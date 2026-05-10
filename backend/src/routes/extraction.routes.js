const { Router } = require("express");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const prisma = require("../config/database");
const { authMiddleware, requireRole, assertCaseload } = require("../middleware/auth.middleware");
const { AppError } = require("../middleware/error.middleware");
const logger = require("../utils/logger");

const router = Router();

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://localhost:5000";
const OCR_TIMEOUT_MS = Number(process.env.OCR_TIMEOUT_MS) || 60000;

function normalizeFieldValue(rawValue) {
  if (rawValue === null || rawValue === undefined) return null;
  if (Array.isArray(rawValue)) {
    const cleaned = rawValue.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
    return cleaned.length ? JSON.stringify(cleaned) : null;
  }
  const str = String(rawValue).trim();
  return str.length ? str : null;
}

async function callOcrService(filePath, originalName) {
  if (!fs.existsSync(filePath)) {
    throw new AppError(`Document file not found at ${filePath}`, 404);
  }
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), {
    filename: originalName || path.basename(filePath),
  });
  try {
    const response = await axios.post(`${OCR_SERVICE_URL}/ocr/extract`, form, {
      headers: form.getHeaders(),
      timeout: OCR_TIMEOUT_MS,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const detail = err.response.data?.detail || err.response.statusText;
      throw new AppError(`UPSTREAM_ERROR: OCR ${err.response.status}: ${detail}`, 502);
    }
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      throw new AppError(`UPSTREAM_UNAVAILABLE: OCR service unreachable`, 503);
    }
    throw new AppError(`OCR call failed: ${err.message}`, 500);
  }
}

router.post(
  "/documents/:id/extract",
  authMiddleware,
  requireRole("CLINICIAN", "ADMIN"),
  async (req, res, next) => {
    try {
      await assertCaseload(req, { documentId: req.params.id });

      const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
      if (!doc) throw new AppError("NOT_FOUND", 404);

      await prisma.document.update({
        where: { id: doc.id },
        data: { status: "PREPROCESSING" },
      });

      const ocrResult = await callOcrService(doc.storagePath, doc.filename);

      const rawFields = Array.isArray(ocrResult.extracted_fields) ? ocrResult.extracted_fields : [];
      const fields = rawFields
        .map((f) => {
          const fieldValue = normalizeFieldValue(f.value);
          if (!fieldValue) return null;
          return {
            fieldName: f.field_name,
            fieldValue,
            confidence: typeof f.confidence === "number" ? f.confidence : 0,
            sourceSnippet: f.source_page != null ? `page ${f.source_page}` : null,
          };
        })
        .filter(Boolean);

      await prisma.extractedField.deleteMany({ where: { documentId: doc.id } });
      if (fields.length) {
        await prisma.extractedField.createMany({
          data: fields.map((f) => ({ documentId: doc.id, ...f })),
        });
      }

      await prisma.document.update({
        where: { id: doc.id },
        data: { status: "EXTRACTED" },
      });

      await prisma.auditLog.create({
        data: {
          action: "document.extract",
          userId: req.user.id,
          documentId: doc.id,
          clinicId: doc.clinicId,
          details: {
            fieldCount: fields.length,
            totalPages: ocrResult.total_pages || 0,
            processingTimeMs: ocrResult.processing_time_ms || 0,
          },
        },
      });

      logger.info(`Extracted ${fields.length} fields from document ${doc.id}`);

      res.json({
        success: true,
        data: {
          documentId: doc.id,
          status: "EXTRACTED",
          fields,
          totalPages: ocrResult.total_pages || 0,
          processingTimeMs: ocrResult.processing_time_ms || 0,
          rawTextLength: (ocrResult.raw_text || "").length,
        },
      });
    } catch (err) {
      try {
        await prisma.document.update({
          where: { id: req.params.id },
          data: { status: "FAILED" },
        });
        await prisma.auditLog.create({
          data: { action: "document.extract.failed", userId: req.user?.id, documentId: req.params.id, details: { error: err.message } },
        });
      } catch { /* ignore */ }
      next(err);
    }
  },
);

router.get(
  "/documents/:id/extraction",
  authMiddleware,
  async (req, res, next) => {
    try {
      await assertCaseload(req, { documentId: req.params.id });
      const fields = await prisma.extractedField.findMany({
        where: { documentId: req.params.id },
      });
      if (!fields.length) throw new AppError("No extraction found", 404);
      res.json({ success: true, data: { documentId: req.params.id, fields } });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
