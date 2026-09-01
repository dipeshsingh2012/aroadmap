export type RoadmapStage = "discovery" | "spec" | "approved" | "development" | "shipped";

export type StrategicTheme =
  | "Core AI & Retrieval"
  | "Enterprise Governance"
  | "Smart Ingestion"
  | "Ecosystem Integrations"
  | "Collaboration & Workflow";

export type PriorityLevel = "P0 - Critical" | "P1 - High" | "P2 - Medium" | "P3 - Low";

export interface RICEScore {
  reach: number;       // 1 - 100%
  impact: number;      // 1 - 5x
  confidence: number;  // 10 - 100%
  effort: number;      // 1 - 20 person-weeks
  score: number;       // (Reach * Impact * Confidence) / (Effort * 100)
}

export interface RoadmapInitiative {
  id: string;
  tenant_id: string;
  title: string;
  stage: RoadmapStage;
  theme: StrategicTheme;
  priority: PriorityLevel;
  target_persona: string;
  quarter: string;
  summary: string;
  problem_statement: string;
  user_story: string;
  success_metrics: string[];
  acceptance_criteria: string[];
  technical_architecture: string;
  rice: RICEScore;
  upvotes: number;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  id: string;             // e.g. 'rfpengine'
  name: string;           // e.g. 'RFPEngine'
  subdomain: string;      // 'rfpengine'
  tagline?: string;       // 'AI-Native RFP & Proposal Acceleration Engine'
  logo_url?: string;
  brand_color?: string;   // '#2563EB'
  github_repo?: string;   // 'dipeshsingh2012/rfpengine'
  visibility?: "public" | "private" | "password";
  created_at?: string;
}

export const STAGE_CONFIG: Record<
  RoadmapStage,
  { label: string; icon: string; description: string; color: string; badgeClass: string }
> = {
  discovery: {
    label: "In Discovery",
    icon: "🔍",
    description: "Customer interviews, user research & problem validation",
    color: "#64748b",
    badgeClass: "stage-discovery",
  },
  spec: {
    label: "In Spec & Design",
    icon: "📐",
    description: "PRD documentation, Gherkin criteria & technical architecture",
    color: "#8b5cf6",
    badgeClass: "stage-spec",
  },
  approved: {
    label: "Approved & Ready",
    icon: "✅",
    description: "Signed off by Lead, queued for autonomous agent dispatch",
    color: "#0284c7",
    badgeClass: "stage-approved",
  },
  development: {
    label: "In Development",
    icon: "🏗️",
    description: "Active sprint execution, coding branch & test implementation",
    color: "#3b82f6",
    badgeClass: "stage-development",
  },
  shipped: {
    label: "Shipped & Live",
    icon: "🚀",
    description: "Available in production with release notes & verified metrics",
    color: "#10b981",
    badgeClass: "stage-shipped",
  },
};

export const STRATEGIC_THEMES: StrategicTheme[] = [
  "Smart Ingestion",
  "Enterprise Governance",
  "Core AI & Retrieval",
  "Ecosystem Integrations",
  "Collaboration & Workflow",
];

export function computeRICEScore(r: { reach: number; impact: number; confidence: number; effort: number }): number {
  const effort = Math.max(0.5, r.effort);
  return Number(((r.reach * r.impact * r.confidence) / (effort * 100)).toFixed(1));
}
