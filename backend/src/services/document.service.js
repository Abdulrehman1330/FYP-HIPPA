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

/**
 * Upload a document. CLINICIAN/ADMIN must specify patientId. The patient
 * must be in the same clinic, and (for CLINICIAN) on their caseload.
 */
async function uploadDocument(actingUser, file, { patientId } = {}) {
  if (!file) throw new AppError('No file uploaded', 400);

  const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
  if (!allowed.includes(file.mimetype)) throw new AppError('Only PDF, PNG, JPEG allowed', 400);

  // Resolve patient & verify scope
  let patient = null;
  if (!patientId) {
    throw new AppError('Select a patient before uploading a clinical document', 400);
  }

  if (patientId) {
    patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId: actingUser.clinicId },
      select: { id: true, clinicId: true, primaryClinicianId: true },
    });
    if (!patient) throw new AppError('NOT_FOUND', 404);
    if (actingUser.role === 'CLINICIAN' && patient.primaryClinicianId !== actingUser.id) {
      throw new AppError('NOT_FOUND', 404);
    }
  }
  const storageDir = path.resolve(config.storageDir);
  fs.mkdirSync(storageDir, { recursive: true });
  const ext = path.extname(file.originalname);
  const storedName = `${uuid()}${ext}`;
  const storedPath = path.join(storageDir, storedName);
  fs.writeFileSync(storedPath, file.buffer);

  const doc = await prisma.document.create({
    data: {
      userId: actingUser.id,
      filename: file.originalname,
      fileType: inferDocType(file.originalname),
      storagePath: storedPath,
      sizeBytes: file.size,
      contentType: file.mimetype,
      clinicId: actingUser.clinicId || null,
      patientId: patient ? patient.id : null,
    },
  });

  await logAction('document.upload', actingUser.id, doc.id, {
    filename: file.originalname, patientId: patient?.id || null, clinicId: actingUser.clinicId || null,
  });
  logger.info(`Document uploaded: ${doc.id}`);
  return doc;
}

/**
 * List documents the acting user can see.
 *  - SUPER_ADMIN: everything
 *  - ADMIN: everything in their clinic
 *  - CLINICIAN: docs on their caseload (where patient.primaryClinicianId === user.id) + docs they uploaded
 *  - DOCTOR: read-only docs of their assigned patients
 *  - PATIENT: only their own docs
 */
async function listDocuments(actingUser, page = 1, limit = 20) {
  const where = buildScopedWhere(actingUser);

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, filename: true, fileType: true, status: true, sizeBytes: true,
        uploadedAt: true, clinicId: true, patientId: true, userId: true,
        patient: {
          select: {
            id: true,
            mrn: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.document.count({ where }),
  ]);
  return { documents, total, page, limit };
}

async function getDocument(actingUser, documentId) {
  const where = { id: documentId, ...buildScopedWhere(actingUser) };
  const doc = await prisma.document.findFirst({
    where,
    include: {
      extractedFields: true,
      patient: {
        select: {
          id: true, mrn: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
  if (!doc) throw new AppError('NOT_FOUND', 404);
  return doc;
}

async function deleteDocument(actingUser, documentId) {
  const where = { id: documentId, ...buildScopedWhere(actingUser, { writeIntent: true }) };
  const doc = await prisma.document.findFirst({ where });
  if (!doc) throw new AppError('NOT_FOUND', 404);

  if (fs.existsSync(doc.storagePath)) fs.unlinkSync(doc.storagePath);
  await prisma.document.delete({ where: { id: doc.id } });
  await logAction('document.delete', actingUser.id, documentId, { clinicId: doc.clinicId });
  logger.info(`Document deleted: ${documentId}`);
}

/**
 * Build a Prisma `where` filter scoped to the acting user's role.
 * `writeIntent`=true narrows DOCTOR/PATIENT to nothing (they can't write).
 */
function buildScopedWhere(actingUser, { writeIntent = false } = {}) {
  switch (actingUser.role) {
    case 'SUPER_ADMIN':
      return writeIntent ? { id: '__never__' } : {};
    case 'ADMIN':
      return { clinicId: actingUser.clinicId };
    case 'CLINICIAN':
      return {
        clinicId: actingUser.clinicId,
        OR: [
          { userId: actingUser.id },
          { patient: { primaryClinicianId: actingUser.id } },
        ],
      };
    case 'DOCTOR':
      if (writeIntent) return { id: '__never__' };
      return {
        clinicId: actingUser.clinicId,
        patient: { primaryDoctorId: actingUser.id },
      };
    case 'PATIENT':
      if (writeIntent) return { id: '__never__' };
      return {
        clinicId: actingUser.clinicId,
        patient: { userId: actingUser.id },
      };
    default:
      return { id: '__never__' };
  }
}

module.exports = { uploadDocument, listDocuments, getDocument, deleteDocument };
