-- Run this in Supabase → SQL Editor → New query
-- Adds the orders table (run after schema.sql)

create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid references projects(id) on delete set null,

  -- Pricing snapshot at time of order
  quantity        int  not null default 1,
  unit_price      int  not null,   -- in Thai Baht (no decimals)
  total_price     int  not null,
  page_count      int  not null,

  -- Thai shipping address
  full_name       text not null,
  phone           text not null,
  address_line    text not null,
  sub_district    text not null,
  district        text not null,
  province        text not null,
  postal_code     text not null,

  -- Order lifecycle
  status          text not null default 'pending_payment',
  -- status values: pending_payment | paid | printing | shipped | delivered | cancelled

  -- Payment (populated after Session 7)
  payment_method  text,           -- 'promptpay' | 'card'
  payment_ref     text,           -- gateway transaction reference
  paid_at         timestamptz,

  -- Print PDF (populated after payment)
  print_pdf_path  text,           -- path in Supabase Storage

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- RLS (open for now — lock down with auth in future)
alter table orders enable row level security;
create policy "allow all on orders" on orders for all using (true) with check (true);

create index if not exists orders_project_id  on orders(project_id);
create index if not exists orders_status      on orders(status);
create index if not exists orders_created_at  on orders(created_at desc);
