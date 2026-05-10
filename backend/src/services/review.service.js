const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");
const { logAction } = require("./audit.service");
const logger = require("../utils/logger");

const DEFAULT_MIN_CONFIDENCE = 0.7;
const DATE_PATTERN = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$|^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/;
const ICD10_PATTERN = /^[A-Z]\d{2}(?:\.\d{1,4})?$/;

const RULES = {
  patient_name: {
    required: true,
    minConfidence: 0.7,
    pattern: /^[A-Za-z][A-Za-z\.\-' ]{1,80}$/,
    label: "Patient Name",
  },
  date_of_birth: {
    required: true,
    minConfidence: 0.8,
    pattern: DATE_PATTERN,
    label: "Date of Birth",
  },
  start_of_care: {
    required: true,
    minConfidence: 0.8,
    pattern: DATE_PATTERN,
    label: "Start of Care",
  },
  primary_icd10: {
    required: true,
    minConfidence: 0.8,
    pattern: ICD10_PATTERN,
    label: "Primary ICD-10",
  },
  primary_diagnosis: {
    required: true,
    minConfidence: 0.6,
    label: "Primary Diagnosis",
  },
  secondary_diagnoses: { required: false, label: "Secondary Diagnoses" },
  admission_source: { required: false, label: "Admission Source" },
  functional_status: { required: false, label: "Functional Status" },
  medications: { required: false, label: "Medications" },
  allergies: { required: false, label: "Allergies" },
};

function validateField(name, value, confidence) {
  const rule = RULES[name] || {};
  const errors = [];
  const warnings = [];

  if (rule.required && (value === null || value === undefined || value === "")) {
    errors.push(`${rule.label || name} is required`);
  }

  if (value && rule.pattern && !rule.pattern.test(String(value))) {
    errors.push(`${rule.label || name} has invalid format`);
  }

  const minConf = rule.minConfidence ?? DEFAULT_MIN_CONFIDENCE;
  if (confidence > 0 && confidence < minConf) {
    warnings.push(
      `${rule.label || name} below confidence threshold (${confidence.toFixed(2)} < ${minConf})`,
    );
  }

  return {
    fieldName: name,
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function summarizeValidations(fields) {
  const validations = fields.map((f) =>
    validateField(f.fieldName, f.fieldValue, f.confidence),
  );
  const errorCount = validations.reduce((s, v) => s + v.errors.length, 0);
  const warningCount = validations.reduce((s, v) => s + v.warnings.length, 0);
  return { validations, errorCount, warningCount, isValid: errorCount === 0 };
}

async function getReviewQueue() {
  const docs = await prisma.document.findMany({
    where: { status: { in: ["EXTRACTED", "IN_REVIEW"] } },
    orderBy: [{ status: "asc" }, { uploadedAt: "desc" }],
    include: {
      user: { select: { firstName: true, lastName: true } },
      reviewClaimedBy: { select: { id: true, firstName: true, lastName: true } },
      extractedFields: true,
    },
  });

  return docs.map((doc) => {
    const { errorCount, warningCount, isValid } = summarizeValidations(
      doc.extractedFields,
    );
    return {
      documentId: doc.id,
      filename: doc.filename,
      fileType: doc.fileType,
      status: doc.status,
      uploadedBy: `${doc.user.firstName} ${doc.user.lastName}`,
      uploadedAt: doc.uploadedAt,
      claimedBy: doc.reviewClaimedBy
        ? {
            id: doc.reviewClaimedBy.id,
            name: `${doc.reviewClaimedBy.firstName} ${doc.reviewClaimedBy.lastName}`,
          }
        : null,
      claimedAt: doc.reviewClaimedAt,
      fieldCount: doc.extractedFields.length,
      isValid,
      errorCount,
      warningCount,
    };
  });
}

async function getReviewDetail(documentId) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      extractedFields: { orderBy: { fieldName: "asc" } },
      reviewActions: {
        orderBy: { timestamp: "desc" },
        include: {
          reviewer: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      reviewClaimedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!doc) throw new AppError("Document not found", 404);

  const { validations, errorCount, warningCount, isValid } =
    summarizeValidations(doc.extractedFields);
  const validationByField = Object.fromEntries(
    validations.map((v) => [v.fieldName, v]),
  );

  const fields = doc.extractedFields.map((f) => ({
    id: f.id,
    fieldName: f.fieldName,
    fieldValue: f.fieldValue,
    confidence: f.confidence,
    sourceSnippet: f.sourceSnippet,
    validation: validationByField[f.fieldName] || {
      fieldName: f.fieldName,
      isValid: true,
      errors: [],
      warnings: [],
    },
  }));

  return {
    document: {
      id: doc.id,
      filename: doc.filename,
      fileType: doc.fileType,
      status: doc.status,
      uploadedAt: doc.uploadedAt,
      claimedBy: doc.reviewClaimedBy,
      claimedAt: doc.reviewClaimedAt,
      completedAt: doc.reviewCompletedAt,
    },
    summary: { isValid, errorCount, warningCount, fieldCount: fields.length },
    fields,
    reviewHistory: doc.reviewActions.map((r) => ({
      id: r.id,
      action: r.action,
      reviewer: `${r.reviewer.firstName} ${r.reviewer.lastName}`,
      reviewerId: r.reviewer.id,
      fieldEdits: r.fieldEdits,
      comments: r.comments,
      timestamp: r.timestamp,
    })),
  };
}

async function claimReview(documentId, reviewerId) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new AppError("Document not found", 404);
  if (!["EXTRACTED", "IN_REVIEW"].includes(doc.status)) {
    throw new AppError(`Cannot claim document in status ${doc.status}`, 409);
  }
  if (
    doc.reviewClaimedById &&
    doc.reviewClaimedById !== reviewerId &&
    doc.status === "IN_REVIEW"
  ) {
    throw new AppError("Document is already claimed by another reviewer", 409);
  }

  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: "IN_REVIEW",
      reviewClaimedById: reviewerId,
      reviewClaimedAt: doc.reviewClaimedAt ?? new Date(),
    },
  });
  await logAction("review.claim", reviewerId, documentId);
  logger.info(`Review claimed: doc=${documentId} reviewer=${reviewerId}`);
}

async function releaseReview(documentId, reviewerId) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new AppError("Document not found", 404);
  if (doc.reviewClaimedById !== reviewerId) {
    throw new AppError("Cannot release a claim you do not own", 403);
  }
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: "EXTRACTED",
      reviewClaimedById: null,
      reviewClaimedAt: null,
    },
  });
  await logAction("review.release", reviewerId, documentId);
}

function buildEditDiff(documentId, edits, currentFields) {
  const currentByName = Object.fromEntries(
    currentFields.map((f) => [f.fieldName, f]),
  );
  const diff = [];
  const updateOps = [];

  for (const [fieldName, newValue] of Object.entries(edits)) {
    const current = currentByName[fieldName];
    const oldValue = current ? current.fieldValue : null;
    if (oldValue === newValue) continue;
    diff.push({ fieldName, oldValue, newValue });
    if (current) {
      updateOps.push(
        prisma.extractedField.update({
          where: { id: current.id },
          data: { fieldValue: newValue, confidence: 1.0 },
        }),
      );
    } else {
      updateOps.push(
        prisma.extractedField.create({
          data: {
            documentId,
            fieldName,
            fieldValue: newValue,
            confidence: 1.0,
          },
        }),
      );
    }
  }
  return { diff, updateOps };
}

async function approveDocument(documentId, reviewerId, comments) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { extractedFields: true },
  });
  if (!doc) throw new AppError("Document not found", 404);
  if (!["EXTRACTED", "IN_REVIEW"].includes(doc.status)) {
    throw new AppError(`Cannot approve document in status ${doc.status}`, 409);
  }

  const { errorCount } = summarizeValidations(doc.extractedFields);
  if (errorCount > 0) {
    throw new AppError(
      `Cannot approve: ${errorCount} validation error(s) — edit fields first`,
      422,
    );
  }

  await prisma.$transaction([
    prisma.document.update({
      where: { id: documentId },
      data: { status: "APPROVED", reviewCompletedAt: new Date() },
    }),
    prisma.reviewAction.create({
      data: {
        documentId,
        reviewerId,
        action: "APPROVE",
        comments: comments || null,
      },
    }),
  ]);

  await logAction("document.approve", reviewerId, documentId, { comments });
  logger.info(`Document approved: ${documentId} by ${reviewerId}`);
}

async function editAndApprove(documentId, reviewerId, edits, comments) {
  if (!edits || typeof edits !== "object" || Array.isArray(edits)) {
    throw new AppError("Edits object required", 400);
  }
  if (Object.keys(edits).length === 0) {
    throw new AppError("Edits object cannot be empty", 400);
  }

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { extractedFields: true },
  });
  if (!doc) throw new AppError("Document not found", 404);
  if (!["EXTRACTED", "IN_REVIEW"].includes(doc.status)) {
    throw new AppError(`Cannot edit document in status ${doc.status}`, 409);
  }

  const { diff, updateOps } = buildEditDiff(
    documentId,
    edits,
    doc.extractedFields,
  );
  if (diff.length === 0) {
    throw new AppError("No changes detected in edits", 400);
  }

  // Re-validate with proposed values to refuse approving an invalid result.
  const merged = doc.extractedFields.map((f) => {
    const next = edits[f.fieldName];
    return next !== undefined
      ? { ...f, fieldValue: next, confidence: 1.0 }
      : f;
  });
  for (const [fieldName, newValue] of Object.entries(edits)) {
    if (!merged.find((m) => m.fieldName === fieldName)) {
      merged.push({ fieldName, fieldValue: newValue, confidence: 1.0 });
    }
  }
  const { errorCount } = summarizeValidations(merged);
  if (errorCount > 0) {
    throw new AppError(
      `Edits leave ${errorCount} validation error(s) — fix before approving`,
      422,
    );
  }

  await prisma.$transaction([
    ...updateOps,
    prisma.document.update({
      where: { id: documentId },
      data: { status: "APPROVED", reviewCompletedAt: new Date() },
    }),
    prisma.reviewAction.create({
      data: {
        documentId,
        reviewerId,
        action: "EDIT",
        fieldEdits: diff,
        comments: comments || null,
      },
    }),
  ]);

  await logAction("document.edit_approve", reviewerId, documentId, {
    editCount: diff.length,
  });
  logger.info(
    `Document edited & approved: ${documentId} reviewer=${reviewerId} edits=${diff.length}`,
  );
}

async function rejectDocument(documentId, reviewerId, reason) {
  if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
    throw new AppError("Rejection reason is required (min 3 chars)", 400);
  }

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new AppError("Document not found", 404);
  if (!["EXTRACTED", "IN_REVIEW"].includes(doc.status)) {
    throw new AppError(`Cannot reject document in status ${doc.status}`, 409);
  }

  await prisma.$transaction([
    prisma.document.update({
      where: { id: documentId },
      data: { status: "REJECTED", reviewCompletedAt: new Date() },
    }),
    prisma.reviewAction.create({
      data: { documentId, reviewerId, action: "REJECT", comments: reason },
    }),
  ]);

  await logAction("document.reject", reviewerId, documentId, { reason });
  logger.info(`Document rejected: ${documentId} by ${reviewerId}`);
}

async function getReviewMetrics(documentId) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      reviewClaimedAt: true,
      reviewCompletedAt: true,
      reviewClaimedById: true,
    },
  });
  if (!doc) throw new AppError("Document not found", 404);
  const startedAt = doc.reviewClaimedAt;
  const completedAt = doc.reviewCompletedAt;
  const reviewSeconds =
    startedAt && completedAt
      ? Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)
      : null;
  return {
    reviewerId: doc.reviewClaimedById,
    startedAt,
    completedAt,
    reviewSeconds,
  };
}

module.exports = {
  validateField,
  summarizeValidations,
  getReviewQueue,
  getReviewDetail,
  claimReview,
  releaseReview,
  approveDocument,
  editAndApprove,
  rejectDocument,
  getReviewMetrics,
};
