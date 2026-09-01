"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import { Header, ViewMode } from "@/components/Header";
import { KanbanBoard } from "@/components/KanbanBoard";
import { RICEMatrix } from "@/components/RICEMatrix";
import { ThemesView } from "@/components/ThemesView";
import { PRDDrawer } from "@/components/PRDDrawer";
import { OpportunityModal } from "@/components/OpportunityModal";
import { RoadmapInitiative, RoadmapStage, Tenant } from "@/lib/types";
import { Plus, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";

export default function TenantDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = use(params);
  const tenantId = resolvedParams.domain.toLowerCase().trim();

  const [tenant, setTenant] = useState<Tenant>({
    id: tenantId,
    name: tenantId.toUpperCase(),
    subdomain: tenantId,
    tagline: "Live Product Strategy & Continuous Discovery Hub",
    brand_color: "#2563EB",
    visibility: "public",
  });

  const [initiatives, setInitiatives] = useState<RoadmapInitiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [selectedInitiative, setSelectedInitiative] = useState<RoadmapInitiative | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [themeFilter, setThemeFilter] = useState("all");
  const [personaFilter, setPersonaFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch live tenant and initiatives from Neon PostgreSQL
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [tenantRes, initRes] = await Promise.all([
          fetch(`/api/tenants/${tenantId}`),
          fetch(`/api/tenants/${tenantId}/initiatives`),
        ]);

        if (tenantRes.ok) {
          const t = await tenantRes.json();
          if (t && t.id) {
            setTenant(t);
          }
        }

        if (initRes.ok) {
          const inits = await initRes.json();
          if (Array.isArray(inits)) {
            setInitiatives(inits);
          }
        }
      } catch (err) {
        console.error("Error loading roadmap data from PostgreSQL:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [tenantId]);

  // Stage transition handler (Optimistic + DB sync)
  const handleMoveStage = async (id: string, stage: RoadmapStage) => {
    const targetItem = initiatives.find((i) => i.id === id);
    if (!targetItem || targetItem.stage === stage) return;

    const quarter = stage === "shipped" ? "Shipped" : targetItem.quarter === "Shipped" ? "In Backlog" : targetItem.quarter;

    setInitiatives((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stage, quarter } : i))
    );

    showToast(`Moved "${targetItem.title}" to ${stage.toUpperCase()}`);

    try {
      await fetch(`/api/tenants/${tenantId}/initiatives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, quarter }),
      });
    } catch (err) {
      console.warn("Failed to persist stage change:", err);
    }
  };

  // Upvote Handler (Optimistic + DB sync)
  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isUpvoted = upvotedIds.has(id);
    const delta = isUpvoted ? -1 : 1;
    const nextSet = new Set(upvotedIds);

    if (isUpvoted) {
      nextSet.delete(id);
      showToast("Upvote removed");
    } else {
      nextSet.add(id);
      showToast("👍 Feature request upvoted!");
    }
    setUpvotedIds(nextSet);

    setInitiatives((prev) =>
      prev.map((i) => (i.id === id ? { ...i, upvotes: Math.max(0, i.upvotes + delta) } : i))
    );

    try {
      await fetch(`/api/tenants/${tenantId}/initiatives/${id}/upvote?delta=${delta}`, {
        method: "POST",
      });
    } catch (err) {
      console.warn("Failed to persist upvote:", err);
    }
  };

  // Create Opportunity Handler
  const handleCreateOpportunity = async (data: Partial<RoadmapInitiative>) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/initiatives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const created = await res.json();
        setInitiatives((prev) => [created, ...prev]);
        setUpvotedIds((prev) => new Set([...prev, created.id]));
        setSelectedInitiative(created);
        showToast("🎉 Customer Opportunity captured in Backlog!");
      }
    } catch (err) {
      console.warn("Failed to create opportunity:", err);
    }
  };

  // Reset to default seed
  const handleResetDefaults = async () => {
    if (window.confirm("Reload roadmap initiatives from database?")) {
      try {
        const res = await fetch(`/api/tenants/${tenantId}/initiatives`);
        if (res.ok) {
          const items = await res.json();
          setInitiatives(items);
        }
        showToast("🔄 Roadmap reloaded from PostgreSQL.");
      } catch (err) {
        console.warn("Failed to reload backlog:", err);
      }
    }
  };

  // Filtered Initiatives
  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((item) => {
      const matchTheme = themeFilter === "all" || item.theme === themeFilter;
      const matchPersona = personaFilter === "all" || item.target_persona.includes(personaFilter);
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTheme && matchPersona && matchSearch;
    });
  }, [initiatives, themeFilter, personaFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <Header
        tenant={tenant}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        themeFilter={themeFilter}
        setThemeFilter={setThemeFilter}
        personaFilter={personaFilter}
        setPersonaFilter={setPersonaFilter}
        onOpenOpportunityModal={() => setIsOpportunityModalOpen(true)}
        onResetDefaults={handleResetDefaults}
        totalInitiatives={initiatives.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 text-xs font-medium space-y-2 flex-col">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading live roadmap from database...</span>
          </div>
        ) : initiatives.length === 0 ? (
          <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold">
              <Sparkles size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">No Initiatives Yet</h3>
              <p className="text-xs text-slate-500">
                Start continuous discovery by capturing your first customer opportunity.
              </p>
            </div>
            <button
              onClick={() => setIsOpportunityModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Frame First Opportunity
            </button>
          </div>
        ) : (
          <>
            {viewMode === "kanban" && (
              <KanbanBoard
                initiatives={filteredInitiatives}
                upvotedIds={upvotedIds}
                onUpvote={handleUpvote}
                onSelectInitiative={(item) => setSelectedInitiative(item)}
                onMoveStage={handleMoveStage}
              />
            )}

            {viewMode === "rice" && (
              <RICEMatrix
                initiatives={filteredInitiatives}
                upvotedIds={upvotedIds}
                onUpvote={handleUpvote}
                onSelectInitiative={(item) => setSelectedInitiative(item)}
              />
            )}

            {viewMode === "themes" && (
              <ThemesView
                initiatives={filteredInitiatives}
                upvotedIds={upvotedIds}
                onUpvote={handleUpvote}
                onSelectInitiative={(item) => setSelectedInitiative(item)}
              />
            )}

            {viewMode === "changelog" && (
              <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Public Changelog & Release History</h2>
                  <p className="text-xs text-slate-500 mt-1">Verified features shipped live to production</p>
                </div>
                <div className="space-y-4">
                  {initiatives
                    .filter((i) => i.stage === "shipped")
                    .map((item) => (
                      <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🚀 Shipped & Live
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{item.quarter}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        <p className="text-xs text-slate-600">{item.summary || item.problem_statement}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Living PRD Slide-over Drawer */}
      {selectedInitiative && (
        <PRDDrawer
          initiative={selectedInitiative}
          onClose={() => setSelectedInitiative(null)}
          isUpvoted={upvotedIds.has(selectedInitiative.id)}
          onUpvote={handleUpvote}
          onMoveStage={handleMoveStage}
        />
      )}

      {/* Opportunity Framing Intake Modal */}
      <OpportunityModal
        isOpen={isOpportunityModalOpen}
        onClose={() => setIsOpportunityModalOpen(false)}
        onSubmit={handleCreateOpportunity}
      />
    </div>
  );
}
