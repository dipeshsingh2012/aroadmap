import { MCPServerHandler } from "../lib/mcp-server";

async function runTestSuite() {
  console.log("===============================================================");
  console.log("🧪 RIGOROUS MCP SUITE VERIFICATION: aroadmap.dev");
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

  // 1. TEST initialize & tools/list
  console.log("1. Testing MCP Handshake & Tool Declaration...");
  const initRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
  });
  assert(initRes?.result?.serverInfo?.name === "aroadmap-mcp", "MCP serverInfo is 'aroadmap-mcp'");

  const listRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
  });
  const tools = listRes?.result?.tools || [];
  assert(tools.length >= 8, `Declared ${tools.length} MCP tools (Expected >= 8)`);
  const toolNames = tools.map((t: any) => t.name);
  assert(toolNames.includes("create_initiative"), "Includes 'create_initiative'");
  assert(toolNames.includes("update_initiative"), "Includes 'update_initiative'");
  assert(toolNames.includes("transition_initiative_stage"), "Includes 'transition_initiative_stage'");
  assert(toolNames.includes("get_initiative"), "Includes 'get_initiative'");
  assert(toolNames.includes("list_initiatives"), "Includes 'list_initiatives'");
  assert(toolNames.includes("generate_release_notes"), "Includes 'generate_release_notes'");
  assert(toolNames.includes("publish_release"), "Includes 'publish_release'");
  assert(toolNames.includes("delete_initiative"), "Includes 'delete_initiative'");

  // 2. TEST create_initiative
  console.log("\n2. Testing Pillar 1: create_initiative...");
  const testId = `test-mcp-init-${Date.now()}`;
  const createRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "create_initiative",
      arguments: {
        tenant_id: "rfpengine",
        title: "Automated RFP Question Answering with Hybrid RAG",
        summary: "Autonomous extraction and retrieval of answers for vendor RFP questions.",
        theme: "Core AI & Retrieval",
        priority: "P0 - Critical",
        target_persona: "Proposal Director",
        user_story: "As a Proposal Director, I want high-confidence answers generated from past winning bids.",
        acceptance_criteria: [
          "Given an incoming RFP question, When queried against KB, Then return top 3 vetted answers with similarity score > 0.85.",
          "Given low confidence match, When detected, Then route to human domain expert."
        ],
        technical_architecture: "pgvector hybrid search + Gemini 1.5 Pro synthesis.",
        rice: { reach: 90, impact: 5, confidence: 85, effort: 2 },
        tags: ["AI", "RAG", "Automation"]
      }
    }
  });

  const createdItem = createRes?.result?.initiative;
  assert(createRes?.result?.status === "success", "create_initiative status is success");
  assert(createdItem?.title === "Automated RFP Question Answering with Hybrid RAG", "Title matches");
  assert(createdItem?.rice?.score === 191.3, `RICE Score correctly calculated as 191.3 (Got: ${createdItem?.rice?.score})`);
  assert(createdItem?.acceptance_criteria?.length === 2, "Acceptance criteria preserved as array of 2 Gherkin items");

  const createdId = createdItem?.id;

  // 3. TEST get_initiative
  console.log("\n3. Testing Pillar 2: get_initiative...");
  const getRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "get_initiative",
      arguments: {
        tenant_id: "rfpengine",
        item_id: createdId
      }
    }
  });
  assert(getRes?.result?.id === createdId, "get_initiative retrieved the exact item ID from Neon DB");
  assert(getRes?.result?.priority === "P0 - Critical", "Priority matches P0 - Critical");

  // 4. TEST update_initiative
  console.log("\n4. Testing Pillar 2: update_initiative (Partial Updates)...");
  const updateRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "update_initiative",
      arguments: {
        tenant_id: "rfpengine",
        item_id: createdId,
        updates: {
          quarter: "Q3 2026",
          technical_architecture: "Updated pgvector + Vertex AI embeddings with Reciprocal Rank Fusion",
          rice: { reach: 95, impact: 5, confidence: 90, effort: 2 }
        }
      }
    }
  });
  const updatedItem = updateRes?.result?.initiative;
  assert(updateRes?.result?.status === "success", "update_initiative returned status success");
  assert(updatedItem?.quarter === "Q3 2026", "Quarter updated to 'Q3 2026'");
  assert(updatedItem?.rice?.score === 213.8, `Updated RICE score is 213.8 (Got: ${updatedItem?.rice?.score})`);

  // 5. TEST transition_initiative_stage
  console.log("\n5. Testing Pillar 2: transition_initiative_stage State Machine...");
  const transRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "transition_initiative_stage",
      arguments: {
        tenant_id: "rfpengine",
        item_id: createdId,
        stage: "development",
        feedback: "Approved in sprint planning 14"
      }
    }
  });
  assert(transRes?.result?.stage === "development", "transition_initiative_stage moved stage to 'development'");

  // 6. TEST list_initiatives with filters
  console.log("\n6. Testing Pillar 2: list_initiatives with filtering...");
  const listInitsRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "list_initiatives",
      arguments: {
        tenant_id: "rfpengine",
        search: "Hybrid RAG"
      }
    }
  });
  assert(listInitsRes?.result?.items?.length >= 1, `list_initiatives found ${listInitsRes?.result?.items?.length} items matching 'Hybrid RAG'`);

  // 7. TEST publish_release
  console.log("\n7. Testing Pillar 3: publish_release...");
  const publishRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "publish_release",
      arguments: {
        tenant_id: "rfpengine",
        version: "v2.0.0",
        item_ids: [createdId],
        pr_url: "https://github.com/dipeshsingh2012/rfpengine/pull/42",
        release_summary: "Major release featuring Automated Hybrid RAG QA Engine"
      }
    }
  });
  assert(publishRes?.result?.status === "success", "publish_release status is success");
  assert(publishRes?.result?.shipped_count === 1, "Shipped count is 1");

  // 8. TEST generate_release_notes
  console.log("\n8. Testing Pillar 3: generate_release_notes (Markdown synthesis)...");
  const notesRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "generate_release_notes",
      arguments: {
        tenant_id: "rfpengine",
        version: "v2.0.0",
        item_ids: [createdId]
      }
    }
  });
  const md = notesRes?.result?.markdown || "";
  assert(md.includes("# Release Notes: v2.0.0"), "Markdown contains header '# Release Notes: v2.0.0'");
  assert(md.includes("Automated RFP Question Answering with Hybrid RAG"), "Markdown includes feature title");
  assert(md.includes("Delivered Capabilities"), "Markdown includes Gherkin Delivered Capabilities section");

  console.log("\n--- Generated Release Notes Preview ---");
  console.log(md.slice(0, 450) + "...\n--------------------------------------");

  // 9. TEST delete_initiative (cleanup)
  console.log("9. Testing delete_initiative (Clean Teardown)...");
  const delRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "delete_initiative",
      arguments: {
        tenant_id: "rfpengine",
        item_id: createdId
      }
    }
  });
  assert(delRes?.result?.status === "success", `delete_initiative successfully deleted '${createdId}'`);

  // Verify it is gone
  const verifyDel = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "get_initiative",
      arguments: {
        tenant_id: "rfpengine",
        item_id: createdId
      }
    }
  });
  assert(verifyDel?.result?.error !== undefined, "Item confirmed deleted from Neon PostgreSQL");

  // 10. TEST get_cloud_diagnostics
  console.log("\n10. Testing get_cloud_diagnostics...");
  const diagRes = await MCPServerHandler.handleRequest({
    jsonrpc: "2.0",
    id: 12,
    method: "tools/call",
    params: {
      name: "get_cloud_diagnostics",
      arguments: {}
    }
  });
  assert(diagRes?.result?.status === "healthy", "Diagnostics reports healthy");
  assert(diagRes?.result?.schema === "aroadmap", "Diagnostics confirms schema 'aroadmap'");

  console.log("\n===============================================================");
  console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(console.error);
