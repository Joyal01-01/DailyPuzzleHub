import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "dailypuzzlehub-secret-key-2026";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  country: string;
}

export function signUserToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyUserToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getSessionFromHeader(authHeader?: string | null): TokenPayload | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  return verifyUserToken(token);
}
