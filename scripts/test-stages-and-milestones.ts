import { CANONICAL_STAGES, STAGE_CONFIG, normalizeStage, getTenantStages, RoadmapStage } from "../lib/types";
import { MCPServerHandler } from "../lib/mcp-server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function declaresProperty(properties: unknown, name: string): boolean {
  return isRecord(properties) && Object.hasOwn(properties, name);
}

function enumIncludes(properties: unknown, property: string, value: string): boolean {
  if (!isRecord(properties)) return false;

  const schemaProperty = properties[property];
  if (!isRecord(schemaProperty) || !Array.isArray(schemaProperty.enum)) return false;

  return schemaProperty.enum.includes(value);
}

async function runTestSuite() {
  console.log("===============================================================");
  console.log("🧪 VERIFICATION: AROADMAP STAGES & FLEET MILESTONE DECOUPLING");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string, details?: any) {
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`, details || "");
      failed++;
    }
  }

  // 1. STAGE DEFINITIONS
  console.log("1. Testing 8 Canonical Stages & STAGE_CONFIG...");
  const expectedStages: RoadmapStage[] = [
    "backlog",
    "ready_for_dev",
    "design_approved",
    "in_development",
    "security_review",
    "qa_review",
    "code_review",
    "shipped",
  ];

  assert(CANONICAL_STAGES.length === 8, "CANONICAL_STAGES has exactly 8 stages");
  for (let i = 0; i < expectedStages.length; i++) {
    assert(CANONICAL_STAGES[i] === expectedStages[i], `Stage ${i + 1} matches '${expectedStages[i]}'`);
    assert(!!STAGE_CONFIG[expectedStages[i]], `STAGE_CONFIG has entry for '${expectedStages[i]}'`);
    assert(!!STAGE_CONFIG[expectedStages[i]].label, `STAGE_CONFIG['${expectedStages[i]}'] has label`);
  }

  // 2. NORMALIZATION & BACKWARD COMPATIBILITY
  console.log("\n2. Testing Stage Normalization & Legacy Aliases...");
  assert(normalizeStage("discovery") === "backlog", "discovery normalizes to backlog");
  assert(normalizeStage("spec") === "backlog", "spec normalizes to backlog");
  assert(normalizeStage("approved") === "ready_for_dev", "approved normalizes to ready_for_dev");
  assert(normalizeStage("development") === "in_development", "development normalizes to in_development");
  assert(normalizeStage("security_review") === "security_review", "security_review remains security_review");

  // 3. TENANT-DRIVEN STAGE CONFIG
  console.log("\n3. Testing Tenant-Driven Stage Config...");
  const defaultTenantStages = getTenantStages(null);
  assert(defaultTenantStages.length === 8, "Default tenant returns 8 canonical stages");

  const customTenant = {
    id: "custom-tenant",
    name: "Custom Tenant",
    subdomain: "custom",
    stages: ["backlog", "in_development", "shipped"] as RoadmapStage[],
  };
  const customStages = getTenantStages(customTenant);
  assert(customStages.length === 3, "Custom tenant returns configured 3 stages");
  assert(customStages[1] === "in_development", "Custom tenant stages preserved");

  // 4. MCP TOOL DECLARATIONS
  console.log("\n4. Testing MCP Tools & report_fleet_status Schema...");
  const tools = MCPServerHandler.getTools();
  const fleetTriggerTool = tools.find((t: any) => t.name === "trigger_fleet_dispatch");
  assert(!!fleetTriggerTool, "Tenant-scoped Fleet dispatch tool declared");

  const reportTool = tools.find((t: any) => t.name === "report_fleet_status");
  assert(!!reportTool, "report_fleet_status tool declared");

  const props: unknown = reportTool?.inputSchema?.properties;
  assert(declaresProperty(props, "tenant_id"), "report_fleet_status declares tenant_id");
  assert(declaresProperty(props, "initiative_id"), "report_fleet_status declares initiative_id");
  assert(declaresProperty(props, "request_id"), "report_fleet_status declares request_id");
  assert(declaresProperty(props, "milestone"), "report_fleet_status declares milestone property");
  assert(declaresProperty(props, "pr_url"), "report_fleet_status declares pr_url property");
  assert(enumIncludes(props, "status", "in_progress"), "report_fleet_status accepts in_progress status");
  assert(enumIncludes(props, "status", "completed"), "report_fleet_status accepts completed status");
  assert(enumIncludes(props, "status", "blocked"), "report_fleet_status accepts blocked status");

  const createTool = tools.find((t: any) => t.name === "create_initiative");
  const createProps: unknown = createTool?.inputSchema?.properties;
  assert(enumIncludes(createProps, "stage", "ready_for_dev"), "create_initiative accepts ready_for_dev");
  assert(enumIncludes(createProps, "stage", "security_review"), "create_initiative accepts security_review");

  console.log(`\n===============================================================`);
  console.log(`🏁 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log(`===============================================================`);

  if (failed > 0) process.exit(1);
}

runTestSuite().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
