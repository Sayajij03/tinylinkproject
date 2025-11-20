-- backend/migrations/create_links_table.sql
-- Creates the `links` table for TinyLink

CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);
