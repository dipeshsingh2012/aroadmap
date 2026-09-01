"use client";

import React, { useState, useEffect } from "react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Tenant, computeRICEScore } from "@/lib/types";
import { getTenantUrl } from "@/lib/utils";
import {
  Layers,
  Sparkles,
  ArrowRight,
  Rocket,
  Globe,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Calculator,
  Terminal,
  Shield,
  Cpu,
  ChevronRight,
  Flame,
} from "lucide-react";

export default function PlatformHomePage() {
  const [slugInput, setSlugInput] = useState("");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState("");

  // Live Tenants from Neon PostgreSQL
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);

  // Live Availability Check
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Interactive RICE Calculator State
  const [reach, setReach] = useState(85);
  const [impact, setImpact] = useState(4);
  const [confidence, setConfidence] = useState(90);
  const [effort, setEffort] = useState(3);

  // MCP Snippet Tab
  const [activeMcpTab, setActiveMcpTab] = useState<"antigravity" | "cursor" | "claude">("antigravity");
  const [copiedMcp, setCopiedMcp] = useState(false);

  // Calculate live RICE score
  const calculatedRice = computeRICEScore({ reach, impact, confidence, effort });

  // Fetch live tenants from Neon PostgreSQL
  useEffect(() => {
    async function loadTenants() {
      try {
        const res = await fetch("/api/tenants");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTenants(data);
          }
        }
      } catch (err) {
        console.error("Failed to load tenants:", err);
      } finally {
        setIsLoadingTenants(false);
      }
    }
    loadTenants();
  }, []);

  // Live Subdomain Availability Check with debounce
  useEffect(() => {
    const cleanSlug = slugInput.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (!cleanSlug || cleanSlug.length < 3) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await fetch(`/api/tenants/check-subdomain?slug=${encodeURIComponent(cleanSlug)}`);
        const data = await res.json();
        setIsAvailable(data.available);
      } catch (err) {
        setIsAvailable(true);
      } finally {
        setIsChecking(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [slugInput]);

  const handleStartOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = slugInput.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    setActiveSlug(clean);
    setIsOnboardingOpen(true);
  };

  const copyMcpConfig = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  const mcpConfigs = {
    antigravity: JSON.stringify(
      {
        mcpServers: {
          aroadmap: {
            url: "https://aroadmap.dev/api/mcp",
            headers: { "X-Tenant-ID": "rfpengine" },
          },
        },
      },
      null,
      2
    ),
    cursor: JSON.stringify(
      {
        mcpServers: {
          "aroadmap-hub": {
            type: "sse",
            url: "https://aroadmap.dev/api/mcp",
          },
        },
      },
      null,
      2
    ),
    claude: `claude mcp add aroadmap https://aroadmap.dev/api/mcp --header "X-Tenant-ID: rfpengine"`,
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      {/* Interactive 4-Step Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialSlug={activeSlug}
      />

      {/* Navigation */}
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              AR
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">aroadmap.dev</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Live DB v1.0
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a
              href={getTenantUrl("rfpengine")}
              className="text-slate-600 hover:text-blue-600 transition-colors hidden sm:inline-flex items-center gap-1"
            >
              Demo: RFPEngine <ExternalLink size={11} />
            </a>
            <button
              onClick={() => {
                setActiveSlug("");
                setIsOnboardingOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all inline-flex items-center gap-1.5 font-bold"
            >
              <Plus size={14} /> Create Board
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Live Subdomain Claiming */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <Sparkles size={13} className="text-blue-600" />
          The Multi-Tenant Product Strategy & Autonomous SDLC Hub
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Your Product Roadmap <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            On Its Own Dedicated Subdomain
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Continuous Product Discovery (Teresa Torres OST), RICE Prioritization Matrix, Living Gherkin PRDs, and 1-Click Autonomous Agent Fleet Dispatch.
        </p>

        {/* Live Subdomain Search & Claim Form */}
        <div className="max-w-md mx-auto pt-2 space-y-2">
          <form onSubmit={handleStartOnboarding} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="your-project-slug"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                className="w-full pl-3.5 pr-28 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono pointer-events-none">
                .aroadmap.dev
              </span>
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all shrink-0"
            >
              Claim Subdomain
            </button>
          </form>

          {/* Live Availability Feedback Banner */}
          {slugInput.length >= 3 && (
            <div className="text-left text-xs px-2 flex items-center gap-1.5">
              {isChecking && <span className="text-slate-400 animate-pulse">Checking availability...</span>}
              {!isChecking && isAvailable === true && (
                <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 size={13} /> {getTenantUrl(slugInput.toLowerCase().trim())} is available!
                </span>
              )}
              {!isChecking && isAvailable === false && (
                <span className="text-red-500 font-semibold inline-flex items-center gap-1">
                  <AlertCircle size={13} /> Subdomain is unavailable or reserved
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Live Neon PostgreSQL Tenant Directory */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-blue-600" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Roadmap Tenants</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live in PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore live customer strategy hubs and vote on upcoming features
              </p>
            </div>

            <button
              onClick={() => {
                setActiveSlug("");
                setIsOnboardingOpen(true);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              + Register Your Tenant <ArrowRight size={13} />
            </button>
          </div>

          {isLoadingTenants ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60" />
              ))}
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              No tenants found. Click "Create Board" to register the first one!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tenants.map((t) => (
                <a
                  key={t.id}
                  href={getTenantUrl(t.subdomain)}
                  className="group p-5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs"
                          style={{ backgroundColor: t.brand_color || "#2563EB" }}
                        >
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {t.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400">
                            {t.subdomain}.aroadmap.dev
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {t.visibility === "private" ? "🔒 Team" : "🌐 Public"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {t.tagline || "Continuous discovery and living PRD hub."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                    <span className="inline-flex items-center gap-1 group-hover:underline">
                      Open Board <ChevronRight size={13} />
                    </span>
                    {t.github_repo && (
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        {t.github_repo}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive RICE Calculator Simulator */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Calculator size={13} /> Interactive Prioritization Sandbox
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Test the RICE Score Formula in Real Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              See how Reach, Impact, Confidence, and Effort dynamically compute ROI score for any feature initiative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Reach (Audience %):</span>
                  <span className="text-blue-600">{reach}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={reach}
                  onChange={(e) => setReach(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Impact (Multiplier):</span>
                  <span className="text-indigo-600">{impact}x Multiplier</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={impact}
                  onChange={(e) => setImpact(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Confidence (%):</span>
                  <span className="text-violet-600">{confidence}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Effort (Person-Weeks):</span>
                  <span className="text-rose-600">{effort} Weeks</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>

            {/* Live Result Score Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center space-y-4 shadow-xl">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Calculated RICE Priority Score
              </span>
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-blue-400">
                {calculatedRice}
              </div>

              <div className="p-3 bg-white/10 rounded-xl text-xs font-mono text-slate-300">
                ({reach}% × {impact}x × {confidence}%) ÷ ({effort}w × 100)
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    calculatedRice > 80
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : calculatedRice > 40
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                  }`}
                >
                  {calculatedRice > 80 ? "🔥 P0 - High Priority ROI" : calculatedRice > 40 ? "⚡ P1 - Medium Priority" : "⏳ P2 - Low Priority"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Hub & Model Context Protocol (MCP) Integration */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-violet-600" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Universal MCP Server for AI Coding Agents
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Connect Antigravity, Cursor, and Claude Code to read, draft, and approve specs directly via MCP.
              </p>
            </div>

            {/* Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveMcpTab("antigravity")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeMcpTab === "antigravity" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Antigravity
              </button>
              <button
                onClick={() => setActiveMcpTab("cursor")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeMcpTab === "cursor" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Cursor
              </button>
              <button
                onClick={() => setActiveMcpTab("claude")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeMcpTab === "claude" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Claude CLI
              </button>
            </div>
          </div>

          {/* Code Block */}
          <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-lg border border-slate-800">
            <button
              onClick={() => copyMcpConfig(mcpConfigs[activeMcpTab])}
              className="absolute right-4 top-4 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans font-semibold flex items-center gap-1 transition-colors"
            >
              {copiedMcp ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedMcp ? "Copied!" : "Copy"}</span>
            </button>
            <pre className="pt-2">{mcpConfigs[activeMcpTab]}</pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200/80 text-center text-xs text-slate-500 space-y-2">
        <p>© 2026 aroadmap.dev · The Multi-Tenant Product Strategy & Autonomous SDLC Hub</p>
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600">
          <a href={getTenantUrl("rfpengine")} className="hover:text-blue-600">RFPEngine Roadmap</a>
          <a href="/new" className="hover:text-blue-600">Onboard Tenant</a>
          <a href="https://github.com/dipeshsingh2012/aroadmap" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
