import { Pool } from "pg";
import { RoadmapInitiative, Tenant, computeRICEScore } from "../types";

const DATABASE_URL = process.env.DATABASE_URL;

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!DATABASE_URL) {
      throw new Error(
        "DATABASE_URL environment variable is not configured. Please set DATABASE_URL in your environment or Vercel project settings."
      );
    }
    pool = new Pool({
      connectionString: DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export class RoadmapRepository {
  static async getTenant(tenantId: string): Promise<Tenant | null> {
    const slug = tenantId.toLowerCase().trim();
    const p = getPool();
    try {
      const res = await p.query(
        "SELECT * FROM aroadmap.tenants WHERE id = $1 OR subdomain = $1 LIMIT 1",
        [slug]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          name: row.name,
          subdomain: row.subdomain,
          tagline: row.tagline || "",
          logo_url: row.logo_url || "",
          brand_color: row.brand_color || "#2563EB",
          github_repo: row.github_repo || "",
          visibility: row.visibility || "public",
          created_at: row.created_at,
        };
      }
    } catch (err) {
      console.error("PostgreSQL getTenant error:", err);
    }
    return null;
  }

  static async listTenants(): Promise<Tenant[]> {
    const p = getPool();
    try {
      const res = await p.query("SELECT * FROM aroadmap.tenants ORDER BY name ASC");
      return res.rows.map((row) => ({
        id: row.id,
        name: row.name,
        subdomain: row.subdomain,
        tagline: row.tagline || "",
        logo_url: row.logo_url || "",
        brand_color: row.brand_color || "#2563EB",
        github_repo: row.github_repo || "",
        visibility: row.visibility || "public",
        created_at: row.created_at,
      }));
    } catch (err) {
      console.error("PostgreSQL listTenants error:", err);
      return [];
    }
  }

  static async createTenant(tenant: Tenant): Promise<Tenant> {
    const slug = tenant.id.toLowerCase().trim();
    const p = getPool();
    try {
      await p.query(
        `INSERT INTO aroadmap.tenants (id, name, subdomain, tagline, logo_url, brand_color, github_repo, visibility)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           tagline = EXCLUDED.tagline,
           logo_url = EXCLUDED.logo_url,
           brand_color = EXCLUDED.brand_color,
           github_repo = EXCLUDED.github_repo,
           visibility = EXCLUDED.visibility,
           updated_at = NOW()`,
        [
          slug,
          tenant.name,
          tenant.subdomain || slug,
          tenant.tagline || "",
          tenant.logo_url || "",
          tenant.brand_color || "#2563EB",
          tenant.github_repo || "",
          tenant.visibility || "public",
        ]
      );
    } catch (err) {
      console.error("PostgreSQL createTenant error:", err);
      throw err;
    }
    return tenant;
  }

  static async listInitiatives(
    tenantId: string,
    filters?: { stage?: string; theme?: string; search?: string }
  ): Promise<RoadmapInitiative[]> {
    const slug = tenantId.toLowerCase().trim();
    const p = getPool();

    try {
      let query = "SELECT * FROM aroadmap.initiatives WHERE tenant_id = $1";
      const params: any[] = [slug];

      if (filters?.stage && filters.stage !== "all") {
        params.push(filters.stage);
        query += ` AND stage = $${params.length}`;
      }
      if (filters?.theme && filters.theme !== "all") {
        params.push(filters.theme);
        query += ` AND theme = $${params.length}`;
      }

      query += " ORDER BY rice_score DESC, upvotes DESC, created_at DESC";

      const res = await p.query(query, params);
      const items: RoadmapInitiative[] = res.rows.map((row) => ({
        id: row.id,
        tenant_id: row.tenant_id,
        title: row.title,
        stage: row.stage,
        theme: row.theme,
        priority: row.priority,
        target_persona: row.target_persona,
        quarter: row.quarter,
        summary: row.summary || "",
        problem_statement: row.problem_statement || "",
        user_story: row.user_story || "",
        success_metrics: Array.isArray(row.success_metrics)
          ? row.success_metrics
          : typeof row.success_metrics === "string"
          ? JSON.parse(row.success_metrics)
          : [],
        acceptance_criteria: Array.isArray(row.acceptance_criteria)
          ? row.acceptance_criteria
          : typeof row.acceptance_criteria === "string"
          ? JSON.parse(row.acceptance_criteria)
          : [],
        technical_architecture: row.technical_architecture || "",
        rice: {
          reach: Number(row.rice_reach || 50),
          impact: Number(row.rice_impact || 3),
          confidence: Number(row.rice_confidence || 80),
          effort: Number(row.rice_effort || 3),
          score: Number(row.rice_score || 40.0),
        },
        upvotes: Number(row.upvotes || 0),
        tags: Array.isArray(row.tags)
          ? row.tags
          : typeof row.tags === "string"
          ? JSON.parse(row.tags)
          : [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        return items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.summary.toLowerCase().includes(q) ||
            item.target_persona.toLowerCase().includes(q) ||
            item.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      return items;
    } catch (err) {
      console.error("PostgreSQL listInitiatives error:", err);
      return [];
    }
  }

  static async getInitiative(tenantId: string, id: string): Promise<RoadmapInitiative | null> {
    const slug = tenantId.toLowerCase().trim();
    const p = getPool();
    try {
      const res = await p.query(
        "SELECT * FROM aroadmap.initiatives WHERE tenant_id = $1 AND id = $2 LIMIT 1",
        [slug, id]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          tenant_id: row.tenant_id,
          title: row.title,
          stage: row.stage,
          theme: row.theme,
          priority: row.priority,
          target_persona: row.target_persona,
          quarter: row.quarter,
          summary: row.summary || "",
          problem_statement: row.problem_statement || "",
          user_story: row.user_story || "",
          success_metrics: Array.isArray(row.success_metrics)
            ? row.success_metrics
            : JSON.parse(row.success_metrics || "[]"),
          acceptance_criteria: Array.isArray(row.acceptance_criteria)
            ? row.acceptance_criteria
            : JSON.parse(row.acceptance_criteria || "[]"),
          technical_architecture: row.technical_architecture || "",
          rice: {
            reach: Number(row.rice_reach || 50),
            impact: Number(row.rice_impact || 3),
            confidence: Number(row.rice_confidence || 80),
            effort: Number(row.rice_effort || 3),
            score: Number(row.rice_score || 40.0),
          },
          upvotes: Number(row.upvotes || 0),
          tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || "[]"),
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      }
    } catch (err) {
      console.error("PostgreSQL getInitiative error:", err);
    }
    return null;
  }

  static async createInitiative(
    tenantId: string,
    data: Partial<RoadmapInitiative>
  ): Promise<RoadmapInitiative> {
    const slug = tenantId.toLowerCase().trim();
    const id = data.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const rice = data.rice || { reach: 50, impact: 3, confidence: 80, effort: 3, score: 40.0 };
    rice.score = computeRICEScore(rice);

    const newInit: RoadmapInitiative = {
      id,
      tenant_id: slug,
      title: data.title || "Untitled Initiative",
      stage: data.stage || "discovery",
      theme: data.theme || "Smart Ingestion",
      priority: data.priority || "P1 - High",
      target_persona: data.target_persona || "Proposal Manager",
      quarter: data.quarter || "In Discovery",
      summary: data.summary || "",
      problem_statement: data.problem_statement || "",
      user_story: data.user_story || "",
      success_metrics: data.success_metrics || [],
      acceptance_criteria: data.acceptance_criteria || [],
      technical_architecture: data.technical_architecture || "",
      rice,
      upvotes: data.upvotes || 0,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const p = getPool();
    try {
      await p.query(
        `INSERT INTO aroadmap.initiatives (
          id, tenant_id, title, stage, theme, priority, target_persona, quarter,
          summary, problem_statement, user_story, success_metrics, acceptance_criteria,
          technical_architecture, rice_reach, rice_impact, rice_confidence, rice_effort,
          rice_score, upvotes, tags, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb,
          $14, $15, $16, $17, $18, $19, $20, $21::jsonb, NOW(), NOW()
        )
        ON CONFLICT (tenant_id, id) DO UPDATE SET
          title = EXCLUDED.title,
          stage = EXCLUDED.stage,
          theme = EXCLUDED.theme,
          priority = EXCLUDED.priority,
          target_persona = EXCLUDED.target_persona,
          quarter = EXCLUDED.quarter,
          summary = EXCLUDED.summary,
          problem_statement = EXCLUDED.problem_statement,
          user_story = EXCLUDED.user_story,
          success_metrics = EXCLUDED.success_metrics,
          acceptance_criteria = EXCLUDED.acceptance_criteria,
          technical_architecture = EXCLUDED.technical_architecture,
          rice_reach = EXCLUDED.rice_reach,
          rice_impact = EXCLUDED.rice_impact,
          rice_confidence = EXCLUDED.rice_confidence,
          rice_effort = EXCLUDED.rice_effort,
          rice_score = EXCLUDED.rice_score,
          upvotes = EXCLUDED.upvotes,
          tags = EXCLUDED.tags,
          updated_at = NOW()`,
        [
          id,
          slug,
          newInit.title,
          newInit.stage,
          newInit.theme,
          newInit.priority,
          newInit.target_persona,
          newInit.quarter,
          newInit.summary,
          newInit.problem_statement,
          newInit.user_story,
          JSON.stringify(newInit.success_metrics),
          JSON.stringify(newInit.acceptance_criteria),
          newInit.technical_architecture,
          rice.reach,
          rice.impact,
          rice.confidence,
          rice.effort,
          rice.score,
          newInit.upvotes,
          JSON.stringify(newInit.tags),
        ]
      );
    } catch (err) {
      console.error("PostgreSQL createInitiative error:", err);
      throw err;
    }

    return newInit;
  }

  static async updateInitiative(
    tenantId: string,
    id: string,
    updates: Partial<RoadmapInitiative>
  ): Promise<RoadmapInitiative | null> {
    const slug = tenantId.toLowerCase().trim();
    const existing = await this.getInitiative(slug, id);
    if (!existing) return null;

    let rice = existing.rice;
    if (updates.rice) {
      rice = { ...existing.rice, ...updates.rice };
      rice.score = computeRICEScore(rice);
    }

    const p = getPool();
    try {
      await p.query(
        `UPDATE aroadmap.initiatives SET
          title = COALESCE($3, title),
          stage = COALESCE($4, stage),
          theme = COALESCE($5, theme),
          priority = COALESCE($6, priority),
          target_persona = COALESCE($7, target_persona),
          quarter = COALESCE($8, quarter),
          summary = COALESCE($9, summary),
          problem_statement = COALESCE($10, problem_statement),
          user_story = COALESCE($11, user_story),
          success_metrics = COALESCE($12::jsonb, success_metrics),
          acceptance_criteria = COALESCE($13::jsonb, acceptance_criteria),
          technical_architecture = COALESCE($14, technical_architecture),
          rice_reach = COALESCE($15, rice_reach),
          rice_impact = COALESCE($16, rice_impact),
          rice_confidence = COALESCE($17, rice_confidence),
          rice_effort = COALESCE($18, rice_effort),
          rice_score = COALESCE($19, rice_score),
          tags = COALESCE($20::jsonb, tags),
          updated_at = NOW()
        WHERE tenant_id = $1 AND id = $2`,
        [
          slug,
          id,
          updates.title,
          updates.stage,
          updates.theme,
          updates.priority,
          updates.target_persona,
          updates.quarter,
          updates.summary,
          updates.problem_statement,
          updates.user_story,
          updates.success_metrics ? JSON.stringify(updates.success_metrics) : null,
          updates.acceptance_criteria ? JSON.stringify(updates.acceptance_criteria) : null,
          updates.technical_architecture,
          rice.reach,
          rice.impact,
          rice.confidence,
          rice.effort,
          rice.score,
          updates.tags ? JSON.stringify(updates.tags) : null,
        ]
      );
    } catch (err) {
      console.error("PostgreSQL updateInitiative error:", err);
      throw err;
    }

    return {
      ...existing,
      ...updates,
      rice,
      updated_at: new Date().toISOString(),
    };
  }

  static async upvoteInitiative(
    tenantId: string,
    id: string,
    delta: number = 1
  ): Promise<RoadmapInitiative | null> {
    const slug = tenantId.toLowerCase().trim();
    const p = getPool();
    try {
      const res = await p.query(
        "UPDATE aroadmap.initiatives SET upvotes = GREATEST(0, upvotes + $3), updated_at = NOW() WHERE tenant_id = $1 AND id = $2 RETURNING *",
        [slug, id, delta]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          tenant_id: row.tenant_id,
          title: row.title,
          stage: row.stage,
          theme: row.theme,
          priority: row.priority,
          target_persona: row.target_persona,
          quarter: row.quarter,
          summary: row.summary || "",
          problem_statement: row.problem_statement || "",
          user_story: row.user_story || "",
          success_metrics: Array.isArray(row.success_metrics) ? row.success_metrics : JSON.parse(row.success_metrics || "[]"),
          acceptance_criteria: Array.isArray(row.acceptance_criteria) ? row.acceptance_criteria : JSON.parse(row.acceptance_criteria || "[]"),
          technical_architecture: row.technical_architecture || "",
          rice: {
            reach: Number(row.rice_reach || 50),
            impact: Number(row.rice_impact || 3),
            confidence: Number(row.rice_confidence || 80),
            effort: Number(row.rice_effort || 3),
            score: Number(row.rice_score || 40.0),
          },
          upvotes: Number(row.upvotes || 0),
          tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || "[]"),
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      }
    } catch (err) {
      console.error("PostgreSQL upvoteInitiative error:", err);
    }
    return null;
  }

  static async deleteInitiative(tenantId: string, id: string): Promise<boolean> {
    const slug = tenantId.toLowerCase().trim();
    const p = getPool();
    try {
      const res = await p.query(
        "DELETE FROM aroadmap.initiatives WHERE tenant_id = $1 AND id = $2",
        [slug, id]
      );
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error("PostgreSQL deleteInitiative error:", err);
      return false;
    }
  }

  static async reportFleetStatus(input: {
    tenant_id: string;
    initiative_id: string;
    request_id: string;
    status: string;
    milestone?: string;
    github_repository?: string;
    github_run_id?: string;
    github_run_attempt?: string;
    run_url?: string;
    pr_url?: string;
    conclusion?: string;
    error_summary?: string;
  }): Promise<Record<string, unknown>> {
    const tenantId = input.tenant_id.toLowerCase().trim();
    let normStatus = input.status.toLowerCase().trim();
    if (normStatus === "in_progress") normStatus = "running";
    if (normStatus === "completed") normStatus = "succeeded";
    if (normStatus === "blocked") normStatus = "failed";

    const statuses = ["accepted", "queued", "running", "succeeded", "failed", "cancelled"];
    if (!statuses.includes(normStatus)) {
      throw new Error(`Unsupported fleet status '${input.status}'.`);
    }

    const p = getPool();
    const client = await p.connect();
    try {
      await client.query("BEGIN");
      const initiative = await client.query(
        "SELECT id, stage, quarter FROM aroadmap.initiatives WHERE tenant_id = $1 AND id = $2 LIMIT 1",
        [tenantId, input.initiative_id]
      );
      if (initiative.rowCount === 0) {
        throw new Error("Initiative not found for this tenant.");
      }

      const currentInit = initiative.rows[0];
      const currentStage = currentInit.stage;

      const existing = await client.query(
        "SELECT * FROM aroadmap.fleet_runs WHERE request_id = $1 FOR UPDATE",
        [input.request_id]
      );
      if (existing.rowCount) {
        const current = existing.rows[0];
        if (current.tenant_id !== tenantId || current.initiative_id !== input.initiative_id) {
          throw new Error("request_id is already associated with another initiative.");
        }
        const terminal = ["succeeded", "failed", "cancelled"];
        const rank: Record<string, number> = {
          accepted: 0,
          queued: 1,
          running: 2,
          succeeded: 3,
          failed: 3,
          cancelled: 3,
        };
        if (
          terminal.includes(current.status) &&
          current.status !== normStatus &&
          rank[normStatus] >= rank[current.status]
        ) {
          throw new Error("Fleet status transition is invalid.");
        }
        if (rank[normStatus] < rank[current.status]) {
          await client.query("COMMIT");
          return current;
        }
      }

      const effectiveRunUrl = input.run_url || input.pr_url || null;
      const effectiveConclusion = input.conclusion || input.milestone || null;

      const result = await client.query(
        `INSERT INTO aroadmap.fleet_runs (
          request_id, tenant_id, initiative_id, status, github_repository,
          github_run_id, github_run_attempt, run_url, conclusion, error_summary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (request_id) DO UPDATE SET
          status = EXCLUDED.status,
          github_repository = COALESCE(EXCLUDED.github_repository, aroadmap.fleet_runs.github_repository),
          github_run_id = COALESCE(EXCLUDED.github_run_id, aroadmap.fleet_runs.github_run_id),
          github_run_attempt = COALESCE(EXCLUDED.github_run_attempt, aroadmap.fleet_runs.github_run_attempt),
          run_url = COALESCE(EXCLUDED.run_url, aroadmap.fleet_runs.run_url),
          conclusion = COALESCE(EXCLUDED.conclusion, aroadmap.fleet_runs.conclusion),
          error_summary = COALESCE(EXCLUDED.error_summary, aroadmap.fleet_runs.error_summary),
          updated_at = NOW()
        WHERE aroadmap.fleet_runs.tenant_id = EXCLUDED.tenant_id
          AND aroadmap.fleet_runs.initiative_id = EXCLUDED.initiative_id
          AND (
            aroadmap.fleet_runs.status = EXCLUDED.status OR
            (aroadmap.fleet_runs.status IN ('accepted', 'queued') AND EXCLUDED.status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')) OR
            (aroadmap.fleet_runs.status = 'running' AND EXCLUDED.status IN ('succeeded', 'failed', 'cancelled'))
          )
        RETURNING *`,
        [
          input.request_id,
          tenantId,
          input.initiative_id,
          normStatus,
          input.github_repository || null,
          input.github_run_id || null,
          input.github_run_attempt || null,
          effectiveRunUrl,
          effectiveConclusion,
          input.error_summary || null,
        ]
      );
      if (result.rowCount === 0) {
        throw new Error("Fleet status update conflicts with existing request state.");
      }

      // Determine forward-only target stage from milestone or status
      let targetStage: string | undefined;
      if (input.milestone) {
        const MILESTONE_TO_STAGE: Record<string, string> = {
          design_approved: "design_approved",
          dev_started: "in_development",
          security_started: "security_review",
          qa_started: "qa_review",
          review_started: "code_review",
          merged: "shipped",
        };
        targetStage = MILESTONE_TO_STAGE[input.milestone];
      } else if (normStatus === "running") {
        if (currentStage === "approved" || currentStage === "ready_for_dev") {
          targetStage = "in_development";
        }
      }

      if (targetStage) {
        const STAGE_RANK: Record<string, number> = {
          backlog: 0,
          discovery: 0,
          spec: 0,
          ready_for_dev: 1,
          approved: 1,
          design_approved: 2,
          in_development: 3,
          development: 3,
          security_review: 4,
          qa_review: 5,
          code_review: 6,
          shipped: 7,
        };
        const currentRank = STAGE_RANK[currentStage] ?? 0;
        const targetRank = STAGE_RANK[targetStage] ?? 0;
        if (targetRank >= currentRank) {
          const targetQuarter = targetStage === "shipped" ? "Shipped" : "In Development";
          await client.query(
            `UPDATE aroadmap.initiatives
             SET stage = $1, quarter = $2, updated_at = NOW()
             WHERE tenant_id = $3 AND id = $4`,
            [targetStage, targetQuarter, tenantId, input.initiative_id]
          );
        }
      }

      await client.query("COMMIT");
      return result.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
