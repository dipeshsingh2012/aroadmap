"use client";

import React, { useState } from "react";
import {
  X,
  ThumbsUp,
  User,
  CheckCircle2,
  Tag,
  ArrowRight,
  Sparkles,
  Rocket,
  ShieldCheck,
  Check,
} from "lucide-react";
import { RoadmapInitiative, STAGE_CONFIG, RoadmapStage } from "@/lib/types";

interface PRDDrawerProps {
  initiative: RoadmapInitiative | null;
  onClose: () => void;
  isUpvoted: boolean;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onApproveAndStartDev?: (id: string) => Promise<void>;
  onMoveStage: (id: string, stage: RoadmapStage) => void;
}

export const PRDDrawer: React.FC<PRDDrawerProps> = ({
  initiative,
  onClose,
  isUpvoted,
  onUpvote,
  onApproveAndStartDev,
  onMoveStage,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  if (!initiative) return null;

  const cfg = STAGE_CONFIG[initiative.stage];

  const handleApprove = async () => {
    if (onApproveAndStartDev) {
      setIsApproving(true);
      try {
        await onApproveAndStartDev(initiative.id);
        setApprovedSuccess(true);
        onMoveStage(initiative.id, "development");
      } catch (err) {
        console.error(err);
      } finally {
        setIsApproving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                >
                  {cfg.icon} {cfg.label}
                </span>
                <span className="text-xs font-semibold text-slate-500">{initiative.theme}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{initiative.priority}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{initiative.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
            {/* RICE Score Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-lg p-2.5 text-center min-w-[60px]">
                  <span className="block text-[9px] uppercase font-bold tracking-wider opacity-80">RICE</span>
                  <span className="text-base font-black">{initiative.rice.score.toFixed(1)}</span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">Reach</span>
                    <strong className="text-slate-800 font-bold">{initiative.rice.reach}%</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">Impact</span>
                    <strong className="text-slate-800 font-bold">{initiative.rice.impact}x</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">Conf.</span>
                    <strong className="text-slate-800 font-bold">{initiative.rice.confidence}%</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">Effort</span>
                    <strong className="text-slate-800 font-bold">{initiative.rice.effort}w</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => onUpvote(initiative.id, e)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isUpvoted
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                }`}
              >
                <ThumbsUp size={13} className={isUpvoted ? "fill-white" : ""} />
                <span>{initiative.upvotes} Upvotes</span>
              </button>
            </div>

            {/* Human Sign-Off Gate & Autonomous Dev Dispatch Button */}
            {initiative.stage === "spec" && (
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-violet-900 text-xs flex items-center gap-1.5">
                    <Sparkles size={14} className="text-violet-600" />
                    Human Sign-off & Autonomous Fleet Gate
                  </h4>
                  <p className="text-[11px] text-violet-700 mt-0.5">
                    Approves this PRD and dispatches the autonomous dev-agent to cut branch and open PR.
                  </p>
                </div>
                <button
                  disabled={isApproving || approvedSuccess}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                >
                  {approvedSuccess ? (
                    <>
                      <Check size={14} /> Dispatched!
                    </>
                  ) : isApproving ? (
                    "Dispatching..."
                  ) : (
                    <>
                      <Rocket size={14} /> Approve & Start Dev
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Section 01: Problem Statement */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="font-mono text-blue-600">01</span> The "Why" & Problem Statement
              </h3>
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-950 leading-relaxed text-xs">
                {initiative.problem_statement}
              </div>
            </section>

            {/* Section 02: User Persona & Agile Story */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="font-mono text-blue-600">02</span> User Persona & Agile Story
              </h3>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-800 font-semibold mb-2">
                <User size={15} className="text-blue-600" />
                <span>Target Persona: {initiative.target_persona}</span>
              </div>
              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl italic text-slate-800 leading-relaxed">
                "{initiative.user_story}"
              </div>
            </section>

            {/* Section 03: Success Metrics */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="font-mono text-blue-600">03</span> Target KPIs & Success Metrics
              </h3>
              <ul className="space-y-2">
                {initiative.success_metrics.map((metric, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 leading-snug">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 04: Acceptance Criteria */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="font-mono text-blue-600">04</span> Acceptance Criteria (Gherkin Syntax)
              </h3>
              <div className="space-y-2">
                {initiative.acceptance_criteria.map((crit, i) => (
                  <div key={i} className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed">
                    {crit}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 05: Technical Architecture */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="font-mono text-blue-600">05</span> Technical Architecture & Dependencies
              </h3>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                {initiative.technical_architecture || "To be scoped during technical spike in In Spec & Design phase."}
              </div>
            </section>

            {/* Section 06: Tags */}
            <div className="flex items-center gap-1.5 flex-wrap pt-4 border-t border-slate-200">
              <Tag size={13} className="text-slate-400" />
              {initiative.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
