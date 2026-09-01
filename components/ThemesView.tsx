"use client";

import React from "react";
import { RoadmapInitiative, STRATEGIC_THEMES, StrategicTheme } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";

interface ThemesViewProps {
  initiatives: RoadmapInitiative[];
  upvotedIds: Set<string>;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onSelectInitiative: (item: RoadmapInitiative) => void;
}

export const ThemesView: React.FC<ThemesViewProps> = ({
  initiatives,
  upvotedIds,
  onUpvote,
  onSelectInitiative,
}) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {STRATEGIC_THEMES.map((theme) => {
        const themeItems = initiatives.filter((i) => i.theme === theme);
        if (themeItems.length === 0) return null;

        return (
          <div key={theme} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">{theme}</h2>
                <p className="text-[11px] text-slate-500">Core strategic pillar for platform capability and market moats</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {themeItems.length} Initiatives
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {themeItems.map((item) => (
                <KanbanCard
                  key={item.id}
                  item={item}
                  isUpvoted={upvotedIds.has(item.id)}
                  onUpvote={onUpvote}
                  onClick={onSelectInitiative}
                  onDragStart={() => {}}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
