"use client"

import { useDroppable } from "@dnd-kit/core"
import type { KanbanItem, Status } from "@/types"
import { STATUS_CONFIG } from "@/lib/status"
import { KanbanCard } from "./KanbanCard"

const columnColors: Record<Status, string> = {
  pending: "text-brand-muted",
  "in-progress": "text-brand-yellow",
  done: "text-brand-green",
  blocked: "text-brand-red",
}

interface KanbanColumnProps {
  status: Status
  items: KanbanItem[]
  onAddTask: () => void
}

export function KanbanColumn({ status, items, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`bg-brand-surface border rounded-xl p-3 min-h-[200px] transition-colors ${
        isOver ? "border-brand-accent ring-2 ring-brand-accent/20" : "border-brand-border"
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${columnColors[status]}`}>
          {STATUS_CONFIG[status].label}
        </span>
        <span className="text-[10px] text-brand-muted bg-brand-surface2 px-1.5 py-0.5 rounded">
          {items.length}
        </span>
      </div>

      <div className="min-h-[60px]">
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <p className="text-brand-muted text-[11px] text-center py-8">Nenhuma tarefa</p>
        )}
      </div>

      <button
        onClick={onAddTask}
        className="w-full mt-2 py-2 border border-dashed border-brand-border rounded-lg text-brand-muted text-xs hover:text-brand-text hover:border-brand-muted transition-colors"
      >
        + Nova tarefa
      </button>
    </div>
  )
}
