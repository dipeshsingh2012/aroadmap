"use client";

import React, { useState, useEffect } from "react";
import { getTenantUrl } from "@/lib/utils";
import {
  X,
  Sparkles,
  Globe,
  Palette,
  Github,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Shield,
  Zap,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlug?: string;
}

const BRAND_PALETTE = [
  { name: "Ocean Blue", hex: "#2563EB" },
  { name: "Electric Indigo", hex: "#4F46E5" },
  { name: "Royal Purple", hex: "#7C3AED" },
  { name: "Emerald Forest", hex: "#059669" },
  { name: "Crimson Rose", hex: "#E11D48" },
  { name: "Amber Flame", hex: "#D97706" },
  { name: "Slate Charcoal", hex: "#334155" },
];

const TEMPLATES = [
  {
    id: "ai-saas",
    name: "⚡ AI & Modern SaaS Starter Pack",
    desc: "Pre-configured with Enterprise SSO, Hybrid RAG Vector Search, and Real-Time Multiplayer Presence.",
    color: "border-blue-200 bg-blue-50/50",
  },
  {
    id: "rfp-sales",
    name: "💼 Enterprise RFP & Proposal Acceleration",
    desc: "Preloaded with Multi-Format Excel SIG-Lite Parser, GCIP Auth, and Compliance Exporter.",
    color: "border-purple-200 bg-purple-50/50",
  },
  {
    id: "blank",
    name: "🧼 Clean Blank Slate",
    desc: "Start with a clean discovery board and 1 sample customer opportunity.",
    color: "border-slate-200 bg-slate-50/50",
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialSlug = "",
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState(initialSlug);
  const [tagline, setTagline] = useState("");
  const [brandColor, setBrandColor] = useState("#2563EB");
  const [customColor, setCustomColor] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [template, setTemplate] = useState("ai-saas");

  // Availability checking state
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionedData, setProvisionedData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Sync initial slug
  useEffect(() => {
    if (initialSlug) {
      setSubdomain(initialSlug.toLowerCase().replace(/[^a-z0-9-]/g, ""));
      if (!name) {
        setName(initialSlug.charAt(0).toUpperCase() + initialSlug.slice(1));
      }
    }
  }, [initialSlug]);

  // Live subdomain check with debounce
  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setIsAvailable(null);
      setAvailabilityError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await fetch(`/api/tenants/check-subdomain?slug=${encodeURIComponent(subdomain)}`);
        const data = await res.json();
        setIsAvailable(data.available);
        setAvailabilityError(data.error || null);
      } catch (err) {
        setIsAvailable(true);
        setAvailabilityError(null);
      } finally {
        setIsChecking(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [subdomain]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!subdomain || subdomain === name.toLowerCase().replace(/[^a-z0-9-]/g, "")) {
      setSubdomain(val.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    }
  };

  const handleProvision = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subdomain,
          tagline,
          brand_color: customColor || brandColor,
          github_repo: githubRepo,
          visibility,
          template,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProvisionedData(data);
        setStep(5); // Success step
      } else {
        alert(data.error || "Failed to provision tenant");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetSubdomainUrl = provisionedData?.tenant?.subdomain
    ? getTenantUrl(provisionedData.tenant.subdomain)
    : "";

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              AR
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {step === 5 ? "🎉 Tenant Provisioned!" : "Create Dedicated Roadmap Tenant"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {step === 5 ? "Your isolated strategy board is ready" : `Step ${step} of 4: Setup your custom subdomain`}
              </p>
            </div>
          </div>
          {step !== 5 && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: IDENTITY & SUBDOMAIN */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product / Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme AI, RFPEngine, Agentic Fleet"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subdomain Slug <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="acme"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="w-full pl-3.5 pr-32 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-mono pointer-events-none">
                    .aroadmap.dev
                  </span>
                </div>

                {/* Live Availability Status */}
                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                  {isChecking && <span className="text-slate-400 animate-pulse">Checking availability...</span>}
                  {!isChecking && isAvailable === true && (
                    <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 size={13} /> {getTenantUrl(subdomain)} is available!
                    </span>
                  )}
                  {!isChecking && isAvailable === false && (
                    <span className="text-red-500 font-semibold inline-flex items-center gap-1">
                      <AlertCircle size={13} /> {availabilityError || "Subdomain is unavailable"}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tagline / Strategic Mission
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI-Powered Proposal & Compliance Acceleration Platform"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Roadmap Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      visibility === "public"
                        ? "border-blue-500 bg-blue-50/40 text-blue-900 ring-1 ring-blue-500"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Globe size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Public Board</div>
                      <div className="text-[11px] text-slate-500">Anyone can view & upvote features</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility("private")}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      visibility === "private"
                        ? "border-blue-500 bg-blue-50/40 text-blue-900 ring-1 ring-blue-500"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Shield size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Internal / Team Only</div>
                      <div className="text-[11px] text-slate-500">Requires team sign-in to access</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BRANDING */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Brand Primary Color
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {BRAND_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setBrandColor(c.hex);
                        setCustomColor("");
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                        brandColor === c.hex && !customColor
                          ? "border-slate-900 bg-slate-100 shadow-xs"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full shadow-xs shrink-0" style={{ backgroundColor: c.hex }} />
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Header Preview</span>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-sm"
                    style={{ backgroundColor: customColor || brandColor }}
                  >
                    {name ? name.slice(0, 2).toUpperCase() : "AR"}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{name || "Your Project Name"}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{getTenantUrl(subdomain || "your-brand")}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GITHUB & AUTONOMOUS SDLC */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Github size={14} /> Connected GitHub Repository
                </label>
                <input
                  type="text"
                  placeholder="e.g. dipeshsingh2012/rfpengine or your-org/repo"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enables 1-Click <strong>"Approve & Start Dev"</strong> to create branches, commit code, and open PRs automatically.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-200/80 space-y-2">
                <div className="flex items-center gap-2 text-violet-900 font-bold text-xs">
                  <Sparkles size={14} className="text-violet-600" />
                  Autonomous SDLC Agent Swarm Enabled
                </div>
                <p className="text-[11px] text-violet-800 leading-relaxed">
                  When a living PRD is approved by your team, autonomous agents on the cloud fleet will automatically synthesize tests and open a verified Pull Request.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: STARTER TEMPLATES */}
          {step === 4 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Choose Starter Backlog Template
              </label>
              <div className="space-y-2.5">
                {TEMPLATES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      template === t.id
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-xs"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">{t.desc}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        template === t.id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                      }`}
                    >
                      {template === t.id && <Check size={11} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: PROVISIONED SUCCESS */}
          {step === 5 && provisionedData && (
            <div className="py-4 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Rocket size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {provisionedData.tenant.name} is Live!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your isolated continuous discovery board and living PRD workspace has been provisioned.
                </p>
              </div>

              {/* Subdomain Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 max-w-md mx-auto">
                <div className="text-xs font-mono font-bold text-blue-600 truncate">
                  {targetSubdomainUrl}
                </div>
                <button
                  type="button"
                  onClick={() => copyUrl(targetSubdomainUrl)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-center gap-3">
                <a
                  href={targetSubdomainUrl}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  Launch Board Now <ArrowRight size={13} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step !== 5 && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={13} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                disabled={!name.trim() || !subdomain.trim() || isAvailable === false}
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                Next Step <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !name.trim() || !subdomain.trim()}
                onClick={handleProvision}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? "Provisioning..." : "🚀 Complete & Launch Board"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
