const { Router } = require("express");
const { authMiddleware, requireRole } = require("../middleware/auth.middleware");
const adminService = require("../services/admin.service");
const { AppError } = require("../middleware/error.middleware");
const emailService = require("../services/email.service");

const router = Router();
const guard = [authMiddleware, requireRole("ADMIN")];

function requireClinic(req) {
  if (!req.user.clinicId) throw new AppError("ADMIN must be attached to a clinic", 400);
  return req.user.clinicId;
}

router.get("/admin/users", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    const users = await adminService.listUsers(clinicId, { role: req.query.role });
    res.json({ success: true, data: { users } });
  } catch (e) { next(e); }
});

router.post("/admin/users", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    const result = await adminService.createUser(clinicId, req.user, req.body);
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        plainPassword: result.plainPassword,
        emailDelivered: result.emailDelivered,
        emailReason: result.emailReason,
        emailConfigured: emailService.isConfigured(),
      },
    });
  } catch (e) { next(e); }
});

router.get("/admin/users/:id", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    res.json({ success: true, data: await adminService.getUser(clinicId, req.params.id) });
  } catch (e) { next(e); }
});

router.patch("/admin/users/:id", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    res.json({ success: true, data: await adminService.updateUser(clinicId, req.params.id, req.user, req.body) });
  } catch (e) { next(e); }
});

router.post("/admin/users/:id/disable", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    res.json({ success: true, data: await adminService.disableUser(clinicId, req.params.id, req.user) });
  } catch (e) { next(e); }
});

router.post("/admin/users/:id/enable", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    res.json({ success: true, data: await adminService.enableUser(clinicId, req.params.id, req.user) });
  } catch (e) { next(e); }
});

router.post("/admin/users/:id/reset-password", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    const r = await adminService.resetPassword(clinicId, req.params.id, req.user);
    res.json({
      success: true,
      data: { ...r, emailConfigured: emailService.isConfigured() },
    });
  } catch (e) { next(e); }
});

router.get("/admin/audit-log", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    const data = await adminService.listClinicAuditLog(clinicId, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      action: req.query.action,
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

module.exports = router;
