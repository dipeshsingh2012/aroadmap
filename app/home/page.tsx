"use client";

import React, { useState } from "react";
import { OnboardingModal } from "@/components/OnboardingModal";
import {
  Layers,
  Sparkles,
  ArrowRight,
  Rocket,
  Globe,
  ExternalLink,
  Plus,
  CheckCircle2,
} from "lucide-react";

export default function PlatformHomePage() {
  const [slugInput, setSlugInput] = useState("");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState("");

  const handleStartOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSlug(slugInput.toLowerCase().trim().replace(/[^a-z0-9-]/g, ""));
    setIsOnboardingOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      {/* Interactive Onboarding Modal */}
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
              Multi-Tenant Architecture
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a
              href="/?tenant=rfqengine"
              className="text-slate-600 hover:text-blue-600 transition-colors hidden sm:inline-flex items-center gap-1"
            >
              rfqengine.aroadmap.dev <ExternalLink size={11} />
            </a>
            <button
              onClick={() => {
                setActiveSlug("");
                setIsOnboardingOpen(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Plus size={13} /> Create Board
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <Sparkles size={13} className="text-blue-600" />
          Multi-Tenant Product Discovery & Autonomous SDLC
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Your Product Roadmap <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            On Its Own Dedicated Subdomain
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Every project gets an isolated subdomain (e.g. <code>rfqengine.aroadmap.dev</code>) with custom branding, public customer upvoting, living PRDs, and autonomous agent fleets.
        </p>

        {/* 1-Click Subdomain Form */}
        <form onSubmit={handleStartOnboarding} className="max-w-md mx-auto pt-4 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="your-project-slug"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
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
            Claim Subdomain
          </button>
        </form>

        {/* Subdomain Preview Pills */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500 flex-wrap">
          <span>Live Tenants:</span>
          <a
            href="/?tenant=rfqengine"
            className="font-mono text-blue-600 hover:underline bg-slate-100 px-2.5 py-1 rounded-md"
          >
            rfqengine.aroadmap.dev
          </a>
          <a
            href="/?tenant=fleet"
            className="font-mono text-violet-600 hover:underline bg-slate-100 px-2.5 py-1 rounded-md"
          >
            fleet.aroadmap.dev
          </a>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Globe size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">True Tenant Architecture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No messy <code>/tenant/slug</code> URL routes. The tenant root is <code>yourbrand.aroadmap.dev/</code> with full data isolation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Living PRD & Gherkin Specs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Each initiative renders full agile user stories, acceptance criteria in Gherkin syntax, and RICE scoring sliders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Rocket size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Autonomous SDLC Gate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              1-Click Human Sign-off dispatches the autonomous agent fleet to create the branch, implement files, run tests, and open the GitHub PR.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
