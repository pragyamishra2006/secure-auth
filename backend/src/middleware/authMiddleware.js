import { verifyAuthToken } from "../utils/token.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required."
    });
  }

  try {
    const payload = verifyAuthToken(token);
    req.auth = payload;
    next();
  } catch {
    res.clearCookie("auth_token", cookieOptions());
    return res.status(401).json({
      success: false,
      message: "Session expired. Please log in again."
    });
  }
}

export function cookieOptions() {
  const production = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000
  };
}
