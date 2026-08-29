-- OGEN — Plateforme client
-- Schema, RLS policies and storage bucket for the client portal.
-- Run this once against a fresh Supabase project (SQL Editor, or `supabase db push`).

-- ---------------------------------------------------------------
-- Helper: is the current request authenticated as an admin?
-- Role is stored in the JWT's app_metadata (set server-side only,
-- via the admin-create-client / bootstrap-admin edge functions),
-- so it can never be self-granted by a client.
-- ---------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ---------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  project_name text not null,
  stage_index int not null default 0 check (stage_index between 0 and 5),
  stage_progress int not null default 0 check (stage_progress between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.contracts (
  client_id uuid primary key references public.clients (id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  category text not null default 'Autre' check (category in ('Logo', 'Image', 'Texte', 'Autre')),
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  label text not null,
  amount numeric(10, 2) not null,
  status text not null default 'En attente' check (status in ('En attente', 'Payée')),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists files_client_id_idx on public.files (client_id);
create index if not exists invoices_client_id_idx on public.invoices (client_id);

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------

alter table public.clients enable row level security;
alter table public.contracts enable row level security;
alter table public.files enable row level security;
alter table public.invoices enable row level security;

-- clients: a client sees only their own record; admin sees/edits all.
-- Writes are normally done through the admin-create-client /
-- admin-delete-client edge functions (service role), but the admin
-- dashboard also updates stage/progress directly as the admin user.
create policy "clients_select" on public.clients
  for select using (id = auth.uid() or public.is_admin());

create policy "clients_admin_write" on public.clients
  for all using (public.is_admin()) with check (public.is_admin());

-- contracts: client reads their own, only admin uploads/replaces.
create policy "contracts_select" on public.contracts
  for select using (client_id = auth.uid() or public.is_admin());

create policy "contracts_admin_write" on public.contracts
  for all using (public.is_admin()) with check (public.is_admin());

-- files: client manages their own uploads, admin can see/manage all.
create policy "files_select" on public.files
  for select using (client_id = auth.uid() or public.is_admin());

create policy "files_insert" on public.files
  for insert with check (client_id = auth.uid() or public.is_admin());

create policy "files_delete" on public.files
  for delete using (client_id = auth.uid() or public.is_admin());

-- invoices: client reads their own, only admin creates/edits/removes.
create policy "invoices_select" on public.invoices
  for select using (client_id = auth.uid() or public.is_admin());

create policy "invoices_admin_write" on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------
-- Storage — private bucket for client files & contracts.
-- Path convention: {client_id}/files/{uuid}-{filename}
--                   {client_id}/contract/{filename}
-- ---------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

create policy "client_files_select" on storage.objects
  for select using (
    bucket_id = 'client-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "client_files_insert" on storage.objects
  for insert with check (
    bucket_id = 'client-files'
    and (
      public.is_admin()
      or (
        (storage.foldername(name))[1] = auth.uid()::text
        and (storage.foldername(name))[2] = 'files'
      )
    )
  );

create policy "client_files_delete" on storage.objects
  for delete using (
    bucket_id = 'client-files'
    and (
      public.is_admin()
      or (
        (storage.foldername(name))[1] = auth.uid()::text
        and (storage.foldername(name))[2] = 'files'
      )
    )
  );
