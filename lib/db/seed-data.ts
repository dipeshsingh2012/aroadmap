import { RoadmapInitiative } from "../types";

// Starter presets available optionally during tenant creation
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
      upvotes: 12,
      tags: ["Auth", "Security", "Enterprise", "SSO"],
    },
    {
      id: "hybrid-rag-retrieval",
      title: "Hybrid Dense + Sparse BM25 Search with Re-Ranking",
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
      upvotes: 18,
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
      upvotes: 9,
      tags: ["Multiplayer", "Realtime", "WebSockets"],
    }
  ],
  "blank": [
    {
      id: "first-customer-opportunity",
      title: "Initial Customer Opportunity & Problem Framing",
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
