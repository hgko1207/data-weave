-- DataWeave Phase 1 — single migration
-- See docs/PLAN.md §6

create table widgets (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  user_id uuid,
  config jsonb not null default '{"v":1}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index widgets_user_active_idx on widgets (user_id, active);
create index widgets_type_active_idx on widgets (type) where active = true;

-- Phase 2 will add: snapshots, notifications, push_subs, cron_runs (TODO 8)
