-- Run in Supabase → SQL Editor → New query
-- Adds tracking + shipped_at columns to orders table (run after orders.sql)

alter table orders
  add column if not exists tracking_number text,
  add column if not exists shipped_at      timestamptz;
