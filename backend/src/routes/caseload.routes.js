const { Router } = require("express");
const { authMiddleware, requireRole, assertCaseload } = require("../middleware/auth.middleware");
const caseload = require("../services/caseload.service");

const router = Router();

// ====== CLINICIAN ======
const clinicianGuard = [authMiddleware, requireRole("CLINICIAN", "ADMIN")];

router.get("/clinician/patients", ...clinicianGuard, async (req, res, next) => {
  try {
    const data = await caseload.clinicianPatients(req.user, { search: req.query.q });
    res.json({ success: true, data: { patients: data } });
  } catch (e) { next(e); }
});

router.get("/clinician/patients/:id", ...clinicianGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { patientId: req.params.id });
    res.json({ success: true, data: await caseload.clinicianPatientDetail(req.user, req.params.id) });
  } catch (e) { next(e); }
});

// ====== DOCTOR (read-only) ======
const doctorGuard = [authMiddleware, requireRole("DOCTOR")];

router.get("/doctor/patients", ...doctorGuard, async (req, res, next) => {
  try {
    res.json({ success: true, data: { patients: await caseload.doctorPatients(req.user) } });
  } catch (e) { next(e); }
});

router.get("/doctor/patients/:id", ...doctorGuard, async (req, res, next) => {
  try {
    await assertCaseload(req, { patientId: req.params.id });
    res.json({ success: true, data: await caseload.doctorPatientDetail(req.user, req.params.id) });
  } catch (e) { next(e); }
});

// ====== /me — PATIENT self-service ======
const patientGuard = [authMiddleware, requireRole("PATIENT")];

router.get("/me/profile", ...patientGuard, async (req, res, next) => {
  try {
    res.json({ success: true, data: await caseload.selfProfile(req.user) });
  } catch (e) { next(e); }
});

router.get("/me/documents", ...patientGuard, async (req, res, next) => {
  try {
    res.json({ success: true, data: { documents: await caseload.selfDocuments(req.user) } });
  } catch (e) { next(e); }
});

module.exports = router;
