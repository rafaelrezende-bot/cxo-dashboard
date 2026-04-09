const PLAN_START = process.env.NEXT_PUBLIC_PLAN_START_DATE || process.env.PLAN_START_DATE || '2026-04-06'

export function getPlanStartDate(): Date {
  return new Date(PLAN_START + 'T00:00:00')
}

export function getCurrentWeek(): number {
  const start = getPlanStartDate()
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.min(12, Math.floor(diffDays / 7) + 1))
}

export function getWeekStartDate(week: number): Date {
  const start = getPlanStartDate()
  const d = new Date(start)
  d.setDate(d.getDate() + (week - 1) * 7)
  return d
}

export function getWeekEndDate(week: number): Date {
  const d = getWeekStartDate(week)
  d.setDate(d.getDate() + 6)
  return d
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export function getMonthLabel(monthNum: 1 | 2 | 3): string {
  const labels: Record<number, string> = {
    1: 'Mês 1 — Provar a Tese',
    2: 'Mês 2 — Operacionalizar',
    3: 'Mês 3 — Escalar',
  }
  return labels[monthNum]
}
