import { NextRequest, NextResponse } from "next/server";
import { RoadmapRepository } from "@/lib/db";

const RESERVED_SLUGS = new Set([
  "api",
  "www",
  "app",
  "admin",
  "new",
  "home",
  "help",
  "support",
  "status",
  "billing",
  "static",
  "assets",
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") || "").toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ available: false, error: "Slug is required" }, { status: 400 });
  }

  if (slug.length < 3) {
    return NextResponse.json({
      available: false,
      error: "Subdomain must be at least 3 characters",
    });
  }

  if (slug.length > 32) {
    return NextResponse.json({
      available: false,
      error: "Subdomain must be 32 characters or fewer",
    });
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({
      available: false,
      error: "Only lowercase letters, numbers, and hyphens allowed",
    });
  }

  if (RESERVED_SLUGS.has(slug)) {
    return NextResponse.json({
      available: false,
      error: `Subdomain '${slug}' is a reserved keyword`,
    });
  }

  const existing = await RoadmapRepository.getTenant(slug);
  if (existing) {
    return NextResponse.json({
      available: false,
      error: `Subdomain '${slug}.aroadmap.dev' is already taken`,
    });
  }

  return NextResponse.json({
    available: true,
    subdomain: `${slug}.aroadmap.dev`,
  });
}
