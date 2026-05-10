const { Router } = require("express");
const { authMiddleware, requireRole, assertCaseload } = require("../middleware/auth.middleware");
const pocService = require("../services/poc.service");
const { AppError } = require("../middleware/error.middleware");

const router = Router();

const writeGuard = [authMiddleware, requireRole("CLINICIAN", "ADMIN")];
const readGuard = [authMiddleware, requireRole("CLINICIAN", "ADMIN", "DOCTOR", "PATIENT")];

router.post("/poc/generate/:documentId", ...writeGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.documentId });
    const result = await pocService.generatePoc(req.params.documentId, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get("/poc/:documentId", ...readGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.documentId });
    const poc = await pocService.getLatestPoc(req.params.documentId);
    res.json({ success: true, data: poc });
  } catch (err) { next(err); }
});

router.get("/poc/:documentId/versions", ...readGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.documentId });
    const versions = await pocService.listPocVersions(req.params.documentId);
    res.json({ success: true, data: versions });
  } catch (err) { next(err); }
});

router.get("/poc/:documentId/versions/:version", ...readGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.documentId });
    const version = parseInt(req.params.version, 10);
    if (Number.isNaN(version) || version < 1) throw new AppError("Invalid version", 400);
    const poc = await pocService.getPocVersion(req.params.documentId, version);
    res.json({ success: true, data: poc });
  } catch (err) { next(err); }
});

router.post("/poc/:documentId/edit", ...writeGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.documentId });
    const { edits } = req.body || {};
    const result = await pocService.editPocDraft(req.params.documentId, req.user.id, edits);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post("/poc/:documentId/approve", ...writeGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.documentId });
    const result = await pocService.approvePoc(req.params.documentId, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

module.exports = router;
