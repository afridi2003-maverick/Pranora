-- ============================================================
-- MAP-1: SQL Functions for Nearest Vet Map & Operating Hours
-- Functions: is_location_open, nearby_clinics
-- Owner: zimia | Branch: zimia | Sprint: S2
-- Depends on: DB-4 (providers, provider_locations, location_hours, provider_services)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Function: is_location_open
--    Checks if a provider location is currently open or open at
--    a given timestamp in Asia/Dhaka timezone.
--    Handles 24/7 locations, same-day windows, and overnight
--    shifts crossing midnight.
-- ------------------------------------------------------------

create or replace function public.is_location_open(
  p_location_id uuid,
  p_at timestamptz default now()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with t as (
    select (p_at at time zone 'Asia/Dhaka') as local_ts
  )
  select exists (
    select 1
    from public.provider_locations pl, t
    where pl.id = p_location_id and pl.is_24h
  ) or exists (
    select 1
    from public.location_hours h, t
    where h.location_id = p_location_id
      and (
        -- same-day window
        (h.close_time > h.open_time
          and h.weekday = extract(dow from t.local_ts)::int
          and t.local_ts::time >= h.open_time
          and t.local_ts::time <  h.close_time)
        -- window that passes midnight: evening part
        or (h.close_time <= h.open_time
          and h.weekday = extract(dow from t.local_ts)::int
          and t.local_ts::time >= h.open_time)
        -- window that passes midnight: after-midnight part (started yesterday)
        or (h.close_time <= h.open_time
          and h.weekday = (extract(dow from t.local_ts)::int + 6) % 7
          and t.local_ts::time < h.close_time)
      )
  );
$$;

grant execute on function public.is_location_open(uuid, timestamptz) to anon, authenticated;

-- ------------------------------------------------------------
-- 2. Function: nearby_clinics
--    Returns verified, active provider locations sorted by distance
--    from origin (p_lat, p_lng). Supports filtering by radius,
--    open now, emergency, home visit, species, service, fee, and types.
-- ------------------------------------------------------------

create or replace function public.nearby_clinics(
  p_lat double precision,
  p_lng double precision,
  p_radius_m integer default 5000,
  p_open_now boolean default false,
  p_emergency boolean default false,
  p_home_visit boolean default false,
  p_species species_type default null,
  p_service text default null,       -- services.slug
  p_max_fee numeric default null,    -- fee filter: cheapest active service at or below this
  p_types provider_type[] default array['vet_clinic','pet_hospital','govt_vet_hospital','freelance_vet']::provider_type[],
  p_limit integer default 50
)
returns table (
  location_id uuid,
  provider_id uuid,
  name_bn text,
  name_en text,
  address_bn text,
  address_en text,
  phone text,
  type provider_type,
  is_government boolean,
  is_24h boolean,
  has_emergency boolean,
  offers_home_visit boolean,
  is_open_now boolean,
  rating_avg numeric,
  rating_count integer,
  fee_from numeric,
  lat double precision,
  lng double precision,
  distance_m double precision
)
language sql
stable
security definer
set search_path = public
as $$
  with origin as (
    select st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography as g
  )
  select
    pl.id,
    p.id,
    coalesce(pl.name_bn, p.name_bn),
    coalesce(pl.name_en, p.name_en),
    pl.address_bn,
    pl.address_en,
    coalesce(pl.phone, p.phone),
    p.type,
    p.is_government,
    pl.is_24h,
    pl.has_emergency,
    pl.offers_home_visit,
    public.is_location_open(pl.id) as is_open_now,
    p.rating_avg,
    p.rating_count,
    (select min(ps.price) from public.provider_services ps
      where ps.location_id = pl.id and ps.is_active) as fee_from,
    st_y(pl.location::geometry) as lat,
    st_x(pl.location::geometry) as lng,
    st_distance(pl.location, o.g) as distance_m
  from public.provider_locations pl
  join public.providers p on p.id = pl.provider_id
  cross join origin o
  where pl.is_active
    and p.verification = 'verified'
    and p.type = any (p_types)
    and st_dwithin(pl.location, o.g, p_radius_m)
    and (not p_emergency  or pl.has_emergency or pl.is_24h)
    and (not p_home_visit or pl.offers_home_visit)
    and (p_species is null or p_species = any (pl.species_treated))
    and (not p_open_now   or public.is_location_open(pl.id))
    and (p_service is null or exists (
          select 1 from public.provider_services ps
          join public.services s on s.id = ps.service_id
          where ps.location_id = pl.id and ps.is_active and s.slug = p_service))
    and (p_max_fee is null or exists (
          select 1 from public.provider_services ps
          where ps.location_id = pl.id and ps.is_active and ps.price <= p_max_fee))
  order by pl.location <-> o.g
  limit p_limit;
$$;

grant execute on function public.nearby_clinics(
  double precision,
  double precision,
  integer,
  boolean,
  boolean,
  boolean,
  species_type,
  text,
  numeric,
  provider_type[],
  integer
) to anon, authenticated;
