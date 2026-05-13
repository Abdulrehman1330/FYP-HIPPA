const OpenAI = require("openai").default;
const axios = require("axios");
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
const GENERATOR_VERSION = "poc-llm-v1";
const GENERATABLE_DOCUMENT_STATUSES = ["APPROVED", "POC_GENERATED", "RISK_SCORED"];
const POC_SYSTEM_PROMPT =
  "You are a clinical documentation assistant for home-health Plans of Care. " +
  "You produce draft documentation for clinician review only. " +
  "You must use only approved numbered evidence, preserve inline citations, and return valid JSON only.";

function resolveLlmProvider() {
  const requested = config.llmProvider || "auto";
  const available = {
    gemini: Boolean(config.geminiKey),
    anthropic: Boolean(config.anthropicKey),
    openai: Boolean(config.openaiKey),
  };

  if (requested === "none") return null;

  if (requested !== "auto") {
    if (!available[requested]) {
      logger.warn(`LLM provider '${requested}' selected but API key is missing; using fallback generator`);
      return null;
    }
    return requested;
  }

  if (available.gemini) return "gemini";
  if (available.anthropic) return "anthropic";
  if (available.openai) return "openai";
  return null;
}

function createLlmClient() {
  const provider = resolveLlmProvider();
  if (!provider) return null;

  if (provider === "openai") {
    const client = new OpenAI({ apiKey: config.openaiKey });
    return {
      provider,
      model: config.openaiModel,
      async generateJson(prompt) {
        const completion = await client.chat.completions.create(
          {
            model: config.openaiModel,
            temperature: 0.3,
            max_tokens: 2500,
            messages: [
              { role: "system", content: POC_SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          },
          { timeout: SECTION_TIMEOUT_MS },
        );
        return completion.choices[0]?.message?.content || "";
      },
    };
  }

  if (provider === "gemini") {
    return {
      provider,
      model: config.geminiModel,
      async generateJson(prompt) {
        const { data } = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent`,
          {
            systemInstruction: {
              parts: [{ text: POC_SYSTEM_PROMPT }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2500,
              responseMimeType: "application/json",
            },
          },
          {
            timeout: SECTION_TIMEOUT_MS,
            headers: {
              "x-goog-api-key": config.geminiKey,
              "Content-Type": "application/json",
            },
          },
        );
        return data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
      },
    };
  }

  if (provider === "anthropic") {
    return {
      provider,
      model: config.anthropicModel,
      async generateJson(prompt) {
        const { data } = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: config.anthropicModel,
            max_tokens: 2500,
            temperature: 0.3,
            system: POC_SYSTEM_PROMPT,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          },
          {
            timeout: SECTION_TIMEOUT_MS,
            headers: {
              "x-api-key": config.anthropicKey,
              "anthropic-version": config.anthropicVersion,
              "Content-Type": "application/json",
            },
          },
        );
        return data?.content?.map((part) => part.text || "").join("") || "";
      },
    };
  }

  return null;
}

function providerErrorSummary(err) {
  return {
    status: err?.status || err?.response?.status || null,
    code: err?.code || err?.response?.data?.error?.code || err?.response?.data?.error?.type || null,
    type: err?.type || err?.response?.data?.error?.type || null,
    message:
      err?.response?.data?.error?.message ||
      err?.error?.message ||
      err?.message ||
      "LLM provider request failed",
  };
}

function providerRetryAfterMs(err) {
  const summary = providerErrorSummary(err);
  const match = String(summary.message || "").match(/retry in\s+([\d.]+)s/i);
  if (!match) return null;
  const seconds = Number.parseFloat(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.min(Math.ceil(seconds * 1000) + 1000, 60000);
}

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

function buildClinicalDocumentScope(user, { patientId } = {}) {
  const baseScope = {
    status: { in: GENERATABLE_DOCUMENT_STATUSES },
    extractedFields: {
      some: {
        fieldValue: { not: null },
      },
    },
    ...(patientId ? { patientId } : {}),
  };

  switch (user.role) {
    case "ADMIN":
      return { ...baseScope, clinicId: user.clinicId };
    case "CLINICIAN":
      return {
        ...baseScope,
        clinicId: user.clinicId,
        OR: [
          { userId: user.id },
          { patient: { primaryClinicianId: user.id } },
        ],
      };
    case "DOCTOR":
      return {
        ...baseScope,
        clinicId: user.clinicId,
        patient: { primaryDoctorId: user.id },
      };
    default:
      return { id: "__never__" };
  }
}

async function findLatestAccessiblePocDocument(user, { patientId } = {}) {
  const document = await prisma.document.findFirst({
    where: buildClinicalDocumentScope(user, { patientId }),
    orderBy: [
      { updatedAt: "desc" },
      { uploadedAt: "desc" },
    ],
    select: {
      id: true,
      filename: true,
      fileType: true,
      status: true,
      uploadedAt: true,
      updatedAt: true,
      patientId: true,
      patient: {
        select: {
          id: true,
          mrn: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!document) {
    throw new AppError(
      patientId
        ? "No approved document with extracted fields found for this patient"
        : "No approved document with extracted fields found for POC generation",
      404,
    );
  }

  return document;
}

function sectionPrompt(section, evidenceText) {
  return [
    `Section key: ${section.name}`,
    `Section title: ${section.title}`,
    "",
    "Approved evidence:",
    evidenceText || "(none)",
    "",
    "Return JSON only with this shape:",
    '{"content":"...","insufficientEvidenceReason":null}',
    "",
    "Rules:",
    "- Use only the approved evidence above.",
    "- Cite evidence inline with [N] where N is the evidence number.",
    "- Do not invent diagnoses, medications, visit frequency, goals, or interventions.",
    "- Keep the wording clinician-editable and concise.",
    "- If the evidence is not enough, set content to exactly: Insufficient evidence to draft this section.",
    "- If evidence is insufficient, explain the missing information in insufficientEvidenceReason.",
  ].join("\n");
}

function allSectionsPrompt(evidenceText) {
  const sectionKeys = POC_SECTIONS
    .map((section) => `- ${section.name}: ${section.title}`)
    .join("\n");

  return [
    "Generate all Plan of Care sections in one JSON response.",
    "",
    "Sections:",
    sectionKeys,
    "",
    "Approved evidence:",
    evidenceText || "(none)",
    "",
    "Return JSON only with this exact shape:",
    '{"sections":{"patient_summary":{"content":"...","insufficientEvidenceReason":null},"problems":{"content":"...","insufficientEvidenceReason":null},"goals":{"content":"...","insufficientEvidenceReason":null},"interventions":{"content":"...","insufficientEvidenceReason":null},"medication_management":{"content":"...","insufficientEvidenceReason":null},"safety_concerns":{"content":"...","insufficientEvidenceReason":null},"follow_up":{"content":"...","insufficientEvidenceReason":null}}}',
    "",
    "Rules:",
    "- Use only the approved evidence above.",
    "- Cite evidence inline with [N] where N is the evidence number.",
    "- Do not invent diagnoses, medications, visit frequency, goals, or interventions.",
    "- Keep each section concise and clinician-editable.",
    "- If evidence is not enough for a section, set that section content to exactly: Insufficient evidence to draft this section.",
    "- If evidence is insufficient, explain the missing information in insufficientEvidenceReason.",
  ].join("\n");
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

function parseJsonSection(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return {
      content: String(raw.content || "").trim() || "Insufficient evidence to draft this section.",
      insufficientEvidenceReason: raw.insufficientEvidenceReason || null,
    };
  }

  const text = String(raw || "").trim();
  if (!text) {
    return {
      content: "Insufficient evidence to draft this section.",
      insufficientEvidenceReason: "The LLM returned an empty response.",
    };
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() || text;

  try {
    const parsed = JSON.parse(candidate);
    if (typeof parsed.content === "string") {
      const nested = parsed.content.trim();
      if (nested.startsWith("{") && nested.endsWith("}")) {
        try {
          const nestedParsed = JSON.parse(nested);
          return {
            content: String(nestedParsed.content || "").trim() || "Insufficient evidence to draft this section.",
            insufficientEvidenceReason: nestedParsed.insufficientEvidenceReason || parsed.insufficientEvidenceReason || null,
          };
        } catch {
          // Keep the original parsed content below if the nested string is not valid JSON.
        }
      }
    }
    return {
      content: String(parsed.content || "").trim() || "Insufficient evidence to draft this section.",
      insufficientEvidenceReason: parsed.insufficientEvidenceReason || null,
    };
  } catch {
    return {
      content: text,
      insufficientEvidenceReason: null,
    };
  }
}

function parseJsonPayload(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() || text;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function fallbackSection(section, localEvidence) {
  const cited = localEvidence.slice(0, 4);
  const evidenceLines = cited.map((e) => `- ${e.fieldName}: ${e.value} [${e.index}]`).join("\n");
  const content = cited.length
    ? [
        `${section.title} draft based on approved evidence:`,
        evidenceLines,
        "",
        "Clinician review required before final approval.",
      ].join("\n")
    : "Insufficient evidence to draft this section.";

  return {
    content,
    insufficientEvidenceReason: cited.length ? null : "No approved evidence matched this Plan of Care section.",
    citations: cited.map((e) => ({
      index: e.index,
      fieldName: e.fieldName,
      value: e.value,
      sourcePage: e.sourcePage,
    })),
  };
}

function buildLlmSectionResult(llmClient, section, rawSection, evidence) {
  const parsed = parseJsonSection(rawSection);
  const content = parsed.content;
  const localEvidence = relevantEvidence(evidence, section.fieldHints);
  const citedIndices = extractCitedIndices(content, evidence);
  const indexMap = new Map(evidence.map((e) => [e.index, e]));
  const citationIndices = citedIndices.length > 0
    ? citedIndices
    : localEvidence.slice(0, content.toLowerCase().includes("insufficient evidence") ? 0 : 2).map((e) => e.index);
  const citations = citationIndices
    .map((i) => indexMap.get(i))
    .filter(Boolean)
    .map((e) => ({
      index: e.index,
      fieldName: e.fieldName,
      value: e.value,
      sourcePage: e.sourcePage,
    }));

  return {
    section: section.name,
    title: section.title,
    content,
    citations,
    sufficientEvidence: !content.toLowerCase().includes("insufficient evidence"),
    insufficientEvidenceReason: parsed.insufficientEvidenceReason,
    generatedAt: new Date().toISOString(),
    editedByClinician: false,
    generator: {
      mode: "llm",
      provider: llmClient.provider,
      model: llmClient.model,
      version: GENERATOR_VERSION,
    },
  };
}

function summarizeGenerator(sections) {
  const sectionList = Object.values(sections || {});
  const llmSections = sectionList.filter((section) => section?.generator?.mode === "llm");
  const firstLlm = llmSections[0]?.generator;
  const firstGenerator = sectionList.find((section) => section?.generator)?.generator;

  const llmSectionCount = llmSections.length;
  const fallbackSectionCount = Math.max(sectionList.length - llmSectionCount, 0);
  const mode =
    llmSectionCount === sectionList.length && sectionList.length > 0
      ? "llm"
      : llmSectionCount > 0
        ? "mixed"
        : "deterministic_fallback";

  return {
    mode,
    provider: firstLlm?.provider || null,
    model: firstLlm?.model || null,
    requestedProvider: firstLlm?.provider || null,
    requestedModel: firstLlm?.model || null,
    version: firstGenerator?.version || GENERATOR_VERSION,
    llmRequested: Boolean(firstLlm || firstGenerator?.providerError),
    llmSectionCount,
    fallbackSectionCount,
  };
}

async function withRetry(fn, label) {
  let lastErr;
  for (let attempt = 1; attempt <= LLM_MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err?.status || err?.response?.status;
      const code = err?.code || err?.response?.data?.error?.code || err?.response?.data?.error?.type;
      const isRetryable =
        status >= 500 ||
        (status === 429 && code !== "insufficient_quota") ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT";
      if (!isRetryable || attempt === LLM_MAX_RETRIES) throw err;
      const delay = providerRetryAfterMs(err) || LLM_RETRY_BASE_MS * 2 ** (attempt - 1);
      logger.warn(`${label} attempt ${attempt} failed (${err.message}); retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function generateAllSections(llmClient, evidence) {
  if (!llmClient) {
    return POC_SECTIONS.map((section) => {
      const fallback = fallbackSection(section, relevantEvidence(evidence, section.fieldHints));
      return {
        section: section.name,
        title: section.title,
        content: fallback.content,
        citations: fallback.citations,
        sufficientEvidence: !fallback.insufficientEvidenceReason,
        insufficientEvidenceReason: fallback.insufficientEvidenceReason,
        generatedAt: new Date().toISOString(),
        editedByClinician: false,
        generator: {
          mode: "deterministic_fallback",
          version: GENERATOR_VERSION,
          model: null,
        },
      };
    });
  }

  try {
    const completion = await withRetry(
      () => llmClient.generateJson(allSectionsPrompt(evidenceToPrompt(evidence))),
      `LLM[${llmClient.provider}:all_sections]`,
    );
    const parsed = parseJsonPayload(completion);
    const parsedSections = parsed?.sections && typeof parsed.sections === "object"
      ? parsed.sections
      : parsed;

    if (!parsedSections || typeof parsedSections !== "object") {
      throw new AppError("LLM did not return a sections object", 502);
    }

    return POC_SECTIONS.map((section) => {
      const rawSection = parsedSections[section.name];
      if (!rawSection) {
        const fallback = fallbackSection(section, relevantEvidence(evidence, section.fieldHints));
        return {
          section: section.name,
          title: section.title,
          content: fallback.content,
          citations: fallback.citations,
          sufficientEvidence: !fallback.insufficientEvidenceReason,
          insufficientEvidenceReason: fallback.insufficientEvidenceReason,
          generatedAt: new Date().toISOString(),
          editedByClinician: false,
          generator: {
            mode: "deterministic_fallback",
            version: GENERATOR_VERSION,
            model: null,
            fallbackReason: "missing_llm_section",
          },
        };
      }
      return buildLlmSectionResult(llmClient, section, rawSection, evidence);
    });
  } catch (err) {
    const errorSummary = providerErrorSummary(err);
    logger.warn("LLM unavailable for all POC sections; using deterministic fallback", {
      provider: llmClient.provider,
      ...errorSummary,
    });

    return POC_SECTIONS.map((section) => {
      const fallback = fallbackSection(section, relevantEvidence(evidence, section.fieldHints));
      return {
        section: section.name,
        title: section.title,
        content: fallback.content,
        citations: fallback.citations,
        sufficientEvidence: !fallback.insufficientEvidenceReason,
        insufficientEvidenceReason: fallback.insufficientEvidenceReason,
        generatedAt: new Date().toISOString(),
        editedByClinician: false,
        generator: {
          mode: "deterministic_fallback",
          version: GENERATOR_VERSION,
          model: null,
          fallbackReason: "llm_unavailable",
          providerError: errorSummary,
        },
      };
    });
  }
}

async function generateSection(llmClient, section, evidence) {
  const localEvidence = relevantEvidence(evidence, section.fieldHints);
  const evidenceText = evidenceToPrompt(localEvidence);

  if (!llmClient) {
    const fallback = fallbackSection(section, localEvidence);
    return {
      section: section.name,
      title: section.title,
      content: fallback.content,
      citations: fallback.citations,
      sufficientEvidence: !fallback.insufficientEvidenceReason,
      insufficientEvidenceReason: fallback.insufficientEvidenceReason,
      generatedAt: new Date().toISOString(),
      editedByClinician: false,
      generator: {
        mode: "deterministic_fallback",
        version: GENERATOR_VERSION,
        model: null,
      },
    };
  }

  let completion;
  try {
    completion = await withRetry(
      () => llmClient.generateJson(sectionPrompt(section, evidenceText)),
      `LLM[${llmClient.provider}:${section.name}]`,
    );
  } catch (err) {
    const errorSummary = providerErrorSummary(err);
    logger.warn(`LLM unavailable for ${section.name}; using deterministic fallback`, {
      provider: llmClient.provider,
      ...errorSummary,
    });
    const fallback = fallbackSection(section, localEvidence);
    return {
      section: section.name,
      title: section.title,
      content: fallback.content,
      citations: fallback.citations,
      sufficientEvidence: !fallback.insufficientEvidenceReason,
      insufficientEvidenceReason: fallback.insufficientEvidenceReason,
      generatedAt: new Date().toISOString(),
      editedByClinician: false,
      generator: {
        mode: "deterministic_fallback",
        version: GENERATOR_VERSION,
        model: null,
        fallbackReason: "llm_unavailable",
        providerError: errorSummary,
      },
    };
  }

  const parsed = parseJsonSection(completion);
  const content = parsed.content;
  const citedIndices = extractCitedIndices(content, localEvidence);
  const indexMap = new Map(localEvidence.map((e) => [e.index, e]));
  const citationIndices = citedIndices.length > 0
    ? citedIndices
    : localEvidence.slice(0, content.toLowerCase().includes("insufficient evidence") ? 0 : 2).map((e) => e.index);
  const citations = citationIndices.map((i) => {
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
    insufficientEvidenceReason: parsed.insufficientEvidenceReason,
    generatedAt: new Date().toISOString(),
    editedByClinician: false,
    generator: {
      mode: "llm",
      provider: llmClient.provider,
      model: llmClient.model,
      version: GENERATOR_VERSION,
    },
  };
}

async function generatePoc(documentId, userId) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { extractedFields: true },
  });
  if (!doc) throw new AppError("Document not found", 404);
  if (!GENERATABLE_DOCUMENT_STATUSES.includes(doc.status)) {
    throw new AppError(
      `Document must be approved before POC generation (current: ${doc.status})`,
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

  const llmClient = createLlmClient();

  const sectionResults = await generateAllSections(llmClient, evidence);

  const sections = Object.fromEntries(sectionResults.map((s) => [s.section, s]));
  const llmSectionCount = sectionResults.filter((s) => s.generator?.mode === "llm").length;
  const generatorMode =
    llmSectionCount === sectionResults.length
      ? "llm"
      : llmSectionCount > 0
        ? "mixed"
        : "deterministic_fallback";
  const generatorMeta = {
    mode: generatorMode,
    provider: llmSectionCount > 0 ? llmClient?.provider : null,
    model: llmSectionCount > 0 ? llmClient?.model : null,
    requestedProvider: llmClient?.provider || null,
    requestedModel: llmClient?.model || null,
    version: GENERATOR_VERSION,
    llmRequested: Boolean(llmClient),
    llmSectionCount,
    fallbackSectionCount: sectionResults.length - llmSectionCount,
  };

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
    generator: generatorMeta,
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
    generator: generatorMeta,
    sections,
  };
}

async function generateLatestPoc(user, { patientId } = {}) {
  const document = await findLatestAccessiblePocDocument(user, { patientId });
  const result = await generatePoc(document.id, user.id);
  return {
    ...result,
    selectedDocument: document,
  };
}

async function getLatestPoc(documentId) {
  const poc = await prisma.generatedPoc.findFirst({
    where: { documentId },
    orderBy: { version: "desc" },
  });
  if (!poc) throw new AppError("POC not found", 404);
  return {
    ...poc,
    generator: summarizeGenerator(poc.sections),
  };
}

async function getLatestAccessiblePoc(user, { patientId } = {}) {
  const documents = await prisma.document.findMany({
    where: buildClinicalDocumentScope(user, { patientId }),
    orderBy: [
      { updatedAt: "desc" },
      { uploadedAt: "desc" },
    ],
    take: 50,
    select: {
      id: true,
      filename: true,
      fileType: true,
      status: true,
      uploadedAt: true,
      updatedAt: true,
      patientId: true,
      patient: {
        select: {
          id: true,
          mrn: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  const documentIds = documents.map((document) => document.id);
  if (documentIds.length === 0) {
    throw new AppError(patientId ? "No POC source document found for this patient" : "POC not found", 404);
  }

  const poc = await prisma.generatedPoc.findFirst({
    where: { documentId: { in: documentIds } },
    orderBy: { generatedAt: "desc" },
  });
  if (!poc) throw new AppError(patientId ? "No generated Plan of Care found for this patient" : "POC not found", 404);

  return {
    ...poc,
    generator: summarizeGenerator(poc.sections),
    selectedDocument: documents.find((document) => document.id === poc.documentId) || null,
  };
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
  generateLatestPoc,
  getLatestPoc,
  getLatestAccessiblePoc,
  listPocVersions,
  getPocVersion,
  editPocDraft,
  approvePoc,
  // exported for tests
  buildEvidence,
  POC_SECTIONS,
  parseJsonSection,
  fallbackSection,
};
