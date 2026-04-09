"use client"

import { useState, useCallback } from "react"
import { ChevronDown, ChevronRight, FileText } from "lucide-react"
import type { Frente, FrenteTask, AdHocTask, Status } from "@/types"
import { getCurrentWeek, getWeekStartDate, formatShortDate, getMonthLabel } from "@/lib/dates"
import { STATUS_CONFIG } from "@/lib/status"
import { TaskEditModal } from "./TaskEditModal"

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

  // Full task editing for frente_tasks
  const [editingFrenteTask, setEditingFrenteTask] = useState<FrenteTask | null>(null)

  // Simple status+note editing for adhoc_tasks (unchanged)
  const [editingAdHoc, setEditingAdHoc] = useState<{
    id: string; name: string; status: Status; note: string
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
                  onClick={() => setEditingFrenteTask(task)}
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
                    onClick={() => setEditingAdHoc({ id: task.id, name: task.name, status: task.status, note: task.note })}
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

      {/* Full edit modal for frente_tasks */}
      {editingFrenteTask && (
        <TaskEditModal
          task={editingFrenteTask}
          onSave={(updates) => {
            onUpdateFrenteTask(editingFrenteTask.id, updates)
            setEditingFrenteTask(null)
          }}
          onDelete={() => {
            onDeleteFrenteTask(editingFrenteTask.id)
            setEditingFrenteTask(null)
          }}
          onClose={() => setEditingFrenteTask(null)}
        />
      )}

      {/* Simple adhoc edit modal (status + note only) */}
      {editingAdHoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditingAdHoc(null)}>
          <div className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-brand-text font-semibold text-base whitespace-normal break-words">{editingAdHoc.name}</h3>
              <button onClick={() => setEditingAdHoc(null)} className="text-brand-muted hover:text-brand-text p-1 flex-shrink-0">
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>
            <span className="text-[10px] text-brand-muted bg-brand-surface2 px-2 py-0.5 rounded mb-4 inline-block">Tarefa ad-hoc</span>

            <AdHocEditForm
              initialStatus={editingAdHoc.status}
              initialNote={editingAdHoc.note}
              onSave={(status, note) => {
                onUpdateAdHocTask(editingAdHoc.id, { status, note })
                setEditingAdHoc(null)
              }}
              onClose={() => setEditingAdHoc(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Inline sub-component to avoid separate file for simple status+note edit
function AdHocEditForm({ initialStatus, initialNote, onSave, onClose }: {
  initialStatus: Status; initialNote: string
  onSave: (status: Status, note: string) => void; onClose: () => void
}) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [note, setNote] = useState(initialNote)

  return (
    <>
      <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-2 mt-3">Status</label>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              status === key ? "border-brand-accent bg-brand-surface2 text-brand-text" : "border-brand-border text-brand-muted hover:text-brand-text"
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${cfg.dotClass}`} />{cfg.label}
          </button>
        ))}
      </div>
      <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">Nota</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none"
        placeholder="Adicionar nota..."
      />
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-brand-muted hover:text-brand-text rounded-lg">Cancelar</button>
        <button onClick={() => onSave(status, note)} className="px-4 py-2 text-sm font-medium bg-brand-accent text-white rounded-lg hover:opacity-90">Salvar</button>
      </div>
    </>
  )
}
