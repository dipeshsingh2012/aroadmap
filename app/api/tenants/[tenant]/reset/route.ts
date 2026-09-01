import { NextRequest, NextResponse } from "next/server";
import { RoadmapRepository } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  const items = await RoadmapRepository.resetTenant(tenant);
  return NextResponse.json({ message: "Tenant reset to defaults", total: items.length });
}
