"use client"

import { useState, useCallback } from "react"
import { DndContext, DragEndEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useKanbanData } from "@/hooks/useKanbanData"
import { getCurrentWeek, getWeekStartDate, getWeekEndDate, formatShortDate } from "@/lib/dates"
import { STATUS_CONFIG } from "@/lib/status"
import type { Status, KanbanTask } from "@/types"
import { KanbanCard } from "./KanbanCard"
import { KanbanTaskModal } from "./KanbanTaskModal"
import { DayView } from "./DayView"

const columns: Status[] = ["pending", "in-progress", "done", "blocked"]
const columnColors: Record<Status, string> = {
  pending: "text-brand-muted",
  "in-progress": "text-brand-yellow",
  done: "text-brand-green",
  blocked: "text-brand-red",
}

export function KanbanView() {
  const [week, setWeek] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cxo_kanban_week")
      return saved ? parseInt(saved) : getCurrentWeek()
    }
    return getCurrentWeek()
  })
  const { kanbanTasks, frentes, loading, createTask, updateTask, deleteTask, moveTask } = useKanbanData(week)
  const [modal, setModal] = useState<{ mode: "create" | "edit"; task?: KanbanTask; initialStatus?: Status } | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const changeWeek = (delta: number) => {
    const next = Math.max(1, Math.min(12, week + delta))
    setWeek(next)
    if (typeof window !== "undefined") localStorage.setItem("cxo_kanban_week", String(next))
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const overId = String(over.id)
    const newStatus = columns.find((c) => overId === c || overId.startsWith(c + "-")) || null
    if (newStatus && active.id) {
      moveTask(String(active.id), newStatus)
    }
  }, [moveTask])

  const tasksByStatus = (status: Status) => kanbanTasks.filter((t) => t.status === status)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-brand-surface rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-3">
              <div className="h-4 w-24 bg-brand-surface2 rounded animate-pulse" />
              <div className="h-16 bg-brand-surface2 rounded-lg animate-pulse" />
              <div className="h-16 bg-brand-surface2 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => changeWeek(-1)} className="p-1.5 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-surface2">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-brand-text">
            Semana {week} &middot; {formatShortDate(getWeekStartDate(week))} – {formatShortDate(getWeekEndDate(week))}
          </span>
          <button onClick={() => changeWeek(1)} className="p-1.5 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-surface2">
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={() => setModal({ mode: "create", initialStatus: "pending" })}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-accent text-white text-sm font-medium rounded-lg hover:opacity-90"
        >
          <Plus size={16} />
          Nova tarefa
        </button>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={(e) => setActiveId(String(e.active.id))} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((status) => {
            const tasks = tasksByStatus(status)
            return (
              <div
                key={status}
                className={`bg-brand-surface border border-brand-border rounded-xl p-3 min-h-[200px] ${
                  activeId ? "ring-1 ring-brand-border" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${columnColors[status]}`}>
                    {STATUS_CONFIG[status].label}
                  </span>
                  <span className="text-[10px] text-brand-muted bg-brand-surface2 px-1.5 py-0.5 rounded">{tasks.length}</span>
                </div>

                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy} id={status}>
                  <div className="space-y-2 min-h-[60px]" id={status}>
                    {tasks.map((task) => (
                      <KanbanCard
                        key={task.id}
                        task={task}
                        frentes={frentes}
                        onClick={() => setModal({ mode: "edit", task })}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-brand-muted text-[11px] text-center py-4">Nenhuma tarefa</p>
                    )}
                  </div>
                </SortableContext>

                <button
                  onClick={() => setModal({ mode: "create", initialStatus: status })}
                  className="w-full mt-2 py-2 border border-dashed border-brand-border rounded-lg text-brand-muted text-xs hover:text-brand-text hover:border-brand-muted transition-colors"
                >
                  + Adicionar
                </button>
              </div>
            )
          })}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-brand-surface2 border border-brand-accent rounded-lg p-3 shadow-lg opacity-80 text-sm text-brand-text">
              {kanbanTasks.find((t) => t.id === activeId)?.name || ""}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Day View */}
      <DayView tasks={kanbanTasks} week={week} />

      {/* Modal */}
      {modal && (
        <KanbanTaskModal
          mode={modal.mode}
          initialName={modal.task?.name}
          initialStatus={modal.initialStatus || modal.task?.status}
          initialCategory={modal.task?.category}
          initialFrenteId={modal.task?.frente_id}
          initialDeadline={modal.task?.deadline}
          frentes={frentes}
          onSave={(data) => {
            if (modal.mode === "create") {
              createTask({ ...data, week, updated_at: new Date().toISOString() } as unknown as Omit<KanbanTask, "id" | "created_at">)
            } else if (modal.task) {
              updateTask(modal.task.id, data)
            }
            setModal(null)
          }}
          onDelete={modal.task ? () => { deleteTask(modal.task!.id); setModal(null) } : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
