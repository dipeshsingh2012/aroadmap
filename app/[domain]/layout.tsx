import React from "react";
import { RoadmapRepository } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const tenantData = await RoadmapRepository.getTenant(domain);
  const name = tenantData?.name || domain.toUpperCase();
  return {
    title: `${name} Product Roadmap & Strategy Hub - aroadmap.dev`,
    description: `Explore live initiatives, vote on upcoming features, and inspect living PRDs for ${name}.`,
  };
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  return <div className="flex-1 flex flex-col">{children}</div>;
}
