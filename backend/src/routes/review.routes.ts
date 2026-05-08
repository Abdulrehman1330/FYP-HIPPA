import { Router, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

const RULES: Record<string, { required?: boolean; minConfidence?: number; pattern?: RegExp; range?: [number, number] }> = {
  patient_name: { required: true, minConfidence: 0.7 },
  date_of_birth: { required: true, minConfidence: 0.8 },
  start_of_care: { required: true, minConfidence: 0.8 },
  primary_icd10: { required: true, minConfidence: 0.8, pattern: /^[A-Z]\d{2}/ },
  diagnosis: { required: true },
  mobility_score: { range: [0, 100] },
  adl_score: { range: [0, 100] },
};

function validateField(name: string, value: string | null, confidence: number) {
  const rule = RULES[name] || {};
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rule.required && !value) errors.push(`${name} is required`);
  if (value && rule.pattern && !rule.pattern.test(value)) errors.push(`${name} has invalid format`);
  if (value && rule.range) {
    const n = parseFloat(value);
    if (isNaN(n) || n < rule.range[0] || n > rule.range[1]) errors.push(`${name} out of range`);
  }
  if (confidence > 0 && confidence < (rule.minConfidence || 0.7)) warnings.push(`${name} low confidence: ${confidence.toFixed(2)}`);

  return { fieldName: name, isValid: errors.length === 0, errors, warnings };
}

router.get('/review/queue', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const docs = await prisma.document.findMany({
      where: { status: 'EXTRACTED' },
      orderBy: { uploadedAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } }, extractedFields: true },
    });

    const queue = docs.map(doc => {
      const validations = doc.extractedFields.map(f => validateField(f.fieldName, f.fieldValue, f.confidence));
      const errors = validations.flatMap(v => v.errors);
      const warnings = validations.flatMap(v => v.warnings);
      return {
        documentId: doc.id, filename: doc.filename,
        uploadedBy: `${doc.user.firstName} ${doc.user.lastName}`,
        uploadedAt: doc.uploadedAt, fieldCount: doc.extractedFields.length,
        isValid: errors.length === 0, errorCount: errors.length, warningCount: warnings.length,
      };
    });

    res.json({ success: true, data: queue });
  } catch (err) { next(err); }
});

router.get('/review/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { extractedFields: true, reviewActions: { orderBy: { timestamp: 'desc' }, include: { reviewer: { select: { firstName: true, lastName: true } } } } },
    });
    if (!doc) throw new AppError('Document not found', 404);

    const fields = doc.extractedFields.map(f => {
      const v = validateField(f.fieldName, f.fieldValue, f.confidence);
      return { ...f, validation: v };
    });

    res.json({ success: true, data: { document: { id: doc.id, filename: doc.filename, status: doc.status }, fields, reviewHistory: doc.reviewActions } });
  } catch (err) { next(err); }
});

router.post('/review/:id/approve', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.document.update({ where: { id: req.params.id }, data: { status: 'APPROVED' } });
    await prisma.reviewAction.create({ data: { documentId: req.params.id, reviewerId: req.user!.id, action: 'APPROVE' } });
    await prisma.auditLog.create({ data: { action: 'document.approve', userId: req.user!.id, documentId: req.params.id } });
    res.json({ success: true, data: { status: 'APPROVED' } });
  } catch (err) { next(err); }
});

router.post('/review/:id/edit', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { edits } = req.body;
    if (!edits || typeof edits !== 'object') throw new AppError('Edits object required', 400);

    for (const [fieldName, newValue] of Object.entries(edits)) {
      await prisma.extractedField.updateMany({
        where: { documentId: req.params.id, fieldName },
        data: { fieldValue: newValue as string, confidence: 1.0 },
      });
    }

    await prisma.document.update({ where: { id: req.params.id }, data: { status: 'APPROVED' } });
    await prisma.reviewAction.create({ data: { documentId: req.params.id, reviewerId: req.user!.id, action: 'EDIT', fieldEdits: edits } });
    await prisma.auditLog.create({ data: { action: 'document.edit_approve', userId: req.user!.id, documentId: req.params.id, details: edits } });
    res.json({ success: true, data: { status: 'APPROVED', edits } });
  } catch (err) { next(err); }
});

router.post('/review/:id/reject', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    if (!reason) throw new AppError('Rejection reason required', 400);

    await prisma.document.update({ where: { id: req.params.id }, data: { status: 'REJECTED' } });
    await prisma.reviewAction.create({ data: { documentId: req.params.id, reviewerId: req.user!.id, action: 'REJECT', comments: reason } });
    await prisma.auditLog.create({ data: { action: 'document.reject', userId: req.user!.id, documentId: req.params.id, details: { reason } } });
    res.json({ success: true, data: { status: 'REJECTED', reason } });
  } catch (err) { next(err); }
});

export default router;
