const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const riskService = require('../services/risk.service');

const router = Router();

router.post('/risk/predict/:documentId', authMiddleware, async (req, res, next) => {
  try {
    const prediction = await riskService.predictRisk(req.params.documentId, req.user.id);
    res.json({ success: true, data: { documentId: req.params.documentId, ...prediction } });
  } catch (err) {
    next(err);
  }
});

router.get('/risk/:documentId', authMiddleware, async (req, res, next) => {
  try {
    const score = await riskService.getRiskScore(req.params.documentId);
    res.json({ success: true, data: score });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
