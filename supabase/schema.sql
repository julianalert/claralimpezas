-- Clara — quote funnel, client spaces and CRM.
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to run again: every statement is idempotent.
--
-- Nothing here is readable from the browser: row level security is on and there are no policies,
-- so only the server (service_role key, see src/lib/supabase.ts) can read or write.

create extension if not exists pgcrypto;

-- One row per quote request.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,                 -- human reference shown to the client and the team: CL-7K2M9P
  token text not null unique,               -- secret part of the client-space URL
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  locale text not null default 'pt' check (locale in ('pt', 'en', 'fr')),
  stage text not null default 'new'
    check (stage in ('new', 'quoted', 'accepted', 'scheduled', 'done', 'lost')),

  -- contact
  name text not null,
  email text not null,
  phone text not null,
  zone text not null,

  -- request (quiz answers; shape in src/lib/funnel/types.ts)
  service text not null,
  answers jsonb not null default '{}'::jsonb,
  estimate_low integer,                     -- indicative range shown after the quiz, in euros
  estimate_high integer,

  -- quote and scheduling, managed from the CRM
  quote_amount numeric(10, 2),
  quote_note text,
  quote_sent_at timestamptz,
  quote_accepted_at timestamptz,
  scheduled_at timestamptz,
  notes text not null default '',           -- internal, never shown to the client

  -- client space
  checklist jsonb not null default '[]'::jsonb,

  -- automation bookkeeping (src/lib/funnel/automations.ts)
  quote_followup_sent_at timestamptz,
  reminder_sent_at timestamptz
);

create index if not exists leads_stage_idx on public.leads (stage);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Timeline of a request: status changes, messages, e-mails sent.
create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_at timestamptz not null default now(),
  kind text not null,                       -- see EventKind in src/lib/funnel/types.ts
  actor text not null check (actor in ('client', 'team', 'system')),
  body text,                                -- free text (messages)
  meta jsonb not null default '{}'::jsonb,
  client_visible boolean not null default true
);

create index if not exists lead_events_lead_idx on public.lead_events (lead_id, created_at desc);
create index if not exists lead_events_created_at_idx on public.lead_events (created_at desc);

-- Photos uploaded by the client (files live in the private "lead-photos" storage bucket).
create table if not exists public.lead_photos (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_at timestamptz not null default now(),
  path text not null unique,
  name text not null,
  size integer not null
);

create index if not exists lead_photos_lead_idx on public.lead_photos (lead_id, created_at);

-- CRM settings (which automatic e-mails are switched on).
create table if not exists public.crm_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table public.lead_photos enable row level security;
alter table public.crm_settings enable row level security;

-- Keeps leads.updated_at current.
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at before update on public.leads
  for each row execute function public.touch_updated_at();

-- Private bucket for client photos: 5 MB per file, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-photos', 'lead-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
