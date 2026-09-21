import { body } from "express-validator";

const emailRule = body("email")
  .trim()
  .isEmail()
  .withMessage("Enter a valid email address.")
  .normalizeEmail();

const passwordRule = body("password")
  .isString()
  .isLength({ min: 8, max: 72 })
  .withMessage("Password must be 8–72 characters.");

export const registerValidators = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be 2–100 characters."),
  emailRule,
  passwordRule,
  body("confirmPassword")
    .isString()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match.")
];

export const loginValidators = [emailRule, passwordRule];

export const otpValidators = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("otp")
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("OTP must be a 6-digit code.")
];
