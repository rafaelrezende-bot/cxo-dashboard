CREATE TABLE frentes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INT NOT NULL
);

CREATE TABLE frente_tasks (
  id TEXT PRIMARY KEY,
  frente_id TEXT REFERENCES frentes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_week INT NOT NULL,
  end_week INT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in-progress','done','blocked')),
  note TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE adhoc_tasks (
  id TEXT PRIMARY KEY,
  frente_id TEXT REFERENCES frentes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in-progress','done','blocked')),
  origin TEXT CHECK (origin IN ('proativa','reativa')),
  note TEXT DEFAULT '',
  date_added DATE NOT NULL,
  deadline DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kanban_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in-progress','done','blocked')),
  category TEXT CHECK (category IN ('comercial','cliente','interno','admin') OR category IS NULL),
  frente_id TEXT REFERENCES frentes(id),
  frente_auto_classified BOOLEAN DEFAULT false,
  frente_manual_override BOOLEAN DEFAULT false,
  week INT NOT NULL,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_frente_tasks BEFORE UPDATE ON frente_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_adhoc_tasks  BEFORE UPDATE ON adhoc_tasks  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kanban_tasks BEFORE UPDATE ON kanban_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
