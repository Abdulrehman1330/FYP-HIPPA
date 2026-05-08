const { Router } = require("express");
const { authMiddleware, requireRole } = require("../middleware/auth.middleware");
const pocService = require("../services/poc.service");
const { AppError } = require("../middleware/error.middleware");

const router = Router();

const clinicianOnly = [authMiddleware, requireRole("CLINICIAN", "ADMIN")];

router.post("/poc/generate/:documentId", ...clinicianOnly, async (req, res, next) => {
  try {
    const result = await pocService.generatePoc(req.params.documentId, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get("/poc/:documentId", ...clinicianOnly, async (req, res, next) => {
  try {
    const poc = await pocService.getLatestPoc(req.params.documentId);
    res.json({ success: true, data: poc });
  } catch (err) {
    next(err);
  }
});

router.get("/poc/:documentId/versions", ...clinicianOnly, async (req, res, next) => {
  try {
    const versions = await pocService.listPocVersions(req.params.documentId);
    res.json({ success: true, data: versions });
  } catch (err) {
    next(err);
  }
});

router.get("/poc/:documentId/versions/:version", ...clinicianOnly, async (req, res, next) => {
  try {
    const version = parseInt(req.params.version, 10);
    if (Number.isNaN(version) || version < 1) {
      throw new AppError("Invalid version", 400);
    }
    const poc = await pocService.getPocVersion(req.params.documentId, version);
    res.json({ success: true, data: poc });
  } catch (err) {
    next(err);
  }
});

router.post("/poc/:documentId/edit", ...clinicianOnly, async (req, res, next) => {
  try {
    const { edits } = req.body || {};
    const result = await pocService.editPocDraft(
      req.params.documentId,
      req.user.id,
      edits,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/poc/:documentId/approve", ...clinicianOnly, async (req, res, next) => {
  try {
    const result = await pocService.approvePoc(req.params.documentId, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
