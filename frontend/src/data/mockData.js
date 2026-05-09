const PATIENTS = [
  { id: "SYN_001", name: "Alexander A. Hill",   dob: "1948-03-12", sex: "M", state: "NE", zip: "66738", soc: "2026-05-07", primary_dx: "I50.9 — Heart failure, unspecified",        secondary: ["E11.9 Type 2 diabetes", "I10 Hypertension"],          risk: 0.62, riskClass: "high",   docs: 4 },
  { id: "SYN_002", name: "Maria E. Carrillo",   dob: "1952-07-22", sex: "F", state: "TX", zip: "78212", soc: "2026-05-04", primary_dx: "J44.9 — COPD, unspecified",                 secondary: ["F32.9 Major depressive disorder"],                    risk: 0.41, riskClass: "medium", docs: 3 },
  { id: "SYN_003", name: "Robert S. Okafor",    dob: "1961-11-04", sex: "M", state: "IL", zip: "60615", soc: "2026-04-30", primary_dx: "N18.3 — Chronic kidney disease, stage 3",    secondary: ["I10 Hypertension"],                                   risk: 0.27, riskClass: "medium", docs: 2 },
  { id: "SYN_004", name: "Linh P. Nguyen",      dob: "1944-01-19", sex: "F", state: "CA", zip: "92103", soc: "2026-05-08", primary_dx: "S72.001A — Fracture of femur",               secondary: ["M81.0 Osteoporosis"],                                 risk: 0.48, riskClass: "high",   docs: 5 },
  { id: "SYN_005", name: "Eleanor T. Brooks",   dob: "1939-09-30", sex: "F", state: "GA", zip: "30309", soc: "2026-05-02", primary_dx: "G30.9 — Alzheimer's disease",                secondary: ["F03.90 Dementia"],                                    risk: 0.35, riskClass: "medium", docs: 2 },
  { id: "SYN_006", name: "Daniel J. Whitfield", dob: "1955-05-08", sex: "M", state: "PA", zip: "19103", soc: "2026-05-06", primary_dx: "L97.521 — Diabetic foot ulcer",               secondary: ["E11.9 Type 2 diabetes"],                              risk: 0.18, riskClass: "low",    docs: 1 },
];

const FIELDS_TEMPLATE = [
  { key: "patient_name",        label: "Patient name",              oasis: "M0040",  value: "Alexander A. Hill", confidence: 0.96, section: "Administrative" },
  { key: "date_of_birth",       label: "Date of birth",             oasis: "M0066",  value: "1948-03-12",        confidence: 0.92, section: "Administrative" },
  { key: "patient_id",          label: "Patient ID",                oasis: "M0020",  value: "SYN_001",           confidence: 0.91, section: "Administrative" },
  { key: "soc_date",            label: "Start of care",             oasis: "M0030",  value: "2026-05-07",        confidence: 0.95, section: "Administrative" },
  { key: "assessment_date",     label: "Assessment date",           oasis: "M0090",  value: "2026-05-08",        confidence: 0.96, section: "Administrative" },
  { key: "state",               label: "State",                     oasis: "M0050",  value: "NE",                confidence: 0.66, section: "Administrative", warn: "Low confidence" },
  { key: "zip",                 label: "ZIP code",                  oasis: "M0060",  value: "66738",             confidence: 0.96, section: "Administrative" },
  { key: "primary_diagnosis",   label: "Primary diagnosis",         oasis: "M1021",  value: "Heart failure, unspecified", confidence: 0.78, section: "Clinical" },
  { key: "primary_icd10",       label: "Primary ICD-10",            oasis: "M1021",  value: "I50.9",             confidence: 0.42, section: "Clinical", warn: "Low confidence — verify with chart" },
  { key: "secondary_dx",        label: "Other diagnoses",           oasis: "M1023",  value: "E11.9; I10",        confidence: 0.31, section: "Clinical", warn: "Below threshold" },
  { key: "risk_hospitalization", label: "Risk for hospitalization",  oasis: "M1033",  value: "1, 3, 8",           confidence: 0.55, section: "Clinical", warn: "Verify selections" },
  { key: "living_situation",    label: "Living situation",           oasis: "M1100",  value: "01 — Patient lives alone", confidence: 0.62, section: "Living" },
  { key: "emergent_care",       label: "Emergent care since SOC",   oasis: "M2301",  value: "0 — No",            confidence: 0.84, section: "Episode" },
  { key: "discharge_date",      label: "Discharge date",            oasis: "M1005",  value: "—",                 confidence: 0.15, section: "Episode", warn: "Field empty / illegible" },
  { key: "medications",         label: "Medications",               oasis: "M2001",  value: "Furosemide 40mg, Lisinopril 10mg, Metformin 500mg, Atorvastatin 20mg, Aspirin 81mg", confidence: 0.71, section: "Medications" },
  { key: "allergies",           label: "Allergies",                 oasis: "M2003",  value: "Penicillin (rash)",  confidence: 0.88, section: "Medications" },
  { key: "mobility_score",      label: "Mobility (M1860)",          oasis: "M1860",  value: "3 — Able to walk only with supervision", confidence: 0.81, section: "Functional" },
  { key: "adl_score",           label: "ADL composite",             oasis: "GG0130", value: "11 / 24",           confidence: 0.74, section: "Functional" },
];

export function fieldsFor(overrides = {}) {
  return FIELDS_TEMPLATE.map(f => ({
    ...f,
    value: overrides[f.key] ?? f.value,
  }));
}

const DOCS = [
  { id: "DOC-7821", patientId: "SYN_001", filename: "OASIS-E2_Hill_2026-05-08.pdf",  pages: 4, status: "IN_REVIEW",     uploadedBy: "A. Rasheed", uploadedAt: "2026-05-08T10:14:00Z", claimedBy: "Dr. J. Patel",  confAvg: 0.71, errors: 0, warnings: 4 },
  { id: "DOC-7820", patientId: "SYN_002", filename: "OASIS-E2_Carrillo.pdf",          pages: 3, status: "EXTRACTED",     uploadedBy: "A. Rasheed", uploadedAt: "2026-05-08T09:42:00Z", claimedBy: null,            confAvg: 0.83, errors: 0, warnings: 2 },
  { id: "DOC-7819", patientId: "SYN_004", filename: "Intake_Nguyen_p1-5.pdf",         pages: 5, status: "EXTRACTED",     uploadedBy: "M. Chen",    uploadedAt: "2026-05-08T09:08:00Z", claimedBy: null,            confAvg: 0.66, errors: 1, warnings: 3 },
  { id: "DOC-7818", patientId: "SYN_005", filename: "OASIS_Brooks_scan.png",          pages: 1, status: "APPROVED",      uploadedBy: "A. Rasheed", uploadedAt: "2026-05-07T16:55:00Z", claimedBy: "Dr. J. Patel",  confAvg: 0.77, errors: 0, warnings: 1 },
  { id: "DOC-7817", patientId: "SYN_003", filename: "OASIS-E2_Okafor.pdf",            pages: 4, status: "RISK_SCORED",   uploadedBy: "A. Rasheed", uploadedAt: "2026-05-07T14:22:00Z", claimedBy: "Dr. J. Patel",  confAvg: 0.85, errors: 0, warnings: 0 },
  { id: "DOC-7816", patientId: "SYN_006", filename: "Whitfield_assessment.pdf",       pages: 3, status: "POC_GENERATED", uploadedBy: "M. Chen",     uploadedAt: "2026-05-07T11:09:00Z", claimedBy: "Dr. K. Adler",  confAvg: 0.91, errors: 0, warnings: 0 },
  { id: "DOC-7815", patientId: "SYN_001", filename: "Med_history_Hill.pdf",           pages: 2, status: "REJECTED",      uploadedBy: "A. Rasheed", uploadedAt: "2026-05-06T08:30:00Z", claimedBy: "Dr. J. Patel",  confAvg: 0.34, errors: 5, warnings: 2 },
  { id: "DOC-7814", patientId: "SYN_002", filename: "Discharge_summary_C.pdf",        pages: 2, status: "APPROVED",      uploadedBy: "M. Chen",     uploadedAt: "2026-05-05T15:11:00Z", claimedBy: "Dr. K. Adler",  confAvg: 0.88, errors: 0, warnings: 1 },
];

const ACTIVITY = [
  { time: "2 min ago",  actor: "Dr. J. Patel",  action: "approved",        target: "DOC-7818", note: "OASIS-E2 — Brooks",              kind: "ok" },
  { time: "8 min ago",  actor: "OCR pipeline",   action: "extracted",       target: "DOC-7820", note: "32 fields, 2 warnings",          kind: "info" },
  { time: "14 min ago", actor: "A. Rasheed",      action: "uploaded",        target: "DOC-7821", note: "Patient SYN_001",                kind: "info" },
  { time: "21 min ago", actor: "Risk model",      action: "scored",          target: "DOC-7817", note: "0.27 → medium",                  kind: "warn" },
  { time: "47 min ago", actor: "Dr. K. Adler",    action: "edited 3 fields", target: "DOC-7816", note: "Frequency, duration, goals",     kind: "info" },
  { time: "1 hr ago",   actor: "Dr. J. Patel",    action: "rejected",        target: "DOC-7815", note: "Illegible — request rescan",     kind: "danger" },
  { time: "2 hr ago",   actor: "POC generator",   action: "generated POC",   target: "DOC-7816", note: "Whitfield — 6 sections",         kind: "ok" },
];

const AUDIT_TRAIL = [
  { time: "10:14:02", actor: "A. Rasheed",   action: "Uploaded document",                  icon: "upload" },
  { time: "10:14:18", actor: "OCR pipeline", action: "OCR extraction complete (32 fields)", icon: "scan",    meta: "4.5s · 4 pages" },
  { time: "10:14:19", actor: "Validator",    action: "Flagged 4 low-confidence fields",    icon: "flag" },
  { time: "10:18:44", actor: "Dr. J. Patel", action: "Claimed for review",                 icon: "claim" },
  { time: "10:23:11", actor: "Dr. J. Patel", action: "Edited primary_icd10",               icon: "edit",    meta: "I50.9 → I50.22" },
  { time: "10:24:02", actor: "Dr. J. Patel", action: "Edited risk_hospitalization",        icon: "edit",    meta: "1, 3, 8 → 1, 3" },
  { time: "10:25:30", actor: "Dr. J. Patel", action: "Added comment",                      icon: "comment", meta: "“Confirmed dx with cardiology consult.”" },
];

const POC_SECTIONS = [
  { key: "diagnoses",     title: "Diagnoses & Conditions", body: "Primary: Heart failure with reduced ejection fraction (I50.22). Secondary: Type 2 diabetes mellitus (E11.9), essential hypertension (I10). Patient is post-acute hospitalization for CHF exacerbation, discharged on 2026-05-04 to home with HHA services." },
  { key: "goals",         title: "Patient Goals",          body: "1. Patient will maintain stable cardiac status with no rehospitalization within 60-day episode.\n2. Patient will demonstrate independent medication self-administration by week 3.\n3. Patient will ambulate 100 ft with rolling walker and minimal assist by week 4." },
  { key: "interventions", title: "Skilled Interventions",  body: "SN: Daily assessment of cardiopulmonary status, weights, edema. Medication reconciliation. Patient/caregiver education on low-sodium diet and fluid restriction (1.5 L/day).\nPT: Gait training, lower-extremity strengthening, balance.\nOT: ADL training, energy conservation." },
  { key: "frequency",     title: "Visit Frequency",        body: "SN 3w x 2, then 2w x 4, then 1w x 3.\nPT 3w x 4, then 2w x 4.\nOT 2w x 3." },
  { key: "safety",        title: "Safety Measures",        body: "Fall precautions in home (clear pathways, removed throw rugs). Emergency action plan posted on refrigerator. Caregiver trained on when to call 911 vs. on-call nurse." },
  { key: "discharge",     title: "Discharge Planning",     body: "Anticipated discharge to self/caregiver care at end of episode if goals met. Coordinate with PCP for ongoing CHF management. Refer to outpatient cardiac rehab on episode close." },
];

const RISK_FACTORS = [
  { feature: "has_chf",               value: 1,  shap: 0.18,  label: "Active heart failure",          direction: "up" },
  { feature: "age",                   value: 78, shap: 0.14,  label: "Age 78",                        direction: "up" },
  { feature: "prior_hospitalization", value: 1,  shap: 0.11,  label: "Hospitalized < 30 days ago",    direction: "up" },
  { feature: "medication_count",      value: 9,  shap: 0.08,  label: "Polypharmacy (9 meds)",         direction: "up" },
  { feature: "mobility_score",        value: 35, shap: 0.05,  label: "Limited mobility",              direction: "up" },
  { feature: "low_confidence_fields", value: 4,  shap: -0.04, label: "Some fields unverified",        direction: "down" },
  { feature: "adl_score",             value: 11, shap: 0.03,  label: "ADL composite",                 direction: "up" },
];

const KPIS = [
  { label: "Documents processed", value: 1284, delta: "+8.4%", trend: [12,15,11,18,22,19,24,28,31,29,34,38] },
  { label: "Pending review",      value: 14,   delta: "-3",    trend: [22,20,19,21,18,17,15,16,14,15,14,14], warn: true },
  { label: "Approved this week",   value: 96,   delta: "+12",   trend: [4,6,9,11,13,18,16,22,26,28,30,32] },
  { label: "Risk alerts",          value: 7,    delta: "+2",    trend: [3,3,4,4,5,5,6,6,7,7,8,7], danger: true },
];

export const ROLE_USERS = {
  ADMIN:   { name: "M. Chen",        role: "ADMIN",   email: "admin@hippa.health",   title: "Compliance lead" },
  DOCTOR:  { name: "Dr. J. Patel",   role: "DOCTOR",  email: "j.patel@hippa.health", title: "MD · Internal medicine" },
  PATIENT: { name: "Linh P. Nguyen", role: "PATIENT", email: "linh.n@hippa.health",  title: "Patient · personal portal", patientId: "PT-1042" },
};

export const NAV = [
  { key: "dashboard", label: "Dashboard",     icon: "dashboard", roles: ["ADMIN","DOCTOR"], section: "Clinical" },
  { key: "upload",    label: "Upload",         icon: "upload",    roles: ["ADMIN","DOCTOR"], section: "Clinical" },
  { key: "review",    label: "Review queue",   icon: "review",    roles: ["ADMIN","DOCTOR"], section: "Clinical", count: 14 },
  { key: "poc",       label: "Plan of care",   icon: "poc",       roles: ["ADMIN","DOCTOR"], section: "Clinical" },
  { key: "risk",      label: "Risk scoring",   icon: "risk",      roles: ["ADMIN","DOCTOR"], section: "Clinical" },
  { key: "patients",  label: "All patients",   icon: "patients",  roles: ["ADMIN","DOCTOR"], section: "Clinical" },
  { key: "audit",     label: "Audit log",      icon: "audit",     roles: ["ADMIN"],          section: "Oversight" },
  { key: "dashboard", label: "My overview",    icon: "dashboard", roles: ["PATIENT"],        section: "My health" },
  { key: "poc",       label: "My care plan",   icon: "poc",       roles: ["PATIENT"],        section: "My health" },
  { key: "risk",      label: "My risk score",  icon: "risk",      roles: ["PATIENT"],        section: "My health" },
  { key: "patient",   label: "My record",      icon: "patients",  roles: ["PATIENT"],        section: "My health" },
];

export { PATIENTS, FIELDS_TEMPLATE, DOCS, ACTIVITY, AUDIT_TRAIL, POC_SECTIONS, RISK_FACTORS, KPIS };
