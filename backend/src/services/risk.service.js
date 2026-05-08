const axios = require("axios");
const prisma = require("../config/database");
const { config } = require("../config/env");
const { AppError } = require("../middleware/error.middleware");
const { logAction } = require("./audit.service");
const logger = require("../utils/logger");

function extractFeatures(fields) {
  const map = {};
  fields.forEach((f) => {
    map[f.fieldName] = f;
  });

  const getNum = (name, def) => {
    const v = map[name]?.fieldValue;
    return v ? parseFloat(v) || def : def;
  };

  const icdCodes = [];
  if (map.primary_icd10?.fieldValue)
    icdCodes.push(map.primary_icd10.fieldValue);

  return {
    age: 75,
    is_female: map.gender?.fieldValue?.toLowerCase().startsWith("f") ? 1 : 0,
    mobility_score: getNum("mobility_score", 50),
    adl_score: getNum("adl_score", 50),
    has_wound: 0,
    diagnosis_count: icdCodes.length,
    medication_count: getNum("medication_count", 0),
    has_high_risk_meds: 0,
    prior_hospitalization: 0,
    days_since_discharge: 7,
    has_diabetes: icdCodes.some((c) => c.startsWith("E11")) ? 1 : 0,
    has_chf: icdCodes.some((c) => c.startsWith("I50")) ? 1 : 0,
    has_copd: icdCodes.some((c) => c.startsWith("J44")) ? 1 : 0,
    low_confidence_fields: fields.filter(
      (f) => f.confidence > 0 && f.confidence < 0.7,
    ).length,
  };
}

function fallbackPredict(features) {
  let score = 0.15;
  if (features.age > 80) score += 0.15;
  if (features.has_chf) score += 0.15;
  if (features.has_diabetes) score += 0.1;
  if (features.medication_count > 10) score += 0.1;
  if (features.mobility_score < 30) score += 0.1;
  score = Math.min(score, 0.95);

  return {
    risk_score: Math.round(score * 1000) / 1000,
    risk_class: score >= 0.35 ? "high" : score >= 0.2 ? "medium" : "low",
    explanation: {
      top_factors: Object.entries(features)
        .slice(0, 5)
        .map(([k, v]) => ({ feature: k, value: v })),
      model_version: "fallback",
    },
  };
}

async function predictRisk(documentId, userId) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { extractedFields: true },
  });
  if (!doc) throw new AppError("Document not found", 404);

  const features = extractFeatures(doc.extractedFields);

  let prediction;
  try {
    const resp = await axios.post(
      `${config.mlServiceUrl}/predict`,
      { features },
      { timeout: 5000 },
    );
    prediction = resp.data;
  } catch {
    prediction = fallbackPredict(features);
  }

  await prisma.riskScore.upsert({
    where: { documentId: doc.id },
    update: {
      riskScore: prediction.risk_score,
      riskClass: prediction.risk_class,
      explanation: prediction.explanation,
    },
    create: {
      documentId: doc.id,
      riskScore: prediction.risk_score,
      riskClass: prediction.risk_class,
      explanation: prediction.explanation,
    },
  });

  await prisma.document.update({
    where: { id: doc.id },
    data: { status: "RISK_SCORED" },
  });
  await logAction("risk.predict", userId, documentId, {
    risk_score: prediction.risk_score,
    risk_class: prediction.risk_class,
  });
  logger.info(`Risk predicted for ${documentId}: ${prediction.risk_class}`);
  return prediction;
}

async function getRiskScore(documentId) {
  const score = await prisma.riskScore.findUnique({ where: { documentId } });
  if (!score) throw new AppError("Risk score not found", 404);
  return score;
}

module.exports = { predictRisk, getRiskScore };
