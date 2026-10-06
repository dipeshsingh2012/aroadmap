export type RoadmapStage =
  | "backlog"
  | "ready_for_dev"
  | "design_approved"
  | "in_development"
  | "security_review"
  | "qa_review"
  | "code_review"
  | "shipped"
  | "discovery"
  | "spec"
  | "approved"
  | "development";

export const CANONICAL_STAGES: RoadmapStage[] = [
  "backlog",
  "ready_for_dev",
  "design_approved",
  "in_development",
  "security_review",
  "qa_review",
  "code_review",
  "shipped",
];

export function normalizeStage(stage: RoadmapStage | string): RoadmapStage {
  switch (stage) {
    case "discovery":
    case "spec":
      return "backlog";
    case "approved":
      return "ready_for_dev";
    case "development":
      return "in_development";
    default:
      return stage as RoadmapStage;
  }
}

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
  stages?: RoadmapStage[];
}

export function getTenantStages(tenant?: Tenant | null): RoadmapStage[] {
  if (tenant?.stages && tenant.stages.length > 0) {
    return tenant.stages;
  }
  return CANONICAL_STAGES;
}

export const STAGE_CONFIG: Record<
  RoadmapStage,
  { label: string; icon: string; description: string; color: string; badgeClass: string }
> = {
  backlog: {
    label: "Backlog / To do",
    icon: "📋",
    description: "Customer interviews, user research & prioritized backlog items",
    color: "#64748b",
    badgeClass: "stage-backlog",
  },
  ready_for_dev: {
    label: "Ready for dev",
    icon: "🎯",
    description: "PRD documentation, Gherkin criteria & operator sign-off",
    color: "#8b5cf6",
    badgeClass: "stage-ready",
  },
  design_approved: {
    label: "Design approved",
    icon: "📐",
    description: "System architecture and technical design approved by Architect",
    color: "#0284c7",
    badgeClass: "stage-design-approved",
  },
  in_development: {
    label: "In development",
    icon: "🏗️",
    description: "Active sprint execution, coding branch & implementation",
    color: "#3b82f6",
    badgeClass: "stage-development",
  },
  security_review: {
    label: "Security review",
    icon: "🛡️",
    description: "Security scanning, secrets audit & vulnerability verification",
    color: "#eab308",
    badgeClass: "stage-security",
  },
  qa_review: {
    label: "QA review",
    icon: "🧪",
    description: "Automated test suite, regression checks & acceptance criteria validation",
    color: "#ec4899",
    badgeClass: "stage-qa",
  },
  code_review: {
    label: "Code review",
    icon: "👀",
    description: "Senior agent code review, diff verification & quality sign-off",
    color: "#a855f7",
    badgeClass: "stage-review",
  },
  shipped: {
    label: "Shipped / Done",
    icon: "🚀",
    description: "Available in production with release notes & verified PR",
    color: "#10b981",
    badgeClass: "stage-shipped",
  },
  // Legacy aliases
  discovery: {
    label: "In Discovery",
    icon: "🔍",
    description: "Legacy stage: Backlog & problem validation",
    color: "#64748b",
    badgeClass: "stage-discovery",
  },
  spec: {
    label: "In Spec & Design",
    icon: "📐",
    description: "Legacy stage: PRD & criteria definition",
    color: "#8b5cf6",
    badgeClass: "stage-spec",
  },
  approved: {
    label: "Approved & Ready",
    icon: "✅",
    description: "Legacy stage: Approved for dev",
    color: "#0284c7",
    badgeClass: "stage-approved",
  },
  development: {
    label: "In Development",
    icon: "🏗️",
    description: "Legacy stage: In development",
    color: "#3b82f6",
    badgeClass: "stage-development",
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
