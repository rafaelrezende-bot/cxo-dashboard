import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { taskName } = await req.json()
    if (!taskName) {
      return NextResponse.json({ frente_id: null, confidence: 0 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey === "cole_aqui") {
      return NextResponse.json({ frente_id: null, confidence: 0 })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        system: `Você é um classificador de tarefas para o painel de CXO da Ivoire.
Dado o nome de uma tarefa, classifique em uma das 6 frentes estratégicas:
- piloto: projetos piloto Agent First, baselines, implementação nos clientes
- educacao: workshops de IA, diagnóstico cultural, formulários, aculturamento
- socios: alinhamento com sócios, apresentações estratégicas, relatórios
- pipeline: propostas comerciais, prospects, vendas próprias, novos clientes
- cx: templates de diagnóstico, métricas CX, NPS, experiência do cliente
- ia: biblioteca de prompts, ferramentas de IA, licenças, automações internas
Responda APENAS com JSON: { "frente_id": string, "confidence": number }
Se não conseguir classificar com confiança > 0.4, retorne { "frente_id": null, "confidence": 0 }`,
        messages: [{ role: "user", content: taskName }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ frente_id: null, confidence: 0 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ""
    const match = text.match(/\{[^}]+\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return NextResponse.json({
        frente_id: parsed.frente_id || null,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
      })
    }

    return NextResponse.json({ frente_id: null, confidence: 0 })
  } catch {
    return NextResponse.json({ frente_id: null, confidence: 0 })
  }
}
