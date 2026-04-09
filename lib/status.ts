import type { Status } from '@/types'

export const STATUS_CONFIG: Record<Status, { label: string; colorClass: string; dotClass: string }> = {
  'pending':     { label: 'A Fazer',       colorClass: 'text-brand-muted',  dotClass: 'bg-brand-muted opacity-40' },
  'in-progress': { label: 'Em Andamento',  colorClass: 'text-brand-yellow', dotClass: 'bg-brand-yellow' },
  'done':        { label: 'Concluído',     colorClass: 'text-brand-green',  dotClass: 'bg-brand-green' },
  'blocked':     { label: 'Travado',       colorClass: 'text-brand-red',    dotClass: 'bg-brand-red' },
}
