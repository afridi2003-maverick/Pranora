-- ============================================================
-- RSC-10: Public Lost & Found Board & Nearby Alerts Migration
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S8
-- Depends on: RSC-1 (animal_reports), NOTIF-1 (notifications)
-- ============================================================

-- ------------------------------------------------------------
-- 1. View: lost_found_board (Enhanced with approx_lat & approx_lng)
--    Snaps exact location coordinates to ~1 km grid (0.01 deg)
--    Redacts contact phone and reporter identity for privacy
-- ------------------------------------------------------------

drop view if exists public.lost_found_board cascade;

create or replace view public.lost_found_board as
select
  id,
  kind,
  species,
  description,
  photos,
  area_text,
  district_id,
  upazila_id,
  last_seen_at,
  created_at,
  st_snaptogrid(location::geometry, 0.01)::geography as approx_location,
  st_y(st_snaptogrid(location::geometry, 0.01)) as approx_lat,
  st_x(st_snaptogrid(location::geometry, 0.01)) as approx_lng
from public.animal_reports
where kind in ('lost', 'found')
  and status not in ('closed', 'rejected', 'duplicate');

grant select on public.lost_found_board to anon, authenticated;

-- ------------------------------------------------------------
-- 2. Table: lost_found_sightings
--    Holds community sightings for "আমি দেখেছি / I've seen it"
--    with optional photo, location and contact sharing
-- ------------------------------------------------------------

create table if not exists public.lost_found_sightings (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.animal_reports(id) on delete cascade,
  reporter_user_id uuid references public.profiles(id) on delete set null,
  message text not null,
  location_text text,
  photos text[] not null default '{}',
  contact_phone text,
  contact_shared boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists lost_found_sightings_report_idx
  on public.lost_found_sightings (report_id, created_at desc);

alter table public.lost_found_sightings enable row level security;

-- Policies:
-- Authenticated users can insert sightings
create policy "lost_found_sightings: authenticated insert"
  on public.lost_found_sightings for insert
  with check (auth.role() = 'authenticated');

-- Spotter or original animal report author or admin can read sightings
create policy "lost_found_sightings: author or report owner read"
  on public.lost_found_sightings for select
  using (
    auth.uid() = reporter_user_id
    or exists (
      select 1 from public.animal_reports ar
      where ar.id = report_id and ar.reporter_id = auth.uid()
    )
    or public.is_admin()
  );

-- Original report author or admin can update contact_shared
create policy "lost_found_sightings: report owner update"
  on public.lost_found_sightings for update
  using (
    exists (
      select 1 from public.animal_reports ar
      where ar.id = report_id and ar.reporter_id = auth.uid()
    )
    or public.is_admin()
  );

-- ------------------------------------------------------------
-- 3. Function: submit_lost_found_sighting
--    Submits a sighting, stores details, and sends an in-app
--    notification to the pet's original reporter.
-- ------------------------------------------------------------

create or replace function public.submit_lost_found_sighting(
  p_report_id uuid,
  p_message text,
  p_location_text text default null,
  p_photos text[] default '{}',
  p_contact_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.animal_reports%rowtype;
  v_sighting_id uuid;
  v_title_bn text;
  v_title_en text;
  v_body_bn text;
  v_body_en text;
begin
  select * into v_report
  from public.animal_reports
  where id = p_report_id;

  if not found then
    raise exception 'Animal report not found: %', p_report_id;
  end if;

  insert into public.lost_found_sightings (
    report_id,
    reporter_user_id,
    message,
    location_text,
    photos,
    contact_phone,
    contact_shared
  )
  values (
    p_report_id,
    auth.uid(),
    p_message,
    p_location_text,
    coalesce(p_photos, '{}'),
    p_contact_phone,
    false
  )
  returning id into v_sighting_id;

  -- Send notification to the original reporter
  if v_report.reporter_id is not null then
    v_title_bn := 'আপনার প্রাণীর নতুন সন্ধান পাওয়া গেছে! 🐾';
    v_title_en := 'New sighting reported for your pet! 🐾';
    v_body_bn := 'একজন প্রত্যক্ষদর্শী আপনার ' || coalesce(v_report.species::text, 'প্রাণী') || ' সম্পর্কে তথ্য জানিয়েছেন: ' || substring(p_message from 1 for 100);
    v_body_en := 'Someone reported a sighting of your ' || coalesce(v_report.species::text, 'pet') || ': ' || substring(p_message from 1 for 100);

    insert into public.notifications (
      user_id,
      title_bn,
      title_en,
      body_bn,
      body_en,
      channel,
      data
    )
    values (
      v_report.reporter_id,
      v_title_bn,
      v_title_en,
      v_body_bn,
      v_body_en,
      'in_app',
      jsonb_build_object(
        'type', 'lost_found_sighting',
        'report_id', p_report_id,
        'sighting_id', v_sighting_id,
        'location_text', p_location_text
      )
    );
  end if;

  return v_sighting_id;
end;
$$;

grant execute on function public.submit_lost_found_sighting to authenticated;

-- ------------------------------------------------------------
-- 4. Function: share_sighting_contact
--    Called by original reporter to grant the spotter permission
--    to see their contact phone number.
-- ------------------------------------------------------------

create or replace function public.share_sighting_contact(
  p_sighting_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sighting public.lost_found_sightings%rowtype;
  v_report public.animal_reports%rowtype;
begin
  select * into v_sighting
  from public.lost_found_sightings
  where id = p_sighting_id;

  if not found then
    raise exception 'Sighting not found: %', p_sighting_id;
  end if;

  select * into v_report
  from public.animal_reports
  where id = v_sighting.report_id;

  -- Ensure caller is the original reporter or admin
  if v_report.reporter_id <> auth.uid() and not public.is_admin() then
    raise exception 'Unauthorized to share contact for this report';
  end if;

  update public.lost_found_sightings
  set contact_shared = true
  where id = p_sighting_id;

  -- If sighting reporter is registered, notify them that contact was shared
  if v_sighting.reporter_user_id is not null then
    insert into public.notifications (
      user_id,
      title_bn,
      title_en,
      body_bn,
      body_en,
      channel,
      data
    )
    values (
      v_sighting.reporter_user_id,
      'মালিক আপনার সাথে যোগাযোগের অনুমতি দিয়েছেন',
      'Pet owner shared their contact with you',
      'আপনার সন্ধান তথ্যের প্রেক্ষিতে প্রাণীর মালিক যোগাযোগ নম্বর শেয়ার করেছেন: ' || coalesce(v_report.contact_phone, 'অ্যাপে বার্তা দেখুন'),
      'Pet owner has shared their contact: ' || coalesce(v_report.contact_phone, 'Check app details'),
      'in_app',
      jsonb_build_object(
        'type', 'contact_shared',
        'report_id', v_sighting.report_id,
        'sighting_id', p_sighting_id,
        'contact_phone', v_report.contact_phone
      )
    );
  end if;

  return true;
end;
$$;

grant execute on function public.share_sighting_contact to authenticated;

-- ------------------------------------------------------------
-- 5. Function: alert_nearby_users_for_lost_found
--    Pushes an alert to users whose saved address or active
--    rescuer base is within radius (default 3 km) of a new report.
-- ------------------------------------------------------------

create or replace function public.alert_nearby_users_for_lost_found(
  p_report_id uuid,
  p_radius_km numeric default 3.0
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.animal_reports%rowtype;
  v_count integer := 0;
  v_target record;
  v_title_bn text;
  v_title_en text;
  v_body_bn text;
  v_body_en text;
begin
  select * into v_report
  from public.animal_reports
  where id = p_report_id;

  if not found then
    raise exception 'Animal report not found: %', p_report_id;
  end if;

  if v_report.kind not in ('lost', 'found') then
    return 0;
  end if;

  v_title_bn := case
    when v_report.kind = 'lost' then '⚠️ আপনার এলাকায় প্রাণী হারিয়েছে!'
    else '🐾 আপনার এলাকায় প্রাণী উদ্ধার/পাওয়া গেছে!'
  end;

  v_title_en := case
    when v_report.kind = 'lost' then '⚠️ Lost Pet Alert in Your Area!'
    else '🐾 Found Pet Alert in Your Area!'
  end;

  v_body_bn := 'এলাকা: ' || coalesce(v_report.area_text, 'নিকটবর্তী') || '। প্রজাতি: ' || coalesce(v_report.species::text, 'প্রাণী') || '। বিস্তারিত দেখুন ও চোখ রাখুন।';
  v_body_en := 'Area: ' || coalesce(v_report.area_text, 'Nearby') || '. Species: ' || coalesce(v_report.species::text, 'animal') || '. Check details and keep an eye out.';

  for v_target in
    with nearby_users as (
      select a.user_id
      from public.addresses a
      where a.location is not null
        and st_dwithin(a.location, v_report.location, coalesce(p_radius_km, 3.0) * 1000)
        and (v_report.reporter_id is null or a.user_id <> v_report.reporter_id)
      union
      select rp.user_id
      from public.rescuer_profiles rp
      where rp.base_location is not null
        and rp.is_available = true
        and st_dwithin(rp.base_location, v_report.location, coalesce(p_radius_km, 3.0) * 1000)
        and (v_report.reporter_id is null or rp.user_id <> v_report.reporter_id)
    )
    select distinct user_id from nearby_users
  loop
    insert into public.notifications (
      user_id,
      title_bn,
      title_en,
      body_bn,
      body_en,
      channel,
      data
    )
    values (
      v_target.user_id,
      v_title_bn,
      v_title_en,
      v_body_bn,
      v_body_en,
      'in_app',
      jsonb_build_object(
        'type', 'nearby_lost_found_alert',
        'report_id', p_report_id,
        'kind', v_report.kind,
        'species', v_report.species
      )
    );
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.alert_nearby_users_for_lost_found to authenticated;
