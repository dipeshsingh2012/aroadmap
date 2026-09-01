"use client";

import React, { useState } from "react";
import { X, Lightbulb, Plus, Sparkles, Loader2, Wand2 } from "lucide-react";
import { StrategicTheme, STRATEGIC_THEMES, RoadmapInitiative } from "@/lib/types";

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RoadmapInitiative>) => void;
}

const DISCOVERY_STARTERS = [
  "Spreadsheet Column Ingestion",
  "Hybrid Vector + BM25 RAG",
  "Real-Time Multiplayer Reviews",
  "Autonomous Agent SDLC Dispatch",
  "Salesforce & HubSpot CRM Sync",
  "Enterprise SSO & SAML Auth",
];

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [persona, setPersona] = useState("Proposal Manager");
  const [theme, setTheme] = useState<StrategicTheme>("Smart Ingestion");
  const [situation, setSituation] = useState("");
  const [workaround, setWorkaround] = useState("");
  const [outcome, setOutcome] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAiSuggest = async (overrideSeed?: string) => {
    const seed = overrideSeed || title || situation;
    if (!seed.trim()) {
      setAiNotice("⚠️ Please type an opportunity title or topic first.");
      setTimeout(() => setAiNotice(null), 3000);
      return;
    }

    setIsGenerating(true);
    setAiNotice(null);

    try {
      const res = await fetch("/api/ai/suggest-opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: seed,
          persona,
          theme,
          situation,
          workaround,
          outcome,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch AI suggestions");
      }

      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.persona) setPersona(data.persona);
      if (data.theme && STRATEGIC_THEMES.includes(data.theme as StrategicTheme)) {
        setTheme(data.theme as StrategicTheme);
      }
      if (data.situation) setSituation(data.situation);
      if (data.workaround) setWorkaround(data.workaround);
      if (data.outcome) setOutcome(data.outcome);
      if (data.hypothesis) setHypothesis(data.hypothesis);

      setAiNotice("✨ Continuous discovery framing generated! Review and tweak below.");
      setTimeout(() => setAiNotice(null), 4000);
    } catch (err: any) {
      console.error("AI Auto-complete error:", err);
      setAiNotice("⚠️ AI suggestion temporarily unavailable. You can still fill fields manually.");
      setTimeout(() => setAiNotice(null), 3500);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !situation.trim()) return;

    const fullProblem = `Context & Trigger: ${situation.trim()}\n\nCurrent Workaround: ${workaround.trim() || "Manual copy-pasting across departments."}`;
    const userStory = `As a ${persona}, when ${situation.trim()}, I want ${hypothesis.trim() || title.trim()}, so that ${outcome.trim() || "our proposal turnaround time is reduced with zero errors"}.`;

    const newInit: Partial<RoadmapInitiative> = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      stage: "discovery",
      theme,
      priority: "P1 - High",
      target_persona: persona,
      quarter: "In Discovery",
      summary: situation.trim().slice(0, 130) + "...",
      problem_statement: fullProblem,
      user_story: userStory,
      success_metrics: [
        outcome.trim() || "Reduce workflow turnaround time by > 50%",
        `Adopted by > 75% of active ${persona} users`,
        "Zero unverified hallucinations or compliance errors",
      ],
      acceptance_criteria: [
        `Given a ${persona} user encountering: "${situation.trim().slice(0, 80)}...",`,
        `When they utilize: "${(hypothesis.trim() || title.trim()).slice(0, 80)}",`,
        `Then they achieve: "${(outcome.trim() || "streamlined delivery").slice(0, 80)}" without manual workarounds.`,
      ],
      technical_architecture: hypothesis.trim()
        ? `Hypothesis: ${hypothesis.trim()}`
        : "To be determined during technical refinement spike with engineering leads.",
      rice: { reach: 70, impact: 3, confidence: 75, effort: 3, score: 52.5 },
      upvotes: 1,
      tags: ["Continuous Discovery", "Opportunity", "JTBD", "Community Backlog"],
    };

    onSubmit(newInit);
    setTitle("");
    setSituation("");
    setWorkaround("");
    setOutcome("");
    setHypothesis("");
    setAiNotice(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-xs text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb size={18} className="text-blue-600" /> Frame Customer Opportunity
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Continuous Discovery Framework (Teresa Torres OST + Jobs-to-be-Done)
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* AI Discovery Banner & Quick Starters */}
        <div className="p-3 bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-950 text-[11px] flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-600 animate-pulse" />
              AI Continuous Discovery Assistant
            </span>
            <span className="text-[10px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">
              OST + JTBD
            </span>
          </div>
          <p className="text-blue-900 text-[11px] leading-relaxed">
            Type an initial title or click a starter topic below, then click <strong>✨ AI Auto-Complete</strong> to automatically frame the situation, workaround, outcome metric, and solution hypothesis.
          </p>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-slate-500 font-medium mr-1">Inspirations:</span>
            {DISCOVERY_STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => {
                  setTitle(starter);
                  handleAiSuggest(starter);
                }}
                disabled={isGenerating}
                className="text-[10px] px-2 py-0.5 bg-white hover:bg-blue-100/60 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-md transition-all cursor-pointer shadow-2xs font-medium disabled:opacity-50"
              >
                + {starter}
              </button>
            ))}
          </div>
        </div>

        {aiNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium flex items-center justify-between animate-fadeIn">
            <span>{aiNotice}</span>
            <button
              onClick={() => setAiNotice(null)}
              className="text-emerald-600 hover:text-emerald-800 text-[10px] font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                1. Opportunity / Problem Title:
              </label>
              <button
                type="button"
                onClick={() => handleAiSuggest()}
                disabled={isGenerating || (!title.trim() && !situation.trim())}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-md text-[11px] font-semibold transition-all shadow-2xs cursor-pointer disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Framing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={12} />
                    <span>AI Auto-Complete</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Automated Spreadsheet Column Mapping for 300-Row Questionnaires"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target User Persona:</label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Proposal Manager">Proposal Manager</option>
                <option value="Security SME">Security SME</option>
                <option value="Legal Counsel">Legal Counsel</option>
                <option value="Head of Sales">Head of Sales / RevOps</option>
                <option value="Bid Team">Bid Team</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="IT Administrator">IT Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Strategic Pillar:</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as StrategicTheme)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STRATEGIC_THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">2. Situation & Trigger (When...):</label>
            <textarea
              required
              rows={2}
              placeholder="When in the workflow does this pain happen? (e.g. When a buyer provides a multi-tab Excel spreadsheet with custom merged headers...)"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">3. Current Workaround:</label>
            <textarea
              rows={2}
              placeholder="e.g. Today, our bid team manually copies 300 questions one-by-one into Google Docs, emails 4 engineers..."
              value={workaround}
              onChange={(e) => setWorkaround(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">4. Desired Outcome & KPI:</label>
            <input
              type="text"
              placeholder="e.g. Reduce questionnaire completion time from 3 days to < 2 hours with 0 errors"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">5. Proposed Solution Hypothesis:</label>
            <textarea
              rows={2}
              placeholder="e.g. A client-side WebAssembly parser with column heuristics and 1-click in-place export..."
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={14} /> Frame Opportunity in Backlog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
