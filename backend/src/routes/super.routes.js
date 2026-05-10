const { Router } = require("express");
const { authMiddleware, requireRole } = require("../middleware/auth.middleware");
const superService = require("../services/super.service");
const { logAction } = require("../services/audit.service");

const router = Router();
const guard = [authMiddleware, requireRole("SUPER_ADMIN")];

router.get("/super/clinics", ...guard, async (_req, res, next) => {
  try {
    res.json({ success: true, data: { clinics: await superService.listClinics() } });
  } catch (e) { next(e); }
});

router.post("/super/clinics", ...guard, async (req, res, next) => {
  try {
    const c = await superService.createClinic({ name: req.body.name });
    await logAction("super.clinic.create", req.user.id, null, { clinicId: c.id, name: c.name });
    res.status(201).json({ success: true, data: c });
  } catch (e) { next(e); }
});

router.get("/super/clinics/:id", ...guard, async (req, res, next) => {
  try {
    res.json({ success: true, data: await superService.getClinic(req.params.id) });
  } catch (e) { next(e); }
});

router.patch("/super/clinics/:id", ...guard, async (req, res, next) => {
  try {
    const updated = await superService.updateClinic(req.params.id, req.body);
    await logAction("super.clinic.update", req.user.id, null, { clinicId: req.params.id, patch: req.body });
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

router.post("/super/clinics/:id/admins", ...guard, async (req, res, next) => {
  try {
    const admin = await superService.createInitialAdmin(req.params.id, req.body);
    await logAction("super.clinic.admin.create", req.user.id, null, {
      clinicId: req.params.id, adminUserId: admin.id, adminEmail: admin.email,
    });
    res.status(201).json({ success: true, data: admin });
  } catch (e) { next(e); }
});

router.get("/super/audit-log", ...guard, async (req, res, next) => {
  try {
    const data = await superService.listPlatformAuditLog({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      action: req.query.action,
      clinicId: req.query.clinicId,
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get("/super/metrics", ...guard, async (_req, res, next) => {
  try {
    res.json({ success: true, data: await superService.platformMetrics() });
  } catch (e) { next(e); }
});

router.post("/super/users/:id/disable", ...guard, async (req, res, next) => {
  try {
    res.json({ success: true, data: await superService.disableUser(req.params.id, req.user.id) });
  } catch (e) { next(e); }
});

module.exports = router;
