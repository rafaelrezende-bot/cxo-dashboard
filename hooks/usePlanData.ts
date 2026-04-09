"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Frente, FrenteTask, AdHocTask } from "@/types"

export function usePlanData() {
  const [frentes, setFrentes] = useState<Frente[]>([])
  const [frenteTasks, setFrenteTasks] = useState<FrenteTask[]>([])
  const [adHocTasks, setAdHocTasks] = useState<AdHocTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAll() {
    setLoading(true)
    try {
      const [fRes, ftRes, ahRes] = await Promise.all([
        supabase.from("frentes").select("*").order("order_index"),
        supabase.from("frente_tasks").select("*"),
        supabase.from("adhoc_tasks").select("*").order("date_added"),
      ])
      if (fRes.error) throw fRes.error
      if (ftRes.error) throw ftRes.error
      if (ahRes.error) throw ahRes.error
      setFrentes(fRes.data as Frente[])
      setFrenteTasks(ftRes.data as FrenteTask[])
      setAdHocTasks(ahRes.data as AdHocTask[])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  async function updateFrenteTask(id: string, updates: Partial<FrenteTask>) {
    const { error } = await supabase.from("frente_tasks").update(updates).eq("id", id)
    if (!error) fetchAll()
    return error
  }

  async function updateAdHocTask(id: string, updates: Partial<AdHocTask>) {
    const { error } = await supabase.from("adhoc_tasks").update(updates).eq("id", id)
    if (!error) fetchAll()
    return error
  }

  useEffect(() => { fetchAll() }, [])

  return { frentes, frenteTasks, adHocTasks, loading, error, updateFrenteTask, updateAdHocTask, refetch: fetchAll }
}
