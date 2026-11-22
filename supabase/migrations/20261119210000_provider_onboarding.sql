-- ============================================================
-- Migration: PRV-1 Provider Onboarding RPC
-- Description: Multi-step provider registration (info, map pin, hours, services, documents)
-- ============================================================

create or replace function public.register_provider(
  p_type public.provider_type,
  p_name_en text,
  p_name_bn text default null,
  p_phone text default null,
  p_email text default null,
  p_trade_license_no text default null,
  p_website text default null,
  p_address_en text default null,
  p_address_bn text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_upazila_id integer default null,
  p_is_24h boolean default false,
  p_has_emergency boolean default false,
  p_offers_home_visit boolean default false,
  p_cancel_cutoff_hours smallint default 2,
  p_species_treated public.species_type[] default '{dog,cat}',
  p_hours jsonb default '[]'::jsonb,
  p_documents text[] default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_provider_id uuid;
  v_location_id uuid;
  v_point geography(Point, 4326);
  v_hour record;
  v_doc text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    -- Fallback for tests or service role
    v_user_id := coalesce(
      (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    );
  end if;

  if p_name_en is null or trim(p_name_en) = '' then
    raise exception 'Provider name is required';
  end if;

  if p_phone is null or trim(p_phone) = '' then
    raise exception 'Contact phone is required';
  end if;

  -- 1. Create provider record
  insert into public.providers (
    owner_user_id,
    type,
    name_en,
    name_bn,
    phone,
    email,
    trade_license_no,
    website,
    verification
  ) values (
    v_user_id,
    p_type,
    p_name_en,
    p_name_bn,
    p_phone,
    p_email,
    p_trade_license_no,
    p_website,
    'pending'
  )
  returning id into v_provider_id;

  -- 2. Create provider location (map pin)
  if p_longitude is not null and p_latitude is not null then
    v_point := st_setsrid(st_makepoint(p_longitude, p_latitude), 4326);
  else
    -- Default to central Dhaka coordinate
    v_point := st_setsrid(st_makepoint(90.4125, 23.8103), 4326);
  end if;

  insert into public.provider_locations (
    provider_id,
    name_en,
    name_bn,
    address_en,
    address_bn,
    upazila_id,
    location,
    phone,
    is_24h,
    has_emergency,
    offers_home_visit,
    cancel_cutoff_hours,
    species_treated,
    is_active
  ) values (
    v_provider_id,
    p_name_en || ' Main Branch',
    p_name_bn,
    p_address_en,
    p_address_bn,
    p_upazila_id,
    v_point,
    p_phone,
    p_is_24h,
    p_has_emergency,
    p_offers_home_visit,
    coalesce(p_cancel_cutoff_hours, 2),
    coalesce(p_species_treated, '{dog,cat}'),
    true
  )
  returning id into v_location_id;

  -- 3. Insert operating hours if provided
  if jsonb_array_length(p_hours) > 0 then
    for v_hour in select * from jsonb_to_recordset(p_hours) as x(
      weekday smallint,
      open_time time,
      close_time time
    )
    loop
      insert into public.location_hours (location_id, weekday, open_time, close_time)
      values (v_location_id, v_hour.weekday, v_hour.open_time, v_hour.close_time)
      on conflict (location_id, weekday, open_time) do nothing;
    end loop;
  else
    -- Default operating hours (Saturday to Thursday, 9 AM to 8 PM)
    insert into public.location_hours (location_id, weekday, open_time, close_time)
    values
      (v_location_id, 0, '09:00:00'::time, '20:00:00'::time),
      (v_location_id, 1, '09:00:00'::time, '20:00:00'::time),
      (v_location_id, 2, '09:00:00'::time, '20:00:00'::time),
      (v_location_id, 3, '09:00:00'::time, '20:00:00'::time),
      (v_location_id, 4, '09:00:00'::time, '20:00:00'::time),
      (v_location_id, 6, '09:00:00'::time, '20:00:00'::time)
    on conflict do nothing;
  end if;

  -- 4. Insert verification documents if provided
  if array_length(p_documents, 1) > 0 then
    foreach v_doc in array p_documents
    loop
      insert into public.provider_documents (
        provider_id,
        doc_type,
        file_path,
        status
      ) values (
        v_provider_id,
        'trade_license',
        v_doc,
        'pending'
      );
    end loop;
  end if;

  -- 5. Record user role as provider (pending verification)
  insert into public.user_roles (user_id, role, status)
  values (v_user_id, 'provider', 'pending')
  on conflict (user_id, role)
  do update set status = 'pending';

  return jsonb_build_object(
    'success', true,
    'providerId', v_provider_id,
    'locationId', v_location_id,
    'name', p_name_en,
    'status', 'pending'
  );
end;
$$;

grant execute on function public.register_provider(
  public.provider_type, text, text, text, text, text, text, text, text,
  double precision, double precision, integer, boolean, boolean, boolean,
  smallint, public.species_type[], jsonb, text[]
) to anon, authenticated;
