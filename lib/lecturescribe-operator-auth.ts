import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

export const LECTURESCRIBE_OPERATOR_COOKIE = "lecturescribe_operator_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function getSessionSecret(): string {
  return process.env.AROADMAP_LECTURESCRIBE_SESSION_SECRET || "";
}

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function verifyLectureScribeOperatorPassword(password: string): boolean {
  const expected = process.env.AROADMAP_LECTURESCRIBE_OPERATOR_PASSWORD || "";
  return Boolean(expected && password && safeEqual(password, expected));
}

export function createLectureScribeOperatorSession(): {
  value: string;
  maxAge: number;
} {
  const secret = getSessionSecret();
  if (Buffer.byteLength(secret) < 32) {
    throw new Error("LectureScribe operator sessions are not configured.");
  }
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = Buffer.from(JSON.stringify({ expiresAt })).toString("base64url");
  return {
    value: `${payload}.${signature(payload, secret)}`,
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function hasLectureScribeOperatorSession(req: NextRequest): boolean {
  const secret = getSessionSecret();
  const value = req.cookies.get(LECTURESCRIBE_OPERATOR_COOKIE)?.value;
  if (!secret || !value) return false;

  const [payload, providedSignature, extra] = value.split(".");
  if (!payload || !providedSignature || extra) return false;
  if (!safeEqual(providedSignature, signature(payload, secret))) return false;

  try {
    const decoded: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("expiresAt" in decoded) ||
      typeof decoded.expiresAt !== "number"
    ) {
      return false;
    }
    return decoded.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
