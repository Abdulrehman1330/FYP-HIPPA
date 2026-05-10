const { Router } = require('express');
const multer = require('multer');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const documentService = require('../services/document.service');

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Upload — CLINICIAN/ADMIN only
router.post(
  '/documents/upload',
  authMiddleware,
  requireRole('CLINICIAN', 'ADMIN'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      const doc = await documentService.uploadDocument(req.user, req.file, {
        patientId: req.body.patientId || null,
      });
      res.status(201).json({
        success: true,
        data: {
          documentId: doc.id,
          filename: doc.filename,
          status: doc.status,
          patientId: doc.patientId,
        },
      });
    } catch (err) { next(err); }
  },
);

// List — scoped by role
router.get('/documents', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const data = await documentService.listDocuments(req.user, page, limit);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/documents/:id', authMiddleware, async (req, res, next) => {
  try {
    const doc = await documentService.getDocument(req.user, req.params.id);
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
});

// Delete — CLINICIAN (own uploads in scope) / ADMIN
router.delete(
  '/documents/:id',
  authMiddleware,
  requireRole('CLINICIAN', 'ADMIN'),
  async (req, res, next) => {
    try {
      await documentService.deleteDocument(req.user, req.params.id);
      res.json({ success: true, data: { message: 'Deleted' } });
    } catch (err) { next(err); }
  },
);

module.exports = router;
