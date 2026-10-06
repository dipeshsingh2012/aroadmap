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

function isAuthorizedForReporting(tenantId: string, authHeader: string | null): boolean {
  if (!authHeader) return false;
  // 1. Tenant-neutral report token
  if (matchesBearerToken(authHeader, process.env.AROADMAP_REPORT_TOKEN)) return true;
  // 2. Per-tenant token (e.g. AROADMAP_TOKEN_LECTURESCRIBE, AROADMAP_TOKEN_RFPENGINE)
  if (tenantId) {
    const tenantKey = `AROADMAP_TOKEN_${tenantId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
    if (matchesBearerToken(authHeader, process.env[tenantKey])) return true;
  }
  // 3. Backward-compatibility tokens
  if (matchesBearerToken(authHeader, process.env.LECTURESCRIBE_STATUS_SYNC_TOKEN)) return true;
  if (matchesBearerToken(authHeader, process.env.AROADMAP_FLEET_TRIGGER_TOKEN)) return true;
  return false;
}

function isAuthorizedForDispatch(tenantId: string, authHeader: string | null): boolean {
  if (!authHeader) return false;
  if (matchesBearerToken(authHeader, process.env.AROADMAP_FLEET_TRIGGER_TOKEN)) return true;
  if (tenantId) {
    const tenantKey = `AROADMAP_TRIGGER_TOKEN_${tenantId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
    if (matchesBearerToken(authHeader, process.env[tenantKey])) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const toolName = body?.method === "tools/call" ? body?.params?.name : undefined;
    const toolArguments = body?.params?.arguments;
    const tenantId = String(toolArguments?.tenant_id || "").toLowerCase().trim();

    if (toolName === "trigger_lecturescribe_fleet" || toolName === "trigger_fleet_dispatch") {
      if (!isAuthorizedForDispatch(tenantId, req.headers.get("authorization"))) {
        return NextResponse.json(
          { jsonrpc: "2.0", id: body?.id ?? null, error: { code: -32001, message: "Unauthorized fleet dispatch or trigger." } },
          { status: 401 }
        );
      }
    }

    if (toolName === "report_fleet_status") {
      if (!isAuthorizedForReporting(tenantId, req.headers.get("authorization"))) {
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
