-- CALL-4: Call recording with mutual consent (both owner and vet must consent)

alter table public.call_sessions
  add column if not exists recording_status text not null default 'off'
    check (recording_status in ('off', 'pending_consent', 'recording', 'stopped')),
  add column if not exists recording_url text;

create table if not exists public.call_recording_consents (
  id uuid primary key default gen_random_uuid(),
  call_session_id uuid not null references public.call_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_role text not null check (participant_role in ('owner', 'vet')),
  consented boolean not null default false,
  consented_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_call_recording_consents_unique
  on public.call_recording_consents (call_session_id, user_id);

alter table public.call_recording_consents enable row level security;

create policy "call_recording_consents: participants can view"
  on public.call_recording_consents
  for select
  using (
    exists (
      select 1 from public.call_sessions cs
      where cs.id = call_session_id
        and (
          cs.initiated_by_user_id = auth.uid()
          or cs.owner_user_id = auth.uid()
          or cs.vet_user_id = auth.uid()
        )
    )
  );

create policy "call_recording_consents: user can upsert own consent"
  on public.call_recording_consents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RPC: set_call_recording_consent
-- Recording starts ONLY when both owner and vet have consented = true.
create or replace function public.set_call_recording_consent(
  p_call_session_id uuid,
  p_consented boolean,
  p_role text default 'owner'
)
returns text
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner_ok boolean := false;
  v_vet_ok boolean := false;
  v_new_status text := 'off';
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.call_recording_consents (
    call_session_id, user_id, participant_role, consented, consented_at
  )
  values (
    p_call_session_id,
    v_user_id,
    p_role,
    p_consented,
    case when p_consented then now() else null end
  )
  on conflict (call_session_id, user_id)
  do update set
    consented = excluded.consented,
    consented_at = excluded.consented_at;

  select
    coalesce(bool_or(participant_role = 'owner' and consented), false),
    coalesce(bool_or(participant_role = 'vet' and consented), false)
  into v_owner_ok, v_vet_ok
  from public.call_recording_consents
  where call_session_id = p_call_session_id;

  if v_owner_ok and v_vet_ok then
    v_new_status := 'recording';
  elsif v_owner_ok or v_vet_ok then
    v_new_status := 'pending_consent';
  else
    v_new_status := 'off';
  end if;

  update public.call_sessions
  set
    recording_status = v_new_status,
    updated_at = now()
  where id = p_call_session_id;

  return v_new_status;
end;
$$;
