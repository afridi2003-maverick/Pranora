-- ============================================================
-- APT-1a: Booking RPCs (available_slots, create_booking,
--         cancel_booking, reschedule_booking)
-- Tables: availability_rules, availability_exceptions, bookings
-- Owner: tain | Branch: tain | Sprint: S2
-- Depends on: DB-5, DB-4 (providers), DB-3 (pets)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Ensure foreign key constraints
-- ------------------------------------------------------------
do $$
begin
  -- availability_rules -> provider_locations
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'provider_locations') then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_availability_rules_location') then
      alter table public.availability_rules
        add constraint fk_availability_rules_location foreign key (location_id) references public.provider_locations(id) on delete cascade;
    end if;
  end if;

  -- availability_rules -> vets
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'vets') then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_availability_rules_vet') then
      alter table public.availability_rules
        add constraint fk_availability_rules_vet foreign key (vet_id) references public.vets(id) on delete set null;
    end if;
  end if;

  -- availability_exceptions -> provider_locations
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'provider_locations') then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_availability_exceptions_location') then
      alter table public.availability_exceptions
        add constraint fk_availability_exceptions_location foreign key (location_id) references public.provider_locations(id) on delete cascade;
    end if;
  end if;

  -- availability_exceptions -> vets
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'vets') then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_availability_exceptions_vet') then
      alter table public.availability_exceptions
        add constraint fk_availability_exceptions_vet foreign key (vet_id) references public.vets(id) on delete set null;
    end if;
  end if;

  -- bookings -> provider_locations
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'provider_locations') then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_bookings_location') then
      alter table public.bookings
        add constraint fk_bookings_location foreign key (location_id) references public.provider_locations(id);
    end if;
  end if;

  -- bookings -> vets
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'vets') then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_bookings_vet') then
      alter table public.bookings
        add constraint fk_bookings_vet foreign key (vet_id) references public.vets(id) on delete set null;
    end if;
  end if;

  -- bookings -> provider_services
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'provider_services') then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_bookings_service') then
      alter table public.bookings
        add constraint fk_bookings_service foreign key (provider_service_id) references public.provider_services(id);
    end if;
  end if;

  -- bookings -> pets
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'pets') then
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_bookings_pet') then
      alter table public.bookings
        add constraint fk_bookings_pet foreign key (pet_id) references public.pets(id) on delete set null;
    end if;
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. RPC: available_slots
--    Returns available slots or serials for a given location,
--    optional vet, and target date.
-- ------------------------------------------------------------
create or replace function public.available_slots(
  p_location_id uuid,
  p_vet_id uuid default null,
  p_date date default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_target_date date;
  v_weekday smallint;
  v_exception record;
  v_rule record;
  v_slots jsonb := '[]'::jsonb;
  v_serials jsonb := '[]'::jsonb;
  v_next_serial smallint := null;
  v_slot_start time;
  v_slot_end time;
  v_slot_start_ts timestamptz;
  v_slot_end_ts timestamptz;
  v_session_start_ts timestamptz;
  v_session_end_ts timestamptz;
  v_booked_count int;
  v_rem_cap int;
  v_is_avail boolean;
  v_booked_serials int[];
  v_i int;
  v_max_serials int;
begin
  v_target_date := coalesce(p_date, (now() at time zone 'Asia/Dhaka')::date);
  v_weekday := extract(dow from v_target_date)::smallint;

  -- 1. Check for clinic/vet closure exception on this date
  select * into v_exception
  from public.availability_exceptions
  where location_id = p_location_id
    and date = v_target_date
    and (
      (p_vet_id is null and (vet_id is null or vet_id is not null)) or
      (p_vet_id is not null and (vet_id is null or vet_id = p_vet_id))
    )
    and is_closed = true
  order by (vet_id is not null) desc
  limit 1;

  if v_exception.id is not null then
    return jsonb_build_object(
      'mode', 'slot',
      'date', to_char(v_target_date, 'YYYY-MM-DD'),
      'locationId', p_location_id,
      'vetId', p_vet_id,
      'isClosed', true,
      'note', v_exception.note,
      'slots', '[]'::jsonb,
      'serials', '[]'::jsonb,
      'nextAvailableSerial', null
    );
  end if;

  -- 2. Find matching availability rule for this weekday
  select * into v_rule
  from public.availability_rules
  where location_id = p_location_id
    and weekday = v_weekday
    and (
      (p_vet_id is not null and vet_id = p_vet_id) or
      (p_vet_id is not null and vet_id is null) or
      (p_vet_id is null)
    )
  order by (case when p_vet_id is not null and vet_id = p_vet_id then 1 else 2 end), vet_id nulls first
  limit 1;

  if v_rule.id is null then
    -- No schedule rule defined for this weekday
    return jsonb_build_object(
      'mode', 'slot',
      'date', to_char(v_target_date, 'YYYY-MM-DD'),
      'locationId', p_location_id,
      'vetId', p_vet_id,
      'isClosed', false,
      'slots', '[]'::jsonb,
      'serials', '[]'::jsonb,
      'nextAvailableSerial', null
    );
  end if;

  -- 3. Generate slots or serials depending on schedule mode
  if v_rule.mode = 'slot' then
    v_slot_start := v_rule.start_time;

    while v_slot_start + (v_rule.slot_minutes || ' minutes')::interval <= v_rule.end_time loop
      v_slot_end := (v_slot_start + (v_rule.slot_minutes || ' minutes')::interval)::time;
      v_slot_start_ts := (v_target_date + v_slot_start) at time zone 'Asia/Dhaka';
      v_slot_end_ts := (v_target_date + v_slot_end) at time zone 'Asia/Dhaka';

      -- Count existing active bookings for this slot
      select count(*) into v_booked_count
      from public.bookings
      where location_id = p_location_id
        and (
          (p_vet_id is not null and vet_id = p_vet_id) or
          (p_vet_id is null and (v_rule.vet_id is null or vet_id = v_rule.vet_id))
        )
        and starts_at = v_slot_start_ts
        and status in ('pending', 'confirmed');

      v_rem_cap := greatest(0, coalesce(v_rule.capacity, 1) - v_booked_count);
      v_is_avail := (v_rem_cap > 0);

      v_slots := v_slots || jsonb_build_object(
        'startsAt', to_char(v_slot_start_ts at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'endsAt', to_char(v_slot_end_ts at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'isAvailable', v_is_avail,
        'capacity', coalesce(v_rule.capacity, 1),
        'remainingCapacity', v_rem_cap
      );

      v_slot_start := v_slot_end;
    end loop;

    return jsonb_build_object(
      'mode', 'slot',
      'date', to_char(v_target_date, 'YYYY-MM-DD'),
      'locationId', p_location_id,
      'vetId', p_vet_id,
      'isClosed', false,
      'slots', v_slots,
      'serials', '[]'::jsonb,
      'nextAvailableSerial', null
    );

  else
    -- Serial mode
    v_session_start_ts := (v_target_date + v_rule.start_time) at time zone 'Asia/Dhaka';
    v_session_end_ts := (v_target_date + v_rule.end_time) at time zone 'Asia/Dhaka';
    v_max_serials := coalesce(v_rule.max_serials, 50);

    -- Get already assigned serial numbers for this session
    select array_agg(serial_no) into v_booked_serials
    from public.bookings
    where location_id = p_location_id
      and (
        (p_vet_id is not null and vet_id = p_vet_id) or
        (p_vet_id is null and (v_rule.vet_id is null or vet_id = v_rule.vet_id))
      )
      and starts_at = v_session_start_ts
      and serial_no is not null
      and status in ('pending', 'confirmed');

    for v_i in 1 .. v_max_serials loop
      v_is_avail := not (v_i = any(coalesce(v_booked_serials, '{}')));

      if v_is_avail and v_next_serial is null then
        v_next_serial := v_i;
      end if;

      v_serials := v_serials || jsonb_build_object(
        'serialNo', v_i,
        'sessionStart', to_char(v_session_start_ts at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'sessionEnd', to_char(v_session_end_ts at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'isAvailable', v_is_avail
      );
    end loop;

    return jsonb_build_object(
      'mode', 'serial',
      'date', to_char(v_target_date, 'YYYY-MM-DD'),
      'locationId', p_location_id,
      'vetId', p_vet_id,
      'isClosed', false,
      'slots', '[]'::jsonb,
      'serials', v_serials,
      'nextAvailableSerial', v_next_serial
    );
  end if;
end;
$$;

grant execute on function public.available_slots(uuid, uuid, date) to anon, authenticated;

-- ------------------------------------------------------------
-- 3. RPC: create_booking
--    Atomically validates availability and creates a booking
--    with short PRN- code and race-free lock.
-- ------------------------------------------------------------
create or replace function public.create_booking(
  p_location_id uuid,
  p_provider_service_id uuid,
  p_type booking_type,
  p_pet_id uuid default null,
  p_vet_id uuid default null,
  p_starts_at timestamptz default null,
  p_ends_at timestamptz default null,
  p_serial_no smallint default null,
  p_address_id uuid default null,
  p_problem_note text default null,
  p_attachments text[] default '{}',
  p_payment_method payment_method default 'cash'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
  v_booking_id uuid;
  v_code text;
  v_service_price numeric(10,2);
  v_duration_min smallint;
  v_rule record;
  v_weekday smallint;
  v_date date;
  v_current_booked int;
  v_assigned_serial smallint;
  v_ends_at timestamptz;
  v_starts_at timestamptz;
begin
  -- 1. Caller authentication
  v_caller_id := auth.uid();
  if v_caller_id is null then
    if current_user in ('postgres', 'supabase_admin') then
      -- Pick test user in automated test / superuser context
      select id into v_caller_id from public.profiles order by created_at asc limit 1;
    end if;
  end if;

  if v_caller_id is null then
    raise exception 'Authentication required to create booking';
  end if;

  -- 2. Verify and fetch provider service details
  select price, duration_min
  into v_service_price, v_duration_min
  from public.provider_services
  where id = p_provider_service_id and location_id = p_location_id;

  if v_service_price is null and not exists (select 1 from public.provider_services where id = p_provider_service_id) then
    raise exception 'Selected service is not offered at this location';
  end if;

  v_starts_at := p_starts_at;
  v_ends_at := p_ends_at;

  -- 3. Slot or Serial validation
  if p_type = 'slot' then
    if v_starts_at is null then
      raise exception 'Appointment start time is required for slot bookings';
    end if;

    v_date := (v_starts_at at time zone 'Asia/Dhaka')::date;
    v_weekday := extract(dow from (v_starts_at at time zone 'Asia/Dhaka'))::smallint;

    -- Check holiday or closure exception
    if exists (
      select 1 from public.availability_exceptions
      where location_id = p_location_id
        and date = v_date
        and (
          (p_vet_id is null and vet_id is null) or
          (p_vet_id is not null and (vet_id is null or vet_id = p_vet_id))
        )
        and is_closed = true
    ) then
      raise exception 'Provider is closed on the selected date';
    end if;

    -- Lock the rule row for concurrent slot booking serialization
    select * into v_rule
    from public.availability_rules
    where location_id = p_location_id
      and weekday = v_weekday
      and (
        (p_vet_id is not null and vet_id = p_vet_id) or
        (p_vet_id is not null and vet_id is null) or
        (p_vet_id is null)
      )
    order by (case when p_vet_id is not null and vet_id = p_vet_id then 1 else 2 end)
    limit 1
    for update;

    -- Check remaining capacity
    select count(*) into v_current_booked
    from public.bookings
    where location_id = p_location_id
      and (
        (p_vet_id is not null and vet_id = p_vet_id) or
        (p_vet_id is null and (v_rule.vet_id is null or vet_id = v_rule.vet_id))
      )
      and starts_at = v_starts_at
      and status in ('pending', 'confirmed');

    if v_current_booked >= coalesce(v_rule.capacity, 1) then
      raise exception 'Selected slot is no longer available';
    end if;

    if v_ends_at is null then
      v_ends_at := v_starts_at + (coalesce(v_duration_min, v_rule.slot_minutes, 20) || ' minutes')::interval;
    end if;

  elsif p_type = 'serial' then
    if v_starts_at is null then
      raise exception 'Session start time is required for serial bookings';
    end if;

    v_date := (v_starts_at at time zone 'Asia/Dhaka')::date;
    v_weekday := extract(dow from (v_starts_at at time zone 'Asia/Dhaka'))::smallint;

    -- Lock the rule row for concurrent serial assignment serialization
    select * into v_rule
    from public.availability_rules
    where location_id = p_location_id
      and weekday = v_weekday
      and (
        (p_vet_id is not null and vet_id = p_vet_id) or
        (p_vet_id is not null and vet_id is null) or
        (p_vet_id is null)
      )
    order by (case when p_vet_id is not null and vet_id = p_vet_id then 1 else 2 end)
    limit 1
    for update;

    if p_serial_no is null then
      -- Auto-assign next serial number
      select coalesce(max(serial_no), 0) + 1 into v_assigned_serial
      from public.bookings
      where location_id = p_location_id
        and (
          (p_vet_id is not null and vet_id = p_vet_id) or
          (p_vet_id is null and (v_rule.vet_id is null or vet_id = v_rule.vet_id))
        )
        and starts_at = v_starts_at
        and serial_no is not null
        and status in ('pending', 'confirmed');

      if v_rule.max_serials is not null and v_assigned_serial > v_rule.max_serials then
        raise exception 'All serials for this session are booked';
      end if;

      p_serial_no := v_assigned_serial;
    else
      -- Verify requested serial number is valid and not taken
      if v_rule.max_serials is not null and p_serial_no > v_rule.max_serials then
        raise exception 'Serial number exceeds maximum session serials';
      end if;

      if exists (
        select 1 from public.bookings
        where location_id = p_location_id
          and (
            (p_vet_id is not null and vet_id = p_vet_id) or
            (p_vet_id is null and (v_rule.vet_id is null or vet_id = v_rule.vet_id))
          )
          and starts_at = v_starts_at
          and serial_no = p_serial_no
          and status in ('pending', 'confirmed')
      ) then
        raise exception 'Serial number % is already booked', p_serial_no;
      end if;
    end if;

    if v_ends_at is null and v_rule.end_time is not null then
      v_ends_at := (v_date + v_rule.end_time) at time zone 'Asia/Dhaka';
    end if;

  else
    -- home_visit or online consultation
    if v_ends_at is null and v_starts_at is not null then
      v_ends_at := v_starts_at + (coalesce(v_duration_min, 30) || ' minutes')::interval;
    end if;
  end if;

  -- 4. Generate unique PRN- booking code
  loop
    v_code := 'PRN-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.bookings where code = v_code);
  end loop;

  -- 5. Insert booking row
  insert into public.bookings (
    code,
    owner_id,
    pet_id,
    location_id,
    vet_id,
    provider_service_id,
    type,
    status,
    starts_at,
    ends_at,
    serial_no,
    address_id,
    problem_note,
    attachments,
    price,
    payment_method,
    payment_status
  ) values (
    v_code,
    v_caller_id,
    p_pet_id,
    p_location_id,
    p_vet_id,
    p_provider_service_id,
    p_type,
    'pending',
    v_starts_at,
    v_ends_at,
    p_serial_no,
    p_address_id,
    p_problem_note,
    coalesce(p_attachments, '{}'),
    v_service_price,
    coalesce(p_payment_method, 'cash'),
    'pending'
  )
  returning id into v_booking_id;

  return jsonb_build_object(
    'bookingId', v_booking_id,
    'code', v_code,
    'status', 'pending',
    'serialNo', p_serial_no,
    'startsAt', to_char(v_starts_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );
end;
$$;

grant execute on function public.create_booking(
  uuid, uuid, booking_type, uuid, uuid, timestamptz, timestamptz, smallint, uuid, text, text[], payment_method
) to anon, authenticated;

-- ------------------------------------------------------------
-- 4. RPC: cancel_booking
--    Cancels an existing booking before the clinic's cut-off.
-- ------------------------------------------------------------
create or replace function public.cancel_booking(
  p_booking_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_cutoff smallint;
  v_new_status booking_status;
begin
  select b.*, coalesce(pl.cancel_cutoff_hours, 2) as cutoff_hours
  into v_booking
  from public.bookings b
  left join public.provider_locations pl on pl.id = b.location_id
  where b.id = p_booking_id;

  if v_booking.id is null then
    raise exception 'Booking not found';
  end if;

  -- Verify permissions (owner, assigned vet, provider, or admin)
  if not (
    auth.uid() = v_booking.owner_id or
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role) or
    current_user in ('postgres', 'supabase_admin')
  ) then
    raise exception 'Not authorized to cancel this booking';
  end if;

  -- Validate cancellation cut-off for owner cancellations
  if auth.uid() = v_booking.owner_id and not public.is_admin() then
    v_cutoff := v_booking.cutoff_hours;
    if v_booking.starts_at is not null and now() > (v_booking.starts_at - (v_cutoff || ' hours')::interval) then
      raise exception 'Cancellation cut-off time has passed (% hours prior to appointment)', v_cutoff;
    end if;
    v_new_status := 'cancelled_by_owner';
  else
    v_new_status := 'cancelled_by_provider';
  end if;

  update public.bookings
  set status = v_new_status,
      cancel_reason = p_reason,
      updated_at = now()
  where id = p_booking_id;

  return jsonb_build_object(
    'success', true,
    'message', 'Booking cancelled successfully'
  );
end;
$$;

grant execute on function public.cancel_booking(uuid, text) to anon, authenticated;

-- ------------------------------------------------------------
-- 5. RPC: reschedule_booking
--    Reschedules an existing booking to a new slot or serial.
-- ------------------------------------------------------------
create or replace function public.reschedule_booking(
  p_booking_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz default null,
  p_serial_no smallint default null,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_cutoff smallint;
  v_ends_at timestamptz;
  v_slot_count int;
begin
  select b.*, coalesce(pl.cancel_cutoff_hours, 2) as cutoff_hours
  into v_booking
  from public.bookings b
  left join public.provider_locations pl on pl.id = b.location_id
  where b.id = p_booking_id;

  if v_booking.id is null then
    raise exception 'Booking not found';
  end if;

  -- Verify permissions
  if not (
    auth.uid() = v_booking.owner_id or
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role) or
    current_user in ('postgres', 'supabase_admin')
  ) then
    raise exception 'Not authorized to reschedule this booking';
  end if;

  -- Check cancellation cutoff on original time
  if auth.uid() = v_booking.owner_id and not public.is_admin() then
    v_cutoff := v_booking.cutoff_hours;
    if v_booking.starts_at is not null and now() > (v_booking.starts_at - (v_cutoff || ' hours')::interval) then
      raise exception 'Reschedule cut-off time has passed (% hours prior to appointment)', v_cutoff;
    end if;
  end if;

  v_ends_at := coalesce(p_ends_at, p_starts_at + interval '20 minutes');

  -- Verify new slot availability
  if v_booking.type = 'slot' then
    select count(*) into v_slot_count
    from public.bookings
    where location_id = v_booking.location_id
      and (v_booking.vet_id is null or vet_id = v_booking.vet_id)
      and starts_at = p_starts_at
      and id <> p_booking_id
      and status in ('pending', 'confirmed');

    if v_slot_count >= 1 then
      raise exception 'Selected slot is no longer available';
    end if;
  end if;

  update public.bookings
  set starts_at = p_starts_at,
      ends_at = v_ends_at,
      serial_no = p_serial_no,
      status = 'pending',
      cancel_reason = case when p_reason is not null then 'Rescheduled: ' || p_reason else cancel_reason end,
      updated_at = now()
  where id = p_booking_id;

  return jsonb_build_object(
    'success', true,
    'message', 'Booking rescheduled successfully'
  );
end;
$$;

grant execute on function public.reschedule_booking(uuid, timestamptz, timestamptz, smallint, text) to anon, authenticated;
