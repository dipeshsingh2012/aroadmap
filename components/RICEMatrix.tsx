"use client";

import React from "react";
import { ThumbsUp, ArrowUpDown, ChevronRight, User } from "lucide-react";
import { RoadmapInitiative, STAGE_CONFIG } from "@/lib/types";

interface RICEMatrixProps {
  initiatives: RoadmapInitiative[];
  upvotedIds: Set<string>;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onSelectInitiative: (item: RoadmapInitiative) => void;
}

export const RICEMatrix: React.FC<RICEMatrixProps> = ({
  initiatives,
  upvotedIds,
  onUpvote,
  onSelectInitiative,
}) => {
  const sorted = [...initiatives].sort((a, b) => b.rice.score - a.rice.score);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Intro Banner */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 mb-6 text-xs text-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <strong className="font-bold">🎯 RICE Prioritization Engine:</strong> Ranked by ROI Score =
          <code className="bg-white px-2 py-0.5 rounded border border-blue-200 ml-1 font-mono text-[11px]">
            (Reach % × Impact × Confidence %) ÷ Effort (wks)
          </code>
        </div>
        <span className="text-[11px] text-blue-700 font-semibold">{sorted.length} Ranked Initiatives</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rank & Initiative</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Theme</th>
                <th className="py-3 px-3">Reach</th>
                <th className="py-3 px-3">Impact</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Effort</th>
                <th className="py-3 px-4 text-right">RICE Score</th>
                <th className="py-3 px-4 text-right">Upvotes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((item, index) => {
                const cfg = STAGE_CONFIG[item.stage];
                const isUpvoted = upvotedIds.has(item.id);

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectInitiative(item)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.summary || item.problem_statement}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{item.theme}</td>
                    <td className="py-3.5 px-3 text-slate-600">{item.rice.reach}%</td>
                    <td className="py-3.5 px-3 text-slate-600">{item.rice.impact}x</td>
                    <td className="py-3.5 px-3 text-slate-600">{item.rice.confidence}%</td>
                    <td className="py-3.5 px-3 text-slate-600">{item.rice.effort} wks</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {item.rice.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => onUpvote(item.id, e)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                          isUpvoted
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <ThumbsUp size={11} className={isUpvoted ? "fill-white" : ""} />
                        <span>{item.upvotes}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
