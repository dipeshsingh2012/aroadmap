import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log("🚀 Starting aroadmap Neon PostgreSQL Migration...");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create aroadmap_tenants table
    console.log("Creating table 'aroadmap_tenants'...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS aroadmap_tenants (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(64) UNIQUE NOT NULL,
        tagline TEXT,
        logo_url TEXT,
        brand_color VARCHAR(32) DEFAULT '#2563EB',
        github_repo VARCHAR(255),
        visibility VARCHAR(32) DEFAULT 'public',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Create aroadmap_initiatives table
    console.log("Creating table 'aroadmap_initiatives'...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS aroadmap_initiatives (
        id VARCHAR(128) NOT NULL,
        tenant_id VARCHAR(64) NOT NULL REFERENCES aroadmap_tenants(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        stage VARCHAR(32) NOT NULL DEFAULT 'discovery',
        theme VARCHAR(64) DEFAULT 'Smart Ingestion',
        priority VARCHAR(32) DEFAULT 'P1 - High',
        target_persona VARCHAR(128) DEFAULT 'Proposal Manager',
        quarter VARCHAR(64) DEFAULT 'In Discovery',
        summary TEXT,
        problem_statement TEXT,
        user_story TEXT,
        success_metrics JSONB DEFAULT '[]'::jsonb,
        acceptance_criteria JSONB DEFAULT '[]'::jsonb,
        technical_architecture TEXT,
        rice_reach INTEGER DEFAULT 50,
        rice_impact INTEGER DEFAULT 3,
        rice_confidence INTEGER DEFAULT 80,
        rice_effort INTEGER DEFAULT 3,
        rice_score NUMERIC(6, 1) DEFAULT 40.0,
        upvotes INTEGER DEFAULT 0,
        tags JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (tenant_id, id)
      );
    `);

    // 3. Seed initial canonical tenants
    console.log("Upserting initial tenants (rfpengine, fleet)...");
    await client.query(`
      INSERT INTO aroadmap_tenants (id, name, subdomain, tagline, brand_color, github_repo, visibility)
      VALUES 
        ('rfpengine', 'RFPEngine', 'rfpengine', 'AI-Native RFP & Enterprise Proposal Acceleration Platform', '#2563EB', 'dipeshsingh2012/rfpengine', 'public'),
        ('fleet', 'Agentic Fleet', 'fleet', 'Autonomous Multi-Agent Swarm Orchestrator & SDLC Engine', '#7C3AED', 'dipeshsingh2012/agentic-fleet', 'public')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        tagline = EXCLUDED.tagline,
        brand_color = EXCLUDED.brand_color,
        github_repo = EXCLUDED.github_repo;
    `);

    // 4. Migrate data from existing roadmap_initiatives to aroadmap_initiatives without purging
    console.log("Reading existing initiatives from 'roadmap_initiatives'...");
    const existingRes = await client.query("SELECT * FROM roadmap_initiatives");
    console.log(`Found ${existingRes.rows.length} existing rows to migrate.`);

    let migratedCount = 0;
    for (const row of existingRes.rows) {
      // Map tenant_id to 'rfpengine' if default/test-tenant
      const tenantId =
        row.tenant_id === "fleet"
          ? "fleet"
          : "rfpengine";

      const successMetrics =
        typeof row.success_metrics === "string"
          ? row.success_metrics
          : JSON.stringify(row.success_metrics || []);

      const acceptanceCriteria =
        typeof row.acceptance_criteria === "string"
          ? row.acceptance_criteria
          : JSON.stringify(row.acceptance_criteria || []);

      const tags =
        typeof row.tags === "string"
          ? row.tags
          : JSON.stringify(row.tags || []);

      await client.query(`
        INSERT INTO aroadmap_initiatives (
          id, tenant_id, title, stage, theme, priority, target_persona, quarter,
          summary, problem_statement, user_story, success_metrics, acceptance_criteria,
          technical_architecture, rice_reach, rice_impact, rice_confidence, rice_effort,
          rice_score, upvotes, tags, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb,
          $14, $15, $16, $17, $18, $19, $20, $21::jsonb, $22, $23
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
          updated_at = EXCLUDED.updated_at;
      `, [
        row.id,
        tenantId,
        row.title,
        row.stage || "discovery",
        row.theme || "Core AI & Retrieval",
        row.priority || "P1 - High",
        row.target_persona || "Proposal Manager",
        row.quarter || "In Discovery",
        row.summary || "",
        row.problem_statement || "",
        row.user_story || "",
        successMetrics,
        acceptanceCriteria,
        row.technical_architecture || "",
        row.rice_reach || 50,
        row.rice_impact || 3,
        row.rice_confidence || 80,
        row.rice_effort || 3,
        row.rice_score || 40.0,
        row.upvotes || 0,
        tags,
        row.created_at || new Date(),
        row.updated_at || new Date(),
      ]);

      migratedCount++;
    }

    await client.query("COMMIT");
    console.log(`✅ Successfully migrated ${migratedCount} initiatives into 'aroadmap_initiatives' (0 rows purged).`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
