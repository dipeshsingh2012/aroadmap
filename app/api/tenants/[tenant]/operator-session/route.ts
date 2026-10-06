import { NextRequest, NextResponse } from "next/server";
import {
  createOperatorSession,
  hasOperatorSession,
  isOperatorAuthConfigured,
  operatorSessionCookieName,
  verifyOperatorPassword,
} from "@/lib/operator-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  return NextResponse.json({
    configured: isOperatorAuthConfigured(tenant),
    authenticated: hasOperatorSession(req, tenant),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  if (!isOperatorAuthConfigured(tenant)) {
    return NextResponse.json({ error: "Operator sign-in is not configured for this tenant." }, { status: 503 });
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  if (typeof body.password !== "string" || body.password.length > 256) {
    return NextResponse.json({ error: "Invalid operator password." }, { status: 400 });
  }
  if (!verifyOperatorPassword(tenant, body.password)) {
    return NextResponse.json({ error: "Invalid operator password." }, { status: 401 });
  }

  try {
    const session = createOperatorSession(tenant);
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(operatorSessionCookieName(tenant), session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: session.maxAge,
    });
    return response;
  } catch (err) {
    console.error("Operator session creation failed:", err);
    return NextResponse.json({ error: "Could not create operator session." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(operatorSessionCookieName(tenant), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
