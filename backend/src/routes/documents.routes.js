const { Router } = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth.middleware');
const documentService = require('../services/document.service');

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/documents/upload', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    const doc = await documentService.uploadDocument(req.user.id, req.file);
    res.status(201).json({
      success: true,
      data: { documentId: doc.id, filename: doc.filename, status: doc.status },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/documents', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const data = await documentService.listDocuments(req.user.id, page, limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/documents/:id', authMiddleware, async (req, res, next) => {
  try {
    const doc = await documentService.getDocument(req.user.id, req.params.id);
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.delete('/documents/:id', authMiddleware, async (req, res, next) => {
  try {
    await documentService.deleteDocument(req.user.id, req.params.id);
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
