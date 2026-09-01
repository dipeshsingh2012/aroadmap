import { pgTable, varchar, text, integer, numeric, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const aroadmapTenantsTable = pgTable("aroadmap_tenants", {
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

export const aroadmapInitiativesTable = pgTable(
  "aroadmap_initiatives",
  {
    id: varchar("id", { length: 128 }).notNull(),
    tenant_id: varchar("tenant_id", { length: 64 })
      .notNull()
      .references(() => aroadmapTenantsTable.id, { onDelete: "cascade" }),
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
