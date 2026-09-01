import { NextRequest, NextResponse } from "next/server";
import { RoadmapRepository } from "@/lib/db";
import { TEMPLATE_INITIATIVES } from "@/lib/db/seed-data";
import { Tenant } from "@/lib/types";

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

export async function GET() {
  try {
    const tenants = await RoadmapRepository.listTenants();
    return NextResponse.json(tenants);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { name, subdomain, tagline, brand_color, github_repo, visibility, template } = body;

    if (!name || !subdomain) {
      return NextResponse.json(
        { error: "Organization Name and Subdomain are required." },
        { status: 400 }
      );
    }

    const slug = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

    if (slug.length < 3 || slug.length > 32) {
      return NextResponse.json(
        { error: "Subdomain must be between 3 and 32 characters." },
        { status: 400 }
      );
    }

    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json(
        { error: `Subdomain '${slug}' is a reserved system keyword.` },
        { status: 409 }
      );
    }

    // Check if tenant already exists
    const existing = await RoadmapRepository.getTenant(slug);
    if (existing) {
      return NextResponse.json(
        { error: `Subdomain '${slug}.aroadmap.dev' is already claimed.` },
        { status: 409 }
      );
    }

    // Create tenant
    const newTenant: Tenant = {
      id: slug,
      name: name.trim(),
      subdomain: slug,
      tagline: tagline?.trim() || "Live Continuous Product Discovery & Autonomous SDLC Hub",
      logo_url: body.logo_url || "",
      brand_color: brand_color || "#2563EB",
      github_repo: github_repo?.trim() || "",
      visibility: visibility === "private" ? "private" : "public",
    };

    await RoadmapRepository.createTenant(newTenant);

    // Seed chosen template initiatives
    const templateKey = template || "ai-saas";
    const templateItems = TEMPLATE_INITIATIVES[templateKey] || TEMPLATE_INITIATIVES["ai-saas"];

    for (const item of templateItems) {
      await RoadmapRepository.createInitiative(slug, item);
    }

    const rootDomain = process.env.ROOT_DOMAIN || "aroadmap.dev";

    return NextResponse.json(
      {
        message: "Tenant provisioned successfully",
        tenant: newTenant,
        subdomain_url: `https://${slug}.${rootDomain}/`,
        local_url: `http://${slug}.localhost:3000/`,
        fallback_url: `/?tenant=${slug}`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
