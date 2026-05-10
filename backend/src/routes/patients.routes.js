const { Router } = require("express");
const { authMiddleware, requireRole } = require("../middleware/auth.middleware");
const patientService = require("../services/patient.service");
const emailService = require("../services/email.service");

const router = Router();

// Anyone authenticated can list patients (clinicians/admins use this; viewers won't access UI)
router.get("/patients", authMiddleware, requireRole("CLINICIAN", "ADMIN"), async (req, res, next) => {
  try {
    const patients = await patientService.listPatients();
    res.json({ success: true, data: { patients } });
  } catch (err) {
    next(err);
  }
});

// Create a patient login
router.post("/patients", authMiddleware, requireRole("CLINICIAN", "ADMIN"), async (req, res, next) => {
  try {
    const { email, firstName, lastName } = req.body;
    const result = await patientService.createPatient({
      email,
      firstName,
      lastName,
      clinician: req.user,
    });
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
  } catch (err) {
    next(err);
  }
});

// Resend credentials (regenerates password)
router.post("/patients/:id/resend", authMiddleware, requireRole("CLINICIAN", "ADMIN"), async (req, res, next) => {
  try {
    const result = await patientService.resendPatientCredentials({
      patientId: req.params.id,
      clinician: req.user,
    });
    res.json({
      success: true,
      data: {
        patient: result.patient,
        plainPassword: result.plainPassword,
        emailDelivered: result.emailDelivered,
        emailReason: result.emailReason,
        emailConfigured: emailService.isConfigured(),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
