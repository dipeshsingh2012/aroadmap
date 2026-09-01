import { NextRequest, NextResponse } from "next/server";
import { MCPServerHandler } from "@/lib/mcp-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
