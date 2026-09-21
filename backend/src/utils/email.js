import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendOtpEmail(email, fullName, otp) {
  const mail = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Your SecureAuth verification code",
    text: `Hello ${fullName}, your verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#172033">
        <h2 style="margin-bottom:8px">Verify your email</h2>
        <p>Hello ${escapeHtml(fullName)},</p>
        <p>Use the verification code below to activate your SecureAuth account.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px 20px;background:#f1f5ff;border-radius:12px;text-align:center;margin:24px 0">${otp}</div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#667085;font-size:13px">If you did not request this code, you can safely ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mail);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
