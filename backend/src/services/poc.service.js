const OpenAI = require("openai").default;
const prisma = require("../config/database");
const { config } = require("../config/env");
const { AppError } = require("../middleware/error.middleware");
const { logAction } = require("./audit.service");
const logger = require("../utils/logger");

const POC_SECTIONS = [
  {
    name: "patient_summary",
    title: "Patient Summary",
    fieldHints: ["patient_name", "date_of_birth", "primary_diagnosis", "primary_icd10"],
  },
  {
    name: "problems",
    title: "Problems and Diagnoses",
    fieldHints: ["primary_diagnosis", "primary_icd10", "secondary_diagnoses"],
  },
  {
    name: "goals",
    title: "Treatment Goals",
    fieldHints: ["goals", "primary_diagnosis", "functional_status"],
  },
  {
    name: "interventions",
    title: "Planned Interventions",
    fieldHints: ["interventions", "primary_diagnosis", "functional_status"],
  },
  {
    name: "medication_management",
    title: "Medication Management",
    fieldHints: ["medications", "allergies"],
  },
  {
    name: "safety_concerns",
    title: "Safety Concerns",
    fieldHints: ["functional_status", "allergies", "secondary_diagnoses"],
  },
  {
    name: "follow_up",
    title: "Follow-up Plan",
    fieldHints: ["frequency", "duration", "start_of_care"],
  },
];

const LLM_MAX_RETRIES = 3;
const LLM_RETRY_BASE_MS = 500;
const SECTION_TIMEOUT_MS = 30000;

function buildEvidence(extractedFields) {
  const populated = extractedFields
    .filter((f) => f.fieldValue !== null && f.fieldValue !== "")
    .sort((a, b) => a.fieldName.localeCompare(b.fieldName));

  return populated.map((field, idx) => ({
    index: idx + 1,
    fieldId: field.id,
    fieldName: field.fieldName,
    value: field.fieldValue,
    confidence: field.confidence,
    sourcePage: field.sourceSnippet || null,
  }));
}

function evidenceToPrompt(evidence) {
  return evidence
    .map(
      (e) =>
        `[${e.index}] ${e.fieldName}: ${e.value}` +
        (e.sourcePage ? ` (${e.sourcePage})` : ""),
    )
    .join("\n");
}

function relevantEvidence(evidence, fieldHints) {
  if (!fieldHints?.length) return evidence;
  const hintSet = new Set(fieldHints);
  const primary = evidence.filter((e) => hintSet.has(e.fieldName));
  return primary.length > 0 ? primary : evidence;
}

function extractCitedIndices(content, evidence) {
  const found = new Set();
  for (const match of content.matchAll(/\[(\d+)\]/g)) {
    const idx = parseInt(match[1], 10);
    if (idx >= 1 && idx <= evidence.length) found.add(idx);
  }
  return [...found].sort((a, b) => a - b);
}

async function withRetry(fn, label) {
  let lastErr;
  for (let attempt = 1; attempt <= LLM_MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isRetryable =
        err?.status >= 500 ||
        err?.status === 429 ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT";
      if (!isRetryable || attempt === LLM_MAX_RETRIES) throw err;
      const delay = LLM_RETRY_BASE_MS * 2 ** (attempt - 1);
      logger.warn(`${label} attempt ${attempt} failed (${err.message}); retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function generateSection(client, section, evidence) {
  const localEvidence = relevantEvidence(evidence, section.fieldHints);
  const evidenceText = evidenceToPrompt(localEvidence);

  if (!client) {
    return {
      section: section.name,
      title: section.title,
      content: `[Stub] ${section.title} draft — set OPENAI_API_KEY to enable LLM generation.\n\nEvidence available:\n${evidenceText}`,
      citations: localEvidence.map((e) => ({
        index: e.index,
        fieldName: e.fieldName,
        value: e.value,
        sourcePage: e.sourcePage,
      })),
      sufficientEvidence: localEvidence.length > 0,
      generatedAt: new Date().toISOString(),
      editedByClinician: false,
    };
  }

  const completion = await withRetry(
    () =>
      client.chat.completions.create(
        {
          model: config.openaiModel,
          temperature: 0.3,
          max_tokens: 600,
          messages: [
            {
              role: "system",
              content:
                "You are a clinical documentation assistant for home-health Plans of Care. " +
                "Write the requested section using ONLY the numbered evidence provided. " +
                "Cite supporting evidence inline using [N] notation matching the evidence numbers. " +
                "If evidence is insufficient, write exactly: 'Insufficient evidence to draft this section.'",
            },
            {
              role: "user",
              content:
                `Section: ${section.title}\n\n` +
                `Evidence:\n${evidenceText || "(none)"}\n\n` +
                `Write the ${section.title} section. Be concise, clinical, and cite evidence as [N].`,
            },
          ],
        },
        { timeout: SECTION_TIMEOUT_MS },
      ),
    `LLM[${section.name}]`,
  );

  const content = completion.choices[0]?.message?.content?.trim() || "";
  const citedIndices = extractCitedIndices(content, localEvidence);
  const indexMap = new Map(localEvidence.map((e) => [e.index, e]));
  const citations = citedIndices.map((i) => {
    const e = indexMap.get(i);
    return {
      index: e.index,
      fieldName: e.fieldName,
      value: e.value,
      sourcePage: e.sourcePage,
    };
  });

  return {
    section: section.name,
    title: section.title,
    content,
    citations,
    sufficientEvidence: !content
      .toLowerCase()
      .includes("insufficient evidence"),
    generatedAt: new Date().toISOString(),
    editedByClinician: false,
  };
}

async function generatePoc(documentId, userId) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { extractedFields: true },
  });
  if (!doc) throw new AppError("Document not found", 404);
  if (!["APPROVED", "POC_GENERATED"].includes(doc.status)) {
    throw new AppError(
      `Document must be APPROVED before POC generation (current: ${doc.status})`,
      409,
    );
  }

  const evidence = buildEvidence(doc.extractedFields);
  if (evidence.length === 0) {
    throw new AppError(
      "No populated extracted fields — cannot generate POC",
      422,
    );
  }

  const client = config.openaiKey ? new OpenAI({ apiKey: config.openaiKey }) : null;

  const sectionResults = await Promise.all(
    POC_SECTIONS.map((section) => generateSection(client, section, evidence)),
  );

  const sections = Object.fromEntries(sectionResults.map((s) => [s.section, s]));

  const latest = await prisma.generatedPoc.findFirst({
    where: { documentId },
    orderBy: { version: "desc" },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const created = await prisma.$transaction(async (tx) => {
    const poc = await tx.generatedPoc.create({
      data: {
        documentId,
        version: nextVersion,
        parentVersionId: latest?.id ?? null,
        sections,
        status: "draft",
        generatedById: userId,
      },
    });
    if (doc.status !== "POC_GENERATED") {
      await tx.document.update({
        where: { id: documentId },
        data: { status: "POC_GENERATED" },
      });
    }
    return poc;
  });

  await logAction("poc.generate", userId, documentId, {
    version: nextVersion,
    sectionCount: sectionResults.length,
    llmEnabled: Boolean(client),
  });
  logger.info(
    `POC generated: doc=${documentId} version=${nextVersion} sections=${sectionResults.length}`,
  );

  return {
    id: created.id,
    documentId,
    version: nextVersion,
    parentVersionId: created.parentVersionId,
    status: created.status,
    generatedAt: created.generatedAt,
    sections,
  };
}

async function getLatestPoc(documentId) {
  const poc = await prisma.generatedPoc.findFirst({
    where: { documentId },
    orderBy: { version: "desc" },
  });
  if (!poc) throw new AppError("POC not found", 404);
  return poc;
}

async function listPocVersions(documentId) {
  return prisma.generatedPoc.findMany({
    where: { documentId },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      status: true,
      parentVersionId: true,
      generatedAt: true,
      approvedAt: true,
      generatedById: true,
      approvedById: true,
    },
  });
}

async function getPocVersion(documentId, version) {
  const poc = await prisma.generatedPoc.findUnique({
    where: { documentId_version: { documentId, version } },
  });
  if (!poc) throw new AppError(`POC version ${version} not found`, 404);
  return poc;
}

async function editPocDraft(documentId, userId, edits) {
  if (!edits || typeof edits !== "object" || Array.isArray(edits)) {
    throw new AppError("Edits object required", 400);
  }
  const poc = await getLatestPoc(documentId);
  if (poc.status !== "draft") {
    throw new AppError(`Cannot edit POC in status ${poc.status}`, 409);
  }

  const sections = { ...poc.sections };
  const editedNames = [];
  for (const [name, content] of Object.entries(edits)) {
    if (typeof content !== "string") continue;
    if (!sections[name]) continue;
    sections[name] = {
      ...sections[name],
      content,
      editedByClinician: true,
      editedAt: new Date().toISOString(),
    };
    editedNames.push(name);
  }
  if (editedNames.length === 0) {
    throw new AppError("No valid section edits provided", 400);
  }

  await prisma.generatedPoc.update({
    where: { id: poc.id },
    data: { sections },
  });

  await logAction("poc.edit", userId, documentId, {
    version: poc.version,
    editedSections: editedNames,
  });
  logger.info(`POC edited: doc=${documentId} version=${poc.version} sections=${editedNames.length}`);

  return { documentId, version: poc.version, editedSections: editedNames };
}

async function approvePoc(documentId, userId) {
  const poc = await getLatestPoc(documentId);
  if (poc.status === "approved") {
    throw new AppError("POC already approved", 409);
  }

  await prisma.generatedPoc.update({
    where: { id: poc.id },
    data: {
      status: "approved",
      approvedById: userId,
      approvedAt: new Date(),
    },
  });

  await logAction("poc.approve", userId, documentId, { version: poc.version });
  logger.info(`POC approved: doc=${documentId} version=${poc.version}`);

  return { documentId, version: poc.version, status: "approved" };
}

module.exports = {
  generatePoc,
  getLatestPoc,
  listPocVersions,
  getPocVersion,
  editPocDraft,
  approvePoc,
  // exported for tests
  buildEvidence,
  POC_SECTIONS,
};
