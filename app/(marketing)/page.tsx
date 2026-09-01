"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Zap,
  Globe,
  Plus,
  Terminal,
} from "lucide-react";

export default function MarketingPage() {
  const [newSubdomain, setNewSubdomain] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubdomain.trim()) {
      window.location.href = `/tenant/${newSubdomain.toLowerCase().trim()}`;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              AR
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">aroadmap.dev</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              v1.0
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/tenant/rfqengine"
              className="text-slate-600 hover:text-blue-600 transition-colors hidden sm:inline"
            >
              Explore RFPEngine Roadmap
            </Link>
            <Link
              href="/tenant/rfqengine"
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              Launch Demo →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <Sparkles size={13} className="text-blue-600" />
          The AI-Native Product Discovery & Autonomous SDLC Hub
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          From Customer Opportunity <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            to Merged Pull Request in Minutes
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The all-in-one platform combining <strong>Teresa Torres’ Continuous Discovery</strong>, <strong>RICE Matrix Prioritization</strong>, and <strong>Autonomous AI Agent Fleets</strong> directly on your own custom subdomain.
        </p>

        {/* 1-Click Subdomain Form */}
        <form onSubmit={handleCreate} className="max-w-md mx-auto pt-4 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="your-project-slug"
              value={newSubdomain}
              onChange={(e) => setNewSubdomain(e.target.value)}
              className="w-full pl-3 pr-28 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            />
            <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-mono pointer-events-none">
              .aroadmap.dev
            </span>
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all shrink-0"
          >
            Create Board
          </button>
        </form>

        {/* Subdomain Preview Pills */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500 flex-wrap">
          <span>Live Examples:</span>
          <Link
            href="/tenant/rfqengine"
            className="font-mono text-blue-600 hover:underline bg-slate-100 px-2.5 py-1 rounded-md"
          >
            rfqengine.aroadmap.dev
          </Link>
          <Link
            href="/tenant/fleet"
            className="font-mono text-violet-600 hover:underline bg-slate-100 px-2.5 py-1 rounded-md"
          >
            fleet.aroadmap.dev
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">5-Stage Continuous Discovery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track initiatives across Discovery, Spec & Design, Active Development, Beta Testing, and Shipped with interactive drag-and-drop.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Living PRD & Gherkin Generator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every initiative generates a complete mini-PRD with agile user stories, acceptance criteria in Gherkin format, and RICE scoring.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Rocket size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Autonomous Agent SDLC Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              One-click human sign-off triggers autonomous cloud agents to cut the branch, write verified code, run tests, and open the Pull Request.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
