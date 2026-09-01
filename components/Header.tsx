"use client";

import React from "react";
import {
  Layers,
  BarChart3,
  Search,
  Filter,
  Plus,
  RotateCcw,
  Sparkles,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { StrategicTheme, STRATEGIC_THEMES, Tenant } from "@/lib/types";

export type ViewMode = "kanban" | "rice" | "themes" | "changelog";

interface HeaderProps {
  tenant: Tenant;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  themeFilter: string;
  setThemeFilter: (t: string) => void;
  personaFilter: string;
  setPersonaFilter: (p: string) => void;
  onOpenOpportunityModal: () => void;
  onResetDefaults: () => void;
  totalInitiatives: number;
}

export const Header: React.FC<HeaderProps> = ({
  tenant,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  themeFilter,
  setThemeFilter,
  personaFilter,
  setPersonaFilter,
  onOpenOpportunityModal,
  onResetDefaults,
  totalInitiatives,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
            style={{ backgroundColor: tenant.brand_color || "#2563EB" }}
          >
            {tenant.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">{tenant.name}</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Strategy
              </span>
              {tenant.github_repo && (
                <a
                  href={`https://github.com/${tenant.github_repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 ml-1"
                >
                  GitHub <ExternalLink size={11} />
                </a>
              )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{tenant.tagline || "Product Strategy & Autonomous SDLC Hub"}</p>
          </div>
        </div>

        {/* View Switchers & Action Button */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-between md:justify-end">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-medium">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-blue-600 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers size={13} /> Kanban Board
            </button>
            <button
              onClick={() => setViewMode("rice")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === "rice"
                  ? "bg-white text-blue-600 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 size={13} /> RICE Matrix
            </button>
            <button
              onClick={() => setViewMode("themes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === "themes"
                  ? "bg-white text-blue-600 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles size={13} /> Themes
            </button>
            <button
              onClick={() => setViewMode("changelog")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === "changelog"
                  ? "bg-white text-blue-600 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen size={13} /> Changelog
            </button>
          </div>

          <button
            onClick={onOpenOpportunityModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus size={14} /> Frame Opportunity
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search initiatives, user stories, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-1 text-slate-500">
              <Filter size={12} />
              <span>Theme:</span>
            </div>
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            >
              <option value="all">All Strategic Themes</option>
              {STRATEGIC_THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={personaFilter}
              onChange={(e) => setPersonaFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            >
              <option value="all">All Personas</option>
              <option value="Proposal Manager">Proposal Manager</option>
              <option value="Security">Security SME</option>
              <option value="Legal">Legal Counsel</option>
              <option value="Sales">Sales & RevOps</option>
            </select>

            <button
              onClick={onResetDefaults}
              title="Reset to default seed backlog"
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-200 transition-colors ml-auto"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
