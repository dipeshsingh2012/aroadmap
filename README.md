# 🗺️ aroadmap.dev

> **The AI-Native Multi-Tenant Product Strategy, Living PRD & Autonomous SDLC Platform**

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat)](https://orm.drizzle.team/)
[![MCP 2024-11-05](https://img.shields.io/badge/Protocol-MCP-purple?style=flat)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Overview

**`aroadmap.dev`** is an all-in-one product management and autonomous software delivery platform. It transforms static roadmaps and chaotic ticket backlogs into **interactive discovery hubs and living PRD studios** directly linked to autonomous AI coding fleets.

Every organization or open-source project receives their own dedicated subdomain (e.g. `rfqengine.aroadmap.dev`, `fleet.aroadmap.dev`), complete with custom branding, public customer upvoting, and a 1-click human sign-off gate that commands autonomous agents to cut branches, write code, run tests, and open Pull Requests.

```
┌────────────────────────────────────────────────────────┐
│  https://rfqengine.aroadmap.dev                       │
└────────────────────────────────────────────────────────┘
  ▲             ▲
  │             └─ aroadmap.dev (Universal Platform Core)
  └─ Tenant ID (RFPEngine Project)
```

---

## 🌟 Key Features

### 1. 📋 5-Stage Kanban Board & Strategy Hub
Track product velocity across five continuous discovery stages:
- 🔍 **In Discovery**: Customer problem validation and opportunity framing.
- 📐 **In Spec & Design**: Living PRD documentation, Gherkin criteria, and technical architecture.
- 🏗️ **In Development**: Active engineering and autonomous `dev-agent` branches.
- 🧪 **Beta & Testing**: Adversarial QA testing, security audits, and customer previews.
- 🚀 **Shipped & Live**: Production releases with public changelogs.

### 2. 🎯 RICE Prioritization Matrix
Automatically compute and rank backlog items by return on investment:
$$\text{RICE Score} = \frac{\text{Reach (\%)} \times \text{Impact (1-5x)} \times \text{Confidence (\%)}}{\text{Effort (person-weeks)} \times 100}$$

### 3. 📑 Living Mini-PRDs with Gherkin Acceptance Criteria
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

### 6. 🌐 Wildcard Subdomain Multi-Tenancy
Edge middleware seamlessly resolves `[tenant].aroadmap.dev` in `<10ms`, loading isolated tenant branding, theme colors, logos, and connected GitHub repositories.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph EdgeRouting ["1. Wildcard DNS & Subdomain Resolver"]
        DNS["Wildcard DNS: *.aroadmap.dev"]
        MW["Next.js 15 Edge Middleware (middleware.ts)"]
        DNS -->|Host: rfqengine.aroadmap.dev| MW
        MW -->|Extract Tenant: 'rfqengine'| TenantResolver["Tenant Context Resolver"]
    end

    subgraph CorePlatform ["2. aroadmap.dev Platform Engine"]
        TenantResolver --> TenantConfig["Load Custom Brand Color, Logo & GitHub Repo"]
        TenantResolver --> DB[(PostgreSQL Store / Drizzle ORM)]
    end

    subgraph UserExperience ["3. Multi-Persona Experience"]
        TenantConfig --> PublicView["🌐 Public View<br/>• Upvoting & Feature Intake<br/>• RICE Matrix & Themes<br/>• Living Gherkin Specs"]
        TenantConfig --> AdminStudio["🔒 Team / Admin Studio<br/>• Drag-and-drop Kanban<br/>• AI PRD Drafter<br/>• 1-Click Approve -> Autonomous Dev Dispatch"]
    end

    subgraph Integrations ["4. Developer & Agent Integrations"]
        AdminStudio <--> MCP["🔌 Universal MCP Server (/api/mcp)<br/>(Antigravity / Cursor / Claude Code)"]
        AdminStudio <--> GH["🐙 Bi-directional GitHub Sync<br/>(Auto Branch, PR, Merge -> Shipped)"]
    end
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript 5.5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Glassmorphism Theme |
| **Icons & Motion** | [Lucide React](https://lucide.dev/) + [Framer Motion](https://www.framer.com/motion/) |
| **Database & ORM** | [Neon Serverless PostgreSQL](https://neon.tech/) + [Drizzle ORM](https://orm.drizzle.team/) |
| **Protocol** | [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) JSON-RPC 2.0 & SSE |

---

## 📦 Project Structure

```
aroadmap/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                     # Landing page, demo & tenant onboarding
│   ├── (tenant)/
│   │   └── [tenant]/
│   │       ├── page.tsx                 # Main Roadmap Hub (Kanban, RICE, Themes)
│   │       ├── changelog/
│   │       │   └── page.tsx             # Public Changelog feed
│   │       └── layout.tsx               # Injects dynamic tenant branding & theme
│   ├── api/
│   │   ├── tenants/
│   │   │   └── [tenant]/
│   │   │       ├── route.ts             # Tenant metadata & configuration
│   │   │       ├── initiatives/
│   │   │       │   ├── route.ts         # GET list & POST create initiative
│   │   │       │   └── [id]/
│   │   │       │       ├── route.ts     # GET & PATCH initiative specs / stage
│   │   │       │       └── upvote/
│   │   │       │           └── route.ts # Atomic upvote handler
│   │   │       └── reset/
│   │   │           └── route.ts         # Restore default catalog
│   │   ├── mcp/
│   │   │   └── route.ts                 # Universal Multi-Tenant MCP Protocol Handler
│   │   └── webhooks/
│   │       └── github/
│   │           └── route.ts             # GitHub Sync (PR Merge -> Shipped)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx                       # Tenant navigation, view switcher, search & filters
│   ├── KanbanBoard.tsx                  # 5-stage drag-and-drop board
│   ├── KanbanCard.tsx                   # Interactive card with RICE badge & upvote button
│   ├── RICEMatrix.tsx                   # Ranked ROI table with live formula breakdown
│   ├── ThemesView.tsx                   # Strategic pillar groupings
│   ├── PRDDrawer.tsx                    # Slide-over living PRD drawer with Gherkin criteria
│   └── OpportunityModal.tsx             # Continuous discovery intake form (Teresa Torres OST)
├── lib/
│   ├── db/
│   │   ├── schema.ts                    # Drizzle ORM schema (tenants, initiatives)
│   │   ├── index.ts                     # Database connection & in-memory cache repository
│   │   └── seed-data.ts                 # Preloaded initiatives for Tenant #1 (RFPEngine)
│   ├── types.ts                         # Type definitions (RoadmapStage, Initiative, RICE)
│   └── mcp-server.ts                    # Model Context Protocol handler
├── middleware.ts                        # Subdomain routing (rfqengine.aroadmap.dev -> /[tenant])
├── package.json
└── tsconfig.json
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

# Database (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/aroadmap?sslmode=require

# GitHub Token (for autonomous agent fleet dispatching)
GITHUB_TOKEN=ghp_your_token_here
```

### 3. Run Development Server
```bash
npm run dev
```

Open your browser:
* **Marketing & Tenant Creator**: [http://localhost:3000](http://localhost:3000)
* **RFPEngine Roadmap (Tenant #1)**: [http://localhost:3000/?tenant=rfqengine](http://localhost:3000/?tenant=rfqengine) (or `http://rfqengine.localhost:3000`)
* **Agentic Fleet Roadmap (Tenant #2)**: [http://localhost:3000/?tenant=fleet](http://localhost:3000/?tenant=fleet)

---

## 🔌 Model Context Protocol (MCP) Integration

`aroadmap.dev` natively exposes an MCP endpoint at `/api/mcp` for AI coding assistants (Antigravity, Cursor, Claude Code).

### Add to your MCP Config (`~/.gemini/config/mcp_config.json` or Cursor Settings):
```json
{
  "mcpServers": {
    "aroadmap": {
      "url": "https://api.aroadmap.dev/api/mcp",
      "headers": {
        "X-Tenant-ID": "rfqengine"
      }
    }
  }
}
```

### Registered MCP Tools:
1. **`manage_roadmap`**: Query, filter, and inspect initiatives and Gherkin criteria across any tenant.
2. **`trigger_pm_initiative`**: Ingest natural language user stories into the Discovery backlog.
3. **`approve_and_start_development`**: Human sign-off gate that advances specs to Development and triggers agent code generation.
4. **`get_cloud_diagnostics`**: Real-time database latency and tenant health checks.

---

## 🚀 Production Deployment

### Deploy on Vercel
1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. In **Domains**, add:
   - `aroadmap.dev`
   - `*.aroadmap.dev` (Wildcard Domain)
4. Add your `DATABASE_URL` and `GITHUB_TOKEN` environment variables.
5. Deploy! Wildcard subdomains will resolve instantly.

---

## 📄 License

MIT © [Dipesh Singh](https://github.com/dipeshsingh2012)
