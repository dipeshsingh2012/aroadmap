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

  // ─────────────────────────────────────────────────────────────
  // 1. TEST: Input Validation / Error Handling
  // ─────────────────────────────────────────────────────────────
  console.log("1. Testing Validation & Error Handling...");
  {
    const { status, data } = await callSuggestApi({});
    assert(status === 400, "Empty payload returns 400 Bad Request");
    assert(!!data.error, "Error message returned for empty payload");
  }

  {
    const { status, data } = await callSuggestApi({ title: "   ", situation: "   " });
    assert(status === 400, "Whitespace-only payload returns 400 Bad Request");
  }

  // ─────────────────────────────────────────────────────────────
  // 2. TEST: Spreadsheet / Smart Ingestion Opportunity Framing
  // ─────────────────────────────────────────────────────────────
  console.log("\n2. Testing 'Spreadsheet Ingestion' Domain Heuristics...");
  {
    const { status, data } = await callSuggestApi({
      title: "excel spreadsheet import",
      persona: "Proposal Manager",
      theme: "Smart Ingestion",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.title && data.title.length > 5, `Title populated: "${data.title}"`);
    assert(data.theme === "Smart Ingestion", `Theme matches "Smart Ingestion" (Got: ${data.theme})`);
    assert(data.situation.startsWith("When"), `Situation follows "When..." trigger format`);
    assert(data.workaround.includes("Today"), `Workaround describes current friction`);
    assert(data.outcome.length > 10, `Outcome KPI provided: "${data.outcome}"`);
    assert(data.hypothesis.length > 10, `Hypothesis provided: "${data.hypothesis}"`);
    assert(STRATEGIC_THEMES.includes(data.theme as StrategicTheme), "Theme is a valid StrategicTheme enum");
  }

  // ─────────────────────────────────────────────────────────────
  // 3. TEST: Hybrid RAG / Core AI Opportunity Framing
  // ─────────────────────────────────────────────────────────────
  console.log("\n3. Testing 'Hybrid RAG Search' Domain Heuristics...");
  {
    const { status, data } = await callSuggestApi({
      title: "hybrid vector search and bm25",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.theme === "Core AI & Retrieval", `Theme inferred as "Core AI & Retrieval" (Got: ${data.theme})`);
    assert(data.persona === "AI Engineer", `Persona inferred as "AI Engineer" (Got: ${data.persona})`);
    assert(data.situation.toLowerCase().includes("search") || data.situation.toLowerCase().includes("questionnaire"), "Situation context mentions search");
    assert(data.outcome.includes("%") || data.outcome.includes("ms"), "Outcome contains measurable metrics/KPIs");
  }

  // ─────────────────────────────────────────────────────────────
  // 4. TEST: Enterprise SSO & Auth Opportunity Framing
  // ─────────────────────────────────────────────────────────────
  console.log("\n4. Testing 'SSO / Auth' Domain Heuristics...");
  {
    const { status, data } = await callSuggestApi({
      title: "okta saml sso integration",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.theme === "Enterprise Governance", `Theme inferred as "Enterprise Governance" (Got: ${data.theme})`);
    assert(data.persona === "IT Administrator", `Persona inferred as "IT Administrator" (Got: ${data.persona})`);
    assert(data.outcome.toLowerCase().includes("saml") || data.outcome.toLowerCase().includes("compliance"), "Outcome specifies compliance");
  }

  // ─────────────────────────────────────────────────────────────
  // 5. TEST: Autonomous SDLC / Fleet Dispatch Opportunity Framing
  // ─────────────────────────────────────────────────────────────
  console.log("\n5. Testing 'Autonomous Fleet SDLC' Domain Heuristics...");
  {
    const { status, data } = await callSuggestApi({
      title: "autonomous agent swarm code review and pr dispatch",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.theme === "Collaboration & Workflow", `Theme categorized under Collaboration & Workflow`);
    assert(data.situation.toLowerCase().includes("specification") || data.situation.toLowerCase().includes("grooming"), "Situation focuses on SDLC spec grooming");
    assert(data.hypothesis.toLowerCase().includes("agent") || data.hypothesis.toLowerCase().includes("swarm"), "Hypothesis describes agent router");
  }

  // ─────────────────────────────────────────────────────────────
  // 6. TEST: Real-time Collaboration Framing
  // ─────────────────────────────────────────────────────────────
  console.log("\n6. Testing 'Multiplayer Collaboration' Domain Heuristics...");
  {
    const { status, data } = await callSuggestApi({
      title: "multiplayer live cursors and comments",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.persona === "Bid Team", `Persona matches "Bid Team"`);
    assert(data.situation.toLowerCase().includes("review") || data.situation.toLowerCase().includes("proposal"), "Situation captures team review");
    assert(data.hypothesis.toLowerCase().includes("multiplayer") || data.hypothesis.toLowerCase().includes("websocket"), "Hypothesis covers live synchronization");
  }

  // ─────────────────────────────────────────────────────────────
  // 7. TEST: CRM & Ecosystem Integrations Framing
  // ─────────────────────────────────────────────────────────────
  console.log("\n7. Testing 'CRM & Ecosystem' Domain Heuristics...");
  {
    const { status, data } = await callSuggestApi({
      title: "salesforce crm deal sync",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.theme === "Ecosystem Integrations", `Theme inferred as "Ecosystem Integrations"`);
    assert(data.persona === "Head of Sales / RevOps", `Persona inferred as "Head of Sales / RevOps"`);
    assert(data.outcome.toLowerCase().includes("crm") || data.outcome.toLowerCase().includes("deal"), "Outcome captures deal-to-proposal velocity");
  }

  // ─────────────────────────────────────────────────────────────
  // 8. TEST: Arbitrary / Custom Input Fallback
  // ─────────────────────────────────────────────────────────────
  console.log("\n8. Testing Arbitrary / Custom Input Fallback...");
  {
    const { status, data } = await callSuggestApi({
      title: "compliance certificate watermarking",
      persona: "Legal Counsel",
      theme: "Enterprise Governance",
    });

    assert(status === 200, "API returned 200 OK for custom topic");
    assert(data.persona === "Legal Counsel", "Preserved custom persona");
    assert(data.theme === "Enterprise Governance", "Preserved custom theme");
    assert(data.situation.length > 10, "Generated structured situation");
    assert(data.workaround.length > 10, "Generated structured workaround");
    assert(data.outcome.length > 10, "Generated measurable outcome");
    assert(data.hypothesis.length > 10, "Generated solution hypothesis");
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
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
