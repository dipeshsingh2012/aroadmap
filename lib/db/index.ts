import { RoadmapInitiative, Tenant, computeRICEScore } from "../types";
import { SEED_TENANTS, SEED_INITIATIVES } from "./seed-data";

// In-Memory fallback cache with multi-tenant partitioning
// Ensures zero downtime if PostgreSQL is connecting or during local offline dev
const inMemoryTenants = new Map<string, Tenant>();
const inMemoryInitiatives = new Map<string, Map<string, RoadmapInitiative>>();

// Seed in-memory defaults
for (const t of SEED_TENANTS) {
  inMemoryTenants.set(t.id, t);
  const map = new Map<string, RoadmapInitiative>();
  const items = SEED_INITIATIVES[t.id] || [];
  for (const item of items) {
    map.set(item.id, item);
  }
  inMemoryInitiatives.set(t.id, map);
}

export class RoadmapRepository {
  static async getTenant(tenantId: string): Promise<Tenant | null> {
    const slug = tenantId.toLowerCase();
    return inMemoryTenants.get(slug) || null;
  }

  static async listTenants(): Promise<Tenant[]> {
    return Array.from(inMemoryTenants.values());
  }

  static async createTenant(tenant: Tenant): Promise<Tenant> {
    const slug = tenant.id.toLowerCase();
    inMemoryTenants.set(slug, tenant);
    if (!inMemoryInitiatives.has(slug)) {
      inMemoryInitiatives.set(slug, new Map());
    }
    return tenant;
  }

  static async listInitiatives(
    tenantId: string,
    filters?: { stage?: string; theme?: string; search?: string }
  ): Promise<RoadmapInitiative[]> {
    const slug = tenantId.toLowerCase();
    if (!inMemoryInitiatives.has(slug)) {
      // Auto-provision if rfqengine
      if (slug === "rfqengine" && SEED_INITIATIVES.rfqengine) {
        const map = new Map<string, RoadmapInitiative>();
        for (const item of SEED_INITIATIVES.rfqengine) {
          map.set(item.id, item);
        }
        inMemoryInitiatives.set(slug, map);
      } else {
        inMemoryInitiatives.set(slug, new Map());
      }
    }

    const items = Array.from(inMemoryInitiatives.get(slug)!.values());

    return items.filter((item) => {
      if (filters?.stage && filters.stage !== "all" && item.stage !== filters.stage) {
        return false;
      }
      if (filters?.theme && filters.theme !== "all" && item.theme !== filters.theme) {
        return false;
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.target_persona.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }

  static async getInitiative(tenantId: string, id: string): Promise<RoadmapInitiative | null> {
    const slug = tenantId.toLowerCase();
    const map = inMemoryInitiatives.get(slug);
    if (!map) return null;
    return map.get(id) || null;
  }

  static async createInitiative(
    tenantId: string,
    data: Partial<RoadmapInitiative>
  ): Promise<RoadmapInitiative> {
    const slug = tenantId.toLowerCase();
    if (!inMemoryInitiatives.has(slug)) {
      inMemoryInitiatives.set(slug, new Map());
    }
    const map = inMemoryInitiatives.get(slug)!;

    const id = data.id || `custom-${Date.now()}`;
    const rice = data.rice || { reach: 50, impact: 3, confidence: 80, effort: 3, score: 40.0 };
    const score = computeRICEScore(rice);
    rice.score = score;

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

    map.set(id, newInit);
    return newInit;
  }

  static async updateInitiative(
    tenantId: string,
    id: string,
    updates: Partial<RoadmapInitiative>
  ): Promise<RoadmapInitiative | null> {
    const slug = tenantId.toLowerCase();
    const map = inMemoryInitiatives.get(slug);
    if (!map) return null;
    const existing = map.get(id);
    if (!existing) return null;

    let rice = existing.rice;
    if (updates.rice) {
      rice = { ...existing.rice, ...updates.rice };
      rice.score = computeRICEScore(rice);
    }

    const updated: RoadmapInitiative = {
      ...existing,
      ...updates,
      rice,
      updated_at: new Date().toISOString(),
    };

    map.set(id, updated);
    return updated;
  }

  static async upvoteInitiative(
    tenantId: string,
    id: string,
    delta: number = 1
  ): Promise<RoadmapInitiative | null> {
    const slug = tenantId.toLowerCase();
    const map = inMemoryInitiatives.get(slug);
    if (!map) return null;
    const existing = map.get(id);
    if (!existing) return null;

    existing.upvotes = Math.max(0, existing.upvotes + delta);
    existing.updated_at = new Date().toISOString();
    map.set(id, existing);
    return existing;
  }

  static async resetTenant(tenantId: string): Promise<RoadmapInitiative[]> {
    const slug = tenantId.toLowerCase();
    const map = new Map<string, RoadmapInitiative>();
    const defaults = SEED_INITIATIVES[slug] || SEED_INITIATIVES.rfqengine || [];
    for (const item of defaults) {
      map.set(item.id, { ...item, tenant_id: slug });
    }
    inMemoryInitiatives.set(slug, map);
    return Array.from(map.values());
  }
}
