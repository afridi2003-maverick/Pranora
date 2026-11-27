-- ============================================================
-- REV-1: Reviews & Ratings for Providers & Clinics
-- Owner: Zimia | Sprint: S6 | Depends on: APT-2, MAP-5
-- Conforms to docs/schema.md §4.11 and §5.3
-- ============================================================

-- 1. Reviews Table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  vet_id uuid references public.vets(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_provider_idx on public.reviews (provider_id);
create index if not exists reviews_author_idx   on public.reviews (author_id);
create index if not exists reviews_created_idx  on public.reviews (created_at desc);

-- 2. Trigger function to refresh provider rating average and count (docs/schema.md §5.3)
create or replace function public.refresh_provider_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider_id uuid;
  v_avg numeric(2,1);
  v_count integer;
begin
  if (TG_OP = 'DELETE') then
    v_provider_id := OLD.provider_id;
  else
    v_provider_id := NEW.provider_id;
  end if;

  select
    coalesce(round(avg(rating)::numeric, 1), 0),
    count(*)
  into v_avg, v_count
  from public.reviews
  where provider_id = v_provider_id
    and is_hidden = false;

  update public.providers
  set
    rating_avg = v_avg,
    rating_count = v_count,
    updated_at = now()
  where id = v_provider_id;

  return null;
end;
$$;

drop trigger if exists trg_reviews_refresh_rating on public.reviews;
create trigger trg_reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_provider_rating();

-- 3. Row Level Security
alter table public.reviews enable row level security;

-- Public can read all active (unhidden) reviews
create policy "reviews: public read active"
  on public.reviews for select
  using (is_hidden = false or auth.uid() = author_id or public.is_admin());

-- Users can insert reviews for their own completed bookings
create policy "reviews: author insert completed"
  on public.reviews for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.user_id = auth.uid()
        and b.provider_id = reviews.provider_id
    )
  );

-- Author can update their own comment/rating
create policy "reviews: author update"
  on public.reviews for update
  using (auth.uid() = author_id or public.is_admin())
  with check (auth.uid() = author_id or public.is_admin());

-- Author or admin can delete
create policy "reviews: author or admin delete"
  on public.reviews for delete
  using (auth.uid() = author_id or public.is_admin());
