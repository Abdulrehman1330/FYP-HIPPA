const { Router } = require("express");
const { authMiddleware, requireRole, assertCaseload } = require("../middleware/auth.middleware");
const reviewService = require("../services/review.service");
const prisma = require("../config/database");

const router = Router();
const reviewerOnly = [authMiddleware, requireRole("CLINICIAN", "ADMIN")];

// Queue is filtered by clinic + caseload
router.get("/review/queue", ...reviewerOnly, async (req, res, next) => {
  try {
    const queue = await reviewService.getReviewQueue();
    // Filter to caller's clinic & caseload (defense in depth — service may not yet scope)
    const filtered = await Promise.all(
      queue.map(async (item) => {
        const doc = await prisma.document.findUnique({
          where: { id: item.documentId || item.id },
          select: { clinicId: true, patientId: true, userId: true, patient: { select: { primaryClinicianId: true } } },
        });
        if (!doc) return null;
        if (doc.clinicId && doc.clinicId !== req.user.clinicId) return null;
        if (req.user.role === "CLINICIAN") {
          const isMine = doc.userId === req.user.id || doc.patient?.primaryClinicianId === req.user.id;
          if (!isMine) return null;
        }
        return item;
      })
    );
    res.json({ success: true, data: filtered.filter(Boolean) });
  } catch (err) { next(err); }
});

router.get("/review/:id", ...reviewerOnly, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.id });
    const data = await reviewService.getReviewDetail(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post("/review/:id/claim", ...reviewerOnly, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.id });
    await reviewService.claimReview(req.params.id, req.user.id);
    res.json({ success: true, data: { documentId: req.params.id, status: "IN_REVIEW" } });
  } catch (err) { next(err); }
});

router.post("/review/:id/release", ...reviewerOnly, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.id });
    await reviewService.releaseReview(req.params.id, req.user.id);
    res.json({ success: true, data: { documentId: req.params.id, status: "EXTRACTED" } });
  } catch (err) { next(err); }
});

router.post("/review/:id/approve", ...reviewerOnly, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.id });
    const { comments } = req.body || {};
    await reviewService.approveDocument(req.params.id, req.user.id, comments);
    res.json({ success: true, data: { status: "APPROVED" } });
  } catch (err) { next(err); }
});

router.post("/review/:id/edit", ...reviewerOnly, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.id });
    const { edits, comments } = req.body || {};
    await reviewService.editAndApprove(req.params.id, req.user.id, edits, comments);
    res.json({ success: true, data: { status: "APPROVED", editCount: Object.keys(edits || {}).length } });
  } catch (err) { next(err); }
});

router.post("/review/:id/reject", ...reviewerOnly, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.id });
    const { reason } = req.body || {};
    await reviewService.rejectDocument(req.params.id, req.user.id, reason);
    res.json({ success: true, data: { status: "REJECTED" } });
  } catch (err) { next(err); }
});

router.get("/review/:id/metrics", ...reviewerOnly, async (req, res, next) => {
  try {
    await assertCaseload(req, { documentId: req.params.id });
    res.json({ success: true, data: await reviewService.getReviewMetrics(req.params.id) });
  } catch (err) { next(err); }
});

module.exports = router;
