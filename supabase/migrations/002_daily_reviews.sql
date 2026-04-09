CREATE TABLE IF NOT EXISTS daily_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  week_number INT NOT NULL,
  report_md TEXT NOT NULL,
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
