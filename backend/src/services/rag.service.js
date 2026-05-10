const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");
const { logAction } = require("./audit.service");

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "can", "do", "for", "from",
  "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "should",
  "the", "this", "to", "what", "when", "which", "with", "you",
]);

const UNSAFE_PATIENT_PATTERNS = [
  /\b(start|stop|change|increase|decrease|skip|double)\b.*\b(med|meds|medicine|medication|dose|dosage|insulin|pill|tablet)\b/i,
  /\b(insulin|opioid|warfarin|blood thinner|antibiotic)\b.*\b(start|stop|change|increase|decrease|skip|double)\b/i,
  /\bdiagnose\b/i,
  /\bemergency\b.*\bwhat should i do\b/i,
];

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((token) => token.length > 1 && !STOPWORDS.has(token)) || [];
}

function hasUnsafePatientIntent(question) {
  return UNSAFE_PATIENT_PATTERNS.some((pattern) => pattern.test(question));
}

function normalizeSections(sections) {
  if (!sections) return [];
  if (Array.isArray(sections)) return sections;
  return Object.entries(sections).map(([key, value]) => ({
    section: key,
    title: value?.title || key,
    content: value?.content || value?.body || "",
    citations: value?.citations || [],
  }));
}

function addExtractedFieldEvidence(evidence, document) {
  for (const field of document.extractedFields || []) {
    if (!field.fieldValue) continue;
    evidence.push({
      sourceId: `FIELD-${field.id}`,
      patientId: document.patientId,
      documentId: document.id,
      section: field.fieldName,
      text: `Approved extracted field '${field.fieldName}': ${field.fieldValue}`,
      sourceType: "approved_extracted_field",
      metadata: {
        confidence: field.confidence,
        sourceSnippet: field.sourceSnippet,
        filename: document.filename,
      },
    });
  }
}

function addPocEvidence(evidence, document) {
  const latestPoc = (document.generatedPocs || [])[0];
  if (!latestPoc) return;

  for (const section of normalizeSections(latestPoc.sections)) {
    if (!section.content) continue;
    evidence.push({
      sourceId: `POC-${latestPoc.id}-${section.section || section.title}`,
      patientId: document.patientId,
      documentId: document.id,
      section: section.section || section.title,
      text: `Approved/generated Plan of Care section '${section.title}': ${section.content}`,
      sourceType: "generated_poc_section",
      metadata: {
        pocId: latestPoc.id,
        version: latestPoc.version,
        status: latestPoc.status,
        citations: section.citations,
      },
    });
  }
}

async function loadApprovedPatientEvidence(patientId) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      documents: {
        where: {
          status: { in: ["APPROVED", "POC_GENERATED", "RISK_SCORED"] },
        },
        include: {
          extractedFields: true,
          generatedPocs: {
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!patient) throw new AppError("Patient not found", 404);

  const evidence = [];
  for (const document of patient.documents) {
    addExtractedFieldEvidence(evidence, document);
    addPocEvidence(evidence, document);
  }
  return evidence;
}

function retrieveEvidence(question, evidence, limit = 4) {
  const queryTokens = new Set(tokenize(question));
  if (queryTokens.size === 0) return [];

  return evidence
    .map((item) => {
      const tokens = tokenize(`${item.section} ${item.text}`);
      const overlap = tokens.filter((token) => queryTokens.has(token)).length;
      const score = overlap / Math.max(queryTokens.size, 1);
      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function formatPatientAnswer(question, matches) {
  const normalized = question.toLowerCase();
  const snippets = matches.map((match) => `[${match.sourceId}] ${match.text}`).join(" ");

  if (normalized.includes("risk")) {
    return `Your risk information is based on your reviewed care record and care-plan evidence. ${snippets} If you are worried about symptoms, contact your care team.`;
  }

  if (normalized.includes("medication") || normalized.includes("medicine") || normalized.includes("meds")) {
    return `I can summarize medication-related information that is already in your approved record, but I cannot recommend medication changes. ${snippets}`;
  }

  if (normalized.includes("task") || normalized.includes("today") || normalized.includes("plan")) {
    return `Here is what your approved care information says about your plan. ${snippets}`;
  }

  return `Based on your approved care information, I found the following relevant evidence. ${snippets}`;
}

function refusedAnswer(question, reason) {
  return {
    question,
    answer:
      "I cannot answer that safely from your approved care-plan evidence. Please contact your clinician or care team for medical guidance.",
    citations: [],
    refused: true,
    reason,
    confidence: "low",
    audience: "patient",
  };
}

async function answerPatientQuestion({ patientId, question, userId }) {
  const normalizedQuestion = typeof question === "string" ? question.trim() : "";

  if (normalizedQuestion.length < 3) {
    throw new AppError("Question must be at least 3 characters.", 400);
  }

  if (hasUnsafePatientIntent(normalizedQuestion)) {
    const response = refusedAnswer(normalizedQuestion, "Patient-facing assistant cannot provide treatment or medication-change advice.");
    await logAction("patient.rag.refused", userId, null, { patientId, question: normalizedQuestion, reason: response.reason });
    return response;
  }

  const evidence = await loadApprovedPatientEvidence(patientId);
  const matches = retrieveEvidence(normalizedQuestion, evidence);
  if (matches.length === 0 || matches[0].score < 0.2) {
    const response = refusedAnswer(normalizedQuestion, "No approved patient evidence was strong enough to answer.");
    await logAction("patient.rag.refused", userId, null, { patientId, question: normalizedQuestion, reason: response.reason });
    return response;
  }

  const citations = matches.map((match) => ({
    sourceId: match.sourceId,
    documentId: match.documentId,
    section: match.section,
    snippet: match.text,
    score: Number(match.score.toFixed(3)),
    sourceType: match.sourceType,
  }));

  const response = {
    question: normalizedQuestion,
    answer: formatPatientAnswer(normalizedQuestion, matches),
    citations,
    refused: false,
    reason: null,
    confidence: matches[0].score >= 0.5 ? "high" : "medium",
    audience: "patient",
    guardrails: [
      "Uses approved patient evidence only",
      "No diagnosis or medication-change advice",
      "Patient should contact care team for clinical decisions",
    ],
  };

  await logAction("patient.rag.answer", userId, null, {
    patientId,
    question: normalizedQuestion,
    sourceIds: citations.map((citation) => citation.sourceId),
    refused: false,
  });

  return response;
}

async function answerOwnPatientQuestion(userId, question) {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!patient) throw new AppError("Patient profile not found", 404);
  return answerPatientQuestion({ patientId: patient.id, question, userId });
}

module.exports = {
  answerOwnPatientQuestion,
  answerPatientQuestion,
  // exported for future tests
  hasUnsafePatientIntent,
  retrieveEvidence,
};
