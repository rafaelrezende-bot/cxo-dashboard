"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import type { KanbanItem } from "@/types"

interface KanbanCardProps {
  item: KanbanItem
}

function getDeadlineColor(deadline: string): string {
  const d = new Date(deadline + "T23:59:59")
  const now = new Date()
  const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return "text-brand-red bg-brand-red/10"
  if (diffDays === 0) return "text-brand-yellow bg-brand-yellow/10"
  if (diffDays === 1) return "text-brand-orange bg-brand-orange/10"
  return "text-brand-muted bg-brand-surface2"
}

export function KanbanCard({ item }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        touchAction: "none",
        borderLeft: item.source === "plan" && item.frente_color
          ? `3px solid ${item.frente_color}`
          : "3px solid transparent",
      }}
      {...listeners}
      {...attributes}
      className="bg-brand-surface2 rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-brand-muted/50 transition-colors"
    >
      <p className={`text-sm text-brand-text leading-snug ${item.status === "done" ? "line-through opacity-50" : ""}`}>
        {item.name}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap mt-2">
        {/* Badge de frente — tarefas do plano */}
        {item.source === "plan" && item.frente_name && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: (item.frente_color || "#666") + "33", color: item.frente_color }}
          >
            {item.frente_name}
          </span>
        )}

        {/* Categoria — tarefas operacionais */}
        {item.source === "operational" && item.category && (
          <span className="text-[10px] text-brand-muted bg-brand-surface px-1.5 py-0.5 rounded capitalize">
            {item.category}
          </span>
        )}

        {/* Deadline — tarefas operacionais */}
        {item.deadline && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${getDeadlineColor(item.deadline)}`}>
            {new Date(item.deadline + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
          </span>
        )}

        {/* Source indicator */}
        {item.source === "plan" && (
          <span className="text-[9px] text-brand-muted bg-brand-surface px-1 py-0.5 rounded">plano</span>
        )}
      </div>
    </div>
  )
}
