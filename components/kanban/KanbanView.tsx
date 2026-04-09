"use client"

import { useState, useCallback } from "react"
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useKanbanData } from "@/hooks/useKanbanData"
import { getCurrentWeek, getWeekStartDate, getWeekEndDate, formatShortDate } from "@/lib/dates"
import type { Status, KanbanItem } from "@/types"
import { KanbanColumn } from "./KanbanColumn"
import { TaskModal, TaskModalData } from "@/components/TaskModal"
import { DayView } from "./DayView"

const columns: Status[] = ["pending", "in-progress", "done", "blocked"]

export function KanbanView() {
  const [week, setWeek] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cxo_kanban_week")
      return saved ? parseInt(saved) : getCurrentWeek()
    }
    return getCurrentWeek()
  })
  const { items, loading, moveItem, updatePlanTask, deletePlanTask, createTask, updateTask, deleteTask } = useKanbanData(week)

  const [modal, setModal] = useState<{
    mode: "create" | "edit"
    taskType: "plan" | "operational"
    item?: KanbanItem
    initialStatus?: Status
  } | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const changeWeek = (delta: number) => {
    const next = Math.max(1, Math.min(12, week + delta))
    setWeek(next)
    if (typeof window !== "undefined") localStorage.setItem("cxo_kanban_week", String(next))
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const itemId = String(active.id)
    const newStatus = String(over.id) as Status
    if (!columns.includes(newStatus)) return
    moveItem(itemId, newStatus)
  }, [moveItem])

  const handleClickItem = (item: KanbanItem) => {
    setModal({
      mode: "edit",
      taskType: item.source === "plan" ? "plan" : "operational",
      item,
    })
  }

  const handleSave = async (data: TaskModalData) => {
    if (!modal) return
    if (modal.mode === "create") {
      await createTask({
        name: data.name,
        status: data.status,
        category: (data.category || null) as "comercial" | "cliente" | "interno" | "admin" | null,
        frente_id: data.frente_id || null,
        frente_auto_classified: false,
        frente_manual_override: false,
        week,
        deadline: data.deadline || null,
        updated_at: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    } else if (modal.item) {
      if (modal.taskType === "plan") {
        await updatePlanTask(modal.item.id, {
          name: data.name,
          status: data.status,
          frente_id: data.frente_id || modal.item.frente_id,
          start_week: data.start_week,
          end_week: data.end_week,
          note: data.note || "",
        })
      } else {
        await updateTask(modal.item.id, {
          name: data.name,
          status: data.status,
          category: (data.category || null) as "comercial" | "cliente" | "interno" | "admin" | null,
          frente_id: data.frente_id || null,
          deadline: data.deadline || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
      }
    }
    setModal(null)
  }

  const handleDelete = async () => {
    if (!modal?.item) return
    if (modal.taskType === "plan") {
      await deletePlanTask(modal.item.id)
    } else {
      await deleteTask(modal.item.id)
    }
    setModal(null)
  }

  const opTasksForDayView = items
    .filter((i) => i.source === "operational")
    .map((i) => ({
      id: i.id,
      name: i.name,
      status: i.status as Status,
      deadline: i.deadline || null,
      category: (i.category || null) as "comercial" | "cliente" | "interno" | "admin" | null,
      frente_id: i.frente_id || null,
      frente_auto_classified: false,
      frente_manual_override: false,
      week,
      created_at: "",
    }))

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-brand-surface rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-3">
              <div className="h-4 w-24 bg-brand-surface2 rounded animate-pulse" />
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
          onClick={() => setModal({ mode: "create", taskType: "operational", initialStatus: "pending" })}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-accent text-white text-sm font-medium rounded-lg hover:opacity-90"
        >
          <Plus size={16} />
          Nova tarefa
        </button>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              items={items.filter((i) => i.status === status)}
              onClickItem={handleClickItem}
              onAddTask={() => setModal({ mode: "create", taskType: "operational", initialStatus: status })}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-brand-surface2 border border-brand-accent rounded-lg p-3 shadow-lg opacity-90 text-sm text-brand-text">
              {items.find((i) => i.id === activeId)?.name || ""}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Day View */}
      <DayView tasks={opTasksForDayView} week={week} />

      {/* Unified TaskModal */}
      {modal && (
        <TaskModal
          mode={modal.mode}
          taskType={modal.taskType}
          initialData={
            modal.item
              ? {
                  name: modal.item.name,
                  status: modal.item.status as Status,
                  frente_id: modal.item.frente_id,
                  deadline: modal.item.deadline,
                  category: modal.item.category,
                }
              : { status: modal.initialStatus || "pending" }
          }
          onSave={handleSave}
          onDelete={modal.mode === "edit" ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
