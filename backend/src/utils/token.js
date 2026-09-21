import jwt from "jsonwebtoken";

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
