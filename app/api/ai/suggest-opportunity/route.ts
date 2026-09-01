import { NextRequest, NextResponse } from "next/server";
import { computeRICEScore, PriorityLevel, StrategicTheme, STRATEGIC_THEMES } from "@/lib/types";

interface SuggestionRequest {
  title?: string;
  persona?: string;
  theme?: string;
  situation?: string;
  workaround?: string;
  outcome?: string;
  hypothesis?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SuggestionRequest = await req.json();
    const rawTitle = (body.title || "").trim();
    const currentPersona = body.persona || "Proposal Manager";
    const currentTheme = body.theme || "Smart Ingestion";
    const currentSituation = (body.situation || "").trim();

    if (!rawTitle && !currentSituation) {
      return NextResponse.json(
        { error: "Please provide an opportunity title or situation to generate suggestions." },
        { status: 400 }
      );
    }

    const promptText = `
You are a Staff Product Manager expert in Teresa Torres' Continuous Discovery Habits and Jobs-to-be-Done (JTBD) framework.
Given the following customer opportunity / feature seed:
- Title/Seed: "${rawTitle || currentSituation}"
- Current Persona: "${currentPersona}"
- Current Strategic Theme: "${currentTheme}"
- Existing Situation: "${currentSituation}"

Generate a complete, structured customer opportunity framing in valid JSON format:
{
  "title": "Refined, punchy opportunity title (e.g. Model Context Protocol (MCP) Server for IDE & Agentic Integrations)",
  "persona": "Target user persona (one of: Proposal Manager, Security SME, Legal Counsel, AI Engineer, IT Administrator, Head of Sales / RevOps, Bid Team, Product Lead)",
  "theme": "Strategic Pillar (one of: Smart Ingestion, Enterprise Governance, Core AI & Retrieval, Ecosystem Integrations, Collaboration & Workflow)",
  "priority": "Priority level (one of: P0 - Critical, P1 - High, P2 - Medium, P3 - Low)",
  "situation": "Detailed Situation & Trigger: When in the workflow does this friction occur? (start with 'When...')",
  "workaround": "Current painful workaround: How do users suffer today? (start with 'Today, ...')",
  "outcome": "Measurable Desired Outcome & KPI: (e.g. 'Reduce turnaround time from 3 days to < 2 hours with 0 errors')",
  "hypothesis": "Proposed Solution Hypothesis: (e.g. 'A standard Model Context Protocol (MCP) endpoint exposing living PRDs and backlog tools...')",
  "tags": ["SearchTag1", "SearchTag2", "SearchTag3"],
  "rice": {
    "reach": 75,
    "impact": 4,
    "confidence": 85,
    "effort": 3
  }
}
Respond ONLY with the raw JSON object.
`;

    // 1. Try Google Gemini API if GEMINI_API_KEY is present
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawResponse = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawResponse) {
            const parsed = JSON.parse(rawResponse);
            const normalized = normalizeSuggestion(parsed, rawTitle || currentSituation);
            return NextResponse.json({ ...normalized, generated_by: "gemini" });
          }
        }
      } catch (err) {
        console.warn("Gemini API suggestion failed, falling back to local engine:", err);
      }
    }

    // 2. Try OpenAI API if OPENAI_API_KEY is present
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a Staff Product Discovery PM. Respond ONLY with valid JSON matching the requested schema.",
              },
              { role: "user", content: promptText },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json();
          const content = openaiData?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const normalized = normalizeSuggestion(parsed, rawTitle || currentSituation);
            return NextResponse.json({ ...normalized, generated_by: "openai" });
          }
        }
      } catch (err) {
        console.warn("OpenAI API suggestion failed, falling back to local engine:", err);
      }
    }

    // 3. Precision Continuous Discovery Heuristics Engine
    const synthesized = synthesizeOpportunity(rawTitle || currentSituation, currentPersona, currentTheme);
    return NextResponse.json({ ...synthesized, generated_by: "discovery-heuristics" });
  } catch (error: any) {
    console.error("AI Opportunity Suggestion Error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions", details: error.message },
      { status: 500 }
    );
  }
}

function normalizeSuggestion(data: any, originalInput: string) {
  const reach = Number(data?.rice?.reach || 70);
  const impact = Number(data?.rice?.impact || 3);
  const confidence = Number(data?.rice?.confidence || 80);
  const effort = Math.max(0.5, Number(data?.rice?.effort || 3));
  const score = computeRICEScore({ reach, impact, confidence, effort });

  return {
    title: data.title || capitalize(originalInput),
    persona: data.persona || "Proposal Manager",
    theme: data.theme || "Smart Ingestion",
    priority: data.priority || "P1 - High",
    situation: data.situation || `When users execute their workflow with ${originalInput}...`,
    workaround: data.workaround || `Today, users rely on manual workarounds across disconnected tools...`,
    outcome: data.outcome || `Reduce completion turnaround time by > 50% with zero errors.`,
    hypothesis: data.hypothesis || `An automated capability that directly addresses ${originalInput} with structured verification.`,
    tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : ["Continuous Discovery", "Opportunity", "JTBD"],
    rice: { reach, impact, confidence, effort, score },
  };
}

function synthesizeOpportunity(
  input: string,
  fallbackPersona: string,
  fallbackTheme: string
) {
  const query = input.toLowerCase();

  // ─────────────────────────────────────────────────────────────
  // 1. SPECIFIC: MCP (Model Context Protocol) / AI Tool Calling / Agent Protocol
  // ─────────────────────────────────────────────────────────────
  if (query.includes("mcp") || query.includes("model context protocol") || query.includes("tool calling") || query.includes("agent tool") || query.includes("json-rpc")) {
    const reach = 80, impact = 5, confidence = 90, effort = 2;
    return {
      title: input.length > 5 ? capitalize(input) : "Model Context Protocol (MCP) Server for IDE & Agentic Integrations",
      persona: "AI Engineer",
      theme: "Core AI & Retrieval",
      priority: "P0 - Critical" as PriorityLevel,
      situation: `When autonomous AI coding agents (Claude, Cursor, Antigravity) need real-time, bi-directional context from our roadmap and living PRD backlog.`,
      workaround: `Today, engineers and product leads manually copy-paste PRD requirements, Gherkin criteria, and issue status across browser tabs into their AI prompts.`,
      outcome: `Provide sub-50ms JSON-RPC 2.0 tool execution for external AI agents with 100% schema validation and zero manual copy-pasting.`,
      hypothesis: `A standard Model Context Protocol (MCP) server endpoint at /api/mcp exposing tools for initiative CRUD, stage transitions, and SDLC dispatch.`,
      tags: ["MCP", "Model Context Protocol", "AI Agents", "Tool Calling", "JSON-RPC"],
      rice: { reach, impact, confidence, effort, score: computeRICEScore({ reach, impact, confidence, effort }) },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SPECIFIC: SSO / Auth / Security / RBAC / SAML / Okta
  // ─────────────────────────────────────────────────────────────
  if (query.includes("sso") || query.includes("saml") || query.includes("auth") || query.includes("okta") || query.includes("login") || query.includes("rbac") || query.includes("oauth") || query.includes("security")) {
    const reach = 85, impact = 4, confidence = 90, effort = 2;
    return {
      title: input.length > 5 ? capitalize(input) : "Enterprise SSO & Automated Role-Based Access Control",
      persona: "IT Administrator",
      theme: "Enterprise Governance",
      priority: "P0 - Critical" as PriorityLevel,
      situation: `When an enterprise customer onboards team members across multiple departments and needs centralized identity management.`,
      workaround: `Today, administrators manually provision accounts, manage separate passwords in spreadsheets, and lack automatic de-provisioning on employee offboarding.`,
      outcome: `Achieve 100% SAML 2.0 / OIDC compliance and reduce IT onboarding ticket volume by > 80%.`,
      hypothesis: `An enterprise SSO gateway supporting Okta, Azure AD, and Google Workspace with SCIM directory synchronization.`,
      tags: ["Auth", "Security", "SSO", "Enterprise", "Okta"],
      rice: { reach, impact, confidence, effort, score: computeRICEScore({ reach, impact, confidence, effort }) },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. SPECIFIC: Spreadsheets / Excel / Ingestion / CSV / Tables / Parsing
  // ─────────────────────────────────────────────────────────────
  if (query.includes("excel") || query.includes("sheet") || query.includes("csv") || query.includes("table") || query.includes("column") || query.includes("format") || query.includes("ingest") || query.includes("parse")) {
    const reach = 90, impact = 4, confidence = 85, effort = 2.5;
    return {
      title: input.length > 5 ? capitalize(input) : "Intelligent Spreadsheet Ingestion & Automatic Column Mapping",
      persona: "Proposal Manager",
      theme: "Smart Ingestion",
      priority: "P1 - High" as PriorityLevel,
      situation: `When a customer uploads a complex multi-tab spreadsheet questionnaire with merged header cells and nested section groups.`,
      workaround: `Today, bid teams spend 4-8 hours manually normalizing tables, reformatting merged cells, and copy-pasting questions row-by-row.`,
      outcome: `Parse 500+ row complex spreadsheets in < 5 seconds with > 98% column identification accuracy.`,
      hypothesis: `A client-side WebAssembly heuristic parser that automatically detects header topologies and maps question/answer columns.`,
      tags: ["Spreadsheets", "Ingestion", "Wasm", "Excel", "Parsing"],
      rice: { reach, impact, confidence, effort, score: computeRICEScore({ reach, impact, confidence, effort }) },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. SPECIFIC: RAG / Vector Search / Embeddings / BM25 / Semantic
  // ─────────────────────────────────────────────────────────────
  if (query.includes("search") || query.includes("rag") || query.includes("vector") || query.includes("retriev") || query.includes("embed") || query.includes("bm25") || query.includes("semantic")) {
    const reach = 80, impact = 5, confidence = 85, effort = 3;
    return {
      title: input.length > 5 ? capitalize(input) : "Hybrid Vector + Keyword Search with Contextual Re-Ranking",
      persona: "AI Engineer",
      theme: "Core AI & Retrieval",
      priority: "P1 - High" as PriorityLevel,
      situation: `When searching across dense technical compliance policies and buyer questionnaires with specific alphanumeric codes and part numbers.`,
      workaround: `Today, standard vector search overlooks exact SKU numbers, while pure keyword search misses conceptually related compliance standards.`,
      outcome: `Boost top-3 retrieval recall to > 95% with sub-100ms p95 latency.`,
      hypothesis: `A hybrid retrieval pipeline combining pgvector dense embeddings and BM25 full-text indexing fused via Reciprocal Rank Fusion (RRF).`,
      tags: ["RAG", "pgvector", "BM25", "Search", "Embeddings"],
      rice: { reach, impact, confidence, effort, score: computeRICEScore({ reach, impact, confidence, effort }) },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. SPECIFIC: Autonomous Agent Swarm / SDLC / Fleet / GitHub PR Review
  // ─────────────────────────────────────────────────────────────
  if (query.includes("agent") || query.includes("fleet") || query.includes("pr review") || query.includes("git") || query.includes("dev agent") || query.includes("qa agent") || query.includes("sdlc")) {
    const reach = 75, impact = 5, confidence = 80, effort = 3.5;
    return {
      title: input.length > 5 ? capitalize(input) : "Autonomous Multi-Agent SDLC Dispatch & Continuous PR Review",
      persona: "Product Lead",
      theme: "Collaboration & Workflow",
      priority: "P1 - High" as PriorityLevel,
      situation: `When a validated feature specification is signed off and ready for implementation without waiting for manual engineering sprint grooming.`,
      workaround: `Today, product specs sit in backlog queues for weeks waiting for developer capacity to draft boilerplate and unit tests.`,
      outcome: `Accelerate spec-to-PR cycle time from 10 days to < 1 hour with automated test verification.`,
      hypothesis: `An autonomous multi-agent swarm router that converts Gherkin acceptance criteria into git branches, code commits, and verified PRs.`,
      tags: ["Agents", "SDLC", "Multi-Agent", "Autonomous", "GitHub"],
      rice: { reach, impact, confidence, effort, score: computeRICEScore({ reach, impact, confidence, effort }) },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. SPECIFIC: Multiplayer / Collaboration / Live / Real-Time / WebSockets
  // ─────────────────────────────────────────────────────────────
  if (query.includes("multiplayer") || query.includes("realtime") || query.includes("real-time") || query.includes("websocket") || query.includes("cursor") || query.includes("presence") || query.includes("live edit")) {
    const reach = 70, impact = 4, confidence = 80, effort = 3;
    return {
      title: input.length > 5 ? capitalize(input) : "Real-Time Multiplayer Collaboration & Inline Threaded Reviews",
      persona: "Bid Team",
      theme: "Collaboration & Workflow",
      priority: "P1 - High" as PriorityLevel,
      situation: `When multiple subject matter experts (Legal, Security, Engineering) review a critical proposal simultaneously before deadline.`,
      workaround: `Today, reviewers lock documents, email disconnected PDF versions, and manually merge conflicting edits.`,
      outcome: `Eliminate version conflicts completely and reduce multi-party review cycles by 65%.`,
      hypothesis: `A live multiplayer editing engine with live avatar cursors, inline resolution threads, and real-time WebSockets synchronization.`,
      tags: ["Multiplayer", "Realtime", "WebSockets", "Collaboration"],
      rice: { reach, impact, confidence, effort, score: computeRICEScore({ reach, impact, confidence, effort }) },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. SPECIFIC: CRM / Salesforce / HubSpot / Deal Velocity
  // ─────────────────────────────────────────────────────────────
  if (query.includes("salesforce") || query.includes("hubspot") || query.includes("crm") || query.includes("deal") || query.includes("pipeline") || query.includes("revops")) {
    const reach = 65, impact = 4, confidence = 85, effort = 2.5;
    return {
      title: input.length > 5 ? capitalize(input) : "Two-Way CRM Integration & Opportunity Sync (Salesforce, HubSpot)",
      persona: "Head of Sales / RevOps",
      theme: "Ecosystem Integrations",
      priority: "P1 - High" as PriorityLevel,
      situation: `When an account executive closes an opportunity stage in CRM and needs immediate proposal generation without leaving Salesforce.`,
      workaround: `Today, sales reps manually duplicate deal parameters, re-type customer requirements into separate tools, and miss deadline SLAs.`,
      outcome: `Automate 100% of deal-to-proposal handoffs and sync proposal completion status back to CRM opportunities.`,
      hypothesis: `Native bi-directional CRM connectors with webhook triggers and automatic workspace provisioning.`,
      tags: ["CRM", "Salesforce", "HubSpot", "Integrations", "Webhooks"],
      rice: { reach, impact, confidence, effort, score: computeRICEScore({ reach, impact, confidence, effort }) },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 8. GENERAL API / Webhook / Ecosystem Connectors
  // ─────────────────────────────────────────────────────────────
  if (query.includes("webhook") || query.includes("api") || query.includes("rest") || query.includes("graphql") || query.includes("connector") || query.includes("integrat") || query.includes("plugin")) {
    const reach = 75, impact = 4, confidence = 85, effort = 2.5;
    return {
      title: input.length > 5 ? capitalize(input) : "Extensible Webhook & REST API Integration Gateway",
      persona: "AI Engineer",
      theme: "Ecosystem Integrations",
      priority: "P1 - High" as PriorityLevel,
      situation: `When third-party enterprise systems and developer tools need to programmatic trigger actions and stream event updates.`,
      workaround: `Today, teams build ad-hoc polling scripts or perform manual batch exports without real-time event synchronization.`,
      outcome: `Provide reliable sub-100ms webhook delivery with automated retries and granular API key permissions.`,
      hypothesis: `A standardized API and Webhook gateway supporting signed payload signatures and event filtering.`,
      tags: ["API", "Webhooks", "Integrations", "Developer Platform"],
      rice: { reach, impact, confidence, effort, score: computeRICEScore({ reach, impact, confidence, effort }) },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. GENERAL / DYNAMIC FALLBACK
  // ─────────────────────────────────────────────────────────────
  const cleanInput = capitalize(input);
  const reach = 60, impact = 3, confidence = 75, effort = 3;
  return {
    title: cleanInput.length > 5 ? cleanInput : `${cleanInput} Acceleration & Automation`,
    persona: fallbackPersona || "Proposal Manager",
    theme: fallbackTheme || "Smart Ingestion",
    priority: "P1 - High" as PriorityLevel,
    situation: `When ${fallbackPersona || "team"} users execute their daily workflow and encounter friction with ${input.toLowerCase()}.`,
    workaround: `Today, teams rely on fragmented manual workarounds, spreadsheets, and repetitive copy-pasting across disparate tools.`,
    outcome: `Reduce turnaround friction by > 60% and improve end-to-end data accuracy with automated validation.`,
    hypothesis: `An automated workflow capability that directly addresses ${input.toLowerCase()} with real-time feedback and structured verification.`,
    tags: ["Continuous Discovery", "Opportunity", "Automation"],
    rice: { reach, impact, confidence, effort, score: computeRICEScore({ reach, impact, confidence, effort }) },
  };
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
