import { RoadmapInitiative, Tenant } from "../types";

export const SEED_TENANTS: Tenant[] = [
  {
    id: "rfqengine",
    name: "RFPEngine",
    subdomain: "rfqengine",
    tagline: "AI-Native RFP & Enterprise Proposal Acceleration Platform",
    logo_url: "",
    brand_color: "#2563EB",
    github_repo: "dipeshsingh2012/rfqengine",
    visibility: "public",
  },
  {
    id: "fleet",
    name: "Agentic Fleet",
    subdomain: "fleet",
    tagline: "Autonomous Multi-Agent Swarm Orchestrator & SDLC Automation Engine",
    logo_url: "",
    brand_color: "#7C3AED",
    github_repo: "dipeshsingh2012/agentic-fleet",
    visibility: "public",
  },
];

export const TEMPLATE_INITIATIVES: Record<string, Partial<RoadmapInitiative>[]> = {
  "ai-saas": [
    {
      id: "auth-multi-tenant-sso",
      title: "Enterprise SSO & SAML 2.0 Auth (Okta, Azure AD)",
      stage: "development",
      theme: "Enterprise Governance",
      priority: "P0 - Critical",
      target_persona: "IT Administrator",
      quarter: "In Development",
      summary: "Single Sign-On integration supporting SAML 2.0, OIDC, and directory sync.",
      problem_statement: "Enterprise customers require SSO integration with their corporate identity providers.",
      user_story: "As an IT Administrator, I want to configure Okta SSO so employees can securely authenticate with corporate credentials.",
      success_metrics: ["100% SAML 2.0 compliance", "Zero plaintext credential storage"],
      acceptance_criteria: [
        "Given a valid SAML IdP metadata XML, When uploaded, Then parse entity ID and SSO certificate.",
        "Given an SSO login redirect, When user authenticates with Okta, Then issue a signed JWT session."
      ],
      technical_architecture: "NextAuth / Clerk / Firebase Auth with SCIM directory sync.",
      rice: { reach: 85, impact: 4, confidence: 90, effort: 2, score: 153.0 },
      upvotes: 42,
      tags: ["Auth", "Security", "Enterprise", "SSO"],
    },
    {
      id: "hybrid-rag-retrieval",
      title: "Hybrid Dense + Sparse BM25 Search with Cohere Re-Ranking",
      stage: "spec",
      theme: "Core AI & Retrieval",
      priority: "P1 - High",
      target_persona: "AI Engineer",
      quarter: "Q3 2026",
      summary: "Combine dense vector embeddings with BM25 lexical keyword search and cross-encoder re-ranking.",
      problem_statement: "Vector search alone misses exact part numbers, acronyms, and product IDs.",
      user_story: "As an End User, I want exact keyword matches prioritized alongside semantic meanings.",
      success_metrics: ["Top-5 retrieval recall > 94%", "Sub-80ms p95 latency"],
      acceptance_criteria: [
        "Given a search query with exact SKU, When searched, Then rank exact SKU match in top 3."
      ],
      technical_architecture: "pgvector + pg_trgm BM25 with Reciprocal Rank Fusion (RRF).",
      rice: { reach: 75, impact: 4, confidence: 85, effort: 3, score: 85.0 },
      upvotes: 68,
      tags: ["RAG", "Search", "pgvector", "Embeddings"],
    },
    {
      id: "realtime-collaboration",
      title: "Live Multiplayer Cursor Presence & Inline Comments",
      stage: "discovery",
      theme: "Collaboration & Workflow",
      priority: "P1 - High",
      target_persona: "Product Manager",
      quarter: "In Discovery",
      summary: "Multiplayer document editing with live collaborator presence indicators and inline threads.",
      problem_statement: "Users have to refresh pages to see team edits and communicate in separate slack channels.",
      user_story: "As a Team Member, I want to see where my teammates are typing and reply to inline comment threads.",
      success_metrics: ["Multiplayer sync latency < 50ms", "Zero data loss on conflict"],
      acceptance_criteria: [
        "Given two users on the same document, When User A moves cursor, Then User B sees live avatar position."
      ],
      technical_architecture: "Liveblocks / PartyKit / WebSockets with CRDT synchronization.",
      rice: { reach: 60, impact: 3, confidence: 75, effort: 4, score: 33.8 },
      upvotes: 35,
      tags: ["Multiplayer", "Realtime", "WebSockets"],
    }
  ],
  "rfp-sales": [
    {
      id: "multi-tenant-gcip-auth",
      title: "Multi-Tenant GCIP Auth & 1-Click Google Sign-In Demo",
      stage: "development",
      theme: "Enterprise Governance",
      priority: "P0 - Critical",
      target_persona: "Evaluator / Enterprise Admin",
      quarter: "In Development",
      summary: "Dual-track multi-tenant authentication powered by Google Cloud Identity Platform (GCIP) with frictionless 1-click Google Sign-In demo sandboxes and enterprise SAML 2.0 / Okta / Azure AD SSO.",
      problem_statement: "Enterprise customers cannot adopt RFPEngine without mandatory corporate SSO (Okta, Azure AD), while evaluators need zero-friction 1-click Google Sign-In to test the platform without complex onboarding.",
      user_story: "As an Enterprise IT Admin, I want all team members to authenticate via our corporate Okta SAML 2.0 provider with automatic tenant isolation, while allowing prospective buyers to launch a 1-click Google authenticated demo workspace.",
      success_metrics: ["Enterprise SSO login success rate > 99.9%", "Time-to-first-demo < 15 seconds for Google Sign-In users", "Zero tenant data leakage across multi-tenant boundaries"],
      acceptance_criteria: [
        "Given an unauthenticated evaluator, When they click 'Continue with Google', Then provision an isolated sandbox tenant in PostgreSQL and redirect to the dashboard in < 3s.",
        "Given an enterprise employee with corporate email domain, When they enter their work email, Then initiate SAML 2.0 SP-initiated flow to their registered Okta / Azure AD IdP."
      ],
      technical_architecture: "Google Cloud Identity Platform (GCIP) multi-tenant auth with Firebase Admin SDK, PostgreSQL tenant partitioning, and Next.js middleware JWT verification.",
      rice: { reach: 95, impact: 5, confidence: 90, effort: 3, score: 142.5 },
      upvotes: 128,
      tags: ["Auth", "GCIP", "Multi-Tenant", "Enterprise SSO", "Security"],
    },
    {
      id: "excel-sig-lite-parser",
      title: "Multi-Format Excel & SIG Lite / CAIQ Parser",
      stage: "development",
      theme: "Smart Ingestion",
      priority: "P0 - Critical",
      target_persona: "Proposal Manager",
      quarter: "In Development",
      summary: "Native parser for complex .xlsx spreadsheets, multi-tab workbooks, and standard questionnaires (SIG Lite, CAIQ v4).",
      problem_statement: "Over 65% of enterprise RFPs and vendor assessments arrive as messy, multi-tab Excel workbooks with merged cells and dropdown pickers.",
      user_story: "As a Proposal Manager, I want to upload a 200-question SIG Lite spreadsheet and have questions, instructions, and response columns mapped automatically.",
      success_metrics: ["98%+ column detection accuracy across SIG Lite and CAIQ templates", "Import time < 5 seconds for 500+ question workbooks"],
      acceptance_criteria: [
        "Given a standard SIG Lite .xlsx file, When uploaded to /api/v1/ingest/excel, Then extract all questions into structured database rows."
      ],
      technical_architecture: "openpyxl + calamine Rust parser with LLM fallback header detector.",
      rice: { reach: 85, impact: 5, confidence: 95, effort: 5, score: 80.8 },
      upvotes: 91,
      tags: ["Excel", "Parser", "SIG-Lite", "CAIQ", "Ingestion"],
    },
    {
      id: "compliance-matrix-exporter",
      title: "Automated Compliance Matrix & Audit Package Exporter",
      stage: "development",
      theme: "Enterprise Governance",
      priority: "P1 - High",
      target_persona: "Security Director",
      quarter: "In Development",
      summary: "One-click export of approved RFP responses into audit-ready PDF, Word (DOCX), and CSV compliance packages.",
      problem_statement: "Compliance and legal teams spend 8-12 hours manually re-formatting approved RFP answers into final client deliverable templates.",
      user_story: "As a Security Director, I want to export our completed questionnaire into a branded DOCX/PDF package with verification timestamps.",
      success_metrics: ["Zero manual re-formatting needed", "Export generation under 3 seconds"],
      acceptance_criteria: [
        "Given a completed questionnaire, When the user clicks 'Export Audit Package', Then stream a formatted PDF with cryptographic hashes."
      ],
      technical_architecture: "python-docx + Weasyprint PDF engine with S3/GCS presigned download URLs.",
      rice: { reach: 75, impact: 4, confidence: 90, effort: 2, score: 101.3 },
      upvotes: 38,
      tags: ["Export", "Compliance", "PDF", "Audit"],
    }
  ],
  "blank": [
    {
      id: "first-customer-opportunity",
      title: "Initial Customer Problem Validation",
      stage: "discovery",
      theme: "Collaboration & Workflow",
      priority: "P1 - High",
      target_persona: "Product Lead",
      quarter: "In Discovery",
      summary: "Continuous discovery opportunity framing to capture first customer interview insights.",
      problem_statement: "We need structured feedback on initial user friction and unmet needs.",
      user_story: "As a Product Lead, I want to capture customer quotes and opportunities in a structured living spec.",
      success_metrics: ["5 customer discovery interviews completed", "Clear problem validation"],
      acceptance_criteria: [
        "Given customer interview notes, When synthesized, Then formulate a testable hypothesis."
      ],
      technical_architecture: "Teresa Torres Opportunity Solution Tree format.",
      rice: { reach: 50, impact: 3, confidence: 80, effort: 2, score: 60.0 },
      upvotes: 1,
      tags: ["Discovery", "JTBD"],
    }
  ]
};

// Full canonical RFPEngine initiatives catalog
export const SEED_INITIATIVES: Record<string, RoadmapInitiative[]> = {
  rfqengine: [
    {
      id: "multi-tenant-gcip-auth",
      tenant_id: "rfqengine",
      title: "Multi-Tenant GCIP Auth & 1-Click Google Sign-In Demo",
      stage: "development",
      theme: "Enterprise Governance",
      priority: "P0 - Critical",
      target_persona: "Evaluator / Enterprise Admin",
      quarter: "In Development",
      summary: "Dual-track multi-tenant authentication powered by Google Cloud Identity Platform (GCIP) with frictionless 1-click Google Sign-In demo sandboxes and enterprise SAML 2.0 / Okta / Azure AD SSO.",
      problem_statement: "Enterprise customers cannot adopt RFPEngine without mandatory corporate SSO (Okta, Azure AD), while evaluators need zero-friction 1-click Google Sign-In to test the platform without complex onboarding.",
      user_story: "As an Enterprise IT Admin, I want all team members to authenticate via our corporate Okta SAML 2.0 provider with automatic tenant isolation, while allowing prospective buyers to launch a 1-click Google authenticated demo workspace.",
      success_metrics: [
        "Enterprise SSO login success rate > 99.9%",
        "Time-to-first-demo < 15 seconds for Google Sign-In users",
        "Zero tenant data leakage across multi-tenant boundaries"
      ],
      acceptance_criteria: [
        "Given an unauthenticated evaluator, When they click 'Continue with Google', Then provision an isolated sandbox tenant in PostgreSQL and redirect to the dashboard in < 3s.",
        "Given an enterprise employee with corporate email domain, When they enter their work email, Then initiate SAML 2.0 SP-initiated flow to their registered Okta / Azure AD IdP.",
        "Given an authenticated tenant JWT, When any database query executes, Then enforce PostgreSQL Row-Level Security (RLS) filtering strictly on tenant_id."
      ],
      technical_architecture: "Google Cloud Identity Platform (GCIP) multi-tenant auth with Firebase Admin SDK, PostgreSQL tenant partitioning, and Next.js middleware JWT verification.",
      rice: { reach: 95, impact: 5, confidence: 90, effort: 3, score: 142.5 },
      upvotes: 128,
      tags: ["Auth", "GCIP", "Multi-Tenant", "Enterprise SSO", "Security"],
      created_at: "2026-08-15T00:00:00Z",
      updated_at: "2026-09-01T12:00:00Z",
    },
    {
      id: "excel-sig-lite-parser",
      tenant_id: "rfqengine",
      title: "Multi-Format Excel & SIG Lite / CAIQ Parser",
      stage: "development",
      theme: "Smart Ingestion",
      priority: "P0 - Critical",
      target_persona: "Proposal Manager",
      quarter: "In Development",
      summary: "Native parser for complex .xlsx spreadsheets, multi-tab workbooks, and standard questionnaires (SIG Lite, CAIQ v4).",
      problem_statement: "Over 65% of enterprise RFPs and vendor assessments arrive as messy, multi-tab Excel workbooks with merged cells and dropdown pickers.",
      user_story: "As a Proposal Manager, I want to upload a 200-question SIG Lite spreadsheet and have questions, instructions, and response columns mapped automatically.",
      success_metrics: [
        "98%+ column detection accuracy across SIG Lite and CAIQ templates",
        "Import time < 5 seconds for 500+ question workbooks",
        "Zero data corruption on export back to original .xlsx"
      ],
      acceptance_criteria: [
        "Given a standard SIG Lite .xlsx file, When uploaded to /api/v1/ingest/excel, Then extract all questions, requirement IDs, and categories into structured database rows.",
        "Given non-standard column headers, When uploaded, Then run Gemini 2.5 Flash column header classifier to map question, answer, and notes columns.",
        "Given completed AI answers, When user clicks Export, Then write answers back into original Excel template preserving exact formulas, cell styling, and dropdown validation."
      ],
      technical_architecture: "openpyxl + calamine Rust parser with LLM fallback header detector.",
      rice: { reach: 85, impact: 5, confidence: 95, effort: 5, score: 80.8 },
      upvotes: 91,
      tags: ["Excel", "Parser", "SIG-Lite", "CAIQ", "Ingestion"],
      created_at: "2026-08-18T00:00:00Z",
      updated_at: "2026-09-01T18:30:00Z",
    },
    {
      id: "compliance-matrix-exporter",
      tenant_id: "rfqengine",
      title: "Automated Compliance Matrix & Audit Package Exporter",
      stage: "development",
      theme: "Enterprise Governance",
      priority: "P1 - High",
      target_persona: "Security Director",
      quarter: "In Development",
      summary: "One-click export of approved RFP responses into audit-ready PDF, Word (DOCX), and CSV compliance packages.",
      problem_statement: "Compliance and legal teams spend 8-12 hours manually re-formatting approved RFP answers into final client deliverable templates.",
      user_story: "As a Security Director, I want to export our completed questionnaire into a branded DOCX/PDF package with verification timestamps.",
      success_metrics: [
        "Zero manual re-formatting needed",
        "Export generation under 3 seconds",
        "100% citation traceability for all claims"
      ],
      acceptance_criteria: [
        "Given a completed questionnaire, When the user clicks 'Export Audit Package', Then stream a formatted PDF with cryptographic hashes and sign-off timestamps.",
        "Given custom corporate Word templates (.dotx), When export is triggered, Then populate fields using Jinja2/docx templating engine."
      ],
      technical_architecture: "python-docx + Weasyprint PDF engine with S3/GCS presigned download URLs.",
      rice: { reach: 75, impact: 4, confidence: 90, effort: 2, score: 101.3 },
      upvotes: 38,
      tags: ["Export", "Compliance", "PDF", "Audit"],
      created_at: "2026-08-20T00:00:00Z",
      updated_at: "2026-09-01T14:00:00Z",
    },
    {
      id: "rag-fact-checker-guard",
      tenant_id: "rfqengine",
      title: "Autonomous Multi-Agent Fact-Checker & Hallucination Guard",
      stage: "spec",
      theme: "Core AI & Retrieval",
      priority: "P0 - Critical",
      target_persona: "Legal Counsel / Security SME",
      quarter: "Q3 2026",
      summary: "Agentic critic swarm that cross-examines AI drafts against contract clauses, rejecting unverified claims.",
      problem_statement: "AI drafts that hallucinate security certifications (e.g. ISO 27001, FedRAMP High) expose companies to legal breach of contract.",
      user_story: "As Legal Counsel, I want an autonomous verification agent to check every generated claim against ground-truth evidence.",
      success_metrics: [
        "Zero unverified compliance assertions",
        "Audit pass rate > 99.5%",
        "Sub-2s verification latency"
      ],
      acceptance_criteria: [
        "Given an AI-generated answer claiming 'SOC 2 Type II certified', When fact-checker runs, Then require citation matching an active SOC 2 document with confidence > 0.92.",
        "Given an ungrounded claim, When verification fails, Then flag text in yellow and request human SME sign-off."
      ],
      technical_architecture: "Chain-of-verification (CoVe) multi-agent prompt graph with Gemini 2.5 Flash critic.",
      rice: { reach: 85, impact: 5, confidence: 90, effort: 6, score: 63.8 },
      upvotes: 76,
      tags: ["Guardrails", "Hallucination", "Multi-Agent", "Verification"],
      created_at: "2026-08-22T00:00:00Z",
      updated_at: "2026-08-30T10:00:00Z",
    },
    {
      id: "continuous-knowledge-connectors",
      tenant_id: "rfqengine",
      title: "Continuous Knowledge Connectors (Drive, Confluence, Notion)",
      stage: "spec",
      theme: "Ecosystem Integrations",
      priority: "P1 - High",
      target_persona: "Head of Sales / RevOps",
      quarter: "Q4 2026",
      summary: "Automated background sync connecting Google Drive folders, Confluence spaces, and Notion docs.",
      problem_statement: "Knowledge bases go stale because product teams publish specs in Notion and Confluence without uploading them to RFPEngine.",
      user_story: "As a RevOps Lead, I want RFPEngine to automatically sync with our Google Drive Security folder every night.",
      success_metrics: [
        "Sync latency < 1 hour from doc edit to vector store update",
        "Zero duplicate embeddings in pgvector"
      ],
      acceptance_criteria: [
        "Given a connected Google Drive folder, When a new PDF is added, Then trigger webhooks to chunk, embed, and index within 5 minutes."
      ],
      technical_architecture: "Temporal / Cloud Tasks scheduled workers with OAuth 2.0 delta-sync APIs.",
      rice: { reach: 80, impact: 4, confidence: 70, effort: 4, score: 56.0 },
      upvotes: 52,
      tags: ["Sync", "Integrations", "Google Drive", "Confluence"],
      created_at: "2026-08-25T00:00:00Z",
      updated_at: "2026-08-31T09:00:00Z",
    },
    {
      id: "ingestion-pipeline-playground",
      tenant_id: "rfqengine",
      title: "Document Ingestion Pipeline & Retrieval Playground",
      stage: "beta",
      theme: "Smart Ingestion",
      priority: "P0 - Critical",
      target_persona: "Proposal Manager",
      quarter: "Q3 2026",
      summary: "Multi-file document ingestion (PDF, Markdown, TXT, JSON) with live semantic chunking and test playground.",
      problem_statement: "Admins cannot inspect how their documents are split into chunks, making it difficult to debug retrieval failures.",
      user_story: "As a Knowledge Manager, I want a visual playground to test semantic search queries and view matched chunk scores.",
      success_metrics: [
        "Ingestion throughput > 50 pages/sec",
        "Interactive query latency < 150ms"
      ],
      acceptance_criteria: [
        "Given an uploaded document, When viewing the playground, Then display chunk boundaries and token counts."
      ],
      technical_architecture: "FastAPI chunking service with pgvector HNSW index visualizer.",
      rice: { reach: 85, impact: 4, confidence: 80, effort: 4, score: 68.0 },
      upvotes: 43,
      tags: ["Ingestion", "Playground", "pgvector", "Chunking"],
      created_at: "2026-08-10T00:00:00Z",
      updated_at: "2026-09-01T11:00:00Z",
    },
    {
      id: "agentic-proposal-generator",
      tenant_id: "rfqengine",
      title: "Agentic Proposal Drafting Engine (Gemini 2.5 Flash RAG)",
      stage: "shipped",
      theme: "Core AI & Retrieval",
      priority: "P0 - Critical",
      target_persona: "Proposal Drafter",
      quarter: "Shipped",
      summary: "Core RAG drafting engine utilizing Gemini 2.5 Flash and vector semantic search with citation grounding.",
      problem_statement: "Manual proposal writing takes 40+ hours per RFP with repetitive copy-pasting from outdated documents.",
      user_story: "As a Proposal Drafter, I want AI to generate compliant first-draft responses with exact citations to verified docs.",
      success_metrics: [
        "85% reduction in first-draft creation time",
        "Zero ungrounded hallucinations"
      ],
      acceptance_criteria: [
        "Given an RFP question, When draft is requested, Then return complete response grounded in knowledge base with source links."
      ],
      technical_architecture: "Gemini 2.5 Flash with Vertex AI search and structured JSON outputs.",
      rice: { reach: 95, impact: 5, confidence: 80, effort: 3, score: 126.7 },
      upvotes: 114,
      tags: ["RAG", "Gemini", "Generation", "Core"],
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-08-20T00:00:00Z",
    }
  ]
};
