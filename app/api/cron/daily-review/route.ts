import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

function getCurrentWeek(): number {
  const start = new Date((process.env.PLAN_START_DATE || "2026-04-06") + "T00:00:00")
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.min(12, Math.floor(diffDays / 7) + 1))
}

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && cronSecret !== "cole_aqui" && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const week = getCurrentWeek()

  // Fetch all data
  const [ftRes, ahRes, kRes] = await Promise.all([
    supabase.from("frente_tasks").select("*"),
    supabase.from("adhoc_tasks").select("*"),
    supabase.from("kanban_tasks").select("*").eq("week", week),
  ])

  const frenteTasks = ftRes.data || []
  const adHocTasks = ahRes.data || []
  const kanbanTasks = kRes.data || []

  // Apply progression rules
  let updatesApplied = 0
  const statusRank: Record<string, number> = { pending: 0, "in-progress": 1, done: 2, blocked: 3 }
  const changes: string[] = []

  for (const kt of kanbanTasks) {
    if (!kt.frente_id) continue

    // Match frente_tasks
    for (const ft of frenteTasks) {
      if (ft.frente_id !== kt.frente_id) continue
      if (ft.name.toLowerCase().includes(kt.name.toLowerCase().slice(0, 15)) || kt.name.toLowerCase().includes(ft.name.toLowerCase().slice(0, 15))) {
        const currentRank = statusRank[ft.status] ?? 0
        const newRank = statusRank[kt.status] ?? 0
        if (newRank > currentRank && kt.status !== "blocked") {
          await supabase.from("frente_tasks").update({ status: kt.status }).eq("id", ft.id)
          changes.push(`${ft.name}: ${ft.status} → ${kt.status}`)
          updatesApplied++
        }
        if (kt.status === "blocked" && ft.status !== "blocked" && ft.status !== "done") {
          await supabase.from("frente_tasks").update({ status: "blocked" }).eq("id", ft.id)
          changes.push(`${ft.name}: ${ft.status} → blocked`)
          updatesApplied++
        }
      }
    }
  }

  // Generate report
  const allTasks = [...frenteTasks, ...adHocTasks]
  const doneCount = allTasks.filter((t) => t.status === "done").length
  const inProgressCount = allTasks.filter((t) => t.status === "in-progress").length
  const blockedCount = allTasks.filter((t) => t.status === "blocked").length
  const kDone = kanbanTasks.filter((t) => t.status === "done").length
  const kPending = kanbanTasks.filter((t) => t.status === "pending").length
  const kInProgress = kanbanTasks.filter((t) => t.status === "in-progress").length
  const kBlocked = kanbanTasks.filter((t) => t.status === "blocked").length

  const proativa = adHocTasks.filter((t) => t.origin === "proativa").length
  const reativa = adHocTasks.filter((t) => t.origin === "reativa").length

  const now = new Date()
  const dateStr = now.toLocaleDateString("pt-BR")
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  // Find upcoming deadlines
  const upcoming = [...adHocTasks, ...kanbanTasks]
    .filter((t) => t.deadline && t.status !== "done")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3)

  const report = `# Revisão Diária — ${dateStr}
*Gerado automaticamente às ${timeStr}*

## O que mudou
${changes.length > 0 ? changes.map((c) => `- ${c}`).join("\n") : "Nenhuma atualização necessária."}

## Inconsistências identificadas
${blockedCount > 0 ? `- ${blockedCount} tarefa(s) travada(s) no plano` : "- Nenhuma inconsistência crítica identificada."}
${Math.abs(proativa - reativa) / Math.max(proativa + reativa, 1) > 0.6 ? `- Desequilíbrio proativa/reativa: ${proativa}/${reativa}` : ""}

## Snapshot da semana ${week}
- Tarefas ativas no plano: ${inProgressCount}
- Concluídas (total): ${doneCount}
- Kanban: ${kPending} a fazer / ${kInProgress} em andamento / ${kDone} concluídas / ${kBlocked} travadas
- Ratio proativa/reativa: ${proativa}/${reativa}

## Próximos vencimentos
${upcoming.length > 0 ? upcoming.map((t) => `- ${t.name} — ${t.deadline}`).join("\n") : "Nenhum vencimento próximo."}
`

  // Save report
  try {
    fs.writeFileSync(path.join(process.cwd(), "revisao-diaria.md"), report, "utf-8")
  } catch {
    // In serverless, fs write may not persist — that's OK
  }

  return NextResponse.json({ success: true, updatesApplied, report })
}
