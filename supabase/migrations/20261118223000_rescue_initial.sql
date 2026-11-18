-- ============================================================
-- DB-8: Rescue Module Tables, Views, RPCs, and RLS Policies
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S2
-- Depends on: DB-1, DB-3, DB-4, DB-6
-- Tables: animal_reports, rescue_cases, rescue_assignments, rescue_case_updates
-- View: lost_found_board
-- RPCs: review_animal_report, assign_rescuer, respond_to_assignment,
--       close_rescue_case, my_report_status
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table: animal_reports
-- ------------------------------------------------------------

create table if not exists public.animal_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  kind public.animal_report_kind not null,
  pet_id uuid references public.pets(id) on delete set null,
  species public.species_type not null default 'other',
  urgency public.urgency_level not null default 'medium',
  last_seen_at timestamptz,
  contact_phone text,
  description text,
  photos text[] not null default '{}',
  location geography(Point, 4326) not null,
  area_text text,
  upazila_id integer references public.upazilas(id),
  district_id smallint references public.districts(id),
  status public.rescue_status not null default 'submitted',
  duplicate_of uuid references public.animal_reports(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Priority queue index: urgency descending (critical -> high -> medium -> low)
create index if not exists animal_reports_queue_idx
  on public.animal_reports (status, urgency desc, created_at);

-- Spatial index for PostGIS distance/radius queries
create index if not exists animal_reports_location_gix
  on public.animal_reports using gist (location);

create index if not exists animal_reports_reporter_idx
  on public.animal_reports (reporter_id, created_at desc);

create index if not exists animal_reports_pet_idx
  on public.animal_reports (pet_id) where pet_id is not null;

create index if not exists animal_reports_duplicate_idx
  on public.animal_reports (duplicate_of) where duplicate_of is not null;

create index if not exists animal_reports_district_idx
  on public.animal_reports (district_id, upazila_id);

-- ------------------------------------------------------------
-- 2. View: lost_found_board (Public board with location privacy)
--    Snaps exact location coordinates to ~1 km grid (0.01 deg)
--    Redacts contact phone and reporter identity
-- ------------------------------------------------------------

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
  st_snaptogrid(location::geometry, 0.01)::geography as approx_location
from public.animal_reports
where kind in ('lost', 'found')
  and status not in ('closed', 'rejected', 'duplicate');

grant select on public.lost_found_board to anon, authenticated;

-- ------------------------------------------------------------
-- 3. Table: rescue_cases
-- ------------------------------------------------------------

create table if not exists public.rescue_cases (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.animal_reports(id) on delete restrict,
  status public.rescue_status not null default 'under_review',
  shelter_id uuid references public.providers(id) on delete set null,
  assigned_rescuer_id uuid references public.profiles(id) on delete set null,
  pet_id uuid references public.pets(id) on delete set null,
  outcome public.rescue_outcome,
  outcome_note text,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rescue_cases_closed_outcome_check check (status <> 'closed' or outcome is not null)
);

create index if not exists rescue_cases_status_idx
  on public.rescue_cases (status, created_at desc);

create index if not exists rescue_cases_rescuer_idx
  on public.rescue_cases (assigned_rescuer_id) where assigned_rescuer_id is not null;

create index if not exists rescue_cases_shelter_idx
  on public.rescue_cases (shelter_id) where shelter_id is not null;

create index if not exists rescue_cases_pet_idx
  on public.rescue_cases (pet_id) where pet_id is not null;

-- ------------------------------------------------------------
-- 4. Table: rescue_assignments
-- ------------------------------------------------------------

create table if not exists public.rescue_assignments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.rescue_cases(id) on delete cascade,
  rescuer_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid not null references public.profiles(id),
  status public.assignment_status not null default 'offered',
  decline_reason text,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

-- At most one active (offered or accepted) rescuer assignment per case
create unique index if not exists rescue_assignments_one_active
  on public.rescue_assignments (case_id) where status in ('offered', 'accepted');

create index if not exists rescue_assignments_rescuer_idx
  on public.rescue_assignments (rescuer_id, status, created_at desc);

-- ------------------------------------------------------------
-- 5. Table: rescue_case_updates
-- ------------------------------------------------------------

create table if not exists public.rescue_case_updates (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.rescue_cases(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  status public.rescue_status,
  note text,
  photos text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists rescue_case_updates_case_idx
  on public.rescue_case_updates (case_id, created_at desc);

create index if not exists rescue_case_updates_author_idx
  on public.rescue_case_updates (author_id, created_at desc);

-- ------------------------------------------------------------
-- 6. Forward Foreign Key Constraints (pets and medical_records)
-- ------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pets_shelter_fk') then
    alter table public.pets
      add constraint pets_shelter_fk foreign key (shelter_id) references public.providers(id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'pets_rescue_case_fk') then
    alter table public.pets
      add constraint pets_rescue_case_fk foreign key (rescue_case_id) references public.rescue_cases(id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'medical_records_rescue_case_fk') then
    alter table public.medical_records
      add constraint medical_records_rescue_case_fk foreign key (rescue_case_id) references public.rescue_cases(id) on delete set null;
  end if;
end $$;

-- ------------------------------------------------------------
-- 7. Audit Triggers
-- ------------------------------------------------------------

drop trigger if exists trg_audit_animal_reports on public.animal_reports;
create trigger trg_audit_animal_reports
  after insert or update or delete on public.animal_reports
  for each row execute function public.audit_row_change();

drop trigger if exists trg_audit_rescue_cases on public.rescue_cases;
create trigger trg_audit_rescue_cases
  after insert or update or delete on public.rescue_cases
  for each row execute function public.audit_row_change();

-- ------------------------------------------------------------
-- 8. RPC Functions
-- ------------------------------------------------------------

-- 8.1 review_animal_report: Reviewer (admin/shelter) reviews report
create or replace function public.review_animal_report(
  p_report_id uuid,
  p_accept boolean,
  p_shelter_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case_id uuid;
  v_report public.animal_reports%rowtype;
begin
  -- Permission check: admin or verified shelter staff
  if not (public.is_admin() or public.has_role('shelter')) then
    raise exception 'Unauthorized: Only admins or verified shelters can review animal reports';
  end if;

  select * into v_report
  from public.animal_reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'Animal report not found: %', p_report_id;
  end if;

  if v_report.status not in ('submitted', 'under_review') then
    raise exception 'Cannot review report with status: %', v_report.status;
  end if;

  if p_accept then
    -- Accept report: transition to under_review and create rescue_cases
    update public.animal_reports
    set status = 'under_review',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        updated_at = now()
    where id = p_report_id;

    insert into public.rescue_cases (
      report_id,
      shelter_id,
      status
    ) values (
      p_report_id,
      p_shelter_id,
      'under_review'
    )
    returning id into v_case_id;

    -- Add initial case log update
    insert into public.rescue_case_updates (
      case_id,
      author_id,
      status,
      note
    ) values (
      v_case_id,
      auth.uid(),
      'under_review',
      'Report approved and case opened for rescue coordination'
    );

    return v_case_id;
  else
    -- Reject report
    update public.animal_reports
    set status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        updated_at = now()
    where id = p_report_id;

    return null;
  end if;
end;
$$;

grant execute on function public.review_animal_report to authenticated;

-- 8.2 assign_rescuer: Offers a case to one verified rescuer
create or replace function public.assign_rescuer(
  p_case_id uuid,
  p_rescuer_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.rescue_cases%rowtype;
  v_assignment_id uuid;
  v_is_rescuer boolean;
begin
  -- Permission check: admin or verified shelter
  if not (public.is_admin() or public.has_role('shelter')) then
    raise exception 'Unauthorized: Only admins or shelters can assign rescuers';
  end if;

  select * into v_case
  from public.rescue_cases
  where id = p_case_id
  for update;

  if not found then
    raise exception 'Rescue case not found: %', p_case_id;
  end if;

  if v_case.status in ('closed', 'rejected', 'duplicate') then
    raise exception 'Cannot assign rescuer to case with status %', v_case.status;
  end if;

  -- Validate target user is a verified rescuer
  select exists (
    select 1 from public.user_roles
    where user_id = p_rescuer_id
      and role = 'rescuer'
      and status = 'verified'
  ) into v_is_rescuer;

  if not v_is_rescuer then
    raise exception 'Target user % is not a verified rescuer', p_rescuer_id;
  end if;

  -- If there is an existing offered assignment, withdraw it
  update public.rescue_assignments
  set status = 'withdrawn',
      responded_at = now()
  where case_id = p_case_id and status = 'offered';

  -- Create new offered assignment
  insert into public.rescue_assignments (
    case_id,
    rescuer_id,
    assigned_by,
    status
  ) values (
    p_case_id,
    p_rescuer_id,
    auth.uid(),
    'offered'
  )
  returning id into v_assignment_id;

  update public.rescue_cases
  set status = 'assigned',
      updated_at = now()
  where id = p_case_id;

  update public.animal_reports
  set status = 'assigned',
      updated_at = now()
  where id = v_case.report_id;

  insert into public.rescue_case_updates (
    case_id,
    author_id,
    status,
    note
  ) values (
    p_case_id,
    auth.uid(),
    'assigned',
    'Offered assignment to rescuer'
  );

  return v_assignment_id;
end;
$$;

grant execute on function public.assign_rescuer to authenticated;

-- 8.3 respond_to_assignment: Rescuer accepts or declines assignment
create or replace function public.respond_to_assignment(
  p_assignment_id uuid,
  p_accept boolean,
  p_decline_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment public.rescue_assignments%rowtype;
  v_case public.rescue_cases%rowtype;
begin
  select * into v_assignment
  from public.rescue_assignments
  where id = p_assignment_id
  for update;

  if not found then
    raise exception 'Assignment not found: %', p_assignment_id;
  end if;

  if v_assignment.rescuer_id <> auth.uid() and not public.is_admin() then
    raise exception 'Unauthorized: Only the assigned rescuer can respond to this assignment';
  end if;

  if v_assignment.status <> 'offered' then
    raise exception 'Cannot respond to assignment with status %', v_assignment.status;
  end if;

  select * into v_case
  from public.rescue_cases
  where id = v_assignment.case_id
  for update;

  if p_accept then
    update public.rescue_assignments
    set status = 'accepted',
        responded_at = now()
    where id = p_assignment_id;

    update public.rescue_cases
    set status = 'rescue_in_progress',
        assigned_rescuer_id = v_assignment.rescuer_id,
        updated_at = now()
    where id = v_assignment.case_id;

    update public.animal_reports
    set status = 'rescue_in_progress',
        updated_at = now()
    where id = v_case.report_id;

    insert into public.rescue_case_updates (
      case_id,
      author_id,
      status,
      note
    ) values (
      v_assignment.case_id,
      auth.uid(),
      'rescue_in_progress',
      'Rescuer accepted assignment. Rescue in progress.'
    );

    return true;
  else
    update public.rescue_assignments
    set status = 'declined',
        decline_reason = p_decline_reason,
        responded_at = now()
    where id = p_assignment_id;

    update public.rescue_cases
    set status = 'under_review',
        assigned_rescuer_id = null,
        updated_at = now()
    where id = v_assignment.case_id;

    update public.animal_reports
    set status = 'under_review',
        updated_at = now()
    where id = v_case.report_id;

    insert into public.rescue_case_updates (
      case_id,
      author_id,
      status,
      note
    ) values (
      v_assignment.case_id,
      auth.uid(),
      'under_review',
      coalesce('Rescuer declined assignment: ' || p_decline_reason, 'Rescuer declined assignment')
    );

    return false;
  end if;
end;
$$;

grant execute on function public.respond_to_assignment to authenticated;

-- 8.4 close_rescue_case: Conclude a rescue case with required outcome
create or replace function public.close_rescue_case(
  p_case_id uuid,
  p_outcome public.rescue_outcome,
  p_note text default null,
  p_pet_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.rescue_cases%rowtype;
begin
  select * into v_case
  from public.rescue_cases
  where id = p_case_id
  for update;

  if not found then
    raise exception 'Rescue case not found: %', p_case_id;
  end if;

  -- Permission: assigned rescuer, case shelter, or admin
  if not (
    v_case.assigned_rescuer_id = auth.uid() or
    public.is_admin() or
    (v_case.shelter_id is not null and exists (
      select 1 from public.providers p
      where p.id = v_case.shelter_id and p.owner_user_id = auth.uid()
    ))
  ) then
    raise exception 'Unauthorized: Only the assigned rescuer, case shelter, or admin can close a case';
  end if;

  if p_outcome is null then
    raise exception 'Outcome is required to close a rescue case';
  end if;

  update public.rescue_cases
  set status = 'closed',
      outcome = p_outcome,
      outcome_note = p_note,
      pet_id = coalesce(p_pet_id, v_case.pet_id),
      closed_at = now(),
      updated_at = now()
  where id = p_case_id;

  update public.animal_reports
  set status = 'closed',
      updated_at = now()
  where id = v_case.report_id;

  insert into public.rescue_case_updates (
    case_id,
    author_id,
    status,
    note
  ) values (
    p_case_id,
    auth.uid(),
    'closed',
    coalesce('Case closed with outcome: ' || p_outcome::text || '. ' || coalesce(p_note, ''), 'Case closed')
  );

  return true;
end;
$$;

grant execute on function public.close_rescue_case to authenticated;

-- 8.5 my_report_status: Reporter-safe status tracker
create or replace function public.my_report_status(p_report_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'reportId', ar.id,
    'kind', ar.kind,
    'species', ar.species,
    'status', ar.status,
    'statusBn', case ar.status
      when 'submitted' then 'জমা'
      when 'under_review' then 'দেখা হচ্ছে'
      when 'assigned' then 'উদ্ধারকারী নির্ধারিত'
      when 'rescue_in_progress' then 'উদ্ধার চলছে'
      when 'closed' then 'শেষ'
      when 'rejected' then 'বাতিল'
      when 'duplicate' then 'অনুলিপি'
      else ar.status::text
    end,
    'statusEn', case ar.status
      when 'submitted' then 'Submitted'
      when 'under_review' then 'Under Review'
      when 'assigned' then 'Rescuer Assigned'
      when 'rescue_in_progress' then 'Rescue In Progress'
      when 'closed' then 'Closed'
      when 'rejected' then 'Rejected'
      when 'duplicate' then 'Duplicate'
      else ar.status::text
    end,
    'urgency', ar.urgency,
    'areaText', ar.area_text,
    'createdAt', ar.created_at,
    'updatedAt', ar.updated_at
  )
  from public.animal_reports ar
  where ar.id = p_report_id
    and (ar.reporter_id = auth.uid() or public.is_admin());
$$;

grant execute on function public.my_report_status to authenticated;

-- ------------------------------------------------------------
-- 9. Row Level Security Policies
-- ------------------------------------------------------------

alter table public.animal_reports enable row level security;
alter table public.rescue_cases enable row level security;
alter table public.rescue_assignments enable row level security;
alter table public.rescue_case_updates enable row level security;

-- ── 9.1 Policies: animal_reports ─────────────────────────────

-- Select: reporter, admins, verified shelter/rescuer, or assigned rescuer
create policy "animal_reports_select_authorized"
  on public.animal_reports for select
  using (
    reporter_id = auth.uid()
    or public.is_admin()
    or public.has_role('shelter')
    or public.has_role('rescuer')
    or exists (
      select 1 from public.rescue_cases rc
      where rc.report_id = animal_reports.id
        and rc.assigned_rescuer_id = auth.uid()
    )
  );

-- Insert: logged-in user can submit a report
create policy "animal_reports_insert_authenticated"
  on public.animal_reports for insert
  with check (
    auth.uid() = reporter_id
    and (pet_id is null or exists (
      select 1 from public.pets p
      where p.id = pet_id and p.owner_id = auth.uid()
    ))
  );

-- Update: reporter can edit while submitted; reviewer/admin via RPCs or directly
create policy "animal_reports_update_authorized"
  on public.animal_reports for update
  using (
    (reporter_id = auth.uid() and status = 'submitted')
    or public.is_admin()
    or public.has_role('shelter')
  )
  with check (
    (reporter_id = auth.uid() and status = 'submitted')
    or public.is_admin()
    or public.has_role('shelter')
  );

-- ── 9.2 Policies: rescue_cases ───────────────────────────────

-- Select: assigned rescuer, case shelter staff, or admin
create policy "rescue_cases_select_authorized"
  on public.rescue_cases for select
  using (
    assigned_rescuer_id = auth.uid()
    or public.is_admin()
    or (shelter_id is not null and exists (
      select 1 from public.providers p
      where p.id = rescue_cases.shelter_id and p.owner_user_id = auth.uid()
    ))
    or exists (
      select 1 from public.rescue_assignments ra
      where ra.case_id = rescue_cases.id and ra.rescuer_id = auth.uid()
    )
    or public.has_role('shelter')
  );

-- Insert/Update: admins, shelter, or via security definer RPCs
create policy "rescue_cases_update_authorized"
  on public.rescue_cases for update
  using (
    assigned_rescuer_id = auth.uid()
    or public.is_admin()
    or public.has_role('shelter')
  );

-- ── 9.3 Policies: rescue_assignments ─────────────────────────

-- Select: assigned rescuer, assigner, or admin
create policy "rescue_assignments_select_authorized"
  on public.rescue_assignments for select
  using (
    rescuer_id = auth.uid()
    or assigned_by = auth.uid()
    or public.is_admin()
    or public.has_role('shelter')
  );

-- Update: rescuer updating own assignment status (accept/decline)
create policy "rescue_assignments_update_rescuer"
  on public.rescue_assignments for update
  using (
    rescuer_id = auth.uid() or public.is_admin()
  )
  with check (
    rescuer_id = auth.uid() or public.is_admin()
  );

-- ── 9.4 Policies: rescue_case_updates ────────────────────────

-- Select: assigned rescuer, case shelter, admins
create policy "rescue_case_updates_select_authorized"
  on public.rescue_case_updates for select
  using (
    public.is_admin()
    or author_id = auth.uid()
    or exists (
      select 1 from public.rescue_cases rc
      where rc.id = rescue_case_updates.case_id
        and (
          rc.assigned_rescuer_id = auth.uid()
          or (rc.shelter_id is not null and exists (
            select 1 from public.providers p
            where p.id = rc.shelter_id and p.owner_user_id = auth.uid()
          ))
        )
    )
    or public.has_role('shelter')
  );

-- Insert: assigned rescuer, case shelter, admin
create policy "rescue_case_updates_insert_authorized"
  on public.rescue_case_updates for insert
  with check (
    auth.uid() = author_id
    and (
      public.is_admin()
      or exists (
        select 1 from public.rescue_cases rc
        where rc.id = rescue_case_updates.case_id
          and (
            rc.assigned_rescuer_id = auth.uid()
            or public.has_role('shelter')
          )
      )
    )
  );
