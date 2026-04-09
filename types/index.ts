export type Status = 'pending' | 'in-progress' | 'done' | 'blocked'

export type Origin = 'proativa' | 'reativa'

export type Category = 'comercial' | 'cliente' | 'interno' | 'admin' | null

export interface Frente {
  id: string
  name: string
  color: string
  order_index: number
}

export interface FrenteTask {
  id: string
  frente_id: string
  name: string
  start_week: number
  end_week: number
  status: Status
  note: string
}

export interface AdHocTask {
  id: string
  frente_id: string
  name: string
  status: Status
  origin: Origin
  note: string
  date_added: string
  deadline: string | null
}

export interface KanbanTask {
  id: string
  name: string
  status: Status
  category: Category
  frente_id: string | null
  frente_auto_classified: boolean
  frente_manual_override: boolean
  week: number
  deadline: string | null
  created_at: string
}
