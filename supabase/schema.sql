-- ═══════════════════════════════════════════════════════════════════════════
--  Bite: Mindful Eating — Supabase Schema
--  Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── User Goals ──────────────────────────────────────────────────────────────
-- Stored per user (currently single-user; add user_id if you add auth later)
create table if not exists user_goals (
  id           uuid primary key default gen_random_uuid(),
  calories     int  not null default 1900,
  protein_g    numeric(6,1) not null default 160,
  carbs_g      numeric(6,1) not null default 180,
  fat_g        numeric(6,1) not null default 60,
  fiber_g      numeric(6,1) not null default 30,
  updated_at   timestamptz not null default now()
);

-- Insert default goals row
insert into user_goals (calories, protein_g, carbs_g, fat_g, fiber_g)
values (1900, 160, 180, 60, 30)
on conflict do nothing;

-- ─── Meals ───────────────────────────────────────────────────────────────────
-- Each individual meal/food entry logged by the user or AI
create table if not exists meals (
  id           uuid primary key default gen_random_uuid(),
  logged_at    timestamptz not null default now(),   -- when it was eaten
  meal_name    text        not null,
  calories     int         not null,
  nutrition    jsonb       not null default '{}',    -- {protein_g, carbs_g, fat_g, fiber_g, ...}
  notes        text,
  is_cheat_day boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- Index for date-range queries
create index if not exists meals_logged_at_idx on meals (logged_at desc);

-- ─── Daily Summaries ─────────────────────────────────────────────────────────
-- Pre-aggregated per-day stats (updated whenever a meal is logged)
create table if not exists daily_summaries (
  id           uuid primary key default gen_random_uuid(),
  date         date        not null unique,          -- YYYY-MM-DD
  calories     int         not null default 0,
  nutrition    jsonb       not null default '{}',
  meal_count   int         not null default 0,
  is_cheat_day boolean     not null default false,
  updated_at   timestamptz not null default now()
);

create index if not exists daily_summaries_date_idx on daily_summaries (date desc);

-- ─── Chat History ────────────────────────────────────────────────────────────
-- Stores AI conversation for memory context
create table if not exists chat_messages (
  id           uuid primary key default gen_random_uuid(),
  role         text        not null check (role in ('user', 'assistant')),
  content      text        not null,
  logged_meal  jsonb,                                -- structured meal card if meal was logged
  created_at   timestamptz not null default now()
);

create index if not exists chat_messages_created_idx on chat_messages (created_at desc);

-- ─── Helper Function: Upsert Daily Summary ───────────────────────────────────
-- Called after every meal insert/update to keep daily_summaries in sync
create or replace function refresh_daily_summary(target_date date)
returns void language plpgsql as $$
declare
  v_calories   int;
  v_nutrition  jsonb;
  v_count      int;
begin
  select
    coalesce(sum(calories), 0),
    jsonb_build_object(
      'protein_g', coalesce(sum((nutrition->>'protein_g')::numeric), 0),
      'carbs_g',   coalesce(sum((nutrition->>'carbs_g')::numeric), 0),
      'fat_g',     coalesce(sum((nutrition->>'fat_g')::numeric), 0),
      'fiber_g',   coalesce(sum((nutrition->>'fiber_g')::numeric), 0)
    ),
    count(*)
  into v_calories, v_nutrition, v_count
  from meals
  where date_trunc('day', logged_at at time zone 'UTC') = target_date::timestamp;

  insert into daily_summaries (date, calories, nutrition, meal_count, updated_at)
  values (target_date, v_calories, v_nutrition, v_count, now())
  on conflict (date) do update set
    calories   = excluded.calories,
    nutrition  = excluded.nutrition,
    meal_count = excluded.meal_count,
    updated_at = excluded.updated_at;
end;
$$;

-- ─── Trigger: Auto-refresh daily summary on meal change ──────────────────────
create or replace function trigger_refresh_daily_summary()
returns trigger language plpgsql as $$
begin
  perform refresh_daily_summary(date_trunc('day', coalesce(NEW.logged_at, OLD.logged_at) at time zone 'UTC')::date);
  return NEW;
end;
$$;

drop trigger if exists meals_refresh_summary on meals;
create trigger meals_refresh_summary
  after insert or update or delete on meals
  for each row execute function trigger_refresh_daily_summary();

-- ─── Row Level Security (permissive for single-user, tighten if adding auth) ─
alter table meals           enable row level security;
alter table daily_summaries enable row level security;
alter table chat_messages   enable row level security;
alter table user_goals      enable row level security;

-- Allow all operations (single-user app — no auth yet)
create policy "allow_all_meals"           on meals           for all using (true) with check (true);
create policy "allow_all_daily_summaries" on daily_summaries for all using (true) with check (true);
create policy "allow_all_chat"            on chat_messages   for all using (true) with check (true);
create policy "allow_all_goals"           on user_goals      for all using (true) with check (true);
