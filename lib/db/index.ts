import { Pool } from "pg";
import { RoadmapInitiative, Tenant, computeRICEScore } from "../types";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_UkAy0bg9uBoT@ep-rapid-truth-aqw82ysi-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
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
}
