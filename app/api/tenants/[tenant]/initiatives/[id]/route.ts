import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { RoadmapRepository } from "@/lib/db";
import { MCPServerHandler } from "@/lib/mcp-server";
import { hasLectureScribeOperatorSession } from "@/lib/lecturescribe-operator-auth";

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
    if (tenant.toLowerCase().trim() === "lecturescribe" && body?.stage === "development") {
      if (!hasLectureScribeOperatorSession(req)) {
        return NextResponse.json({ error: "LectureScribe operator sign-in is required to start Agentic Fleet." }, { status: 401 });
      }

      const transition = await MCPServerHandler.handleRequest({
        jsonrpc: "2.0",
        id: randomUUID(),
        method: "tools/call",
        params: {
          name: "transition_initiative_stage",
          arguments: {
            tenant_id: "lecturescribe",
            item_id: id,
            stage: "development",
            request_id: typeof body.request_id === "string" ? body.request_id : undefined,
          },
        },
      });
      const result = transition?.result;
      if (!result || result.isError || result.error) {
        return NextResponse.json(
          { error: result?.error || "Could not transition the initiative or dispatch Agentic Fleet." },
          { status: 409 }
        );
      }
      return NextResponse.json({
        ...result,
        initiative_id: id,
        stage: result.stage || "development",
      });
    }

    const updated = await RoadmapRepository.updateInitiative(tenant, id, body);
    if (!updated) {
      return NextResponse.json({ error: "Initiative not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  const { tenant, id } = await params;
  try {
    const success = await RoadmapRepository.deleteInitiative(tenant, id);
    if (!success) {
      return NextResponse.json({ error: "Initiative not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Initiative deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
