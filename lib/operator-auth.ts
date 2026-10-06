import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { tenantEnvironmentKey } from "./tenant-env";

export function operatorSessionCookieName(tenantId: string): string {
  const tenantKey = tenantId.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `aroadmap_operator_${tenantKey}_session`;
}

const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function getOperatorConfig(tenantId: string) {
  return {
    password: process.env[tenantEnvironmentKey("AROADMAP_OPERATOR_PASSWORD", tenantId)] || "",
    sessionSecret: process.env[tenantEnvironmentKey("AROADMAP_OPERATOR_SESSION_SECRET", tenantId)] || "",
  };
}

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function isOperatorAuthConfigured(tenantId: string): boolean {
  const { password, sessionSecret } = getOperatorConfig(tenantId);
  return Buffer.byteLength(password) >= 32 && Buffer.byteLength(sessionSecret) >= 32;
}

export function verifyOperatorPassword(tenantId: string, password: string): boolean {
  const { password: expected } = getOperatorConfig(tenantId);
  return Boolean(isOperatorAuthConfigured(tenantId) && password && safeEqual(password, expected));
}

export function createOperatorSession(tenantId: string): {
  value: string;
  maxAge: number;
} {
  const { sessionSecret: secret } = getOperatorConfig(tenantId);
  if (Buffer.byteLength(secret) < 32) {
    throw new Error("Operator sessions are not configured for this tenant.");
  }
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const normalizedTenant = tenantId.toLowerCase().trim();
  const payload = Buffer.from(JSON.stringify({ expiresAt, tenantId: normalizedTenant })).toString("base64url");
  return {
    value: `${payload}.${signature(payload, secret)}`,
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function hasOperatorSession(req: NextRequest, tenantId: string): boolean {
  const { sessionSecret: secret } = getOperatorConfig(tenantId);
  const value = req.cookies.get(operatorSessionCookieName(tenantId))?.value;
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
      typeof decoded.expiresAt !== "number" ||
      !("tenantId" in decoded) ||
      decoded.tenantId !== tenantId.toLowerCase().trim()
    ) {
      return false;
    }
    return decoded.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
