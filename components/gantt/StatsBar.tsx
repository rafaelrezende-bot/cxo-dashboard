"use client"

import type { FrenteTask, AdHocTask } from "@/types"
import { getCurrentWeek } from "@/lib/dates"

interface StatsBarProps {
  frenteTasks: FrenteTask[]
  adHocTasks: AdHocTask[]
}

export function StatsBar({ frenteTasks, adHocTasks }: StatsBarProps) {
  const allTasks = [...frenteTasks, ...adHocTasks]
  const total = allTasks.length
  const done = allTasks.filter((t) => t.status === "done").length
  const inProgress = allTasks.filter((t) => t.status === "in-progress").length
  const blocked = allTasks.filter((t) => t.status === "blocked").length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  const week = getCurrentWeek()
  const month = week <= 4 ? 1 : week <= 8 ? 2 : 3

  const weekAdhoc = adHocTasks.filter((t) => {
    const added = new Date(t.date_added)
    const start = new Date("2026-04-06")
    start.setDate(start.getDate() + (week - 1) * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return added >= start && added <= end
  })
  const proativa = weekAdhoc.filter((t) => t.origin === "proativa").length
  const reativa = weekAdhoc.filter((t) => t.origin === "reativa").length

  const cards = [
    { label: "Progresso Geral", value: `${progress}%`, sub: `${done}/${total} concluídas` },
    { label: "Semana Atual", value: `${week}/12`, sub: `Mês ${month}` },
    { label: "Em Andamento", value: String(inProgress), color: "text-brand-yellow" },
    { label: "Travadas", value: String(blocked), color: blocked > 0 ? "text-brand-red" : "text-brand-green" },
    { label: "Proativa / Reativa", value: `${proativa}/${reativa}`, sub: "esta semana" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-brand-surface border border-brand-border rounded-xl px-5 py-4">
          <p className="text-[11px] text-brand-muted uppercase tracking-wider mb-1">{c.label}</p>
          <p className={`text-[28px] font-bold leading-tight ${c.color || "text-brand-text"}`}>{c.value}</p>
          {c.sub && <p className="text-xs text-brand-muted mt-0.5">{c.sub}</p>}
        </div>
      ))}
    </div>
  )
}
