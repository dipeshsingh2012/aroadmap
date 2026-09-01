# 🗺️ aroadmap.dev

> **The AI-Native Multi-Tenant Product Strategy, Living PRD & Autonomous SDLC Platform**

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20Postgres-00e699?style=flat&logo=postgresql)](https://neon.tech/)
[![MCP 2024-11-05](https://img.shields.io/badge/Protocol-MCP-purple?style=flat)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Overview

**`aroadmap.dev`** is an AI-native product strategy hub and autonomous software delivery platform. It transforms static roadmaps and chaotic ticket backlogs into **interactive discovery hubs and living PRD studios** directly linked to autonomous AI coding fleets.

Every organization or open-source project receives their own dedicated subdomain (e.g. [**https://rfpengine.aroadmap.dev**](https://rfpengine.aroadmap.dev)), complete with custom branding, public customer upvoting, living Gherkin acceptance criteria, and a 1-click human sign-off gate that commands autonomous agents to cut branches, write code, run tests, and open Pull Requests.

```
┌────────────────────────────────────────────────────────┐
│  https://rfpengine.aroadmap.dev                        │
└────────────────────────────────────────────────────────┘
  ▲             ▲
  │             └─ aroadmap.dev (Universal Platform Core)
  └─ Tenant Subdomain (RFPEngine Strategy Hub)
```

---

## 🌟 Key Features

### 1. 📋 5-Stage Kanban Board & Strategy Hub
Track product velocity across five continuous discovery stages:
- 🔍 **In Discovery**: Customer problem validation and opportunity framing.
- 📐 **In Spec & Design**: Living PRD documentation, Gherkin criteria, and technical architecture.
- ✅ **Approved & Ready**: Signed off by Product/Engineering Lead — queued for autonomous agent dispatch.
- 🏗️ **In Development**: Active engineering, coding branch, and automated test synthesis.
- 🚀 **Shipped & Live**: Production releases with public changelogs.

### 2. 🎯 RICE Prioritization Matrix
Automatically compute and rank backlog items by return on investment:
$$\text{RICE Score} = \frac{\text{Reach (\%)} \times \text{Impact (1-5x)} \times \text{Confidence (\%)}}{\text{Effort (person-weeks)} \times 100}$$

### 3. 📑 Living PRDs with Gherkin Acceptance Criteria
Clicking any initiative opens a slide-over PRD drawer containing:
- **The "Why" & Problem Statement**: Customer context and current friction.
- **Agile User Story**: `"As a [Persona], when [Trigger], I want [Feature], so that [Outcome]"`.
- **Target KPIs & Success Metrics**: Verification checklist.
- **Acceptance Criteria**: Formatted in standard Gherkin syntax (`Given / When / Then`).
- **Technical Architecture & Dependencies**: Data models, APIs, and security requirements.

### 4. 💡 Continuous Discovery (Teresa Torres OST + JTBD)
A built-in opportunity framing intake modal based on Teresa Torres' **Opportunity Solution Trees** and **Jobs-to-be-Done (JTBD)**.

### 5. 🤖 Autonomous SDLC Fleet Dispatch Gate
Human-in-the-loop sign-off: clicking **"Approve & Start Dev"** in the PRD drawer immediately dispatches an autonomous agent swarm to create the feature branch, write implementation files, run pre-commit tests, and open a GitHub Pull Request with zero manual ticket toil.

### 6. 🌐 Pure Wildcard Subdomain Multi-Tenancy
Edge middleware seamlessly resolves `[tenant].aroadmap.dev` in `<10ms` (zero query strings), loading isolated tenant branding, theme colors, logos, and connected GitHub repositories.

---

## 🏗️ Architecture & Database Namespacing

```mermaid
flowchart TD
    subgraph Routing ["1. Wildcard Subdomain Edge Routing"]
        DNS["Wildcard DNS: *.aroadmap.dev"]
        MW["Next.js 15 Edge Middleware (middleware.ts)"]
        DNS -->|Host: rfpengine.aroadmap.dev| MW
        MW -->|Extract Tenant: 'rfpengine'| Page["app/[domain]/page.tsx"]
    end

    subgraph Database ["2. Neon Serverless PostgreSQL (Schema: aroadmap)"]
        Page --> DB[(Neon Postgres)]
        DB --> T1["aroadmap.tenants<br/>(Subdomains, Branding, GitHub Repos)"]
        DB --> T2["aroadmap.initiatives<br/>(Composite PK: tenant_id, id)"]
    end

    subgraph MCP ["3. Model Context Protocol Layer (/api/mcp)"]
        Page <--> MCPServer["Jira-Grade MCP Handler"]
        MCPServer <--> Antigravity["🤖 Google Antigravity / Agent Fleet"]
        MCPServer <--> Cursor["💻 Cursor IDE"]
        MCPServer <--> Claude["⚡ Claude Code CLI"]
    end
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript 5.5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Glassmorphism Theme |
| **Icons & Motion** | [Lucide React](https://lucide.dev/) |
| **Database & ORM** | [Neon Serverless PostgreSQL](https://neon.tech/) (`aroadmap` schema) + [Drizzle ORM](https://orm.drizzle.team/) |
| **Protocol** | [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) JSON-RPC 2.0 & SSE |

---

## 🔌 Model Context Protocol (MCP) Suite

`aroadmap.dev` exposes a Jira-grade MCP interface at `https://aroadmap.dev/api/mcp` for AI coding agents.

### Tool Suite Overview

| Tool Name | Action | Description |
| :--- | :--- | :--- |
| **`create_initiative`** | **Pillar 1: Creation** | Creates a living PRD with User Story, Gherkin Criteria, and RICE scoring. |
| **`update_initiative`** | **Pillar 2: CRUD** | Updates any field on an initiative (RICE, specs, criteria, priority, quarter). |
| **`transition_initiative_stage`** | **Pillar 2: Workflow** | Moves card through `discovery` $\rightarrow$ `spec` $\rightarrow$ `approved` $\rightarrow$ `development` $\rightarrow$ `shipped`. |
| **`get_initiative`** | **Pillar 2: Inspect** | Retrieves full PRD specification for a single initiative. |
| **`list_initiatives`** | **Pillar 2: Query** | Filters backlog by stage, theme, priority, or full-text search. |
| **`delete_initiative`** | **Pillar 2: Teardown** | Permanently deletes an initiative from the backlog. |
| **`generate_release_notes`** | **Pillar 3: Releases** | Synthesizes categorized Markdown release notes grouped by theme. |
| **`publish_release`** | **Pillar 3: Changelog** | Marks items as `shipped` and records release version + PR link. |
| **`get_cloud_diagnostics`** | **Diagnostics** | Checks database latency, PostgreSQL schema health, and tenant status. |

---

### Client MCP Configuration

#### Google Antigravity SDK (`~/.gemini/config/mcp_config.json`):
```json
{
  "mcpServers": {
    "aroadmap": {
      "url": "https://aroadmap.dev/api/mcp",
      "headers": {
        "X-Tenant-ID": "rfpengine"
      }
    }
  }
}
```

#### Cursor IDE Settings:
```json
{
  "mcpServers": {
    "aroadmap-hub": {
      "type": "sse",
      "url": "https://aroadmap.dev/api/mcp"
    }
  }
}
```

#### Claude Code CLI:
```bash
claude mcp add aroadmap https://aroadmap.dev/api/mcp --header "X-Tenant-ID: rfpengine"
```

---

## ⚡ Quick Start & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/dipeshsingh2012/aroadmap.git
cd aroadmap
npm install
```

### 2. Configure Environment
Create a `.env` file in the root:
```env
# Root domain configuration
ROOT_DOMAIN=aroadmap.dev
NEXT_PUBLIC_ROOT_DOMAIN=aroadmap.dev

# Database (Neon Serverless PostgreSQL - Schema: aroadmap)
DATABASE_URL=postgresql://neondb_owner:npg_UkAy0bg9uBoT@ep-rapid-truth-aqw82ysi-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Run Development Server
```bash
npm run dev
```

Open your browser:
* **Marketing & Tenant Onboarding**: [http://localhost:3000](http://localhost:3000)
* **RFPEngine Roadmap**: [http://rfpengine.localhost:3000](http://rfpengine.localhost:3000)

### 4. Run Automated Test Suite
```bash
npx tsx scripts/test-mcp-suite.ts
```

---

## 📄 License

MIT © [Dipesh Singh](https://github.com/dipeshsingh2012)
