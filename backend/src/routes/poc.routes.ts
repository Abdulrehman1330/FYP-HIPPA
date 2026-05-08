import { Router, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import prisma from '../config/database';
import { config } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const router = Router();

const POC_SECTIONS = ['patient_summary', 'problems', 'goals', 'interventions', 'medication_management', 'safety_concerns', 'follow_up'];

async function generateSection(sectionName: string, evidence: string) {
  if (!config.openaiKey) {
    return { section: sectionName, content: `[Stub] Draft ${sectionName} — set OPENAI_API_KEY to enable.`, citations: [], sufficientEvidence: false };
  }

  const client = new OpenAI({ apiKey: config.openaiKey });
  const response = await client.chat.completions.create({
    model: config.openaiModel,
    messages: [
      { role: 'system', content: 'You are a clinical documentation assistant. Generate care plan sections with citations.' },
      { role: 'user', content: `Generate a ${sectionName} section using ONLY this evidence:\n${evidence}\n\nAdd [1], [2] citations. If insufficient, say so.` },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const text = response.choices[0].message.content || '';
  return { section: sectionName, content: text, citations: [], sufficientEvidence: !text.toLowerCase().includes('insufficient') };
}

router.post('/poc/generate/:documentId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.documentId }, include: { extractedFields: true } });
    if (!doc) throw new AppError('Document not found', 404);
    if (doc.status !== 'APPROVED') throw new AppError('Document must be approved first', 400);

    const evidence = doc.extractedFields
      .filter(f => f.fieldValue)
      .map((f, i) => `${i + 1}. ${f.fieldName}: ${f.fieldValue}`)
      .join('\n');

    const sections: Record<string, any> = {};
    for (const name of POC_SECTIONS) {
      sections[name] = await generateSection(name, evidence);
    }

    await prisma.generatedPoc.upsert({
      where: { documentId: doc.id },
      update: { sections, status: 'draft' },
      create: { documentId: doc.id, sections, status: 'draft' },
    });

    await prisma.document.update({ where: { id: doc.id }, data: { status: 'POC_GENERATED' } });
    await prisma.auditLog.create({ data: { action: 'poc.generate', userId: req.user!.id, documentId: doc.id } });

    logger.info(`POC generated for document ${doc.id}`);
    res.json({ success: true, data: { documentId: doc.id, sections } });
  } catch (err) { next(err); }
});

router.get('/poc/:documentId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const poc = await prisma.generatedPoc.findUnique({ where: { documentId: req.params.documentId } });
    if (!poc) throw new AppError('POC not found', 404);
    res.json({ success: true, data: poc });
  } catch (err) { next(err); }
});

router.post('/poc/:documentId/approve', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const poc = await prisma.generatedPoc.findUnique({ where: { documentId: req.params.documentId } });
    if (!poc) throw new AppError('POC not found', 404);

    const updates: any = { status: 'approved', approvedAt: new Date() };
    if (req.body.edits) {
      const sections = { ...(poc.sections as any) };
      for (const [name, content] of Object.entries(req.body.edits)) {
        if (sections[name]) { sections[name].content = content; sections[name].editedByClinician = true; }
      }
      updates.sections = sections;
    }

    await prisma.generatedPoc.update({ where: { documentId: req.params.documentId }, data: updates });
    await prisma.auditLog.create({ data: { action: 'poc.approve', userId: req.user!.id, documentId: req.params.documentId } });
    res.json({ success: true, data: { status: 'approved' } });
  } catch (err) { next(err); }
});

export default router;
