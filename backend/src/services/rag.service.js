const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");
const { logAction } = require("./audit.service");

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "can", "do", "for", "from",
  "about", "does", "explain", "how", "i", "in", "is", "it", "me", "my", "of",
  "on", "or", "say", "says", "should", "tell", "the", "this", "to", "what",
  "when", "which", "with", "you", "your",
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

function humanizeSection(section) {
  return String(section || "Evidence")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
      text: field.fieldValue,
      sourceType: "approved_extracted_field",
      metadata: {
        confidence: field.confidence,
        sourceSnippet: field.sourceSnippet,
        filename: document.filename,
        title: humanizeSection(field.fieldName),
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
      text: section.content,
      sourceType: "generated_poc_section",
      metadata: {
        pocId: latestPoc.id,
        version: latestPoc.version,
        status: latestPoc.status,
        citations: section.citations,
        title: section.title,
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
  const bullets = [];

  for (const match of matches.slice(0, 4)) {
    const section = String(match.section || "").toLowerCase();
    const text = match.text.replace(/\s+/g, " ").trim();
    if (!text) continue;

    if (section.includes("mobility")) {
      bullets.push(`Mobility: ${text}`);
    } else if (section.includes("fall") || section.includes("safety")) {
      bullets.push(`Safety: ${text}`);
    } else if (section.includes("goal")) {
      bullets.push(`Goal: ${text}`);
    } else if (section.includes("intervention")) {
      bullets.push(`Care team support: ${text}`);
    } else if (section.includes("medication")) {
      bullets.push(`Medication note: ${text}`);
    } else if (section.includes("diagnosis")) {
      bullets.push(`Main condition: ${text}`);
    } else {
      bullets.push(`${humanizeSection(match.section)}: ${text}`);
    }
  }

  const summary = bullets.length
    ? bullets.map((bullet) => `- ${bullet}`).join("\n")
    : "- I found approved care-plan evidence, but it needs clinician review for a clearer explanation.";

  if (normalized.includes("risk")) {
    return `Simple answer:\nYour risk score is based on reviewed information in your care record. It helps your care team watch for problems early.\n\nWhat the evidence says:\n${summary}\n\nIf you feel worse or are worried about symptoms, contact your care team.`;
  }

  if (normalized.includes("medication") || normalized.includes("medicine") || normalized.includes("meds")) {
    return `Simple answer:\nI can explain medication information already written in your approved care record, but I cannot recommend medication changes.\n\nWhat the evidence says:\n${summary}\n\nPlease ask your clinician before changing any medicine or dose.`;
  }

  if (normalized.includes("task") || normalized.includes("today") || normalized.includes("plan")) {
    return `Simple answer:\nHere is the most important care-plan information I found.\n\nWhat the evidence says:\n${summary}\n\nUse this as a summary only. Your care team should make clinical decisions.`;
  }

  return `Simple answer:\nHere is the approved care-plan information that matches your question.\n\nWhat the evidence says:\n${summary}\n\nFor medical decisions, ask your care team.`;
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
    title: match.metadata?.title || humanizeSection(match.section),
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
