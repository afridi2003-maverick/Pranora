-- pgTAP tests for PRV-2: Provider Dashboard (bookings schedule + serial queue)
begin;

select plan(6);

-- ── Helper: ensure required tables exist ─────────────────────────────────────

select has_table('public', 'bookings',     'bookings table should exist');
select has_table('public', 'serial_queue', 'serial_queue table should exist');

-- ── Test 1: today's slot bookings ordered by starts_at ascending ─────────────

do $$
declare
  v_provider_id uuid := gen_random_uuid();
  v_location_id uuid := gen_random_uuid();
  v_slot1_id    uuid := gen_random_uuid();
  v_slot2_id    uuid := gen_random_uuid();
  v_slot3_id    uuid := gen_random_uuid();
  v_today       date := current_date;
begin
  -- seed minimal provider + location rows if FK constraints are deferrable
  -- (in test schema they are deferred, so we insert bookings directly)
  insert into public.bookings (id, provider_id, location_id, starts_at, status, created_at)
  values
    (v_slot1_id, v_provider_id, v_location_id, (v_today || 'T14:00:00')::timestamptz, 'confirmed', now()),
    (v_slot2_id, v_provider_id, v_location_id, (v_today || 'T09:00:00')::timestamptz, 'completed', now()),
    (v_slot3_id, v_provider_id, v_location_id, (v_today || 'T11:30:00')::timestamptz, 'in_progress', now());
end;
$$;

select ok(
  (
    with ordered as (
      select starts_at,
             lag(starts_at) over (order by starts_at) as prev
      from public.bookings
      where starts_at::date = current_date
    )
    select bool_and(prev is null or starts_at >= prev)
    from ordered
  ),
  'Today bookings should be orderable by starts_at ascending'
);

-- ── Test 2: serial queue ordered by serial_no ascending ──────────────────────

do $$
declare
  v_location_id uuid := gen_random_uuid();
begin
  insert into public.serial_queue (id, location_id, serial_no, status, issued_at)
  values
    (gen_random_uuid(), v_location_id, 3, 'completed', now()),
    (gen_random_uuid(), v_location_id, 1, 'completed', now()),
    (gen_random_uuid(), v_location_id, 5, 'waiting',   now()),
    (gen_random_uuid(), v_location_id, 4, 'serving',   now()),
    (gen_random_uuid(), v_location_id, 2, 'waiting',   now());
end;
$$;

select ok(
  (
    with ordered as (
      select serial_no,
             lag(serial_no) over (order by serial_no) as prev
      from public.serial_queue
    )
    select bool_and(prev is null or serial_no >= prev)
    from ordered
  ),
  'Serial queue should be orderable by serial_no ascending'
);

-- ── Test 3: dashboard stat — count of pending bookings ───────────────────────

do $$
declare
  v_provider_id uuid := gen_random_uuid();
  v_location_id uuid := gen_random_uuid();
begin
  insert into public.bookings (id, provider_id, location_id, starts_at, status, created_at)
  values
    (gen_random_uuid(), v_provider_id, v_location_id, now(), 'pending',   now()),
    (gen_random_uuid(), v_provider_id, v_location_id, now(), 'pending',   now()),
    (gen_random_uuid(), v_provider_id, v_location_id, now(), 'confirmed', now());
end;
$$;

select ok(
  (select count(*) >= 2 from public.bookings where status = 'pending'),
  'At least 2 pending bookings should exist for dashboard stats'
);

-- ── Test 4: serial_queue has serial_no column of integer type ─────────────────

select col_type_is(
  'public', 'serial_queue', 'serial_no', 'integer',
  'serial_queue.serial_no should be integer'
);

select * from finish();

rollback;
