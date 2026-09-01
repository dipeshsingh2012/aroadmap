import { NextRequest, NextResponse } from "next/server";
import { RoadmapRepository } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  const { tenant, id } = await params;
  const item = await RoadmapRepository.getInitiative(tenant, id);
  if (!item) {
    return NextResponse.json({ error: "Initiative not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  const { tenant, id } = await params;
  try {
    const body = await req.json();
    const updated = await RoadmapRepository.updateInitiative(tenant, id, body);
    if (!updated) {
      return NextResponse.json({ error: "Initiative not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
