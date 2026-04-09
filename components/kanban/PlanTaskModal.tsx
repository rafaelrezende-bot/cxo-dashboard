"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { Status } from "@/types"
import { STATUS_CONFIG } from "@/lib/status"

interface PlanTaskModalProps {
  taskName: string
  frenteName?: string
  frenteColor?: string
  currentStatus: Status
  currentNote: string
  onSave: (status: Status, note: string) => void
  onClose: () => void
}

export function PlanTaskModal({ taskName, frenteName, frenteColor, currentStatus, currentNote, onSave, onClose }: PlanTaskModalProps) {
  const [status, setStatus] = useState<Status>(currentStatus)
  const [note, setNote] = useState(currentNote)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-brand-text font-semibold text-base">{taskName}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text p-1"><X size={18} /></button>
        </div>

        {/* Plan label */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] text-brand-muted bg-brand-surface2 px-2 py-0.5 rounded">Tarefa do Plano Estratégico</span>
          {frenteName && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: (frenteColor || "#666") + "33", color: frenteColor }}
            >
              {frenteName}
            </span>
          )}
        </div>

        {/* Status */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-2">Status</label>
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

        {/* Note */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-2">Nota</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none"
          placeholder="Adicionar nota..."
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-brand-muted hover:text-brand-text rounded-lg">Cancelar</button>
          <button
            onClick={() => onSave(status, note)}
            className="px-4 py-2 text-sm font-medium bg-brand-accent text-white rounded-lg hover:opacity-90"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
