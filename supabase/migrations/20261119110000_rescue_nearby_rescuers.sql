-- ============================================================
-- RSC-9: Nearby Rescuer Search Migration
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S8
-- Depends on: RSC-3 (rescuer_profiles, user_roles)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Function: nearby_rescuers
--    RSC-9 (P1): Available verified rescuers whose coverage area
--    covers the specified point; returns rescuer IDs and distance.
-- ------------------------------------------------------------
create or replace function public.nearby_rescuers(
  p_lat double precision,
  p_lng double precision,
  p_radius_m integer default null,
  p_species public.species_type default null
)
returns table (
  rescuer_id uuid,
  distance_meters double precision,
  radius_km numeric,
  is_available boolean,
  species public.species_type[],
  display_name text,
  avatar_url text,
  active_cases_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_point geography(Point, 4326);
begin
  if p_lat is null or p_lng is null then
    raise exception 'Latitude and longitude are required';
  end if;

  v_point := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;

  return query
  select
    rp.user_id as rescuer_id,
    round(st_distance(rp.base_location, v_point)::numeric, 1)::double precision as distance_meters,
    rp.radius_km,
    rp.is_available,
    rp.species,
    p.full_name as display_name,
    p.avatar_url,
    coalesce((
      select count(*)::integer
      from public.rescue_assignments ra
      join public.rescue_cases rc on rc.id = ra.case_id
      where ra.rescuer_id = rp.user_id
        and ra.status = 'accepted'
        and rc.status not in ('closed', 'rejected', 'duplicate')
    ), 0) as active_cases_count
  from public.rescuer_profiles rp
  join public.user_roles ur
    on ur.user_id = rp.user_id
   and ur.role = 'rescuer'
   and ur.status = 'verified'
  left join public.profiles p
    on p.id = rp.user_id
  where rp.is_available = true
    and rp.base_location is not null
    and st_dwithin(rp.base_location, v_point, rp.radius_km * 1000)
    and (p_radius_m is null or st_dwithin(rp.base_location, v_point, p_radius_m))
    and (p_species is null or p_species = any(rp.species))
  order by distance_meters asc;
end;
$$;

grant execute on function public.nearby_rescuers to authenticated;

-- ------------------------------------------------------------
-- 2. Function: upsert_rescuer_profile
--    Allows verified rescuers (or admins) to configure their
--    base location, coverage radius, supported species & availability.
-- ------------------------------------------------------------
create or replace function public.upsert_rescuer_profile(
  p_user_id uuid,
  p_lat double precision default null,
  p_lng double precision default null,
  p_district_id smallint default null,
  p_radius_km numeric default 5.0,
  p_species public.species_type[] default '{dog,cat}',
  p_is_available boolean default true
)
returns public.rescuer_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.rescuer_profiles;
  v_point geography(Point, 4326) := null;
begin
  -- Permission check: caller must be modifying own profile or be an admin
  if auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'Unauthorized: Cannot modify another user''s rescuer profile';
  end if;

  if p_lat is not null and p_lng is not null then
    v_point := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;
  end if;

  insert into public.rescuer_profiles (
    user_id,
    base_location,
    district_id,
    radius_km,
    species,
    is_available,
    updated_at
  )
  values (
    p_user_id,
    v_point,
    p_district_id,
    coalesce(p_radius_km, 5.0),
    coalesce(p_species, '{dog,cat}'::public.species_type[]),
    coalesce(p_is_available, true),
    now()
  )
  on conflict (user_id) do update set
    base_location = coalesce(v_point, rescuer_profiles.base_location),
    district_id = coalesce(p_district_id, rescuer_profiles.district_id),
    radius_km = coalesce(p_radius_km, rescuer_profiles.radius_km),
    species = coalesce(p_species, rescuer_profiles.species),
    is_available = coalesce(p_is_available, rescuer_profiles.is_available),
    updated_at = now()
  returning * into v_profile;

  return v_profile;
end;
$$;

grant execute on function public.upsert_rescuer_profile to authenticated;
