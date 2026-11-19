-- ============================================================
-- Migration: 20261120000000_vet_schedule_rpc.sql
-- Description: APT-6 Vet schedule management (weekly hours, holidays, slots or serials)
-- ============================================================

-- ------------------------------------------------------------
-- 1. RPC: save_schedule_rules
-- Replaces/updates weekly availability rules for a location/vet
-- ------------------------------------------------------------
create or replace function public.save_schedule_rules(
  p_location_id uuid,
  p_vet_id uuid default null,
  p_rules jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rule jsonb;
  v_weekday smallint;
  v_start time;
  v_end time;
  v_mode schedule_mode;
  v_slot_mins smallint;
  v_capacity smallint;
  v_max_serials smallint;
  v_count integer := 0;
begin
  -- Validate caller has permission on this location
  -- (Provider owner, vet, or admin)
  if not (
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role)
  ) then
    raise exception 'Unauthorized to manage schedule for location %', p_location_id;
  end if;

  -- Delete existing rules for this location and vet
  if p_vet_id is null then
    delete from public.availability_rules
    where location_id = p_location_id
      and vet_id is null;
  else
    delete from public.availability_rules
    where location_id = p_location_id
      and vet_id = p_vet_id;
  end if;

  -- Insert new rules
  for v_rule in select * from jsonb_array_elements(p_rules)
  loop
    v_weekday     := (v_rule->>'weekday')::smallint;
    v_start       := (v_rule->>'startTime')::time;
    v_end         := (v_rule->>'endTime')::time;
    v_mode        := coalesce((v_rule->>'mode')::schedule_mode, 'slot'::schedule_mode);
    v_slot_mins   := coalesce((v_rule->>'slotMinutes')::smallint, 20);
    v_capacity    := coalesce((v_rule->>'capacity')::smallint, 1);
    v_max_serials := (v_rule->>'maxSerials')::smallint;

    if v_start >= v_end then
      raise exception 'Start time % must be before end time % for weekday %', v_start, v_end, v_weekday;
    end if;

    if v_mode = 'serial' and v_max_serials is null then
      v_max_serials := 50; -- Default sensible limit for serial session
    end if;

    insert into public.availability_rules (
      location_id,
      vet_id,
      weekday,
      start_time,
      end_time,
      mode,
      slot_minutes,
      capacity,
      max_serials
    ) values (
      p_location_id,
      p_vet_id,
      v_weekday,
      v_start,
      v_end,
      v_mode,
      v_slot_mins,
      v_capacity,
      v_max_serials
    );

    v_count := v_count + 1;
  end loop;

  return jsonb_build_object(
    'success', true,
    'locationId', p_location_id,
    'rulesSaved', v_count
  );
end;
$$;

grant execute on function public.save_schedule_rules(uuid, uuid, jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- 2. RPC: add_availability_exception (Holidays / Day off)
-- ------------------------------------------------------------
create or replace function public.add_availability_exception(
  p_location_id uuid,
  p_date date,
  p_is_closed boolean default true,
  p_note text default null,
  p_vet_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not (
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role)
  ) then
    raise exception 'Unauthorized to manage exceptions for location %', p_location_id;
  end if;

  -- Upsert: remove existing exception for this exact date/location/vet first
  delete from public.availability_exceptions
  where location_id = p_location_id
    and date = p_date
    and (
      (p_vet_id is null and vet_id is null) or
      (vet_id = p_vet_id)
    );

  insert into public.availability_exceptions (
    location_id,
    vet_id,
    date,
    is_closed,
    note
  ) values (
    p_location_id,
    p_vet_id,
    p_date,
    p_is_closed,
    p_note
  )
  returning id into v_id;

  return jsonb_build_object(
    'success', true,
    'id', v_id,
    'date', p_date,
    'isClosed', p_is_closed,
    'note', p_note
  );
end;
$$;

grant execute on function public.add_availability_exception(uuid, date, boolean, text, uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- 3. RPC: delete_availability_exception
-- ------------------------------------------------------------
create or replace function public.delete_availability_exception(
  p_exception_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.availability_exceptions
  where id = p_exception_id;

  return jsonb_build_object(
    'success', true,
    'deletedId', p_exception_id
  );
end;
$$;

grant execute on function public.delete_availability_exception(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- 4. RPC: get_vet_schedule
-- Returns weekly rules + upcoming exceptions
-- ------------------------------------------------------------
create or replace function public.get_vet_schedule(
  p_location_id uuid,
  p_vet_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_rules jsonb;
  v_exceptions jsonb;
begin
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'locationId', r.location_id,
      'vetId', r.vet_id,
      'weekday', r.weekday,
      'startTime', to_char(r.start_time, 'HH24:MI'),
      'endTime', to_char(r.end_time, 'HH24:MI'),
      'mode', r.mode,
      'slotMinutes', r.slot_minutes,
      'capacity', r.capacity,
      'maxSerials', r.max_serials
    ) order by r.weekday, r.start_time
  ), '[]'::jsonb)
  into v_rules
  from public.availability_rules r
  where r.location_id = p_location_id
    and (
      (p_vet_id is null and (r.vet_id is null or p_vet_id is null)) or
      (r.vet_id = p_vet_id)
    );

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', e.id,
      'locationId', e.location_id,
      'vetId', e.vet_id,
      'date', to_char(e.date, 'YYYY-MM-DD'),
      'isClosed', e.is_closed,
      'note', e.note
    ) order by e.date asc
  ), '[]'::jsonb)
  into v_exceptions
  from public.availability_exceptions e
  where e.location_id = p_location_id
    and e.date >= current_date
    and (
      (p_vet_id is null and (e.vet_id is null or p_vet_id is null)) or
      (e.vet_id = p_vet_id)
    );

  return jsonb_build_object(
    'locationId', p_location_id,
    'vetId', p_vet_id,
    'rules', v_rules,
    'exceptions', v_exceptions
  );
end;
$$;

grant execute on function public.get_vet_schedule(uuid, uuid) to anon, authenticated;
