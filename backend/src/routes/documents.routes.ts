import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import prisma from '../config/database';
import { config } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function inferDocType(filename: string): 'OASIS_E2' | 'POC' | 'OTHER' {
  const name = filename.toLowerCase();
  if (name.includes('oasis')) return 'OASIS_E2';
  if (name.includes('care') || name.includes('poc')) return 'POC';
  return 'OTHER';
}

router.post('/documents/upload', authMiddleware, upload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) throw new AppError('No file uploaded', 400);

      const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
      if (!allowed.includes(file.mimetype)) throw new AppError('Only PDF, PNG, JPEG allowed', 400);

      const storageDir = path.resolve(config.storageDir);
      fs.mkdirSync(storageDir, { recursive: true });

      const ext = path.extname(file.originalname);
      const storedName = `${uuid()}${ext}`;
      const storedPath = path.join(storageDir, storedName);
      fs.writeFileSync(storedPath, file.buffer);

      const doc = await prisma.document.create({
        data: {
          userId: req.user!.id,
          filename: file.originalname,
          fileType: inferDocType(file.originalname),
          storagePath: storedPath,
          sizeBytes: file.size,
          contentType: file.mimetype,
        },
      });

      await prisma.auditLog.create({
        data: { action: 'document.upload', userId: req.user!.id, documentId: doc.id, details: { filename: file.originalname } },
      });

      logger.info(`Document uploaded: ${doc.id}`);
      res.status(201).json({ success: true, data: { documentId: doc.id, filename: doc.filename, status: doc.status } });
    } catch (err) { next(err); }
  }
);

router.get('/documents', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: { userId: req.user!.id },
        orderBy: { uploadedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, filename: true, fileType: true, status: true, sizeBytes: true, uploadedAt: true },
      }),
      prisma.document.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({ success: true, data: { documents, total, page, limit } });
  } catch (err) { next(err); }
});

router.get('/documents/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { extractedFields: true },
    });
    if (!doc) throw new AppError('Document not found', 404);
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
});

router.delete('/documents/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await prisma.document.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!doc) throw new AppError('Document not found', 404);

    if (fs.existsSync(doc.storagePath)) fs.unlinkSync(doc.storagePath);
    await prisma.document.delete({ where: { id: doc.id } });

    await prisma.auditLog.create({
      data: { action: 'document.delete', userId: req.user!.id, documentId: doc.id },
    });

    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) { next(err); }
});

export default router;
