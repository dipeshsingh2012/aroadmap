"use client";

import React, { useState } from "react";
import { RoadmapInitiative, RoadmapStage, STAGE_CONFIG } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";

interface KanbanBoardProps {
  initiatives: RoadmapInitiative[];
  upvotedIds: Set<string>;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onSelectInitiative: (item: RoadmapInitiative) => void;
  onMoveStage: (id: string, stage: RoadmapStage) => void;
}

const STAGES: RoadmapStage[] = ["discovery", "spec", "approved", "development", "shipped"];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  initiatives,
  upvotedIds,
  onUpvote,
  onSelectInitiative,
  onMoveStage,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<RoadmapStage | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, stage: RoadmapStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stage: RoadmapStage) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStage === stage) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stage: RoadmapStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    setDragOverStage(null);
    setDraggedId(null);
    if (id) {
      onMoveStage(id, stage);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4.5 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-auto">
      {STAGES.map((stage) => {
        const cfg = STAGE_CONFIG[stage];
        const stageItems = initiatives.filter((i) => i.stage === stage);
        const isDragTarget = dragOverStage === stage;

        return (
          <div
            key={stage}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={(e) => handleDragLeave(e, stage)}
            onDrop={(e) => handleDrop(e, stage)}
            className={`flex flex-col rounded-2xl bg-slate-100/70 border p-3 min-w-[250px] transition-all ${
              isDragTarget
                ? "border-blue-500 bg-blue-50/50 shadow-inner ring-2 ring-blue-400/20"
                : "border-slate-200/80"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{cfg.icon}</span>
                <h2 className="text-xs font-bold text-slate-800 tracking-tight">{cfg.label}</h2>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                {stageItems.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="flex flex-col gap-2.5 flex-1 min-h-[350px]">
              {stageItems.map((item) => (
                <KanbanCard
                  key={item.id}
                  item={item}
                  isUpvoted={upvotedIds.has(item.id)}
                  onUpvote={onUpvote}
                  onClick={onSelectInitiative}
                  onDragStart={handleDragStart}
                />
              ))}

              {stageItems.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400">
                  <p className="text-xs font-medium">Drop initiatives here</p>
                  <span className="text-[10px] mt-1">{cfg.description}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
