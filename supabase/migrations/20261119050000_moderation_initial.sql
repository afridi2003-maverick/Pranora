-- ============================================================
-- ADM-2: Content Moderation & Abuse Prevention
-- Owner: Afridi (@afridi2003-maverick) | Branch: afridi | Sprint: S5
-- Depends on: ADM-1, RSC-1, ADP-1, (MAP-SEED)
-- Tables: content_reports, profiles (is_blocked flag)
-- RPCs: moderate_content, submit_content_report
-- ============================================================

-- ------------------------------------------------------------
-- 1. Profiles: User Blocking Support
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

create index if not exists profiles_is_blocked_idx
  on public.profiles(is_blocked) where is_blocked = true;

-- ------------------------------------------------------------
-- 2. Table: content_reports
-- ------------------------------------------------------------
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.report_target not null,
  target_id uuid not null,
  reason text not null,
  details text,
  evidence_urls text[] not null default '{}',
  status public.moderation_status not null default 'open',
  moderator_id uuid references public.profiles(id) on delete set null,
  moderator_notes text,
  action_taken text not null default 'none',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices
create index if not exists content_reports_status_idx
  on public.content_reports (status, created_at desc);

create index if not exists content_reports_target_idx
  on public.content_reports (target_type, target_id);

create index if not exists content_reports_reporter_idx
  on public.content_reports (reporter_id);

-- Updated_at trigger
drop trigger if exists trg_content_reports_updated_at on public.content_reports;
create trigger trg_content_reports_updated_at
  before update on public.content_reports
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 3. Row Level Security
-- ------------------------------------------------------------
alter table public.content_reports enable row level security;

drop policy if exists "content_reports: auth insert" on public.content_reports;
create policy "content_reports: auth insert"
  on public.content_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists "content_reports: reporter or admin select" on public.content_reports;
create policy "content_reports: reporter or admin select"
  on public.content_reports
  for select
  to authenticated
  using (auth.uid() = reporter_id or public.is_admin());

drop policy if exists "content_reports: admin update" on public.content_reports;
create policy "content_reports: admin update"
  on public.content_reports
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "content_reports: admin delete" on public.content_reports;
create policy "content_reports: admin delete"
  on public.content_reports
  for delete
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- 4. RPC: submit_content_report
-- ------------------------------------------------------------
create or replace function public.submit_content_report(
  p_target_type public.report_target,
  p_target_id uuid,
  p_reason text,
  p_details text default null,
  p_evidence_urls text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report_id uuid;
  v_caller_id uuid;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required to submit report';
  end if;

  insert into public.content_reports (
    reporter_id,
    target_type,
    target_id,
    reason,
    details,
    evidence_urls,
    status
  ) values (
    v_caller_id,
    p_target_type,
    p_target_id,
    p_reason,
    p_details,
    coalesce(p_evidence_urls, '{}'),
    'open'
  )
  returning id into v_report_id;

  return v_report_id;
end;
$$;

-- ------------------------------------------------------------
-- 5. RPC: moderate_content
--    Allows admin to remove/hide fake content, update clinic status, or block users
-- ------------------------------------------------------------
create or replace function public.moderate_content(
  p_report_id uuid,
  p_action text,
  p_notes text default null,
  p_block_user boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_report record;
  v_affected_user_id uuid;
  v_target_type public.report_target;
  v_target_id uuid;
  v_status public.moderation_status;
begin
  v_admin_id := auth.uid();
  if v_admin_id is null or not public.is_admin() then
    raise exception 'Unauthorized: Only administrators can moderate content';
  end if;

  select * into v_report
  from public.content_reports
  where id = p_report_id;

  if not found then
    raise exception 'Report not found: %', p_report_id;
  end if;

  v_target_type := v_report.target_type;
  v_target_id := v_report.target_id;

  -- 1. Apply content action if action is not dismissed
  if p_action in ('removed', 'hidden') then
    case v_target_type
      when 'adoption_listing' then
        update public.adoption_listings
        set status = 'removed', updated_at = now()
        where id = v_target_id
        returning posted_by into v_affected_user_id;

      when 'animal_report' then
        update public.animal_reports
        set status = 'rejected', updated_at = now()
        where id = v_target_id
        returning reporter_id into v_affected_user_id;

      when 'provider' then
        update public.providers
        set verification = 'suspended', updated_at = now()
        where id = v_target_id
        returning owner_user_id into v_affected_user_id;

      else
        null;
    end case;
  end if;

  -- 2. User blocking
  if p_block_user or p_action = 'user_blocked' then
    if v_target_type = 'user' then
      v_affected_user_id := v_target_id;
    end if;

    if v_affected_user_id is not null then
      update public.profiles
      set is_blocked = true, updated_at = now()
      where id = v_affected_user_id;
    end if;
  end if;

  -- 3. Determine status
  if p_action = 'dismissed' then
    v_status := 'dismissed';
  else
    v_status := 'actioned';
  end if;

  -- 4. Update the report record
  update public.content_reports
  set
    status = v_status,
    moderator_id = v_admin_id,
    moderator_notes = p_notes,
    action_taken = p_action,
    resolved_at = now(),
    updated_at = now()
  where id = p_report_id;

  return jsonb_build_object(
    'success', true,
    'report_id', p_report_id,
    'status', v_status,
    'action_taken', p_action,
    'affected_user_id', v_affected_user_id
  );
end;
$$;

-- Grant permissions
grant execute on function public.submit_content_report to authenticated;
grant execute on function public.moderate_content to authenticated;
