"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ThumbsUp,
  User,
  CheckCircle2,
  Tag,
  Sparkles,
  Rocket,
  Check,
  Edit3,
  Save,
  Trash2,
  Plus,
  BarChart3,
  Loader2,
  Wand2,
  RotateCcw,
} from "lucide-react";
import {
  RoadmapInitiative,
  STAGE_CONFIG,
  RoadmapStage,
  StrategicTheme,
  STRATEGIC_THEMES,
  PriorityLevel,
  computeRICEScore,
} from "@/lib/types";

interface PRDDrawerProps {
  initiative: RoadmapInitiative | null;
  onClose: () => void;
  isUpvoted: boolean;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onApproveAndStartDev?: (id: string) => Promise<void>;
  onMoveStage: (id: string, stage: RoadmapStage) => void;
  onUpdateInitiative?: (id: string, updates: Partial<RoadmapInitiative>) => Promise<any>;
  onDeleteInitiative?: (id: string) => Promise<any>;
}

const STAGES: RoadmapStage[] = ["discovery", "spec", "approved", "development", "shipped"];
const PRIORITIES: PriorityLevel[] = ["P0 - Critical", "P1 - High", "P2 - Medium", "P3 - Low"];
const STANDARD_PERSONAS = [
  "Proposal Manager",
  "Security SME",
  "Legal Counsel",
  "Head of Sales / RevOps",
  "Bid Team",
  "AI Engineer",
  "IT Administrator",
  "Product Lead",
];

export const PRDDrawer: React.FC<PRDDrawerProps> = ({
  initiative,
  onClose,
  isUpvoted,
  onUpvote,
  onApproveAndStartDev,
  onMoveStage,
  onUpdateInitiative,
  onDeleteInitiative,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);
  const [isAiPolishing, setIsAiPolishing] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<RoadmapStage>("discovery");
  const [theme, setTheme] = useState<StrategicTheme>("Smart Ingestion");
  const [priority, setPriority] = useState<PriorityLevel>("P1 - High");
  const [persona, setPersona] = useState("Proposal Manager");
  const [quarter, setQuarter] = useState("In Discovery");
  const [problemStatement, setProblemStatement] = useState("");
  const [userStory, setUserStory] = useState("");
  const [successMetrics, setSuccessMetrics] = useState<string[]>([]);
  const [acceptanceCriteria, setAcceptCriteria] = useState<string[]>([]);
  const [technicalArchitecture, setTechnicalArchitecture] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // RICE score state
  const [reach, setReach] = useState(70);
  const [impact, setImpact] = useState(3);
  const [confidence, setConfidence] = useState(80);
  const [effort, setEffort] = useState(3);

  // Sync form when initiative changes
  useEffect(() => {
    if (initiative) {
      setTitle(initiative.title || "");
      setStage(initiative.stage || "discovery");
      setTheme(initiative.theme || "Smart Ingestion");
      setPriority(initiative.priority || "P1 - High");
      setPersona(initiative.target_persona || "Proposal Manager");
      setQuarter(initiative.quarter || "In Discovery");
      setProblemStatement(initiative.problem_statement || "");
      setUserStory(initiative.user_story || "");
      setSuccessMetrics(initiative.success_metrics || []);
      setAcceptCriteria(initiative.acceptance_criteria || []);
      setTechnicalArchitecture(initiative.technical_architecture || "");
      setTagsInput((initiative.tags || []).join(", "));
      setReach(initiative.rice?.reach ?? 70);
      setImpact(initiative.rice?.impact ?? 3);
      setConfidence(initiative.rice?.confidence ?? 80);
      setEffort(initiative.rice?.effort ?? 3);
      setIsEditing(false);
    }
  }, [initiative]);

  if (!initiative) return null;

  const cfg = STAGE_CONFIG[initiative.stage] || STAGE_CONFIG.discovery;
  const currentRiceScore = computeRICEScore({ reach, impact, confidence, effort });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateInitiative || isSaving) return;

    setIsSaving(true);
    try {
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const updates: Partial<RoadmapInitiative> = {
        title: title.trim(),
        stage,
        theme,
        priority,
        target_persona: persona,
        quarter: quarter.trim(),
        problem_statement: problemStatement.trim(),
        user_story: userStory.trim(),
        success_metrics: successMetrics.filter((m) => m.trim().length > 0),
        acceptance_criteria: acceptanceCriteria.filter((c) => c.trim().length > 0),
        technical_architecture: technicalArchitecture.trim(),
        tags: parsedTags,
        rice: {
          reach,
          impact,
          confidence,
          effort,
          score: currentRiceScore,
        },
      };

      await onUpdateInitiative(initiative.id, updates);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save initiative updates:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteInitiative || isDeleting) return;
    if (window.confirm(`Are you sure you want to permanently delete "${initiative.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDeleteInitiative(initiative.id);
        onClose();
      } catch (err) {
        console.error("Failed to delete initiative:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

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

  const handleAiPolish = async () => {
    setIsAiPolishing(true);
    try {
      const res = await fetch("/api/ai/suggest-opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          persona,
          theme,
          situation: problemStatement,
          workaround: userStory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.problem_statement || data.situation) {
          setProblemStatement(data.problem_statement || `Context: ${data.situation}\nWorkaround: ${data.workaround}`);
        }
        if (data.user_story) setUserStory(data.user_story);
        if (data.hypothesis && !technicalArchitecture) setTechnicalArchitecture(`Hypothesis: ${data.hypothesis}`);
        if (Array.isArray(data.tags) && data.tags.length > 0) setTagsInput(data.tags.join(", "));
        if (data.rice) {
          if (data.rice.reach) setReach(data.rice.reach);
          if (data.rice.impact) setImpact(data.rice.impact);
          if (data.rice.confidence) setConfidence(data.rice.confidence);
          if (data.rice.effort) setEffort(data.rice.effort);
        }
      }
    } catch (err) {
      console.warn("AI Polish failed:", err);
    } finally {
      setIsAiPolishing(false);
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
        <aside className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4 shrink-0">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                >
                  {cfg.icon} {cfg.label}
                </span>
                <span className="text-xs font-semibold text-slate-500">{initiative.theme}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{initiative.priority}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{initiative.quarter}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white border border-blue-400 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  initiative.title
                )}
              </h2>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Edit3 size={13} /> Edit Spec
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                >
                  <RotateCcw size={13} /> Cancel
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
            {isEditing ? (
              /* ─── EDIT MODE FORM ─── */
              <form onSubmit={handleSave} className="space-y-5">
                {/* AI Polish Banner in Edit Mode */}
                <div className="p-3 bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-blue-600 animate-pulse shrink-0" />
                    <div>
                      <p className="font-bold text-blue-950 text-xs">AI Spec Refinement Assistant</p>
                      <p className="text-[11px] text-blue-800">
                        Polish user stories, Gherkin acceptance criteria, and technical architecture with 1 click.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiPolish}
                    disabled={isAiPolishing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isAiPolishing ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                    <span>{isAiPolishing ? "Polishing..." : "AI Polish"}</span>
                  </button>
                </div>

                {/* Grid: Stage, Theme, Priority, Persona, Quarter */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stage:</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as RoadmapStage)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {STAGE_CONFIG[s].icon} {STAGE_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Strategic Pillar:</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as StrategicTheme)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer"
                    >
                      {STRATEGIC_THEMES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Priority:</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Persona:</label>
                    <select
                      value={persona}
                      onChange={(e) => setPersona(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer"
                    >
                      {STANDARD_PERSONAS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Quarter / Release:</label>
                    <input
                      type="text"
                      value={quarter}
                      onChange={(e) => setQuarter(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* RICE Prioritization */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                      <BarChart3 size={14} className="text-blue-600" />
                      RICE Prioritization Scoring
                    </span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      Score: {currentRiceScore}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <label className="block text-slate-500 font-medium">Reach ({reach}%):</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={reach}
                        onChange={(e) => setReach(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium">Impact ({impact}x):</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={impact}
                        onChange={(e) => setImpact(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium">Confidence ({confidence}%):</label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={confidence}
                        onChange={(e) => setConfidence(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium">Effort ({effort}w):</label>
                      <input
                        type="number"
                        min="0.5"
                        max="20"
                        step="0.5"
                        value={effort}
                        onChange={(e) => setEffort(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">01. Problem Statement & Customer "Why":</label>
                  <textarea
                    rows={3}
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* User Story */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">02. Agile User Story:</label>
                  <textarea
                    rows={2}
                    value={userStory}
                    onChange={(e) => setUserStory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 italic"
                  />
                </div>

                {/* Success Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">03. Target Success Metrics & KPIs:</label>
                    <button
                      type="button"
                      onClick={() => setSuccessMetrics([...successMetrics, ""])}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Metric
                    </button>
                  </div>
                  {successMetrics.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => {
                          const updated = [...successMetrics];
                          updated[i] = e.target.value;
                          setSuccessMetrics(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setSuccessMetrics(successMetrics.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Acceptance Criteria (Gherkin) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">04. Acceptance Criteria (Gherkin Syntax):</label>
                    <button
                      type="button"
                      onClick={() => setAcceptCriteria([...acceptanceCriteria, "Given ..., When ..., Then ..."])}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Gherkin Scenario
                    </button>
                  </div>
                  {acceptanceCriteria.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={c}
                        onChange={(e) => {
                          const updated = [...acceptanceCriteria];
                          updated[i] = e.target.value;
                          setAcceptCriteria(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-lg border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setAcceptCriteria(acceptanceCriteria.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 p-1 mt-1 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Technical Architecture */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">05. Technical Architecture & Blueprint:</label>
                  <textarea
                    rows={3}
                    value={technicalArchitecture}
                    onChange={(e) => setTechnicalArchitecture(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">06. Search Tags (comma-separated):</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {/* Save and Delete Actions Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={13} /> {isDeleting ? "Deleting..." : "Delete Initiative"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* ─── VIEW MODE ─── */
              <>
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
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
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
                    {initiative.problem_statement || "(No problem statement provided)"}
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
                    "{initiative.user_story || "(No user story provided)"}"
                  </div>
                </section>

                {/* Section 03: Success Metrics */}
                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span className="font-mono text-blue-600">03</span> Target KPIs & Success Metrics
                  </h3>
                  <ul className="space-y-2">
                    {initiative.success_metrics && initiative.success_metrics.length > 0 ? (
                      initiative.success_metrics.map((metric, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 leading-snug">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>{metric}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No metrics defined yet</li>
                    )}
                  </ul>
                </section>

                {/* Section 04: Acceptance Criteria */}
                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span className="font-mono text-blue-600">04</span> Acceptance Criteria (Gherkin Syntax)
                  </h3>
                  <div className="space-y-2">
                    {initiative.acceptance_criteria && initiative.acceptance_criteria.length > 0 ? (
                      initiative.acceptance_criteria.map((crit, i) => (
                        <div key={i} className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed">
                          {crit}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-slate-100 text-slate-500 rounded-lg italic">
                        No Gherkin criteria specified yet
                      </div>
                    )}
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
                  {initiative.tags && initiative.tags.length > 0 ? (
                    initiative.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No tags</span>
                  )}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
