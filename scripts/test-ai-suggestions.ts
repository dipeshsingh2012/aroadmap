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

  // 2. TEST: Spreadsheet / Smart Ingestion Opportunity Framing (All 10 fields)
  console.log("\n2. Testing 'Spreadsheet Ingestion' Populates All 10 Fields...");
  {
    const { status, data } = await callSuggestApi({
      title: "excel spreadsheet import",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.title && data.title.length > 5, `1. Title populated: "${data.title}"`);
    assert(data.persona === "Proposal Manager", `2. Persona populated: "${data.persona}"`);
    assert(data.theme === "Smart Ingestion", `3. Theme matches "Smart Ingestion"`);
    assert(data.priority === "P1 - High", `4. Priority populated: "${data.priority}"`);
    assert(data.situation.startsWith("When"), `5. Situation follows "When..." trigger`);
    assert(data.workaround.startsWith("Today"), `6. Workaround follows "Today, ..."`);
    assert(data.outcome.length > 10, `7. Outcome KPI provided: "${data.outcome}"`);
    assert(data.hypothesis.length > 10, `8. Hypothesis provided: "${data.hypothesis}"`);
    assert(Array.isArray(data.tags) && data.tags.length >= 3, `9. Tags populated: [${data.tags.join(', ')}]`);
    assert(typeof data.rice?.score === "number" && data.rice.score > 0, `10. RICE score calculated: ${data.rice.score}`);
  }

  // 3. TEST: SSO / Auth Domain
  console.log("\n3. Testing 'SSO / Auth' Domain...");
  {
    const { status, data } = await callSuggestApi({
      title: "okta saml sso integration",
    });

    assert(status === 200, "API returned 200 OK");
    assert(data.persona === "IT Administrator", `Persona is IT Administrator`);
    assert(data.theme === "Enterprise Governance", `Theme is Enterprise Governance`);
    assert(data.priority === "P0 - Critical", `Priority is P0 - Critical`);
    assert(data.tags.includes("SSO") || data.tags.includes("Auth"), "Tags include Auth/SSO");
    assert(data.rice.reach === 85, "Reach is 85%");
  }

  // 4. TEST: Arbitrary Input Fallback
  console.log("\n4. Testing Arbitrary / Generic Topic Fallback...");
  {
    const { status, data } = await callSuggestApi({
      title: "dark mode theme",
    });

    assert(status === 200, "API returned 200 OK for custom topic");
    assert(data.title.toLowerCase().includes("dark mode"), "Title contains dark mode");
    assert(data.situation.length > 10, "Situation generated");
    assert(data.workaround.length > 10, "Workaround generated");
    assert(data.outcome.length > 10, "Outcome generated");
    assert(data.hypothesis.length > 10, "Hypothesis generated");
    assert(data.tags.length > 0, "Tags generated");
    assert(data.rice.score > 0, "RICE score computed");
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
