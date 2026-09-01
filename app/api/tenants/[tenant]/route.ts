import { NextRequest, NextResponse } from "next/server";
import { RoadmapRepository } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  const data = await RoadmapRepository.getTenant(tenant);
  if (!data) {
    // Return fallback tenant metadata
    return NextResponse.json({
      id: tenant,
      name: tenant.charAt(0).toUpperCase() + tenant.slice(1),
      subdomain: tenant,
      tagline: "Product Roadmap & Strategy Hub",
      brand_color: "#2563EB",
      visibility: "public",
    });
  }
  return NextResponse.json(data);
}
