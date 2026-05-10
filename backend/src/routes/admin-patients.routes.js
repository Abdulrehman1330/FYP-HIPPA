const { Router } = require("express");
const { authMiddleware, requireRole } = require("../middleware/auth.middleware");
const adminPatientService = require("../services/admin-patient.service");
const emailService = require("../services/email.service");
const { AppError } = require("../middleware/error.middleware");

const router = Router();
const guard = [authMiddleware, requireRole("ADMIN")];

function requireClinic(req) {
  if (!req.user.clinicId) throw new AppError("ADMIN must be attached to a clinic", 400);
  return req.user.clinicId;
}

router.get("/admin/patients", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    const patients = await adminPatientService.listPatients(clinicId, { search: req.query.q });
    res.json({ success: true, data: { patients } });
  } catch (e) { next(e); }
});

router.post("/admin/patients", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    const result = await adminPatientService.createPatient(clinicId, req.user, req.body);
    res.status(201).json({
      success: true,
      data: {
        patient: result.patient,
        plainPassword: result.plainPassword,
        emailDelivered: result.emailDelivered,
        emailReason: result.emailReason,
        emailConfigured: emailService.isConfigured(),
      },
    });
  } catch (e) { next(e); }
});

router.get("/admin/patients/:id", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    res.json({ success: true, data: await adminPatientService.getPatient(clinicId, req.params.id) });
  } catch (e) { next(e); }
});

router.patch("/admin/patients/:id/assignment", ...guard, async (req, res, next) => {
  try {
    const clinicId = requireClinic(req);
    res.json({
      success: true,
      data: await adminPatientService.reassignPatient(clinicId, req.params.id, req.user, req.body),
    });
  } catch (e) { next(e); }
});

module.exports = router;
