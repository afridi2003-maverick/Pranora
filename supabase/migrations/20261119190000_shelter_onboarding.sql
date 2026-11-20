-- PRV-3: Shelter Onboarding & Registration RPC
-- Registers a new animal shelter provider, location, and requests the 'shelter' user role.

create or replace function public.register_shelter(
  p_name text,
  p_name_bn text default null,
  p_phone text default null,
  p_email text default null,
  p_address text default null,
  p_address_bn text default null,
  p_division_id integer default null,
  p_district_id integer default null,
  p_upazila_id integer default null,
  p_lat double precision default 23.7465,
  p_lng double precision default 90.3752,
  p_capacity integer default 50,
  p_supported_species species_type[] default array['dog'::species_type, 'cat'::species_type],
  p_emergency_intake boolean default true,
  p_documents text[] default array[]::text[]
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
  v_point geometry(Point, 4326);
begin
  v_user_id := auth.uid();
  if v_user_id is null and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Authentication required';
  end if;

  if v_user_id is null then
    select id into v_user_id from public.profiles limit 1;
  end if;

  -- Verify name
  if p_name is null or trim(p_name) = '' then
    raise exception 'Shelter name is required';
  end if;

  -- Coordinates
  v_point := ST_SetSRID(ST_MakePoint(coalesce(p_lng, 90.3752), coalesce(p_lat, 23.7465)), 4326);

  -- 1. Insert into providers
  insert into public.providers (
    owner_user_id,
    type,
    name_en,
    name_bn,
    phone,
    email,
    verification
  ) values (
    v_user_id,
    'shelter'::provider_type,
    trim(p_name),
    p_name_bn,
    p_phone,
    p_email,
    'pending'::verification_status
  )
  returning id into v_provider_id;

  -- 2. Insert into provider_locations
  insert into public.provider_locations (
    provider_id,
    name_en,
    name_bn,
    address_en,
    address_bn,
    division_id,
    district_id,
    upazila_id,
    location,
    is_active
  ) values (
    v_provider_id,
    trim(p_name),
    p_name_bn,
    p_address,
    p_address_bn,
    p_division_id,
    p_district_id,
    p_upazila_id,
    v_point,
    true
  )
  returning id into v_location_id;

  -- 3. Register user role 'shelter' as pending verification
  insert into public.user_roles (
    user_id,
    role,
    status
  ) values (
    v_user_id,
    'shelter'::user_role,
    'pending'::verification_status
  )
  on conflict (user_id, role) do update
  set status = case
    when user_roles.status = 'verified' then 'verified'
    else 'pending'::verification_status
  end;

  return jsonb_build_object(
    'success', true,
    'providerId', v_provider_id,
    'locationId', v_location_id,
    'name', p_name,
    'capacity', p_capacity,
    'status', 'pending',
    'message', 'Shelter registered successfully and submitted for admin verification'
  );
end;
$$;

grant execute on function public.register_shelter to anon, authenticated;
