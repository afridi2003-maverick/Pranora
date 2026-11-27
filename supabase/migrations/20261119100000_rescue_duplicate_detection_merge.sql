-- ============================================================
-- RSC-8: Duplicate Report Detection & Merge Migration
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S7
-- Depends on: RSC-1 (animal_reports, rescue_cases)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Function: find_potential_duplicate_reports
--    Locates existing reports of the same species within a given
--    radius (meters) created around the same time.
-- ------------------------------------------------------------
create or replace function public.find_potential_duplicate_reports(
  p_report_id uuid,
  p_radius_meters integer default 1500
)
returns table (
  id uuid,
  reporter_id uuid,
  kind public.animal_report_kind,
  species public.species_type,
  urgency public.urgency_level,
  description text,
  photos text[],
  area_text text,
  status public.rescue_status,
  distance_meters double precision,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_location geography(Point, 4326);
  v_species public.species_type;
  v_created_at timestamptz;
begin
  -- Fetch target report details
  select r.location, r.species, r.created_at
    into v_location, v_species, v_created_at
    from public.animal_reports r
   where r.id = p_report_id;

  if not found then
    raise exception 'Target animal report not found';
  end if;

  return query
  select
    r.id,
    r.reporter_id,
    r.kind,
    r.species,
    r.urgency,
    r.description,
    r.photos,
    r.area_text,
    r.status,
    round(st_distance(r.location, v_location)::numeric, 1)::double precision as distance_meters,
    r.created_at
  from public.animal_reports r
  where r.id <> p_report_id
    and r.duplicate_of is null
    and (r.species = v_species or v_species = 'other' or r.species = 'other')
    and r.status not in ('closed')
    and r.created_at between (v_created_at - interval '7 days') and (v_created_at + interval '7 days')
    and st_dwithin(r.location, v_location, p_radius_meters)
  order by distance_meters asc, r.created_at desc;
end;
$$;

grant execute on function public.find_potential_duplicate_reports to authenticated;

-- ------------------------------------------------------------
-- 2. Function: merge_animal_reports
--    Merges a duplicate report into a primary target report.
--    Marks duplicate report as closed with duplicate_of set,
--    closes its case, copies evidence to target case, and notifies reporter.
-- ------------------------------------------------------------
create or replace function public.merge_animal_reports(
  p_duplicate_id uuid,
  p_target_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dup record;
  v_target record;
  v_target_case_id uuid;
begin
  if p_duplicate_id = p_target_id then
    raise exception 'Cannot merge a report into itself';
  end if;

  select * into v_dup
    from public.animal_reports
   where id = p_duplicate_id;

  if not found then
    raise exception 'Duplicate report not found';
  end if;

  select * into v_target
    from public.animal_reports
   where id = p_target_id;

  if not found then
    raise exception 'Target report not found';
  end if;

  -- Close duplicate report and point to target
  update public.animal_reports
     set duplicate_of = p_target_id,
         status = 'closed',
         updated_at = now()
   where id = p_duplicate_id;

  -- Close any rescue case associated with duplicate report
  update public.rescue_cases
     set status = 'closed',
         outcome = 'other',
         outcome_note = 'একই প্রাণীর পূর্ববর্তী রিপোর্ট ' || p_target_id || '-এ একীভূত করা হয়েছে (Duplicate merged)',
         closed_at = now(),
         updated_at = now()
   where report_id = p_duplicate_id
     and status <> 'closed';

  -- Check if target report has an active case
  select id into v_target_case_id
    from public.rescue_cases
   where report_id = p_target_id;

  if v_target_case_id is not null then
    -- Insert a merge log update into target case
    insert into public.rescue_case_updates (
      case_id,
      author_id,
      notes,
      photos,
      created_at
    ) values (
      v_target_case_id,
      auth.uid(),
      'নকল রিপোর্ট সংযুক্ত করা হয়েছে (# ' || substring(p_duplicate_id::text from 1 for 8) || '). বিবরণ: ' || coalesce(v_dup.description, 'কোনো বিবরণ নেই'),
      coalesce(v_dup.photos, '{}'),
      now()
    );
  end if;

  -- Notify duplicate reporter
  perform public.create_notification(
    v_dup.reporter_id,
    'আপনার রিপোর্টটি একটি চলমান উদ্ধার কেসের সাথে সংযুক্ত করা হয়েছে',
    'Your rescue report was merged with an ongoing case',
    'একই এলাকায় একই প্রাণীর পূর্ববর্তী রিপোর্টের সাথে আপনার রিপোর্টটি একীভূত করা হয়েছে। উদ্ধারকারী দল কাজ করছে।',
    'Your report was merged with an existing rescue case in the same location. Rescuers are actively handling it.',
    jsonb_build_object(
      'type', 'report_merged',
      'duplicate_id', p_duplicate_id,
      'target_id', p_target_id
    ),
    'in_app'
  );

  return true;
end;
$$;

grant execute on function public.merge_animal_reports to authenticated;
