import { pgSchema, varchar, text, integer, numeric, jsonb, timestamp, primaryKey, index } from "drizzle-orm/pg-core";

// Dedicated 'aroadmap' PostgreSQL Namespace (Schema) in Neon
export const aroadmapSchema = pgSchema("aroadmap");

export const tenantsTable = aroadmapSchema.table("tenants", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 64 }).unique().notNull(),
  tagline: text("tagline"),
  logo_url: text("logo_url"),
  brand_color: varchar("brand_color", { length: 32 }).default("#2563EB"),
  github_repo: varchar("github_repo", { length: 255 }),
  visibility: varchar("visibility", { length: 32 }).default("public"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const initiativesTable = aroadmapSchema.table(
  "initiatives",
  {
    id: varchar("id", { length: 128 }).notNull(),
    tenant_id: varchar("tenant_id", { length: 64 })
      .notNull()
      .references(() => tenantsTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    stage: varchar("stage", { length: 32 }).notNull().default("discovery"),
    theme: varchar("theme", { length: 64 }).default("Smart Ingestion"),
    priority: varchar("priority", { length: 32 }).default("P1 - High"),
    target_persona: varchar("target_persona", { length: 128 }).default("Proposal Manager"),
    quarter: varchar("quarter", { length: 64 }).default("In Discovery"),
    summary: text("summary"),
    problem_statement: text("problem_statement"),
    user_story: text("user_story"),
    success_metrics: jsonb("success_metrics").default([]),
    acceptance_criteria: jsonb("acceptance_criteria").default([]),
    technical_architecture: text("technical_architecture"),
    rice_reach: integer("rice_reach").default(50),
    rice_impact: integer("rice_impact").default(3),
    rice_confidence: integer("rice_confidence").default(80),
    rice_effort: integer("rice_effort").default(3),
    rice_score: numeric("rice_score", { precision: 6, scale: 1 }).default("40.0"),
    upvotes: integer("upvotes").default(0),
    tags: jsonb("tags").default([]),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tenant_id, table.id] }),
  })
);

export const fleetRunsTable = aroadmapSchema.table(
  "fleet_runs",
  {
    request_id: varchar("request_id", { length: 128 }).primaryKey(),
    tenant_id: varchar("tenant_id", { length: 128 }).notNull(),
    initiative_id: varchar("initiative_id", { length: 128 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    github_repository: varchar("github_repository", { length: 255 }),
    github_run_id: varchar("github_run_id", { length: 32 }),
    github_run_attempt: varchar("github_run_attempt", { length: 16 }),
    run_url: text("run_url"),
    conclusion: varchar("conclusion", { length: 100 }),
    error_summary: text("error_summary"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    initiativeUpdated: index("idx_aroadmap_fleet_runs_initiative").on(
      table.tenant_id,
      table.initiative_id,
      table.updated_at
    ),
  })
);
