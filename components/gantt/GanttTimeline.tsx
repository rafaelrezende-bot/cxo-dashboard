"use client"

import { useState, useCallback } from "react"
import { ChevronDown, ChevronRight, FileText } from "lucide-react"
import type { Frente, FrenteTask, AdHocTask, Status } from "@/types"
import { getCurrentWeek, getWeekStartDate, formatShortDate, getMonthLabel } from "@/lib/dates"
import { STATUS_CONFIG } from "@/lib/status"
import { TaskModal, TaskModalData } from "@/components/TaskModal"

interface GanttTimelineProps {
  frentes: Frente[]
  frenteTasks: FrenteTask[]
  adHocTasks: AdHocTask[]
  onUpdateFrenteTask: (id: string, updates: Partial<FrenteTask>) => void
  onDeleteFrenteTask: (id: string) => void
  onUpdateAdHocTask: (id: string, updates: Partial<AdHocTask>) => void
}

const weeks = Array.from({ length: 12 }, (_, i) => i + 1)

function getBarColor(status: Status): string {
  const map: Record<Status, string> = {
    pending: "bg-brand-muted/30",
    "in-progress": "bg-brand-yellow",
    done: "bg-brand-green",
    blocked: "bg-brand-red",
  }
  return map[status]
}

export function GanttTimeline({ frentes, frenteTasks, adHocTasks, onUpdateFrenteTask, onDeleteFrenteTask, onUpdateAdHocTask }: GanttTimelineProps) {
  const currentWeek = getCurrentWeek()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gantt_collapsed")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  const [editingTask, setEditingTask] = useState<{
    id: string
    taskType: "plan" | "operational"
    source: "frente" | "adhoc"
    data: Partial<TaskModalData>
  } | null>(null)

  const toggleCollapse = useCallback((frenteId: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [frenteId]: !prev[frenteId] }
      localStorage.setItem("gantt_collapsed", JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
      {/* Month headers */}
      <div className="grid" style={{ gridTemplateColumns: "260px 1fr" }}>
        <div className="bg-brand-surface2 border-b border-r border-brand-border px-4 py-2" />
        <div className="grid grid-cols-3 border-b border-brand-border">
          {([1, 2, 3] as const).map((m) => (
            <div key={m} className="bg-brand-surface2 px-3 py-2 text-center text-[11px] font-medium text-brand-muted uppercase tracking-wider border-r border-brand-border last:border-r-0">
              {getMonthLabel(m)}
            </div>
          ))}
        </div>
      </div>

      {/* Week headers */}
      <div className="grid" style={{ gridTemplateColumns: "260px 1fr" }}>
        <div className="bg-brand-surface2 border-b border-r border-brand-border px-4 py-2 text-[11px] text-brand-muted">
          Frente / Tarefa
        </div>
        <div className="grid grid-cols-12 border-b border-brand-border">
          {weeks.map((w) => (
            <div
              key={w}
              className={`px-1 py-2 text-center text-[10px] border-r border-brand-border last:border-r-0 ${
                w === currentWeek ? "bg-brand-red/20 text-brand-red font-bold" : "text-brand-muted"
              }`}
            >
              S{w}
              <br />
              <span className="text-[9px] opacity-70">{formatShortDate(getWeekStartDate(w))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Frentes */}
      {frentes.map((frente) => {
        const tasks = frenteTasks.filter((t) => t.frente_id === frente.id)
        const adhocs = adHocTasks.filter((t) => t.frente_id === frente.id)
        const allTasks = [...tasks, ...adhocs]
        const doneCount = allTasks.filter((t) => t.status === "done").length
        const progress = allTasks.length > 0 ? Math.round((doneCount / allTasks.length) * 100) : 0
        const isCollapsed = collapsed[frente.id]

        return (
          <div key={frente.id}>
            {/* Frente header */}
            <div
              className="grid cursor-pointer hover:bg-brand-surface2/50 transition-colors"
              style={{ gridTemplateColumns: "260px 1fr" }}
              onClick={() => toggleCollapse(frente.id)}
            >
              <div className="flex items-center gap-2 px-4 border-b border-r border-brand-border h-10">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: frente.color }} />
                {isCollapsed ? <ChevronRight size={14} className="text-brand-muted flex-shrink-0" /> : <ChevronDown size={14} className="text-brand-muted flex-shrink-0" />}
                <span className="text-sm font-medium text-brand-text truncate" style={{ maxWidth: '160px' }} title={frente.name}>{frente.name}</span>
                <span className="ml-auto text-[10px] text-brand-muted flex-shrink-0">{progress}%</span>
                <div className="w-12 h-1.5 bg-brand-border rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full bg-brand-green rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="border-b border-brand-border relative">
                <div
                  className="absolute top-0 bottom-0 w-px bg-brand-red z-10"
                  style={{ left: `${((currentWeek - 0.5) / 12) * 100}%` }}
                />
              </div>
            </div>

            {/* Frente tasks */}
            {!isCollapsed &&
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="grid cursor-pointer hover:bg-brand-surface2/30 transition-colors"
                  style={{ gridTemplateColumns: "260px 1fr" }}
                  onClick={() => setEditingTask({
                    id: task.id,
                    taskType: "plan",
                    source: "frente",
                    data: { name: task.name, status: task.status, frente_id: task.frente_id, start_week: task.start_week, end_week: task.end_week, note: task.note },
                  })}
                >
                  <div className="flex items-center gap-2 px-4 border-b border-r border-brand-border pl-8 h-10">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[task.status].dotClass}`} />
                    <span className="text-xs text-brand-text truncate" style={{ minWidth: 0 }} title={task.name}>{task.name}</span>
                    {task.note && <FileText size={10} className="text-brand-muted flex-shrink-0" />}
                  </div>
                  <div className="relative border-b border-brand-border">
                    <div
                      className="absolute top-0 bottom-0 w-px bg-brand-red/50 z-10"
                      style={{ left: `${((currentWeek - 0.5) / 12) * 100}%` }}
                    />
                    <div className="h-full flex items-center px-1">
                      <div
                        className={`h-5 rounded ${getBarColor(task.status)} transition-all`}
                        style={{
                          marginLeft: `${((task.start_week - 1) / 12) * 100}%`,
                          width: `${((task.end_week - task.start_week + 1) / 12) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

            {/* Ad-hoc tasks */}
            {!isCollapsed &&
              adhocs.map((task) => {
                const startDate = new Date(task.date_added)
                const planStart = new Date("2026-04-06")
                const daysDiff = Math.floor((startDate.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24))
                const startW = Math.max(1, Math.floor(daysDiff / 7) + 1)
                const endW = task.deadline
                  ? Math.max(startW, Math.min(12, Math.floor((new Date(task.deadline).getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24) / 7) + 1))
                  : startW

                return (
                  <div
                    key={task.id}
                    className="grid cursor-pointer hover:bg-brand-surface2/30 transition-colors"
                    style={{ gridTemplateColumns: "260px 1fr" }}
                    onClick={() => setEditingTask({
                      id: task.id,
                      taskType: "plan",
                      source: "adhoc",
                      data: { name: task.name, status: task.status, frente_id: task.frente_id, note: task.note },
                    })}
                  >
                    <div className="flex items-center gap-2 px-4 border-b border-r border-brand-border pl-8 h-10">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[task.status].dotClass}`} />
                      <span className="text-xs text-brand-text truncate italic" style={{ minWidth: 0 }} title={task.name}>{task.name}</span>
                      <span className={`text-[9px] px-1 rounded flex-shrink-0 ${task.origin === "proativa" ? "text-brand-accent bg-brand-accent/10" : "text-brand-orange bg-brand-orange/10"}`}>
                        {task.origin}
                      </span>
                    </div>
                    <div className="relative border-b border-brand-border">
                      <div
                        className="absolute top-0 bottom-0 w-px bg-brand-red/50 z-10"
                        style={{ left: `${((currentWeek - 0.5) / 12) * 100}%` }}
                      />
                      <div className="h-full flex items-center px-1">
                        <div
                          className={`h-5 rounded border-2 border-dashed ${
                            task.origin === "proativa" ? "border-brand-accent/50" : "border-brand-orange/50"
                          } ${getBarColor(task.status)} transition-all`}
                          style={{
                            marginLeft: `${((startW - 1) / 12) * 100}%`,
                            width: `${((endW - startW + 1) / 12) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-brand-border text-[10px] text-brand-muted">
        {(["pending", "in-progress", "done", "blocked"] as Status[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dotClass}`} />
            {STATUS_CONFIG[s].label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-2 rounded border border-dashed border-brand-muted" />
          Ad-hoc
        </div>
      </div>

      {/* Unified TaskModal */}
      {editingTask && (
        <TaskModal
          mode="edit"
          taskType={editingTask.taskType}
          initialData={editingTask.data}
          onSave={async (data) => {
            if (editingTask.source === "adhoc") {
              onUpdateAdHocTask(editingTask.id, { status: data.status, note: data.note || "" })
            } else {
              onUpdateFrenteTask(editingTask.id, {
                name: data.name,
                status: data.status,
                frente_id: data.frente_id,
                start_week: data.start_week,
                end_week: data.end_week,
                note: data.note || "",
              })
            }
            setEditingTask(null)
          }}
          onDelete={editingTask.source === "frente" ? async () => {
            onDeleteFrenteTask(editingTask.id)
            setEditingTask(null)
          } : undefined}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}

