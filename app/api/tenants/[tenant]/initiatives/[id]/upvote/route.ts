import { NextRequest, NextResponse } from "next/server";
import { RoadmapRepository } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  const { tenant, id } = await params;
  const delta = Number(req.nextUrl.searchParams.get("delta") || 1);
  const updated = await RoadmapRepository.upvoteInitiative(tenant, id, delta);
  if (!updated) {
    return NextResponse.json({ error: "Initiative not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
