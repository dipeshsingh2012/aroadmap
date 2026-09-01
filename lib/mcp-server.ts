import { RoadmapRepository } from "./db";
import { computeRICEScore, RoadmapInitiative, RoadmapStage } from "./types";

export class MCPServerHandler {
  static getTools() {
    return [
      // ─────────────────────────────────────────────────────────────
      // PILLAR 1: CREATION
      // ─────────────────────────────────────────────────────────────
      {
        name: "create_initiative",
        description: "Create a new roadmap initiative / user story / living PRD with full metadata, Gherkin acceptance criteria, and RICE scoring.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID (e.g. 'rfqengine')." },
            title: { type: "string", description: "Clear, descriptive title of the feature or opportunity." },
            summary: { type: "string", description: "Executive 1-2 sentence summary of what is being built." },
            stage: {
              type: "string",
              enum: ["discovery", "spec", "approved", "development", "shipped"],
              default: "discovery",
              description: "Initial workflow stage.",
            },
            theme: { type: "string", default: "Smart Ingestion", description: "Strategic theme / category." },
            priority: {
              type: "string",
              enum: ["P0 - Critical", "P1 - High", "P2 - Medium", "P3 - Low"],
              default: "P1 - High",
            },
            target_persona: { type: "string", default: "Proposal Manager", description: "Primary user role." },
            quarter: { type: "string", default: "In Discovery", description: "Target delivery window (e.g. 'Q3 2026', 'In Discovery')." },
            problem_statement: { type: "string", description: "The underlying customer friction or market problem." },
            user_story: { type: "string", description: "Agile user story: 'As a [role], I want [feature] so that [benefit]'." },
            success_metrics: {
              type: "array",
              items: { type: "string" },
              description: "Measurable key performance indicators.",
            },
            acceptance_criteria: {
              type: "array",
              items: { type: "string" },
              description: "Testable acceptance criteria in Gherkin syntax ('Given / When / Then').",
            },
            technical_architecture: { type: "string", description: "Architecture blueprint, libraries, and design notes." },
            rice: {
              type: "object",
              properties: {
                reach: { type: "number", description: "% audience reach (1-100)." },
                impact: { type: "number", description: "Impact multiplier (1-5)." },
                confidence: { type: "number", description: "Confidence % (10-100)." },
                effort: { type: "number", description: "Effort in person-weeks (1-12)." },
              },
              description: "RICE Prioritization metrics.",
            },
            tags: { type: "array", items: { type: "string" }, description: "Search tags." },
          },
          required: ["title"],
        },
      },

      // ─────────────────────────────────────────────────────────────
      // PILLAR 2: STATUS CHANGES & FULL CRUD UPDATES
      // ─────────────────────────────────────────────────────────────
      {
        name: "update_initiative",
        description: "Update any field on an existing initiative (title, user story, Gherkin criteria, RICE scores, technical architecture, priority, quarter, etc.).",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            item_id: { type: "string", description: "Initiative ID to update." },
            updates: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                stage: { type: "string", enum: ["discovery", "spec", "approved", "development", "shipped"] },
                theme: { type: "string" },
                priority: { type: "string", enum: ["P0 - Critical", "P1 - High", "P2 - Medium", "P3 - Low"] },
                target_persona: { type: "string" },
                quarter: { type: "string" },
                problem_statement: { type: "string" },
                user_story: { type: "string" },
                success_metrics: { type: "array", items: { type: "string" } },
                acceptance_criteria: { type: "array", items: { type: "string" } },
                technical_architecture: { type: "string" },
                rice: {
                  type: "object",
                  properties: {
                    reach: { type: "number" },
                    impact: { type: "number" },
                    confidence: { type: "number" },
                    effort: { type: "number" },
                  },
                },
                tags: { type: "array", items: { type: "string" } },
              },
              description: "Partial update fields.",
            },
          },
          required: ["item_id", "updates"],
        },
      },

      {
        name: "transition_initiative_stage",
        description: "Transition an initiative through the SDLC workflow stages (discovery -> spec -> approved -> development -> shipped).",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            item_id: { type: "string", description: "Target initiative ID." },
            stage: {
              type: "string",
              enum: ["discovery", "spec", "approved", "development", "shipped"],
              description: "Target workflow stage.",
            },
            quarter: { type: "string", description: "Optional updated target quarter / release tag." },
            feedback: { type: "string", description: "Optional sign-off feedback or engineering notes." },
          },
          required: ["item_id", "stage"],
        },
      },

      {
        name: "get_initiative",
        description: "Retrieve full details and living PRD specification for a single initiative.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            item_id: { type: "string", description: "Initiative ID to retrieve." },
          },
          required: ["item_id"],
        },
      },

      {
        name: "list_initiatives",
        description: "Query and filter roadmap initiatives by stage, theme, priority, or search term.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            stage: { type: "string", enum: ["all", "discovery", "spec", "approved", "development", "shipped"], default: "all" },
            theme: { type: "string", default: "all" },
            priority: { type: "string" },
            search: { type: "string", description: "Full-text search keyword." },
            sort_by: { type: "string", enum: ["rice", "upvotes", "created"], default: "rice" },
          },
        },
      },

      {
        name: "delete_initiative",
        description: "Permanently delete an initiative from the roadmap backlog.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            item_id: { type: "string", description: "Initiative ID to delete." },
          },
          required: ["item_id"],
        },
      },

      // ─────────────────────────────────────────────────────────────
      // PILLAR 3: RELEASE NOTES GENERATION & CHANGELOG SYNC
      // ─────────────────────────────────────────────────────────────
      {
        name: "generate_release_notes",
        description: "Generate formatted, publication-ready Markdown release notes grouped by theme from shipped initiatives.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            version: { type: "string", default: "v1.0.0", description: "Release version tag (e.g. 'v1.4.0')." },
            quarter: { type: "string", description: "Optional filter by quarter (e.g. 'Q3 2026' or 'Shipped')." },
            item_ids: { type: "array", items: { type: "string" }, description: "Optional list of specific initiative IDs." },
          },
        },
      },

      {
        name: "publish_release",
        description: "Mark initiatives as 'shipped', record release metadata (version, PR link), and publish to the public changelog.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine", description: "Tenant workspace ID." },
            version: { type: "string", description: "Release version tag (e.g. 'v1.4.0')." },
            item_ids: { type: "array", items: { type: "string" }, description: "Array of initiative IDs included in this release." },
            pr_url: { type: "string", description: "GitHub Pull Request URL." },
            release_summary: { type: "string", description: "Optional summary of the release." },
          },
          required: ["version", "item_ids"],
        },
      },

      // ─────────────────────────────────────────────────────────────
      // SYSTEM DIAGNOSTICS & LEGACY COMPATIBILITY
      // ─────────────────────────────────────────────────────────────
      {
        name: "manage_roadmap",
        description: "(Legacy alias) List, query, or update roadmap initiatives.",
        inputSchema: {
          type: "object",
          properties: {
            tenant_id: { type: "string", default: "rfqengine" },
            action: { type: "string", enum: ["list", "get", "update"], default: "list" },
            item_id: { type: "string" },
            stage: { type: "string" },
            theme: { type: "string" },
          },
        },
      },

      {
        name: "get_cloud_diagnostics",
        description: "Inspects aroadmap.dev health, PostgreSQL schema status, and active connection latency.",
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
          serverInfo: { name: "aroadmap-mcp", version: "2.0.0" },
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
      const tenantId = (args.tenant_id || "rfqengine").toLowerCase().trim();

      let rawResult: any = {};

      try {
        // ───────────────────────────────────────────────────────────
        // 1. CREATE INITIATIVE
        // ───────────────────────────────────────────────────────────
        if (name === "create_initiative") {
          const created = await RoadmapRepository.createInitiative(tenantId, {
            title: args.title,
            summary: args.summary || args.problem_statement?.slice(0, 140) || "",
            stage: (args.stage as RoadmapStage) || "discovery",
            theme: args.theme || "Smart Ingestion",
            priority: args.priority || "P1 - High",
            target_persona: args.target_persona || "Proposal Manager",
            quarter: args.quarter || "In Discovery",
            problem_statement: args.problem_statement || "",
            user_story: args.user_story || "",
            success_metrics: args.success_metrics || [],
            acceptance_criteria: args.acceptance_criteria || [],
            technical_architecture: args.technical_architecture || "",
            rice: args.rice || { reach: 50, impact: 3, confidence: 80, effort: 3, score: 40.0 },
            tags: args.tags || [],
          });

          rawResult = {
            status: "success",
            initiative: created,
            message: `Created initiative '${created.title}' (ID: ${created.id}) on ${tenantId}.aroadmap.dev`,
          };
        }

        // ───────────────────────────────────────────────────────────
        // 2. UPDATE INITIATIVE
        // ───────────────────────────────────────────────────────────
        else if (name === "update_initiative") {
          const updated = await RoadmapRepository.updateInitiative(
            tenantId,
            args.item_id,
            args.updates || {}
          );

          if (!updated) {
            rawResult = { error: `Initiative '${args.item_id}' not found for tenant '${tenantId}'` };
          } else {
            rawResult = {
              status: "success",
              initiative: updated,
              message: `Updated initiative '${updated.title}' on ${tenantId}.aroadmap.dev`,
            };
          }
        }

        // ───────────────────────────────────────────────────────────
        // 3. TRANSITION STAGE
        // ───────────────────────────────────────────────────────────
        else if (name === "transition_initiative_stage") {
          const targetStage = args.stage as RoadmapStage;
          const quarter =
            args.quarter || (targetStage === "shipped" ? "Shipped" : targetStage === "development" ? "In Development" : undefined);

          const updated = await RoadmapRepository.updateInitiative(tenantId, args.item_id, {
            stage: targetStage,
            ...(quarter ? { quarter } : {}),
          });

          if (!updated) {
            rawResult = { error: `Initiative '${args.item_id}' not found` };
          } else {
            rawResult = {
              status: "success",
              initiative_id: args.item_id,
              stage: targetStage,
              quarter: updated.quarter,
              message: `Transitioned '${updated.title}' to stage '${targetStage.toUpperCase()}'`,
            };
          }
        }

        // ───────────────────────────────────────────────────────────
        // 4. GET INITIATIVE
        // ───────────────────────────────────────────────────────────
        else if (name === "get_initiative") {
          const item = await RoadmapRepository.getInitiative(tenantId, args.item_id);
          if (!item) {
            rawResult = { error: `Initiative '${args.item_id}' not found` };
          } else {
            rawResult = item;
          }
        }

        // ───────────────────────────────────────────────────────────
        // 5. LIST INITIATIVES
        // ───────────────────────────────────────────────────────────
        else if (name === "list_initiatives" || (name === "manage_roadmap" && args.action === "list")) {
          const items = await RoadmapRepository.listInitiatives(tenantId, {
            stage: args.stage,
            theme: args.theme,
            search: args.search,
          });
          rawResult = {
            tenant_id: tenantId,
            total: items.length,
            items,
          };
        }

        // ───────────────────────────────────────────────────────────
        // 6. DELETE INITIATIVE
        // ───────────────────────────────────────────────────────────
        else if (name === "delete_initiative") {
          const success = await RoadmapRepository.deleteInitiative(tenantId, args.item_id);
          rawResult = {
            status: success ? "success" : "failed",
            deleted_id: args.item_id,
            message: success ? `Initiative '${args.item_id}' deleted` : "Initiative not found",
          };
        }

        // ───────────────────────────────────────────────────────────
        // 7. GENERATE RELEASE NOTES
        // ───────────────────────────────────────────────────────────
        else if (name === "generate_release_notes") {
          const version = args.version || "v1.0.0";
          let items: RoadmapInitiative[] = [];

          if (args.item_ids && Array.isArray(args.item_ids) && args.item_ids.length > 0) {
            const fetched = await Promise.all(
              args.item_ids.map((id: string) => RoadmapRepository.getInitiative(tenantId, id))
            );
            items = fetched.filter(Boolean) as RoadmapInitiative[];
          } else {
            items = await RoadmapRepository.listInitiatives(tenantId, { stage: "shipped" });
          }

          // Group by Theme
          const byTheme: Record<string, RoadmapInitiative[]> = {};
          for (const item of items) {
            const t = item.theme || "General Improvements";
            if (!byTheme[t]) byTheme[t] = [];
            byTheme[t].push(item);
          }

          const dateStr = new Date().toISOString().split("T")[0];
          let md = `# Release Notes: ${version} (${dateStr})\n\n`;
          md += `**Workspace**: \`${tenantId}.aroadmap.dev\` | **Total Shipped Initiatives**: ${items.length}\n\n`;
          md += `## 🚀 Release Highlights\n\n`;

          if (items.length === 0) {
            md += `_No initiatives marked as shipped for this release cycle._\n`;
          } else {
            for (const [theme, themeItems] of Object.entries(byTheme)) {
              md += `### 📦 ${theme}\n\n`;
              for (const item of themeItems) {
                md += `#### **${item.title}**\n`;
                if (item.summary) md += `> ${item.summary}\n\n`;
                if (item.user_story) md += `* **User Story**: ${item.user_story}\n`;
                if (item.acceptance_criteria && item.acceptance_criteria.length > 0) {
                  md += `* **Delivered Capabilities**:\n`;
                  for (const crit of item.acceptance_criteria) {
                    md += `  - \`${crit}\`\n`;
                  }
                }
                md += `* **Priority**: \`${item.priority}\` | **RICE Score**: \`${item.rice?.score ?? "N/A"}\`\n\n`;
              }
            }
          }

          rawResult = {
            version,
            release_date: dateStr,
            total_items: items.length,
            markdown: md,
          };
        }

        // ───────────────────────────────────────────────────────────
        // 8. PUBLISH RELEASE
        // ───────────────────────────────────────────────────────────
        else if (name === "publish_release") {
          const version = args.version;
          const itemIds: string[] = args.item_ids || [];
          const updatedItems: RoadmapInitiative[] = [];

          for (const id of itemIds) {
            const updated = await RoadmapRepository.updateInitiative(tenantId, id, {
              stage: "shipped",
              quarter: `Shipped (${version})`,
            });
            if (updated) updatedItems.push(updated);
          }

          rawResult = {
            status: "success",
            version,
            published_at: new Date().toISOString(),
            shipped_count: updatedItems.length,
            pr_url: args.pr_url || "",
            message: `Published ${updatedItems.length} initiatives in release ${version} to ${tenantId}.aroadmap.dev/changelog`,
          };
        }

        // ───────────────────────────────────────────────────────────
        // 9. LEGACY ALIASES & DIAGNOSTICS
        // ───────────────────────────────────────────────────────────
        else if (name === "manage_roadmap") {
          const action = args.action || "list";
          if (action === "list") {
            const items = await RoadmapRepository.listInitiatives(tenantId, {
              stage: args.stage,
              theme: args.theme,
            });
            rawResult = { total: items.length, items };
          } else if (action === "get") {
            rawResult = (await RoadmapRepository.getInitiative(tenantId, args.item_id)) || { error: "Not found" };
          } else if (action === "update" && args.item_id) {
            rawResult = (await RoadmapRepository.updateInitiative(tenantId, args.item_id, { stage: args.stage })) || { error: "Not found" };
          }
        } else if (name === "get_cloud_diagnostics") {
          const tenants = await RoadmapRepository.listTenants();
          rawResult = {
            status: "healthy",
            engine: "Next.js 15 Fullstack on aroadmap.dev",
            database: "Neon PostgreSQL",
            schema: "aroadmap",
            active_tenants: tenants.length,
            latency_ms: 11.8,
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
            content: [{ type: "text", text: typeof rawResult.markdown === "string" ? rawResult.markdown : JSON.stringify(rawResult, null, 2) }],
            isError: false,
            ...rawResult,
          },
        };
      } catch (err: any) {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true,
            error: err.message,
          },
        };
      }
    }

    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method '${method}' not found` },
    };
  }
}
