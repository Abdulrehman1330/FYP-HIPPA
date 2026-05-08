import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config/env";

export function signToken(userId: string, email: string): string {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn,
  };
  return jwt.sign({ userId, email }, config.jwtSecret as Secret, options);
}

export function verifyToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, config.jwtSecret) as {
    userId: string;
    email: string;
  };
}
