"use client";

import React from "react";
import { ThumbsUp, User, GripVertical, ChevronRight } from "lucide-react";
import { RoadmapInitiative } from "@/lib/types";

interface KanbanCardProps {
  item: RoadmapInitiative;
  isUpvoted: boolean;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onClick: (item: RoadmapInitiative) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  isUpvoted,
  onUpvote,
  onClick,
  onDragStart,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onClick={() => onClick(item)}
      className="group relative bg-white border border-slate-200/90 hover:border-blue-400 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2.5 select-none"
    >
      {/* Top Meta Row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 tracking-wide">
          {item.theme}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
            RICE {item.rice.score.toFixed(1)}
          </span>
          <GripVertical size={13} className="text-slate-300 group-hover:text-slate-500 cursor-grab" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
        {item.title}
      </h3>

      {/* Summary */}
      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
        {item.summary || item.problem_statement}
      </p>

      {/* Persona Pill & Tags */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-50">
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
          <User size={10} className="text-blue-500" />
          {item.target_persona}
        </span>
      </div>

      {/* Bottom Row: Upvote & Arrow */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-auto">
        <button
          onClick={(e) => onUpvote(item.id, e)}
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md transition-all ${
            isUpvoted
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          <ThumbsUp size={11} className={isUpvoted ? "fill-white" : ""} />
          <span>{item.upvotes}</span>
        </button>

        <span className="text-[10px] text-slate-400 group-hover:text-blue-500 flex items-center font-medium">
          View Spec <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
};
