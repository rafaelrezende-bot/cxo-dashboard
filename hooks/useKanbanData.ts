"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { FRENTE_MAP } from "@/lib/frentes"
import type { KanbanItem, KanbanTask, Status } from "@/types"

export function useKanbanData(week: number) {
  const [items, setItems] = useState<KanbanItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)

    const [planRes, opRes] = await Promise.all([
      // Fonte 1: tarefas do plano ativas nesta semana
      supabase
        .from("frente_tasks")
        .select("id, name, status, frente_id, start_week, end_week")
        .in("status", ["pending", "in-progress"])
        .lte("start_week", week)
        .gte("end_week", week),
      // Fonte 2: tarefas operacionais da semana
      supabase
        .from("kanban_tasks")
        .select("*")
        .eq("week", week)
        .order("created_at"),
    ])

    const planItems: KanbanItem[] = (planRes.data ?? []).map((t) => ({
      id: `plan_${t.id}`,
      name: t.name,
      status: t.status,
      source: "plan" as const,
      frente_id: t.frente_id,
      frente_color: FRENTE_MAP[t.frente_id]?.color,
      frente_name: FRENTE_MAP[t.frente_id]?.name,
    }))

    const opItems: KanbanItem[] = (opRes.data ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      source: "operational" as const,
      frente_id: t.frente_id ?? undefined,
      frente_color: t.frente_id ? FRENTE_MAP[t.frente_id]?.color : undefined,
      frente_name: t.frente_id ? FRENTE_MAP[t.frente_id]?.name : undefined,
      deadline: t.deadline ?? undefined,
      category: t.category ?? undefined,
    }))

    setItems([...planItems, ...opItems])
    setLoading(false)
  }, [week])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Real-time for kanban_tasks changes
  useEffect(() => {
    const channel = supabase
      .channel("kanban-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "kanban_tasks" }, () => {
        fetchAll()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  const moveItem = useCallback(async (itemId: string, newStatus: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item || item.status === newStatus) return

    // Optimistic update
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, status: newStatus } : i))

    if (item.source === "plan") {
      const realId = itemId.replace("plan_", "")
      await supabase.from("frente_tasks").update({ status: newStatus }).eq("id", realId)
    } else {
      await supabase.from("kanban_tasks").update({ status: newStatus }).eq("id", itemId)
    }
  }, [items])

  const updatePlanTask = async (planItemId: string, updates: Record<string, unknown>) => {
    const realId = planItemId.replace("plan_", "")
    const { error } = await supabase.from("frente_tasks").update(updates).eq("id", realId)
    if (!error) fetchAll()
    return error
  }

  const deletePlanTask = async (planItemId: string) => {
    const realId = planItemId.replace("plan_", "")
    const { error } = await supabase.from("frente_tasks").delete().eq("id", realId)
    if (!error) fetchAll()
    return error
  }

  const createTask = async (task: Omit<KanbanTask, "id" | "created_at">) => {
    const { error } = await supabase.from("kanban_tasks").insert(task)
    if (!error) fetchAll()
    return error
  }

  const updateTask = async (id: string, updates: Partial<KanbanTask>) => {
    const { error } = await supabase.from("kanban_tasks").update(updates).eq("id", id)
    if (!error) fetchAll()
    return error
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("kanban_tasks").delete().eq("id", id)
    if (!error) fetchAll()
    return error
  }

  return { items, loading, moveItem, updatePlanTask, deletePlanTask, createTask, updateTask, deleteTask, refetch: fetchAll }
}
