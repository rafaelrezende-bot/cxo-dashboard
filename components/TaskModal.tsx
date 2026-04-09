"use client"

import { useState } from "react"
import { X, Trash2 } from "lucide-react"
import type { Status } from "@/types"
import { STATUS_CONFIG } from "@/lib/status"
import { FRENTE_OPTIONS } from "@/lib/frentes"

export interface TaskModalData {
  name: string
  status: Status
  frente_id?: string
  note?: string
  start_week?: number
  end_week?: number
  deadline?: string
  category?: string
}

interface TaskModalProps {
  mode: "create" | "edit"
  taskType: "plan" | "operational"
  initialData?: Partial<TaskModalData>
  onSave: (data: TaskModalData) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

export function TaskModal({ mode, taskType, initialData, onSave, onDelete, onClose }: TaskModalProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [status, setStatus] = useState<Status>(initialData?.status || "pending")
  const [frenteId, setFrenteId] = useState(initialData?.frente_id || "")
  const [note, setNote] = useState(initialData?.note || "")
  const [startWeek, setStartWeek] = useState(initialData?.start_week || 1)
  const [endWeek, setEndWeek] = useState(initialData?.end_week || 1)
  const [deadline, setDeadline] = useState(initialData?.deadline || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    const data: TaskModalData = {
      name: name.trim(),
      status,
      frente_id: frenteId || undefined,
      note: note || undefined,
    }
    if (taskType === "plan") {
      data.start_week = startWeek
      data.end_week = endWeek
    } else {
      data.deadline = deadline || undefined
      data.category = category || undefined
    }
    await onSave(data)
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!onDelete) return
    await onDelete()
  }

  const title = mode === "create"
    ? "Nova tarefa"
    : taskType === "plan"
      ? "Editar tarefa do plano"
      : "Editar tarefa"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-brand-text font-semibold text-base">{title}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text p-1">
            <X size={18} />
          </button>
        </div>

        {/* Plan badge */}
        {taskType === "plan" && mode === "edit" && (
          <span className="inline-block text-[10px] text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded mb-4">
            Tarefa do Plano Estratégico
          </span>
        )}

        {/* ── Shared fields ── */}

        {/* Name */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1 mt-2">
          Nome da tarefa
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent"
          placeholder="Descreva a tarefa..."
          autoFocus
        />

        {/* Frente */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1 mt-4">
          Frente
        </label>
        <select
          value={frenteId}
          onChange={(e) => setFrenteId(e.target.value)}
          className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
        >
          <option value="">Sem frente</option>
          {FRENTE_OPTIONS.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        {/* ── Plan-only fields ── */}
        {taskType === "plan" && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">
                Semana início
              </label>
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
              <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">
                Semana fim
              </label>
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
        )}

        {/* ── Operational-only fields ── */}
        {taskType === "operational" && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">
                Prazo
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">
                Categoria
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: comercial, interno"
                className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent"
              />
            </div>
          </div>
        )}

        {/* Status */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-2 mt-4">
          Status
        </label>
        <div className="grid grid-cols-2 gap-2">
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
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1 mt-4">
          Nota
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none"
          placeholder="Adicionar nota..."
        />

        {/* ── Actions ── */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-brand-border">
          <div>
            {mode === "edit" && onDelete && (
              !confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-brand-red hover:text-brand-red/80"
                >
                  <Trash2 size={13} />
                  Excluir
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-red">Confirma?</span>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-brand-red font-semibold bg-brand-red/10 px-2 py-1 rounded hover:bg-brand-red/20"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-brand-muted hover:text-brand-text"
                  >
                    Não
                  </button>
                </div>
              )
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-brand-muted hover:text-brand-text rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="px-4 py-2 text-sm font-medium bg-brand-accent text-white rounded-lg hover:opacity-90 disabled:opacity-40"
            >
              {saving ? "Salvando..." : mode === "create" ? "Criar" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
