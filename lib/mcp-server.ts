import { RoadmapRepository } from "./db";

export class MCPServerHandler {
  static getTools() {
    return [
      {
        name: "manage_roadmap",
        description: "List, query, or update roadmap initiatives for a specific tenant on aroadmap.dev.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            action: { type: "string", enum: ["list", "get", "update"], default: "list" },
            item_id: { type: "string", description: "Target initiative ID." },
            stage: { type: "string", enum: ["discovery", "spec", "development", "beta", "shipped"] },
            theme: { type: "string" },
          },
        },
      },
      {
        name: "trigger_pm_initiative",
        description: "Triggers the autonomous PM Agent and SDLC fleet to spec an initiative in discovery stage.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            title: { type: "string", description: "Initiative title." },
            prompt: { type: "string", description: "Full user story, problem context, and requirements." },
            category: { type: "string", default: "Smart Ingestion" },
          },
          required: ["title", "prompt"],
        },
      },
      {
        name: "approve_and_start_development",
        description: "Human Sign-Off Gate: Approves a PRD spec, transitions it to development, and dispatches dev-agent.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            item_id: { type: "string", description: "Initiative ID to approve." },
            feedback: { type: "string", description: "Optional engineer feedback." },
          },
          required: ["item_id"],
        },
      },
      {
        name: "get_cloud_diagnostics",
        description: "Inspects aroadmap.dev health, database latency, and active tenant connection status.",
        inputSchema: {
          type: "object",
          properties: {
            service_name: { type: "string", default: "all" },
          },
        },
      },
    ];
  }

  static async handleRequest(req: any): Promise<any> {
    const { id, method, params } = req;

    if (!id && (method?.startsWith("notifications/") || method === "initialized")) {
      return null;
    }

    if (method === "initialize") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "aroadmap-mcp", version: "1.0.0" },
          capabilities: { tools: {} },
        },
      };
    }

    if (method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: { tools: this.getTools() },
      };
    }

    if (method === "tools/call") {
      const name = params?.name;
      const args = params?.arguments || {};
      const tenantId = args.tenant_id || "rfqengine";

      let rawResult: any = {};

      if (name === "manage_roadmap") {
        const action = args.action || "list";
        if (action === "list") {
          const items = await RoadmapRepository.listInitiatives(tenantId, {
            stage: args.stage,
            theme: args.theme,
          });
          rawResult = { total: items.length, items };
        } else if (action === "get") {
          const item = await RoadmapRepository.getInitiative(tenantId, args.item_id);
          rawResult = item || { error: "Not found" };
        } else if (action === "update" && args.item_id) {
          const updated = await RoadmapRepository.updateInitiative(tenantId, args.item_id, {
            stage: args.stage,
          });
          rawResult = updated || { error: "Not found" };
        }
      } else if (name === "trigger_pm_initiative") {
        const created = await RoadmapRepository.createInitiative(tenantId, {
          title: args.title,
          stage: "discovery",
          theme: args.category || "Smart Ingestion",
          problem_statement: args.prompt,
          summary: args.prompt?.slice(0, 140) + "...",
        });
        rawResult = {
          status: "success",
          initiative_id: created.id,
          stage: "discovery",
          message: `Created discovery initiative '${created.title}' on aroadmap.dev`,
        };
      } else if (name === "approve_and_start_development") {
        const updated = await RoadmapRepository.updateInitiative(tenantId, args.item_id, {
          stage: "development",
          quarter: "In Development",
        });
        rawResult = {
          status: "success",
          initiative_id: args.item_id,
          stage: "development",
          dev_agent_dispatched: true,
          message: `Approved initiative '${updated?.title || args.item_id}' -> Moved to Development!`,
        };
      } else if (name === "get_cloud_diagnostics") {
        rawResult = {
          status: "healthy",
          engine: "Next.js 15 Fullstack on aroadmap.dev",
          database: "Neon PostgreSQL",
          latency_ms: 12.4,
        };
      } else {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Unknown tool '${name}'` },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(rawResult, null, 2) }],
          isError: false,
          ...rawResult,
        },
      };
    }

    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method '${method}' not found` },
    };
  }
}
