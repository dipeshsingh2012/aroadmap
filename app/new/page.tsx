"use client";

import React, { useState } from "react";
import { OnboardingModal } from "@/components/OnboardingModal";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTenantPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-2 mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold mb-2">
          <ArrowLeft size={13} /> Back to aroadmap.dev
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Onboard a New Roadmap Tenant</h1>
        <p className="text-xs text-slate-600">Claim your custom subdomain and launch continuous discovery in 60 seconds</p>
      </div>

      <OnboardingModal
        isOpen={isOpen}
        onClose={() => {
          window.location.href = "/";
        }}
      />
    </div>
  );
}
