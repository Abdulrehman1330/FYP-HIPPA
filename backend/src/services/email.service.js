const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null; // Not configured
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

function isConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendPatientCredentials({ to, firstName, lastName, email, password, clinicianName }) {
  const tx = getTransporter();
  const fullName = `${firstName} ${lastName}`.trim();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || "HippaClinical";
  const portalUrl = process.env.PATIENT_PORTAL_URL || "http://localhost:5174";

  const subject = "Your HippaClinical patient portal access";

  const text = [
    `Hello ${fullName},`,
    ``,
    `${clinicianName} has set up a patient account for you on HippaClinical, a HIPAA-compliant patient portal.`,
    ``,
    `Sign in here: ${portalUrl}`,
    ``,
    `Email:    ${email}`,
    `Password: ${password}`,
    ``,
    `For your security, please change your password after your first sign-in.`,
    ``,
    `If you did not expect this email, please contact your clinician.`,
    ``,
    `— HippaClinical`,
  ].join("\n");

  const html = `
<!doctype html><html><body style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f4f6f9; padding:24px; margin:0;">
  <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px 36px; border:1px solid #e2e8f0;">
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:24px;">
      <div style="width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg, #2a8a82, #4ab1a3); color:#fff; display:inline-grid; place-items:center; font-weight:700; font-size:14px;">H</div>
      <div style="font-size:18px; font-weight:600; color:#0e2030;">HippaClinical</div>
    </div>

    <h2 style="font-size:22px; font-weight:600; color:#0e2030; margin:0 0 8px;">Welcome, ${fullName}</h2>
    <p style="font-size:14px; color:#475569; line-height:1.55; margin:0 0 24px;">
      ${clinicianName} has set up a patient account for you on HippaClinical. You can sign in to view your plan of care, medication schedule, and visit history.
    </p>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; margin-bottom:24px;">
      <div style="font-size:11px; font-weight:600; letter-spacing:0.12em; color:#94a3b8; text-transform:uppercase; margin-bottom:10px;">Your Login Credentials</div>
      <div style="font-size:13.5px; color:#0e2030; margin-bottom:6px;"><strong>Email:</strong> <span style="font-family:Consolas,Menlo,monospace;">${email}</span></div>
      <div style="font-size:13.5px; color:#0e2030;"><strong>Password:</strong> <span style="font-family:Consolas,Menlo,monospace;">${password}</span></div>
    </div>

    <a href="${portalUrl}" style="display:inline-block; background:linear-gradient(135deg, #2a8a82, #4ab1a3); color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">Sign in to portal</a>

    <p style="font-size:12.5px; color:#64748b; line-height:1.55; margin:28px 0 0;">
      For your security, please change your password after your first sign-in. If you didn't expect this email, please contact your clinician.
    </p>

    <hr style="border:0; border-top:1px solid #e2e8f0; margin:24px 0 16px;" />
    <div style="font-size:11px; color:#94a3b8;">HippaClinical · HIPAA-compliant clinical intake platform</div>
  </div>
</body></html>`;

  if (!tx) {
    // Email not configured — log and return delivered:false so caller can show creds in UI
    logger.warn(`SMTP not configured — patient credentials NOT emailed to ${to}`);
    return { delivered: false, reason: "SMTP not configured" };
  }

  try {
    const info = await tx.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Patient credentials emailed to ${to} (messageId=${info.messageId})`);
    return { delivered: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Failed to email patient credentials to ${to}: ${err.message}`);
    return { delivered: false, reason: err.message };
  }
}

module.exports = { sendPatientCredentials, isConfigured };
