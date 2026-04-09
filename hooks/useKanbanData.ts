"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { KanbanTask, Status, Frente } from "@/types"

export function useKanbanData(week: number) {
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([])
  const [frentes, setFrentes] = useState<Frente[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [kRes, fRes] = await Promise.all([
      supabase.from("kanban_tasks").select("*").eq("week", week).order("created_at"),
      supabase.from("frentes").select("*").order("order_index"),
    ])
    if (kRes.data) setKanbanTasks(kRes.data as KanbanTask[])
    if (fRes.data) setFrentes(fRes.data as Frente[])
    setLoading(false)
  }, [week])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    const channel = supabase
      .channel("kanban-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "kanban_tasks" }, () => {
        fetchAll()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

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

  const moveTask = async (id: string, newStatus: Status) => {
    return updateTask(id, { status: newStatus })
  }

  return { kanbanTasks, frentes, loading, createTask, updateTask, deleteTask, moveTask, refetch: fetchAll }
}
