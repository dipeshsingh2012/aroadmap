import { NextRequest, NextResponse } from "next/server";
import { RoadmapRepository } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  const searchParams = req.nextUrl.searchParams;
  const stage = searchParams.get("stage") || undefined;
  const theme = searchParams.get("theme") || undefined;
  const search = searchParams.get("search") || undefined;

  const items = await RoadmapRepository.listInitiatives(tenant, { stage, theme, search });
  return NextResponse.json(items);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  try {
    const body = await req.json();
    const created = await RoadmapRepository.createInitiative(tenant, body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
