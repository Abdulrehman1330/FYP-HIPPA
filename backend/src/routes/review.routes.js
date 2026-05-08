const { Router } = require("express");
const { authMiddleware, requireRole } = require("../middleware/auth.middleware");
const reviewService = require("../services/review.service");

const router = Router();

const reviewerOnly = [authMiddleware, requireRole("CLINICIAN", "ADMIN")];

router.get("/review/queue", ...reviewerOnly, async (req, res, next) => {
  try {
    const queue = await reviewService.getReviewQueue();
    res.json({ success: true, data: queue });
  } catch (err) {
    next(err);
  }
});

router.get("/review/:id", ...reviewerOnly, async (req, res, next) => {
  try {
    const data = await reviewService.getReviewDetail(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/review/:id/claim", ...reviewerOnly, async (req, res, next) => {
  try {
    await reviewService.claimReview(req.params.id, req.user.id);
    res.json({
      success: true,
      data: { documentId: req.params.id, status: "IN_REVIEW" },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/review/:id/release", ...reviewerOnly, async (req, res, next) => {
  try {
    await reviewService.releaseReview(req.params.id, req.user.id);
    res.json({
      success: true,
      data: { documentId: req.params.id, status: "EXTRACTED" },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/review/:id/approve", ...reviewerOnly, async (req, res, next) => {
  try {
    const { comments } = req.body || {};
    await reviewService.approveDocument(req.params.id, req.user.id, comments);
    res.json({ success: true, data: { status: "APPROVED" } });
  } catch (err) {
    next(err);
  }
});

router.post("/review/:id/edit", ...reviewerOnly, async (req, res, next) => {
  try {
    const { edits, comments } = req.body || {};
    await reviewService.editAndApprove(
      req.params.id,
      req.user.id,
      edits,
      comments,
    );
    res.json({
      success: true,
      data: {
        status: "APPROVED",
        editCount: Object.keys(edits || {}).length,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/review/:id/reject", ...reviewerOnly, async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    await reviewService.rejectDocument(req.params.id, req.user.id, reason);
    res.json({ success: true, data: { status: "REJECTED" } });
  } catch (err) {
    next(err);
  }
});

router.get("/review/:id/metrics", ...reviewerOnly, async (req, res, next) => {
  try {
    const metrics = await reviewService.getReviewMetrics(req.params.id);
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
