import { NextRequest, NextResponse } from "next/server";
import {
  createLectureScribeOperatorSession,
  hasLectureScribeOperatorSession,
  LECTURESCRIBE_OPERATOR_COOKIE,
  verifyLectureScribeOperatorPassword,
} from "@/lib/lecturescribe-operator-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  if (tenant.toLowerCase().trim() !== "lecturescribe") {
    return NextResponse.json({ error: "Operator sessions are only enabled for LectureScribe." }, { status: 404 });
  }
  return NextResponse.json({ authenticated: hasLectureScribeOperatorSession(req) });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  if (tenant.toLowerCase().trim() !== "lecturescribe") {
    return NextResponse.json({ error: "Operator sessions are only enabled for LectureScribe." }, { status: 404 });
  }

  const expectedPassword = process.env.AROADMAP_LECTURESCRIBE_OPERATOR_PASSWORD;
  const sessionSecret = process.env.AROADMAP_LECTURESCRIBE_SESSION_SECRET;
  if (
    !expectedPassword ||
    Buffer.byteLength(expectedPassword) < 32 ||
    !sessionSecret ||
    Buffer.byteLength(sessionSecret) < 32
  ) {
    return NextResponse.json({ error: "LectureScribe operator sign-in is not configured." }, { status: 503 });
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
  if (!verifyLectureScribeOperatorPassword(body.password)) {
    return NextResponse.json({ error: "Invalid operator password." }, { status: 401 });
  }

  try {
    const session = createLectureScribeOperatorSession();
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(LECTURESCRIBE_OPERATOR_COOKIE, session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: session.maxAge,
    });
    return response;
  } catch (err) {
    console.error("LectureScribe operator session creation failed:", err);
    return NextResponse.json({ error: "Could not create operator session." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  if (tenant.toLowerCase().trim() !== "lecturescribe") {
    return NextResponse.json({ error: "Operator sessions are only enabled for LectureScribe." }, { status: 404 });
  }
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(LECTURESCRIBE_OPERATOR_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
