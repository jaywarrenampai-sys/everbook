-- Run this in Supabase → SQL Editor → New query

-- ── Projects table ──────────────────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'หนังสือของฉัน',
  layout_json jsonb not null default '{}'::jsonb,
  page_count  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on projects;
create trigger projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- ── Photo assets table ───────────────────────────────────────────────────────
create table if not exists project_photos (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  storage_path text not null,   -- path in Supabase Storage bucket
  preview_path text not null,   -- smaller preview path in Storage
  file_name    text not null,
  mime_type    text not null,
  width        int  not null,
  height       int  not null,
  file_size    bigint not null,
  created_at   timestamptz not null default now()
);

create index if not exists project_photos_project_id on project_photos(project_id);

-- ── Storage buckets ──────────────────────────────────────────────────────────
-- Run these separately in the Storage section OR via SQL:
insert into storage.buckets (id, name, public)
values ('everbook-originals', 'everbook-originals', false)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('everbook-previews', 'everbook-previews', true)
on conflict do nothing;

-- Storage policies — allow all for now (tighten when auth is added)
create policy "allow all originals" on storage.objects
  for all using (bucket_id = 'everbook-originals') with check (bucket_id = 'everbook-originals');

create policy "allow all previews" on storage.objects
  for all using (bucket_id = 'everbook-previews') with check (bucket_id = 'everbook-previews');

-- Row-level security (open for now — lock down when auth is added)
alter table projects enable row level security;
alter table project_photos enable row level security;

create policy "allow all on projects" on projects for all using (true) with check (true);
create policy "allow all on project_photos" on project_photos for all using (true) with check (true);
