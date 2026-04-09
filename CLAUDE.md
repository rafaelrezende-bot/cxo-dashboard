# cxo-dashboard — CLAUDE.md

## Sobre o projeto
Painel pessoal de gestão para CXO da Ivoire. Duas views:
1. Plano 90 Dias — Gantt estratégico com frentes e milestones
2. Tarefas da Semana — Kanban operacional com 4 colunas

---

## DESIGN — TRAVA VISUAL
Não alterar cores nem layout sem instrução explícita do usuário.
Decisões de design são tomadas no Cowork, não no Code.

### Paleta — usar APENAS estes tokens (definidos em tailwind.config.ts como colors.brand.*)
- brand.bg       #0f1117   background da página
- brand.surface  #1a1d27   cards, containers
- brand.surface2 #242835   headers de seção, inputs
- brand.border   #2e3344   bordas
- brand.text     #e4e6ed   texto principal
- brand.muted    #8b8fa3   texto secundário
- brand.accent   #6c8cff   ações primárias (azul)
- brand.green    #34d399   status concluído
- brand.yellow   #fbbf24   status em andamento
- brand.red      #f87171   status travado / erros
- brand.purple   #a78bfa   frente Educação IA
- brand.orange   #fb923c   avisos, prazos próximos
- brand.pink     #f472b6   frente Pipeline
- brand.sky      #38bdf8   frente Biblioteca IA

Nunca usar cores fora desta paleta. Nunca hardcodar hex values em componentes.

### Layout — regras fixas (não alterar)
Kanban: 4 colunas em desktop, 2 em tablet (≤1100px), 1 em mobile (≤900px)
Gantt: grid 220px + 1fr, timeline sempre 12 colunas (semanas 1–12)
Navegação: abas horizontais no topo — nunca sidebar lateral
Exatamente 2 abas: "Plano 90 Dias" e "Tarefas da Semana"

### Bordas e arredondamento
Cards grandes: rounded-xl (12px)
Cards menores, botões: rounded-lg (8px)
Tags, badges: rounded (4px)

### Tipografia
Fonte: system-ui / -apple-system — sem fontes externas, sem Google Fonts

---

## LÓGICA — pode modificar livremente
Toda lógica de negócio, hooks, queries Supabase, API routes, funções utilitárias.

## Status (unificados em todo o sistema)
pending     = "A Fazer"
in-progress = "Em Andamento"
done        = "Concluído"
blocked     = "Travado"
