-- SVC-ONL: Online consultation (video/audio consult + online payment)

create table if not exists public.online_consultations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  vet_id uuid,
  pet_id uuid references public.pets(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  call_session_id uuid references public.call_sessions(id) on delete set null,
  call_mode text not null default 'video' check (call_mode in ('audio', 'video')),
  chief_complaint text not null,
  fee_bdt integer not null check (fee_bdt >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  payment_method text not null default 'sslcommerz',
  transaction_id text,
  scheduled_at timestamptz not null,
  status text not null default 'pending_payment' check (
    status in ('pending_payment', 'confirmed', 'in_call', 'completed', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_online_consultations_owner
  on public.online_consultations (owner_user_id, created_at desc);

alter table public.online_consultations enable row level security;

create policy "online_consultations: owner can view"
  on public.online_consultations
  for select
  using (auth.uid() = owner_user_id);

create policy "online_consultations: owner can insert"
  on public.online_consultations
  for insert
  with check (auth.uid() = owner_user_id);

create policy "online_consultations: owner can update"
  on public.online_consultations
  for update
  using (auth.uid() = owner_user_id);

-- RPC: create_online_consultation
create or replace function public.create_online_consultation(
  p_vet_id uuid,
  p_pet_id uuid,
  p_call_mode text,
  p_chief_complaint text,
  p_fee_bdt integer,
  p_scheduled_at timestamptz
)
returns public.online_consultations
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.online_consultations;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.online_consultations (
    owner_user_id,
    vet_id,
    pet_id,
    call_mode,
    chief_complaint,
    fee_bdt,
    scheduled_at,
    transaction_id,
    status
  )
  values (
    v_user_id,
    p_vet_id,
    p_pet_id,
    p_call_mode,
    p_chief_complaint,
    p_fee_bdt,
    p_scheduled_at,
    'ONL-' || replace(gen_random_uuid()::text, '-', ''),
    'pending_payment'
  )
  returning * into v_row;

  return v_row;
end;
$$;
