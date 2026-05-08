const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const prisma = require('../config/database');
const { config } = require('../config/env');
const { AppError } = require('../middleware/error.middleware');
const { logAction } = require('./audit.service');
const logger = require('../utils/logger');

function inferDocType(filename) {
  const name = filename.toLowerCase();
  if (name.includes('oasis')) return 'OASIS_E2';
  if (name.includes('care') || name.includes('poc')) return 'POC';
  return 'OTHER';
}

async function uploadDocument(userId, file) {
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
      userId,
      filename: file.originalname,
      fileType: inferDocType(file.originalname),
      storagePath: storedPath,
      sizeBytes: file.size,
      contentType: file.mimetype,
    },
  });

  await logAction('document.upload', userId, doc.id, { filename: file.originalname });
  logger.info(`Document uploaded: ${doc.id}`);
  return doc;
}

async function listDocuments(userId, page = 1, limit = 20) {
  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, filename: true, fileType: true, status: true, sizeBytes: true, uploadedAt: true },
    }),
    prisma.document.count({ where: { userId } }),
  ]);
  return { documents, total, page, limit };
}

async function getDocument(userId, documentId) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: { extractedFields: true },
  });
  if (!doc) throw new AppError('Document not found', 404);
  return doc;
}

async function deleteDocument(userId, documentId) {
  const doc = await prisma.document.findFirst({ where: { id: documentId, userId } });
  if (!doc) throw new AppError('Document not found', 404);

  if (fs.existsSync(doc.storagePath)) fs.unlinkSync(doc.storagePath);
  await prisma.document.delete({ where: { id: doc.id } });
  await logAction('document.delete', userId, documentId);
  logger.info(`Document deleted: ${documentId}`);
}

module.exports = { uploadDocument, listDocuments, getDocument, deleteDocument };
