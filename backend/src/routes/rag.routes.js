const { Router } = require("express");
const { authMiddleware, requireRole, assertCaseload } = require("../middleware/auth.middleware");
const ragService = require("../services/rag.service");

const router = Router();

router.post(
  "/patient/rag/chat",
  authMiddleware,
  requireRole("PATIENT"),
  async (req, res, next) => {
    try {
      const result = await ragService.answerOwnPatientQuestion(req.user.id, req.body?.question);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/patients/:patientId/rag/chat",
  authMiddleware,
  requireRole("ADMIN", "CLINICIAN", "DOCTOR"),
  async (req, res, next) => {
    try {
      await assertCaseload(req, { patientId: req.params.patientId });
      const result = await ragService.answerPatientQuestion({
        patientId: req.params.patientId,
        question: req.body?.question,
        userId: req.user.id,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
