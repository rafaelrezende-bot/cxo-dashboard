export const FRENTE_MAP: Record<string, { color: string; name: string }> = {
  piloto:   { color: '#6c8cff', name: 'Agent First' },
  educacao: { color: '#a78bfa', name: 'Educação IA' },
  socios:   { color: '#fbbf24', name: 'Alinhamento com Sócios' },
  pipeline: { color: '#f472b6', name: 'Pipeline & Vendas Próprias' },
  cx:       { color: '#34d399', name: 'CX & Templates Agent First' },
  custos:   { color: '#fb923c', name: 'Corte de Custos' },
}

export const FRENTE_OPTIONS = Object.entries(FRENTE_MAP).map(([id, { name }]) => ({ id, name }))
