import { POST } from "../app/api/ai/suggest-opportunity/route";
import { NextRequest } from "next/server";
import { STRATEGIC_THEMES, StrategicTheme } from "../lib/types";

async function runAiSuggestionTests() {
  console.log("===============================================================");
  console.log("🧪 CONTINUOUS DISCOVERY & AI AUTO-COMPLETE TEST SUITE");
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

  // Helper to call POST handler
  async function callSuggestApi(body: any): Promise<{ status: number; data: any }> {
    const req = new NextRequest("http://localhost:3000/api/ai/suggest-opportunity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const res = await POST(req);
    const data = await res.json();
    return { status: res.status, data };
  }

  // 1. TEST: Input Validation / Error Handling
  console.log("1. Testing Validation & Error Handling...");
  {
    const { status, data } = await callSuggestApi({});
    assert(status === 400, "Empty payload returns 400 Bad Request");
    assert(!!data.error, "Error message returned for empty payload");
  }

  // 2. TEST: MCP Integration (Specific Regression Test)
  console.log("\n2. Testing 'Add MCP Integration' (Regression Test)...");
  {
    const { status, data } = await callSuggestApi({
      title: "Add MCP Integration",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.title === "Add MCP Integration", `Title matches: "${data.title}"`);
    assert(data.persona === "AI Engineer", `Persona is "AI Engineer" (Got: ${data.persona})`);
    assert(data.theme === "Core AI & Retrieval", `Theme is "Core AI & Retrieval" (Got: ${data.theme})`);
    assert(data.priority === "P0 - Critical", `Priority is P0 - Critical (Got: ${data.priority})`);
    assert(data.situation.includes("Model Context Protocol") || data.situation.includes("Claude, Cursor, Antigravity"), `Situation captures AI coding agents`);
    assert(data.workaround.includes("copy-paste PRD requirements"), `Workaround captures manual PRD copy-pasting`);
    assert(data.outcome.includes("JSON-RPC 2.0"), `Outcome captures JSON-RPC 2.0 compliance`);
    assert(data.hypothesis.includes("/api/mcp"), `Hypothesis mentions /api/mcp`);
    assert(data.tags.includes("MCP"), `Tags include "MCP" (Got: [${data.tags.join(', ')}])`);
    assert(!data.tags.includes("Salesforce"), `Tags DO NOT contain Salesforce (Got: [${data.tags.join(', ')}])`);
  }

  // 3. TEST: Spreadsheet / Smart Ingestion
  console.log("\n3. Testing 'Spreadsheet Ingestion'...");
  {
    const { status, data } = await callSuggestApi({
      title: "excel spreadsheet import",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.persona === "Proposal Manager", `Persona is Proposal Manager`);
    assert(data.theme === "Smart Ingestion", `Theme matches "Smart Ingestion"`);
    assert(data.tags.includes("Spreadsheets"), "Tags include Spreadsheets");
  }

  // 4. TEST: SSO / Auth Domain
  console.log("\n4. Testing 'SSO / Auth' Domain...");
  {
    const { status, data } = await callSuggestApi({
      title: "okta saml sso integration",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.persona === "IT Administrator", `Persona is IT Administrator`);
    assert(data.theme === "Enterprise Governance", `Theme is Enterprise Governance`);
  }

  // 5. TEST: Salesforce CRM (Should specifically match CRM, not MCP)
  console.log("\n5. Testing 'Salesforce CRM Sync'...");
  {
    const { status, data } = await callSuggestApi({
      title: "salesforce crm deal sync",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.persona === "Head of Sales / RevOps", `Persona is Head of Sales / RevOps`);
    assert(data.tags.includes("Salesforce"), "Tags include Salesforce");
  }

  // SUMMARY
  console.log("\n===============================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAiSuggestionTests().catch((err) => {
  console.error("Test Suite Unhandled Exception:", err);
  process.exit(1);
});
