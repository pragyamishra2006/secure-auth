import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import pool from "../config/db.js";
import { sendOtpEmail } from "../utils/email.js";
import { generateOtp, hashOtp, otpExpiresAt, OTP_MAX_ATTEMPTS, OTP_RESEND_SECONDS } from "../utils/otp.js";
import { signAuthToken } from "../utils/token.js";
import { cookieOptions } from "../middleware/authMiddleware.js";

function validationError(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    });
    return true;
  }
  return false;
}

export async function register(req, res, next) {
  try {
    if (validationError(req, res)) return;

    const fullName = req.body.fullName.trim();
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password;

    const [existing] = await pool.execute(
      "SELECT id, is_verified FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length && existing[0].is_verified) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = otpExpiresAt();

    if (existing.length) {
      await pool.execute(
        `UPDATE users
         SET full_name = ?, password_hash = ?, otp_hash = ?, otp_expires_at = ?,
             otp_attempts = 0, otp_last_sent_at = NOW()
         WHERE id = ?`,
        [fullName, passwordHash, otpHash, expiresAt, existing[0].id]
      );
    } else {
      await pool.execute(
        `INSERT INTO users
         (full_name, email, password_hash, is_verified, otp_hash, otp_expires_at, otp_attempts, otp_last_sent_at)
         VALUES (?, ?, ?, FALSE, ?, ?, 0, NOW())`,
        [fullName, email, passwordHash, otpHash, expiresAt]
      );
    }

    try {
      await sendOtpEmail(email, fullName, otp);
    } catch (mailError) {
      console.error("OTP email failed:", mailError.message);
      await pool.execute("DELETE FROM users WHERE email = ? AND is_verified = FALSE", [email]);
      return res.status(502).json({
        success: false,
        message: "We could not send the verification email. Check SMTP configuration and try again."
      });
    }

    res.status(201).json({
      success: true,
      message: "Verification code sent to your email.",
      email
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    if (validationError(req, res)) return;

    const email = req.body.email.toLowerCase().trim();
    const otp = req.body.otp;

    const [rows] = await pool.execute(
      `SELECT id, full_name, email, otp_hash, otp_expires_at, otp_attempts, is_verified
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification request."
      });
    }

    const user = rows[0];

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "This account is already verified."
      });
    }

    if (!user.otp_hash || !user.otp_expires_at || new Date(user.otp_expires_at) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This OTP has expired. Request a new code."
      });
    }

    if (user.otp_attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP."
      });
    }

    const isMatch = hashOtp(otp) === user.otp_hash;

    if (!isMatch) {
      await pool.execute(
        "UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = ?",
        [user.id]
      );

      const remaining = Math.max(0, OTP_MAX_ATTEMPTS - user.otp_attempts - 1);

      return res.status(400).json({
        success: false,
        message: remaining
          ? `Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Incorrect OTP. Request a new code."
      });
    }

    await pool.execute(
      `UPDATE users
       SET is_verified = TRUE, otp_hash = NULL, otp_expires_at = NULL,
           otp_attempts = 0, otp_last_sent_at = NULL
       WHERE id = ?`,
      [user.id]
    );

    res.json({
      success: true,
      message: "Email verified successfully. Your account is now active."
    });
  } catch (error) {
    next(error);
  }
}

export async function resendOtp(req, res, next) {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address."
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, full_name, is_verified, otp_last_sent_at
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "No pending verification was found for this email."
      });
    }

    const user = rows[0];

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "This account is already verified. You can log in."
      });
    }

    if (user.otp_last_sent_at) {
      const secondsSinceLast = Math.floor(
        (Date.now() - new Date(user.otp_last_sent_at).getTime()) / 1000
      );

      if (secondsSinceLast < OTP_RESEND_SECONDS) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${OTP_RESEND_SECONDS - secondsSinceLast}s before requesting another OTP.`
        });
      }
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = otpExpiresAt();

    await pool.execute(
      `UPDATE users
       SET otp_hash = ?, otp_expires_at = ?, otp_attempts = 0, otp_last_sent_at = NOW()
       WHERE id = ?`,
      [otpHash, expiresAt, user.id]
    );

    try {
      await sendOtpEmail(email, user.full_name, otp);
    } catch (mailError) {
      console.error("Resend OTP email failed:", mailError.message);
      return res.status(502).json({
        success: false,
        message: "Unable to send the new OTP right now."
      });
    }

    res.json({
      success: true,
      message: "A new verification code has been sent."
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    if (validationError(req, res)) return;

    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password;

    const [rows] = await pool.execute(
      `SELECT id, full_name, email, password_hash, is_verified
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = rows[0];

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in."
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = signAuthToken(user);

    res.cookie("auth_token", token, cookieOptions());

    res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, full_name, email, is_verified, created_at FROM users WHERE id = ? LIMIT 1",
      [req.auth.sub]
    );

    if (!rows.length || !rows[0].is_verified) {
      return res.status(401).json({
        success: false,
        message: "User account is not available."
      });
    }

    res.json({
      success: true,
      user: {
        id: rows[0].id,
        fullName: rows[0].full_name,
        email: rows[0].email,
        verified: Boolean(rows[0].is_verified),
        createdAt: rows[0].created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res) {
  res.clearCookie("auth_token", cookieOptions());
  res.json({
    success: true,
    message: "Logged out successfully."
  });
}
