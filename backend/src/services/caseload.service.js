const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");

/**
 * For CLINICIAN — list patients on caseload.
 */
async function clinicianPatients(user, { search } = {}) {
  const where = { clinicId: user.clinicId, primaryClinicianId: user.id };
  if (search) {
    where.OR = [
      { mrn: { contains: search, mode: "insensitive" } },
      { user: { firstName: { contains: search, mode: "insensitive" } } },
      { user: { lastName: { contains: search, mode: "insensitive" } } },
    ];
  }
  return prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      primaryDoctor: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { documents: true } },
    },
  });
}

async function clinicianPatientDetail(user, patientId) {
  const p = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: user.clinicId, primaryClinicianId: user.id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      primaryDoctor: { select: { id: true, firstName: true, lastName: true } },
      primaryClinician: { select: { id: true, firstName: true, lastName: true } },
      documents: {
        orderBy: { uploadedAt: "desc" },
        select: { id: true, filename: true, status: true, uploadedAt: true },
      },
    },
  });
  if (!p) throw new AppError("NOT_FOUND", 404);
  return p;
}

/**
 * For DOCTOR — strict read-only on assigned patients.
 */
async function doctorPatients(user) {
  return prisma.patient.findMany({
    where: { clinicId: user.clinicId, primaryDoctorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      primaryClinician: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { documents: true } },
    },
  });
}

async function doctorPatientDetail(user, patientId) {
  const p = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: user.clinicId, primaryDoctorId: user.id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      primaryDoctor: { select: { id: true, firstName: true, lastName: true } },
      primaryClinician: { select: { id: true, firstName: true, lastName: true } },
      documents: {
        orderBy: { uploadedAt: "desc" },
        select: { id: true, filename: true, status: true, uploadedAt: true },
      },
    },
  });
  if (!p) throw new AppError("NOT_FOUND", 404);
  return p;
}

/**
 * For PATIENT — own profile.
 */
async function selfProfile(user) {
  const p = await prisma.patient.findFirst({
    where: { userId: user.id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      primaryDoctor: { select: { id: true, firstName: true, lastName: true } },
      primaryClinician: { select: { id: true, firstName: true, lastName: true } },
      clinic: { select: { id: true, name: true } },
    },
  });
  // PATIENT may not have a Patient row yet (legacy account) — return User-only fallback
  if (!p) {
    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      mrn: null, dateOfBirth: null, primaryDoctor: null, primaryClinician: null, clinic: null,
    };
  }
  return p;
}

async function selfDocuments(user) {
  const p = await prisma.patient.findFirst({ where: { userId: user.id }, select: { id: true } });
  if (!p) return [];
  return prisma.document.findMany({
    where: { patientId: p.id },
    orderBy: { uploadedAt: "desc" },
    select: { id: true, filename: true, status: true, uploadedAt: true },
  });
}

async function selfLatestPoc(user) {
  const p = await prisma.patient.findFirst({ where: { userId: user.id }, select: { id: true } });
  if (!p) throw new AppError("Patient profile not found", 404);

  const poc = await prisma.generatedPoc.findFirst({
    where: {
      document: {
        patientId: p.id,
        status: { in: ["POC_GENERATED", "RISK_SCORED"] },
      },
    },
    orderBy: { generatedAt: "desc" },
    include: {
      document: {
        select: {
          id: true,
          filename: true,
          status: true,
          uploadedAt: true,
        },
      },
    },
  });

  if (!poc) throw new AppError("No generated Plan of Care found for this patient", 404);
  return poc;
}

module.exports = {
  clinicianPatients,
  clinicianPatientDetail,
  doctorPatients,
  doctorPatientDetail,
  selfProfile,
  selfDocuments,
  selfLatestPoc,
};
