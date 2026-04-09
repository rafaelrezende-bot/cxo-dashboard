"use client"

import { useState } from "react"
import { X, Trash2 } from "lucide-react"
import type { Status, FrenteTask } from "@/types"
import { STATUS_CONFIG } from "@/lib/status"
import { FRENTE_MAP } from "@/lib/frentes"

interface TaskEditModalProps {
  task: FrenteTask
  onSave: (updates: Partial<FrenteTask>) => void
  onDelete: () => void
  onClose: () => void
}

const frenteOptions = Object.entries(FRENTE_MAP).map(([id, { name }]) => ({ id, name }))

export function TaskEditModal({ task, onSave, onDelete, onClose }: TaskEditModalProps) {
  const [name, setName] = useState(task.name)
  const [frenteId, setFrenteId] = useState(task.frente_id)
  const [startWeek, setStartWeek] = useState(task.start_week)
  const [endWeek, setEndWeek] = useState(task.end_week)
  const [status, setStatus] = useState<Status>(task.status)
  const [note, setNote] = useState(task.note)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-brand-text font-semibold text-base">Editar tarefa</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text p-1">
            <X size={18} />
          </button>
        </div>

        {/* Name */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">Nome da tarefa</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent mb-4"
        />

        {/* Frente + Weeks row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">Frente</label>
            <select
              value={frenteId}
              onChange={(e) => setFrenteId(e.target.value)}
              className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
            >
              {frenteOptions.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">Semana início</label>
            <input
              type="number"
              min={1}
              max={12}
              value={startWeek}
              onChange={(e) => setStartWeek(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div>
            <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">Semana fim</label>
            <input
              type="number"
              min={1}
              max={12}
              value={endWeek}
              onChange={(e) => setEndWeek(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
            />
          </div>
        </div>

        {/* Status */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-2">Status</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                status === key
                  ? "border-brand-accent bg-brand-surface2 text-brand-text"
                  : "border-brand-border text-brand-muted hover:text-brand-text"
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${cfg.dotClass}`} />
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Note */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">Nota</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none"
          placeholder="Adicionar nota..."
        />

        {/* Actions */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-brand-border">
          <div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-brand-red hover:text-brand-red/80"
              >
                <Trash2 size={13} />
                Excluir tarefa
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-red">Confirma exclusão?</span>
                <button
                  onClick={onDelete}
                  className="text-xs text-brand-red font-semibold bg-brand-red/10 px-2 py-1 rounded hover:bg-brand-red/20"
                >
                  Sim, excluir
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-brand-muted hover:text-brand-text"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-brand-muted hover:text-brand-text rounded-lg">
              Cancelar
            </button>
            <button
              onClick={() => onSave({ name, frente_id: frenteId, start_week: startWeek, end_week: endWeek, status, note })}
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium bg-brand-accent text-white rounded-lg hover:opacity-90 disabled:opacity-40"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
