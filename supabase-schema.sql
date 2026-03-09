-- Run this in your Supabase SQL Editor to correctly structure tables for the frontend connection

-- 1. Create cities table
CREATE TABLE cities (
  id text PRIMARY KEY,
  name text NOT NULL,
  timing text NOT NULL,
  "yesterdayResult" text DEFAULT '--',
  "todayResult" text DEFAULT '',
  slug text,
  "group" text DEFAULT 'main',
  "order" integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create khaiwals table
CREATE TABLE khaiwals (
  id text PRIMARY KEY,
  name text NOT NULL,
  "whatsappNumber" text NOT NULL,
  cities jsonb DEFAULT '[]'::jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We use "text" for id instead of uuid, because local storage generated IDs were like "1", "2" or Date.now().toString().

-- Enable RLS (Row Level Security) but allow public read/write for now
-- (In a real production app you should lock down writing to admins only)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE khaiwals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON cities FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON cities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON cities FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON cities FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON khaiwals FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON khaiwals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON khaiwals FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON khaiwals FOR DELETE USING (true);

-- Insert initial data (Wait to run this file! We will migrate old local storage programmatically from the Admin Panel)
