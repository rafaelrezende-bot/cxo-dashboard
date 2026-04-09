"use client"

import { usePlanData } from "@/hooks/usePlanData"
import { StatsBar } from "./StatsBar"
import { GanttTimeline } from "./GanttTimeline"

export function GanttView() {
  const { frentes, frenteTasks, adHocTasks, loading, error, updateFrenteTask, updateAdHocTask } = usePlanData()

  if (error) {
    return (
      <div className="bg-brand-surface border border-brand-red/30 rounded-xl p-6 text-center">
        <p className="text-brand-red text-sm">{error}</p>
        <p className="text-brand-muted text-xs mt-1">Verifique a conexão com o Supabase.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-brand-surface border border-brand-border rounded-xl px-5 py-4 h-[88px] animate-pulse">
              <div className="h-2.5 w-16 bg-brand-surface2 rounded mb-3" />
              <div className="h-6 w-12 bg-brand-surface2 rounded" />
            </div>
          ))}
        </div>
        {/* Gantt skeleton */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-brand-surface2 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StatsBar frenteTasks={frenteTasks} adHocTasks={adHocTasks} />
      <GanttTimeline
        frentes={frentes}
        frenteTasks={frenteTasks}
        adHocTasks={adHocTasks}
        onUpdateFrenteTask={(id, updates) => updateFrenteTask(id, updates)}
        onUpdateAdHocTask={(id, updates) => updateAdHocTask(id, updates)}
      />
    </div>
  )
}
