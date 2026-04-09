"use client"

import type { KanbanTask } from "@/types"
import { getWeekStartDate } from "@/lib/dates"
import { STATUS_CONFIG } from "@/lib/status"

interface DayViewProps {
  tasks: KanbanTask[]
  week: number
}

const dayNames = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

export function DayView({ tasks, week }: DayViewProps) {
  const weekStart = getWeekStartDate(week)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const tasksWithDeadline = tasks.filter((t) => t.deadline)
  const tasksNoDeadline = tasks.filter((t) => !t.deadline && t.status !== "done")

  return (
    <div>
      <p className="text-[11px] text-brand-muted uppercase tracking-wider mb-3">Prazo por dia</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {days.map((day) => {
          const dayStr = day.toISOString().split("T")[0]
          const isToday = day.getTime() === today.getTime()
          const dayTasks = tasksWithDeadline.filter((t) => t.deadline === dayStr)

          return (
            <div
              key={dayStr}
              className={`bg-brand-surface rounded-xl p-3 min-h-[80px] ${
                isToday ? "border-2 border-brand-accent" : "border border-brand-border"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`text-[11px] font-medium uppercase ${isToday ? "text-brand-accent" : "text-brand-muted"}`}>
                  {dayNames[day.getDay()]}
                </span>
                <span className={`text-xs font-bold ${isToday ? "text-brand-accent" : "text-brand-text"}`}>
                  {day.getDate()}
                </span>
              </div>
              <div className="space-y-1">
                {dayTasks.length === 0 && (
                  <p className="text-brand-border text-[10px] text-center">—</p>
                )}
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-1.5 text-[11px] ${
                      t.status === "done" ? "opacity-50 line-through" : ""
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[t.status].dotClass}`} />
                    <span className="text-brand-text truncate">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {tasksNoDeadline.length > 0 && (
        <div>
          <p className="text-[11px] text-brand-muted uppercase tracking-wider mb-2">Sem prazo definido</p>
          <div className="flex flex-wrap gap-1.5">
            {tasksNoDeadline.map((t) => (
              <div key={t.id} className="flex items-center gap-1.5 bg-brand-surface border border-brand-border rounded px-2 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[t.status].dotClass}`} />
                <span className="text-[11px] text-brand-text">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
