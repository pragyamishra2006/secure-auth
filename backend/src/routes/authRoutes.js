import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  me,
  logout
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  registerValidators,
  loginValidators,
  otpValidators
} from "../validators/authValidators.js";

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later."
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later."
  }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later."
  }
});

router.post("/register", registerLimiter, registerValidators, register);
router.post("/verify-otp", otpLimiter, otpValidators, verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/login", loginLimiter, loginValidators, login);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);

export default router;
