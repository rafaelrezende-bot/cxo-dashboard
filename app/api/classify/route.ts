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
        system: `Você é um classificador de tarefas para o painel de CXO da Ivoire Agency.
Dado o nome de uma tarefa, classifique em UMA das 6 frentes estratégicas abaixo.

Frentes (use exatamente estes IDs):

- piloto: "Agent First" — aplicação da metodologia Agent First em projetos da agência. Exemplos: "Aplicar Agent First no projeto Newtrade", "Documentar baseline de custo do piloto", "Imersão no projeto Meta", "Escalar metodologia para novos projetos".

- educacao: "Educação IA" — aculturamento, diagnóstico cultural, workshops e processos com IA dentro da empresa. Exemplos: "Formulário diagnóstico para o time", "Conversas qualitativas com colaboradores", "Workshop de IA para área comercial", "Newsletter interna sobre IA".

- socios: "Alinhamento com Sócios" — governança, estrutura societária, reuniões estratégicas internas. Exemplos: "Reunião semanal com sócios", "Apresentar plano estratégico ao board", "Negociar alocação de tempo com diretoria", "Relatório consolidado 90 dias".

- pipeline: "Pipeline & Vendas Próprias" — prospecção, propostas comerciais, novos clientes. Exemplos: "Proposta para novo cliente", "Preparar apresentação comercial Conar", "Retomar conversa com prospect Aviva", "Fechar primeiro projeto próprio".

- cx: "CX & Templates Agent First" — experiência do cliente, templates de entrega, métricas de satisfação. Exemplos: "Adaptar template de diagnóstico", "Implantar métricas NPS", "Primeiro diagnóstico Agent First entregue", "Padronizar entregáveis do núcleo".

- custos: "Corte de Custos" — redução de custos, eficiência operacional, renegociações. Exemplos: "Revisar processo do cliente Bourbon para cortar custos", "Renegociar contrato de ferramentas", "Mapear despesas recorrentes", "Automatizar processo manual para economizar".

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
