-- ============================================================
-- CareerPilot — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension (already enabled on Supabase by default)
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------
-- Table: analyses
-- -------------------------------------------------------
create table if not exists public.analyses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  job_title   text,
  resume_tailor   text,
  cover_letter    text,
  interview_prep  text,
  skill_gap       text,
  created_at  timestamptz not null default now()
);

-- Row Level Security — users can only see their own rows
alter table public.analyses enable row level security;

create policy "Users can view own analyses"
  on public.analyses for select
  using ( auth.uid() = user_id );

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own analyses"
  on public.analyses for delete
  using ( auth.uid() = user_id );

-- Index for fast history lookups
create index if not exists analyses_user_id_created_at_idx
  on public.analyses (user_id, created_at desc);

-- -------------------------------------------------------
-- Storage buckets
-- (Create these in Supabase Dashboard → Storage, or via API)
-- Bucket name: resumes  (private)
-- -------------------------------------------------------
