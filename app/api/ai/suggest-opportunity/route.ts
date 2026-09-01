import { NextRequest, NextResponse } from "next/server";

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

Generate a structured customer opportunity framing in valid JSON format:
{
  "title": "Refined, punchy opportunity title (e.g. Automated Spreadsheet Column Mapping for 300-Row Questionnaires)",
  "persona": "Target user persona (e.g. Proposal Manager, Security SME, Legal Counsel, AI Engineer, IT Administrator, Head of Sales / RevOps, Bid Team)",
  "theme": "Strategic Pillar (one of: Smart Ingestion, Enterprise Governance, Core AI & Retrieval, Ecosystem Integrations, Collaboration & Workflow)",
  "situation": "Detailed Situation & Trigger: When in the workflow does this friction occur? (start with 'When...')",
  "workaround": "Current painful workaround: How do users suffer today? (e.g. 'Today, users manually copy-paste...')",
  "outcome": "Measurable Desired Outcome & KPI: (e.g. 'Reduce turnaround time from 3 days to < 2 hours with 0 errors')",
  "hypothesis": "Proposed Solution Hypothesis: (e.g. 'A client-side WebAssembly parser with column heuristics and 1-click in-place export...')"
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
          const rawResponse =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawResponse) {
            const parsed = JSON.parse(rawResponse);
            return NextResponse.json({ ...parsed, generated_by: "gemini" });
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
            return NextResponse.json({ ...parsed, generated_by: "openai" });
          }
        }
      } catch (err) {
        console.warn("OpenAI API suggestion failed, falling back to local engine:", err);
      }
    }

    // 3. Intelligent Heuristic Continuous Discovery Engine (Fast, High-Quality, Zero-Dependency)
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

function synthesizeOpportunity(
  input: string,
  fallbackPersona: string,
  fallbackTheme: string
) {
  const query = input.toLowerCase();

  // Pattern matching for diverse product discovery themes
  if (query.includes("sso") || query.includes("saml") || query.includes("auth") || query.includes("okta") || query.includes("login") || query.includes("rbac")) {
    return {
      title: input.length > 5 ? capitalize(input) : "Enterprise SSO & Automated Role-Based Access Control",
      persona: "IT Administrator",
      theme: "Enterprise Governance",
      situation: `When an enterprise customer onboards team members across multiple departments and needs centralized identity management.`,
      workaround: `Today, administrators manually provision accounts, manage separate passwords in spreadsheets, and lack automatic de-provisioning on employee offboarding.`,
      outcome: `Achieve 100% SAML 2.0 / OIDC compliance and reduce IT onboarding ticket volume by > 80%.`,
      hypothesis: `An enterprise SSO gateway supporting Okta, Azure AD, and Google Workspace with SCIM directory synchronization.`,
    };
  }

  if (query.includes("excel") || query.includes("sheet") || query.includes("csv") || query.includes("table") || query.includes("import") || query.includes("column") || query.includes("format")) {
    return {
      title: input.length > 5 ? capitalize(input) : "Intelligent Spreadsheet Ingestion & Automatic Column Mapping",
      persona: "Proposal Manager",
      theme: "Smart Ingestion",
      situation: `When a customer uploads a complex multi-tab spreadsheet questionnaire with merged header cells and nested section groups.`,
      workaround: `Today, bid teams spend 4-8 hours manually normalizing tables, reformatting merged cells, and copy-pasting questions row-by-row.`,
      outcome: `Parse 500+ row complex spreadsheets in < 5 seconds with > 98% column identification accuracy.`,
      hypothesis: `A client-side WebAssembly heuristic parser that automatically detects header topologies and maps question/answer columns.`,
    };
  }

  if (query.includes("search") || query.includes("rag") || query.includes("vector") || query.includes("retriev") || query.includes("embed") || query.includes("bm25") || query.includes("hybrid")) {
    return {
      title: input.length > 5 ? capitalize(input) : "Hybrid Vector + Keyword Search with Contextual Re-Ranking",
      persona: "AI Engineer",
      theme: "Core AI & Retrieval",
      situation: `When searching across dense technical compliance policies and buyer questionnaires with specific alphanumeric codes and part numbers.`,
      workaround: `Today, standard vector search overlooks exact SKU numbers, while pure keyword search misses conceptually related compliance standards.`,
      outcome: `Boost top-3 retrieval recall to > 95% with sub-100ms p95 latency.`,
      hypothesis: `A hybrid retrieval pipeline combining pgvector dense embeddings and BM25 full-text indexing fused via Reciprocal Rank Fusion (RRF).`,
    };
  }

  if (query.includes("agent") || query.includes("fleet") || query.includes("review") || query.includes("pr") || query.includes("git") || query.includes("dev") || query.includes("qa") || query.includes("code")) {
    return {
      title: input.length > 5 ? capitalize(input) : "Autonomous Multi-Agent SDLC Dispatch & Continuous PR Review",
      persona: "Proposal Manager",
      theme: "Collaboration & Workflow",
      situation: `When a validated feature specification is signed off and ready for implementation without waiting for manual engineering sprint grooming.`,
      workaround: `Today, product specs sit in backlog queues for weeks waiting for developer capacity to draft boilerplate and unit tests.`,
      outcome: `Accelerate spec-to-PR cycle time from 10 days to < 1 hour with automated test verification.`,
      hypothesis: `An autonomous multi-agent swarm router that converts Gherkin acceptance criteria into git branches, code commits, and verified PRs.`,
    };
  }

  if (query.includes("collab") || query.includes("multiplayer") || query.includes("comment") || query.includes("share") || query.includes("slack") || query.includes("notif")) {
    return {
      title: input.length > 5 ? capitalize(input) : "Real-Time Multiplayer Collaboration & Inline Threaded Reviews",
      persona: "Bid Team",
      theme: "Collaboration & Workflow",
      situation: `When multiple subject matter experts (Legal, Security, Engineering) review a critical proposal simultaneously before deadline.`,
      workaround: `Today, reviewers lock documents, email disconnected PDF versions, and manually merge conflicting edits.`,
      outcome: `Eliminate version conflicts completely and reduce multi-party review cycles by 65%.`,
      hypothesis: `A live multiplayer editing engine with live avatar cursors, inline resolution threads, and real-time WebSockets synchronization.`,
    };
  }

  if (query.includes("integrat") || query.includes("api") || query.includes("salesforce") || query.includes("hubspot") || query.includes("crm") || query.includes("webhook")) {
    return {
      title: input.length > 5 ? capitalize(input) : "Two-Way CRM & Ecosystem Integrations (Salesforce, HubSpot)",
      persona: "Head of Sales / RevOps",
      theme: "Ecosystem Integrations",
      situation: `When an account executive closes an opportunity stage in CRM and needs immediate proposal generation without leaving Salesforce.`,
      workaround: `Today, sales reps manually duplicate deal parameters, re-type customer requirements into separate tools, and miss deadline SLAs.`,
      outcome: `Automate 100% of deal-to-proposal handoffs and sync proposal completion status back to CRM opportunities.`,
      hypothesis: `Native bi-directional CRM connectors with webhook triggers and automatic workspace provisioning.`,
    };
  }

  // General fallback
  const cleanInput = capitalize(input);
  return {
    title: cleanInput.length > 5 ? cleanInput : `${cleanInput} Acceleration & Automation`,
    persona: fallbackPersona || "Proposal Manager",
    theme: fallbackTheme || "Smart Ingestion",
    situation: `When ${fallbackPersona} users execute their daily workflow and encounter friction with ${input.toLowerCase()}.`,
    workaround: `Today, teams rely on fragmented manual workarounds, spreadsheets, and repetitive copy-pasting across disparate tools.`,
    outcome: `Reduce turnaround friction by > 60% and improve end-to-end data accuracy with automated validation.`,
    hypothesis: `An automated workflow capability that directly addresses ${input.toLowerCase()} with real-time feedback and structured verification.`,
  };
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
