import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { MCPServerHandler } from "@/lib/mcp-server";

function matchesBearerToken(header: string | null, expected: string | undefined): boolean {
  const provided = header?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!provided || !expected) return false;
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const toolName = body?.method === "tools/call" ? body?.params?.name : undefined;
    const toolArguments = body?.params?.arguments;
    const startingLectureScribeInitiative =
      String(toolArguments?.tenant_id || "").toLowerCase().trim() === "lecturescribe" &&
      ((toolName === "transition_initiative_stage" && toolArguments?.stage === "development") ||
        (toolName === "update_initiative" && toolArguments?.updates?.stage === "development"));
    if (toolName === "trigger_lecturescribe_fleet" || startingLectureScribeInitiative) {
      if (!matchesBearerToken(req.headers.get("authorization"), process.env.AROADMAP_FLEET_TRIGGER_TOKEN)) {
        return NextResponse.json(
          { jsonrpc: "2.0", id: body?.id ?? null, error: { code: -32001, message: "Unauthorized LectureScribe development transition or fleet trigger." } },
          { status: 401 }
        );
      }
    }
    if (toolName === "report_fleet_status") {
      if (!matchesBearerToken(req.headers.get("authorization"), process.env.LECTURESCRIBE_STATUS_SYNC_TOKEN)) {
        return NextResponse.json(
          { jsonrpc: "2.0", id: body?.id ?? null, error: { code: -32001, message: "Unauthorized fleet status update." } },
          { status: 401 }
        );
      }
    }
    const response = await MCPServerHandler.handleRequest(body);
    if (!response) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: err.message } },
      { status: 400 }
    );
  }
}
