"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import type { Status, Category, Frente } from "@/types"
import { STATUS_CONFIG } from "@/lib/status"

interface KanbanTaskModalProps {
  mode: "create" | "edit"
  initialName?: string
  initialStatus?: Status
  initialCategory?: Category
  initialFrenteId?: string | null
  initialDeadline?: string | null
  frentes: Frente[]
  onSave: (data: { name: string; status: Status; category: Category; frente_id: string | null; deadline: string | null; frente_auto_classified: boolean; frente_manual_override: boolean }) => void
  onDelete?: () => void
  onClose: () => void
}

export function KanbanTaskModal({
  mode, initialName = "", initialStatus = "pending", initialCategory = null,
  initialFrenteId = null, initialDeadline = null, frentes, onSave, onDelete, onClose,
}: KanbanTaskModalProps) {
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState<Status>(initialStatus)
  const [category, setCategory] = useState<Category>(initialCategory)
  const [frenteId, setFrenteId] = useState<string | null>(initialFrenteId)
  const [deadline, setDeadline] = useState(initialDeadline || "")
  const [suggestion, setSuggestion] = useState<{ frente_id: string | null; confidence: number } | null>(null)
  const [manualOverride, setManualOverride] = useState(false)
  const [showFrenteSelect, setShowFrenteSelect] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (mode !== "create" || !name || name.length < 5) {
      setSuggestion(null)
      return
    }
    if (manualOverride) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskName: name }),
        })
        if (res.ok) {
          const data = await res.json()
          setSuggestion(data)
          if (data.confidence > 0.5 && data.frente_id) {
            setFrenteId(data.frente_id)
          }
        }
      } catch { /* ignore */ }
    }, 600)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [name, mode, manualOverride])

  const suggestedFrente = suggestion?.frente_id ? frentes.find((f) => f.id === suggestion.frente_id) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-brand-text font-semibold">{mode === "create" ? "Nova tarefa" : "Editar tarefa"}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text p-1"><X size={18} /></button>
        </div>

        {/* Name */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">Tarefa</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent mb-1"
          placeholder="Descreva a tarefa..."
          autoFocus
        />

        {/* AI suggestion */}
        {suggestion && suggestedFrente && !manualOverride && (
          <div className={`flex items-center gap-2 text-xs mb-3 px-1 ${suggestion.confidence > 0.5 ? "text-brand-accent" : "text-brand-muted"}`}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: suggestedFrente.color }} />
            {suggestion.confidence > 0.5 ? "Sugestão" : "Possível"}: {suggestedFrente.name}
            <button onClick={() => { setShowFrenteSelect(true); setManualOverride(true) }} className="underline opacity-70 hover:opacity-100">Alterar</button>
          </div>
        )}

        {/* Frente select */}
        {(showFrenteSelect || mode === "edit") && (
          <>
            <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1 mt-3">Frente</label>
            <select
              value={frenteId || ""}
              onChange={(e) => { setFrenteId(e.target.value || null); setManualOverride(true) }}
              className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent mb-3"
            >
              <option value="">Sem frente</option>
              {frentes.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </>
        )}

        {/* Category */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1 mt-3">Categoria</label>
        <select
          value={category || ""}
          onChange={(e) => setCategory((e.target.value || null) as Category)}
          className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent mb-3"
        >
          <option value="">Sem categoria</option>
          <option value="comercial">Comercial</option>
          <option value="cliente">Cliente</option>
          <option value="interno">Interno</option>
          <option value="admin">Admin</option>
        </select>

        {/* Deadline */}
        <label className="block text-[11px] text-brand-muted uppercase tracking-wider mb-1">Prazo</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full bg-brand-surface2 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent mb-4"
        />

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

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {mode === "edit" && onDelete && (
              <button onClick={onDelete} className="text-xs text-brand-red hover:text-brand-red/80">Excluir</button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-brand-muted hover:text-brand-text rounded-lg">Cancelar</button>
            <button
              onClick={() => onSave({
                name, status, category,
                frente_id: frenteId,
                deadline: deadline || null,
                frente_auto_classified: !!suggestion?.frente_id && !manualOverride,
                frente_manual_override: manualOverride,
              })}
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium bg-brand-accent text-white rounded-lg hover:opacity-90 disabled:opacity-40"
            >
              {mode === "create" ? "Criar" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
