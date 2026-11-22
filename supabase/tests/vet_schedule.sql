-- pgTAP test suite for APT-6: Vet Schedule & Availability (weekly hours, holidays, slots or serials)
begin;

select plan(7);

-- ── 1. Table existence ───────────────────────────────────────────────────────

select has_table('public', 'availability_rules',      'availability_rules table exists');
select has_table('public', 'availability_exceptions', 'availability_exceptions table exists');

-- ── 2. Column checks ─────────────────────────────────────────────────────────

select col_type_is('public', 'availability_rules', 'mode', 'schedule_mode',
  'availability_rules.mode should be schedule_mode enum');

select col_type_is('public', 'availability_rules', 'weekday', 'smallint',
  'availability_rules.weekday should be smallint');

select col_type_is('public', 'availability_exceptions', 'is_closed', 'boolean',
  'availability_exceptions.is_closed should be boolean');

-- ── 3. Constraint test: start_time < end_time ────────────────────────────────

do $$
declare
  v_loc uuid := gen_random_uuid();
  v_failed boolean := false;
begin
  begin
    insert into public.availability_rules (
      location_id, weekday, start_time, end_time, mode, slot_minutes, capacity
    ) values (
      v_loc, 1, '18:00:00'::time, '09:00:00'::time, 'slot', 20, 1
    );
  exception when check_violation then
    v_failed := true;
  end;

  if not v_failed then
    raise exception 'Expected check_violation on start_time >= end_time';
  end if;
end;
$$;

select pass('chk_availability_time constraint properly rejects start_time >= end_time');

-- ── 4. Serial mode requires max_serials or default ───────────────────────────

do $$
declare
  v_loc uuid := gen_random_uuid();
  v_failed boolean := false;
begin
  begin
    insert into public.availability_rules (
      location_id, weekday, start_time, end_time, mode, slot_minutes, capacity, max_serials
    ) values (
      v_loc, 2, '09:00:00'::time, '13:00:00'::time, 'serial', 20, 1, null
    );
  exception when check_violation then
    v_failed := true;
  end;

  if not v_failed then
    raise exception 'Expected check_violation when mode=serial has null max_serials';
  end if;
end;
$$;

select pass('chk_availability_mode constraint enforces max_serials when mode is serial');

select * from finish();

rollback;
