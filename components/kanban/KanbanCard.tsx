"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X } from "lucide-react"
import type { KanbanTask, Frente } from "@/types"

interface KanbanCardProps {
  task: KanbanTask
  frentes: Frente[]
  onClick: () => void
  onDelete: () => void
}

function getDeadlineColor(deadline: string | null): string {
  if (!deadline) return ""
  const d = new Date(deadline + "T23:59:59")
  const now = new Date()
  const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return "text-brand-red bg-brand-red/10"
  if (diffDays === 0) return "text-brand-yellow bg-brand-yellow/10"
  if (diffDays === 1) return "text-brand-orange bg-brand-orange/10"
  return "text-brand-muted bg-brand-surface2"
}

export function KanbanCard({ task, frentes, onClick, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const frente = task.frente_id ? frentes.find((f) => f.id === task.frente_id) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group bg-brand-surface2 border border-brand-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-brand-muted/50 transition-colors"
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      {frente && (
        <div className="w-full h-0.5 rounded-full mb-2" style={{ backgroundColor: frente.color }} />
      )}
      <p className={`text-sm text-brand-text leading-snug mb-2 ${task.status === "done" ? "line-through opacity-50" : ""}`}>
        {task.name}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.category && (
            <span className="text-[10px] text-brand-muted bg-brand-surface px-1.5 py-0.5 rounded capitalize">
              {task.category}
            </span>
          )}
          {frente && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: frente.color, backgroundColor: frente.color + "15" }}>
              {frente.name.length > 15 ? frente.name.slice(0, 15) + "…" : frente.name}
            </span>
          )}
          {task.deadline && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getDeadlineColor(task.deadline)}`}>
              {new Date(task.deadline + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 text-brand-muted hover:text-brand-red p-0.5 transition-opacity"
          aria-label="Excluir tarefa"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
