import { Router, Response, NextFunction } from 'express';
import fs from 'fs';
import prisma from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const router = Router();

const FIELD_PATTERNS: Array<{ name: string; pattern: RegExp; required: boolean }> = [
  { name: 'patient_name', pattern: /(?:patient\s*name|pt\s*name|name)\s*[:\-]\s*([A-Za-z][A-Za-z ,.'-]{1,80})/i, required: true },
  { name: 'date_of_birth', pattern: /(?:date\s*of\s*birth|dob)\s*[:\-]\s*([0-3]?\d[/-][0-3]?\d[/-](?:\d{4}|\d{2}))/i, required: true },
  { name: 'start_of_care', pattern: /(?:soc|start\s*of\s*care)\s*[:\-]\s*([0-3]?\d[/-][0-3]?\d[/-](?:\d{4}|\d{2}))/i, required: true },
  { name: 'primary_icd10', pattern: /(?:primary\s+diagnosis|icd-?10|diagnosis\s*code)\s*[:\-]\s*([A-Z]\d{2}(?:\.\w{1,4})?)/i, required: true },
  { name: 'diagnosis', pattern: /(?:primary\s+diagnosis|diagnosis|dx)\s*[:\-]\s*([^\n]+)/i, required: true },
  { name: 'mobility_score', pattern: /(?:mobility|ambulation)\s*(?:score)?\s*[:\-]\s*(\d+)/i, required: false },
  { name: 'adl_score', pattern: /(?:adl|daily\s*living)\s*(?:score)?\s*[:\-]\s*(\d+)/i, required: false },
  { name: 'medication_count', pattern: /(?:medications?|med\s*count)\s*[:\-]\s*(\d+)/i, required: false },
  { name: 'patient_id', pattern: /(?:patient\s*id|pt\s*id|mrn)\s*[:\-]\s*([A-Z0-9]+)/i, required: false },
  { name: 'gender', pattern: /(?:gender|sex)\s*[:\-]\s*(male|female|m|f)/i, required: false },
];

function extractFields(text: string) {
  return FIELD_PATTERNS.map(({ name, pattern, required }) => {
    const match = text.match(pattern);
    if (!match) {
      return { fieldName: name, fieldValue: null, confidence: 0, sourceSnippet: null };
    }
    const value = match[1].trim();
    const confidence = Math.min(0.85 + (value.length > 2 ? 0.05 : 0) + (text.split(match[0]).length === 2 ? 0.05 : 0), 0.95);
    return { fieldName: name, fieldValue: value, confidence, sourceSnippet: match[0].trim() };
  }).filter(f => f.fieldValue || FIELD_PATTERNS.find(p => p.name === f.fieldName)?.required);
}

router.post('/documents/:id/extract', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await prisma.document.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!doc) throw new AppError('Document not found', 404);

    await prisma.document.update({ where: { id: doc.id }, data: { status: 'PREPROCESSING' } });

    const text = fs.readFileSync(doc.storagePath, 'utf-8').replace(/\r\n/g, '\n');
    const fields = extractFields(text);

    await prisma.extractedField.deleteMany({ where: { documentId: doc.id } });
    await prisma.extractedField.createMany({
      data: fields.map(f => ({ documentId: doc.id, ...f })),
    });

    await prisma.document.update({ where: { id: doc.id }, data: { status: 'EXTRACTED' } });

    await prisma.auditLog.create({
      data: { action: 'document.extract', userId: req.user!.id, documentId: doc.id, details: { fieldCount: fields.length } },
    });

    logger.info(`Extracted ${fields.length} fields from document ${doc.id}`);
    res.json({ success: true, data: { documentId: doc.id, status: 'EXTRACTED', fields, rawTextLength: text.length } });
  } catch (err) { next(err); }
});

router.get('/documents/:id/extraction', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fields = await prisma.extractedField.findMany({ where: { documentId: req.params.id } });
    if (!fields.length) throw new AppError('No extraction found', 404);
    res.json({ success: true, data: { documentId: req.params.id, fields } });
  } catch (err) { next(err); }
});

export default router;
