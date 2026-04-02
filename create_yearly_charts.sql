-- Run this in your Supabase SQL Editor to create the new yearly_charts table

CREATE TABLE yearly_charts (
  id text PRIMARY KEY,
  city_slug text NOT NULL,
  year integer NOT NULL,
  chart_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) but allow public read/write for now
-- (In a real production app you should lock down writing to admins only)
ALTER TABLE yearly_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON yearly_charts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON yearly_charts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON yearly_charts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON yearly_charts FOR DELETE USING (true);
