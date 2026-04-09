"use client"

import dynamic from "next/dynamic"
import { useState } from "react"

const GanttView = dynamic(() => import("@/components/gantt/GanttView").then((m) => m.GanttView), { ssr: false })
const KanbanView = dynamic(() => import("@/components/kanban/KanbanView").then((m) => m.KanbanView), { ssr: false })

type Tab = "plano" | "tarefas"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("plano")

  return (
    <div className="min-h-screen bg-brand-bg">
      <nav className="border-b border-brand-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("plano")}
              className={`px-5 py-4 text-sm font-medium transition-colors relative ${
                activeTab === "plano" ? "text-brand-text" : "text-brand-muted hover:text-brand-text"
              }`}
            >
              Plano 90 Dias
              {activeTab === "plano" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent" />}
            </button>
            <button
              onClick={() => setActiveTab("tarefas")}
              className={`px-5 py-4 text-sm font-medium transition-colors relative ${
                activeTab === "tarefas" ? "text-brand-text" : "text-brand-muted hover:text-brand-text"
              }`}
            >
              Tarefas da Semana
              {activeTab === "tarefas" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {activeTab === "plano" && <GanttView />}
        {activeTab === "tarefas" && <KanbanView />}
      </div>
    </div>
  )
}
