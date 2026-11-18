-- ============================================================
-- DB-9: Adoption Module Tables, RLS Policies, and RPCs
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S2
-- Depends on: DB-1, DB-3, DB-4, DB-6, DB-8
-- Tables: adoption_listings, adoption_applications, adoption_handovers,
--         adoption_favorites, adoption_followups
-- RPCs: decide_adoption_application, confirm_handover,
--       toggle_adoption_favorite
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table: adoption_listings
-- ------------------------------------------------------------

create table if not exists public.adoption_listings (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  posted_by uuid not null references public.profiles(id) on delete cascade,
  shelter_id uuid references public.providers(id) on delete set null,
  species public.species_type not null default 'other',
  age_months smallint,
  gender public.pet_gender default 'unknown',
  title_bn text,
  title_en text,
  description_bn text,
  description_en text,
  photos text[] not null default '{}',
  is_vaccinated boolean default false,
  is_neutered boolean default false,
  district_id smallint not null references public.districts(id),
  upazila_id integer references public.upazilas(id),
  status public.adoption_listing_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Public browsing index
create index if not exists adoption_listings_browse_idx
  on public.adoption_listings (status, species, district_id);

create index if not exists adoption_listings_posted_by_idx
  on public.adoption_listings (posted_by, status);

create index if not exists adoption_listings_shelter_idx
  on public.adoption_listings (shelter_id) where shelter_id is not null;

-- One open/active listing per pet at a time
create unique index if not exists adoption_listings_one_open_per_pet
  on public.adoption_listings (pet_id)
  where status in ('draft', 'available', 'reserved');

-- ------------------------------------------------------------
-- 2. Table: adoption_applications
-- ------------------------------------------------------------

create table if not exists public.adoption_applications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.adoption_listings(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  home_type public.home_type not null default 'own_flat',
  has_other_pets boolean default false,
  experience text,
  reason text not null,
  status public.adoption_application_status not null default 'submitted',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint adoption_applications_one_per_user unique (listing_id, applicant_id)
);

create index if not exists adoption_applications_applicant_idx
  on public.adoption_applications (applicant_id, status);

create index if not exists adoption_applications_listing_idx
  on public.adoption_applications (listing_id, status);

-- ------------------------------------------------------------
-- 3. Table: adoption_handovers
-- ------------------------------------------------------------

create table if not exists public.adoption_handovers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.adoption_listings(id) on delete cascade,
  application_id uuid not null unique references public.adoption_applications(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id),
  to_user_id uuid not null references public.profiles(id),
  giver_confirmed_at timestamptz,
  adopter_confirmed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists adoption_handovers_parties_idx
  on public.adoption_handovers (from_user_id, to_user_id);

create index if not exists adoption_handovers_pet_idx
  on public.adoption_handovers (pet_id);

-- ------------------------------------------------------------
-- 4. Table: adoption_favorites (Saved listings)
-- ------------------------------------------------------------

create table if not exists public.adoption_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.adoption_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists adoption_favorites_listing_idx
  on public.adoption_favorites (listing_id);

-- ------------------------------------------------------------
-- 5. Table: adoption_followups (Post-adoption welfare check)
-- ------------------------------------------------------------

create table if not exists public.adoption_followups (
  id uuid primary key default gen_random_uuid(),
  handover_id uuid not null references public.adoption_handovers(id) on delete cascade,
  due_on date not null,
  sent_at timestamptz,
  answered_at timestamptz,
  wellbeing text check (wellbeing is null or wellbeing in ('good', 'okay', 'needs_help')),
  note text,
  photos text[] not null default '{}'
);

create index if not exists adoption_followups_due_idx
  on public.adoption_followups (due_on, sent_at);

create index if not exists adoption_followups_handover_idx
  on public.adoption_followups (handover_id);

-- ------------------------------------------------------------
-- 6. Audit Triggers
-- ------------------------------------------------------------

drop trigger if exists trg_audit_adoption_listings on public.adoption_listings;
create trigger trg_audit_adoption_listings
  after insert or update or delete on public.adoption_listings
  for each row execute function public.audit_row_change();

drop trigger if exists trg_audit_adoption_applications on public.adoption_applications;
create trigger trg_audit_adoption_applications
  after insert or update or delete on public.adoption_applications
  for each row execute function public.audit_row_change();

drop trigger if exists trg_audit_adoption_handovers on public.adoption_handovers;
create trigger trg_audit_adoption_handovers
  after insert or update or delete on public.adoption_handovers
  for each row execute function public.audit_row_change();

-- ------------------------------------------------------------
-- 7. RPC Functions
-- ------------------------------------------------------------

-- 7.1 decide_adoption_application: Human reviewer approves or rejects
create or replace function public.decide_adoption_application(
  p_application_id uuid,
  p_approve boolean,
  p_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app public.adoption_applications%rowtype;
  v_listing public.adoption_listings%rowtype;
  v_handover_id uuid;
begin
  select * into v_app
  from public.adoption_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Adoption application not found: %', p_application_id;
  end if;

  select * into v_listing
  from public.adoption_listings
  where id = v_app.listing_id
  for update;

  if not found then
    raise exception 'Listing not found for application: %', p_application_id;
  end if;

  -- Permission: listing poster, shelter staff, or admin
  if not (
    v_listing.posted_by = auth.uid() or
    public.is_admin() or
    (v_listing.shelter_id is not null and exists (
      select 1 from public.providers p
      where p.id = v_listing.shelter_id and p.owner_user_id = auth.uid()
    )) or
    public.has_role('shelter')
  ) then
    raise exception 'Unauthorized: Only the listing poster, shelter staff, or admin can decide applications';
  end if;

  if v_app.status not in ('submitted', 'under_review') then
    raise exception 'Cannot review application with status %', v_app.status;
  end if;

  if p_approve then
    -- Update application status
    update public.adoption_applications
    set status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        decision_note = p_note,
        updated_at = now()
    where id = p_application_id;

    -- Update listing status to reserved
    update public.adoption_listings
    set status = 'reserved',
        updated_at = now()
    where id = v_listing.id;

    -- Create or update handover record
    insert into public.adoption_handovers (
      listing_id,
      application_id,
      pet_id,
      from_user_id,
      to_user_id
    ) values (
      v_listing.id,
      p_application_id,
      v_listing.pet_id,
      v_listing.posted_by,
      v_app.applicant_id
    )
    on conflict (listing_id) do update
      set application_id = excluded.application_id,
          to_user_id = excluded.to_user_id,
          giver_confirmed_at = null,
          adopter_confirmed_at = null,
          completed_at = null
    returning id into v_handover_id;

    return true;
  else
    -- Reject application
    update public.adoption_applications
    set status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        decision_note = p_note,
        updated_at = now()
    where id = p_application_id;

    return false;
  end if;
end;
$$;

grant execute on function public.decide_adoption_application to authenticated;

-- 7.2 confirm_handover: Giver and adopter two-sided confirmation
create or replace function public.confirm_handover(p_handover_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_handover public.adoption_handovers%rowtype;
  v_is_giver boolean;
  v_is_adopter boolean;
  v_both_confirmed boolean := false;
begin
  select * into v_handover
  from public.adoption_handovers
  where id = p_handover_id
  for update;

  if not found then
    raise exception 'Handover not found: %', p_handover_id;
  end if;

  if v_handover.completed_at is not null then
    raise exception 'Handover is already completed';
  end if;

  v_is_giver := (v_handover.from_user_id = auth.uid() or public.is_admin());
  v_is_adopter := (v_handover.to_user_id = auth.uid() or public.is_admin());

  if not (v_is_giver or v_is_adopter) then
    raise exception 'Unauthorized: Only the giver or adopter can confirm the handover';
  end if;

  if v_is_giver and v_handover.giver_confirmed_at is null then
    update public.adoption_handovers
    set giver_confirmed_at = now()
    where id = p_handover_id;
    v_handover.giver_confirmed_at := now();
  end if;

  if v_is_adopter and v_handover.adopter_confirmed_at is null then
    update public.adoption_handovers
    set adopter_confirmed_at = now()
    where id = p_handover_id;
    v_handover.adopter_confirmed_at := now();
  end if;

  -- Check if both parties have confirmed
  if v_handover.giver_confirmed_at is not null and v_handover.adopter_confirmed_at is not null then
    -- Complete the handover
    update public.adoption_handovers
    set completed_at = now()
    where id = p_handover_id;

    -- Transfer pet ownership to the adopter and clear shelter_id
    update public.pets
    set owner_id = v_handover.to_user_id,
        shelter_id = null,
        updated_at = now()
    where id = v_handover.pet_id;

    -- Log ownership history
    insert into public.pet_ownership_history (
      pet_id,
      from_user_id,
      to_user_id,
      reason,
      note
    ) values (
      v_handover.pet_id,
      v_handover.from_user_id,
      v_handover.to_user_id,
      'adoption',
      'Adoption handover completed successfully'
    );

    -- Mark listing as adopted
    update public.adoption_listings
    set status = 'adopted',
        updated_at = now()
    where id = v_handover.listing_id;

    -- Withdraw other applications for this listing
    update public.adoption_applications
    set status = 'withdrawn',
        updated_at = now()
    where listing_id = v_handover.listing_id
      and id <> v_handover.application_id
      and status in ('submitted', 'under_review');

    -- Schedule adoption follow-up milestones (30 days, 90 days, 180 days)
    insert into public.adoption_followups (handover_id, due_on)
    values
      (p_handover_id, current_date + 30),
      (p_handover_id, current_date + 90),
      (p_handover_id, current_date + 180);

    v_both_confirmed := true;
  end if;

  return v_both_confirmed;
end;
$$;

grant execute on function public.confirm_handover to authenticated;

-- 7.3 toggle_adoption_favorite: Toggle save listing
create or replace function public.toggle_adoption_favorite(p_listing_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  select exists (
    select 1 from public.adoption_favorites
    where user_id = auth.uid() and listing_id = p_listing_id
  ) into v_exists;

  if v_exists then
    delete from public.adoption_favorites
    where user_id = auth.uid() and listing_id = p_listing_id;
    return false;
  else
    insert into public.adoption_favorites (user_id, listing_id)
    values (auth.uid(), p_listing_id);
    return true;
  end if;
end;
$$;

grant execute on function public.toggle_adoption_favorite to authenticated;

-- ------------------------------------------------------------
-- 8. Row Level Security Policies
-- ------------------------------------------------------------

alter table public.adoption_listings enable row level security;
alter table public.adoption_applications enable row level security;
alter table public.adoption_handovers enable row level security;
alter table public.adoption_favorites enable row level security;
alter table public.adoption_followups enable row level security;

-- ── 8.1 Policies: adoption_listings ──────────────────────────

-- Select: Public (anon too) for available and reserved; poster/shelter/admin for all
create policy "adoption_listings_select_public"
  on public.adoption_listings for select
  using (
    status in ('available', 'reserved')
    or posted_by = auth.uid()
    or public.is_admin()
    or (shelter_id is not null and exists (
      select 1 from public.providers p
      where p.id = adoption_listings.shelter_id and p.owner_user_id = auth.uid()
    ))
    or public.has_role('shelter')
  );

-- Insert: Verified shelter, verified adoption_lister, or admin
create policy "adoption_listings_insert_authorized"
  on public.adoption_listings for insert
  with check (
    auth.uid() = posted_by
    and (
      public.is_admin()
      or public.has_role('shelter')
      or public.has_role('adoption_lister')
    )
    and exists (
      select 1 from public.pets p
      where p.id = pet_id and (p.owner_id = auth.uid() or p.shelter_id is not null)
    )
  );

-- Update: Poster, shelter staff, or admin
create policy "adoption_listings_update_authorized"
  on public.adoption_listings for update
  using (
    posted_by = auth.uid()
    or public.is_admin()
    or (shelter_id is not null and exists (
      select 1 from public.providers p
      where p.id = adoption_listings.shelter_id and p.owner_user_id = auth.uid()
    ))
  )
  with check (
    posted_by = auth.uid()
    or public.is_admin()
    or (shelter_id is not null and exists (
      select 1 from public.providers p
      where p.id = adoption_listings.shelter_id and p.owner_user_id = auth.uid()
    ))
  );

-- ── 8.2 Policies: adoption_applications ──────────────────────

-- Select: Applicant, listing poster, shelter staff, or admin
create policy "adoption_applications_select_authorized"
  on public.adoption_applications for select
  using (
    applicant_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.adoption_listings al
      where al.id = adoption_applications.listing_id
        and (
          al.posted_by = auth.uid()
          or (al.shelter_id is not null and exists (
            select 1 from public.providers p
            where p.id = al.shelter_id and p.owner_user_id = auth.uid()
          ))
        )
    )
    or public.has_role('shelter')
  );

-- Insert: Logged-in applicant
create policy "adoption_applications_insert_applicant"
  on public.adoption_applications for insert
  with check (
    auth.uid() = applicant_id
    and exists (
      select 1 from public.adoption_listings al
      where al.id = listing_id and al.status = 'available'
    )
  );

-- Update: Applicant can withdraw their submitted application
create policy "adoption_applications_update_applicant"
  on public.adoption_applications for update
  using (
    applicant_id = auth.uid() and status = 'submitted'
  )
  with check (
    applicant_id = auth.uid() and status = 'withdrawn'
  );

-- ── 8.3 Policies: adoption_handovers ─────────────────────────

-- Select: Giver, adopter, or admin
create policy "adoption_handovers_select_authorized"
  on public.adoption_handovers for select
  using (
    from_user_id = auth.uid()
    or to_user_id = auth.uid()
    or public.is_admin()
    or public.has_role('shelter')
  );

-- ── 8.4 Policies: adoption_favorites ─────────────────────────

-- All actions restricted to user's own favorites
create policy "adoption_favorites_all_own"
  on public.adoption_favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── 8.5 Policies: adoption_followups ─────────────────────────

-- Select: Handover parties or admin
create policy "adoption_followups_select_authorized"
  on public.adoption_followups for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.adoption_handovers ah
      where ah.id = adoption_followups.handover_id
        and (ah.from_user_id = auth.uid() or ah.to_user_id = auth.uid())
    )
  );

-- Update: Adopter updating followup answers
create policy "adoption_followups_update_adopter"
  on public.adoption_followups for update
  using (
    exists (
      select 1 from public.adoption_handovers ah
      where ah.id = adoption_followups.handover_id
        and ah.to_user_id = auth.uid()
    )
  );
