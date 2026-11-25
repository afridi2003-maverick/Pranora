-- CALL-1 / CALL-2 / CALL-3: Owner-vet audio & video call sessions

create table if not exists public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  call_type text not null check (call_type in ('audio', 'video')),
  status text not null default 'pending' check (status in ('pending', 'active', 'ended', 'missed', 'declined')),
  room_name text not null,
  initiated_by_user_id uuid not null references auth.users(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete set null,
  vet_user_id uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_call_sessions_booking_id on public.call_sessions(booking_id);
create index if not exists idx_call_sessions_owner on public.call_sessions(owner_user_id);
create index if not exists idx_call_sessions_vet on public.call_sessions(vet_user_id);

alter table public.call_sessions enable row level security;

create policy "call_sessions: participants can view"
  on public.call_sessions
  for select
  using (
    auth.uid() = initiated_by_user_id
    or auth.uid() = owner_user_id
    or auth.uid() = vet_user_id
  );

create policy "call_sessions: participants can insert"
  on public.call_sessions
  for insert
  with check (
    auth.uid() = initiated_by_user_id
  );

create policy "call_sessions: participants can update"
  on public.call_sessions
  for update
  using (
    auth.uid() = initiated_by_user_id
    or auth.uid() = owner_user_id
    or auth.uid() = vet_user_id
  );

-- RPC: initiate_call
create or replace function public.initiate_call(
  p_booking_id uuid,
  p_call_type text
)
returns public.call_sessions
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_room_name text;
  v_session public.call_sessions;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_call_type not in ('audio', 'video') then
    raise exception 'Invalid call type: %', p_call_type;
  end if;

  v_room_name := 'pranora-' || p_call_type || '-' || left(p_booking_id::text, 8);

  insert into public.call_sessions (
    booking_id,
    call_type,
    status,
    room_name,
    initiated_by_user_id,
    started_at
  )
  values (
    p_booking_id,
    p_call_type,
    'pending',
    v_room_name,
    v_user_id,
    now()
  )
  returning * into v_session;

  return v_session;
end;
$$;

-- RPC: end_call
create or replace function public.end_call(
  p_call_session_id uuid,
  p_duration_seconds integer default null
)
returns public.call_sessions
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.call_sessions;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.call_sessions
  set
    status = 'ended',
    ended_at = now(),
    duration_seconds = coalesce(p_duration_seconds, duration_seconds),
    updated_at = now()
  where id = p_call_session_id
    and (
      initiated_by_user_id = v_user_id
      or owner_user_id = v_user_id
      or vet_user_id = v_user_id
    )
  returning * into v_session;

  return v_session;
end;
$$;
