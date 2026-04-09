import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function getCurrentWeek(): number {
  const startDate = new Date("2026-04-06")
  const today = new Date()
  const diffMs = today.getTime() - startDate.getTime()
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
  return Math.max(1, Math.min(12, diffWeeks + 1))
}

export async function POST(req: Request) {
  // Auth check
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabase()

  // 1. Read current state
  const [{ data: frentes }, { data: frenteTasks }, { data: adhocTasks }, { data: kanbanTasks }] =
    await Promise.all([
      supabase.from("frentes").select("*").order("order_index"),
      supabase.from("frente_tasks").select("*"),
      supabase.from("adhoc_tasks").select("*"),
      supabase.from("kanban_tasks").select("*"),
    ])

  // 2. Calculate per-frente stats
  const stats = frentes?.map((f) => {
    const tasks = frenteTasks?.filter((t) => t.frente_id === f.id) ?? []
    const done = tasks.filter((t) => t.status === "done").length
    const inProgress = tasks.filter((t) => t.status === "in-progress").length
    const blocked = tasks.filter((t) => t.status === "blocked").length
    return {
      frente: f.name,
      total: tasks.length,
      done,
      inProgress,
      blocked,
      progress: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0,
    }
  })

  const totalTasks = (frenteTasks?.length ?? 0) + (adhocTasks?.length ?? 0)
  const totalDone = [
    ...(frenteTasks ?? []),
    ...(adhocTasks ?? []),
  ].filter((t) => t.status === "done").length

  const currentWeek = getCurrentWeek()
  const kanbanWeek = kanbanTasks?.filter((t) => t.week === currentWeek) ?? []

  // 3. Fetch last review for comparison
  const { data: lastReview } = await supabase
    .from("daily_reviews")
    .select("report_md, date")
    .order("date", { ascending: false })
    .limit(1)
    .single()

  // 4. Generate report with Claude Sonnet
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `Você é o assistente de gestão estratégica do Rafael, CXO da Ivoire.
Analise o estado atual do plano de 90 dias e gere uma revisão diária em português.

ESTADO ATUAL:
- Progresso geral: ${totalDone}/${totalTasks} tarefas concluídas (${totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0}%)
- Tarefas operacionais esta semana: ${kanbanWeek.length} (${kanbanWeek.filter((t) => t.status === "done").length} concluídas)
- Semana atual: ${currentWeek}/12

POR FRENTE:
${stats?.map((s) => `- ${s.frente}: ${s.progress}% (${s.done}/${s.total} concluídas, ${s.inProgress} em andamento, ${s.blocked} travadas)`).join("\n")}

${lastReview ? `RELATÓRIO ANTERIOR (${lastReview.date}):\n${lastReview.report_md.slice(0, 500)}...` : "Primeiro relatório do período."}

Gere um relatório conciso com:
1. **Situação geral** — 2-3 frases sobre o momento do plano
2. **Destaque positivo** — o que avançou bem
3. **Atenção necessária** — frentes travadas ou atrasadas (seja direto)
4. **Foco para amanhã** — 2-3 prioridades concretas

Tom: direto, honesto, sem enrolação. Máximo 300 palavras.`

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const reportMd = message.content[0].type === "text" ? message.content[0].text : ""

  // 5. Save to database
  await supabase.from("daily_reviews").insert({
    date: new Date().toISOString().split("T")[0],
    week_number: currentWeek,
    report_md: reportMd,
    stats,
  })

  return NextResponse.json({ ok: true, report: reportMd })
}
