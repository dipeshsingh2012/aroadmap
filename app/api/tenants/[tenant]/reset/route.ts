import { NextRequest, NextResponse } from "next/server";
import { RoadmapRepository } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  const items = await RoadmapRepository.listInitiatives(tenant);
  return NextResponse.json({ message: "Tenant initiatives reloaded", total: items.length });
}
