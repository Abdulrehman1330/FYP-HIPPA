const { Router } = require("express");
const { authMiddleware, requireRole, assertCaseload } = require("../middleware/auth.middleware");
const riskService = require("../services/risk.service");

const router = Router();

const writeGuard = [authMiddleware, requireRole("CLINICIAN", "ADMIN")];
const readGuard = [authMiddleware, requireRole("CLINICIAN", "ADMIN", "DOCTOR", "PATIENT")];

router.post("/risk/predict/:documentId", ...writeGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.documentId });
    const prediction = await riskService.predictRisk(req.params.documentId, req.user.id);
    res.json({ success: true, data: { documentId: req.params.documentId, ...prediction } });
  } catch (err) { next(err); }
});

router.get("/risk/:documentId", ...readGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.documentId });
    const score = await riskService.getRiskScore(req.params.documentId);
    res.json({ success: true, data: score });
  } catch (err) { next(err); }
});

module.exports = router;
