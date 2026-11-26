-- APT-4: Booking reminders (24h and 1h before appointment)

create table if not exists public.booking_reminders (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_window text not null check (reminder_window in ('24h', '1h')),
  remind_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'sent', 'cancelled')),
  channel text not null default 'both' check (channel in ('push', 'in_app', 'both')),
  created_at timestamptz not null default now()
);

create unique index if not exists idx_booking_reminders_unique_window
  on public.booking_reminders (booking_id, reminder_window);

create index if not exists idx_booking_reminders_pending
  on public.booking_reminders (remind_at)
  where status = 'pending';

alter table public.booking_reminders enable row level security;

create policy "booking_reminders: owner can view"
  on public.booking_reminders
  for select
  using (auth.uid() = user_id);

create policy "booking_reminders: owner can manage"
  on public.booking_reminders
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RPC: schedule_booking_reminders
create or replace function public.schedule_booking_reminders(
  p_booking_id uuid,
  p_scheduled_at timestamptz,
  p_enable_24h boolean default true,
  p_enable_1h boolean default true,
  p_channel text default 'both'
)
returns setof public.booking_reminders
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_24h timestamptz := p_scheduled_at - interval '24 hours';
  v_1h timestamptz := p_scheduled_at - interval '1 hour';
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_enable_24h and v_24h > now() then
    insert into public.booking_reminders (
      booking_id, user_id, reminder_window, remind_at, status, channel
    )
    values (
      p_booking_id, v_user_id, '24h', v_24h, 'pending', p_channel
    )
    on conflict (booking_id, reminder_window)
    do update set
      remind_at = excluded.remind_at,
      status = 'pending',
      channel = excluded.channel;
  end if;

  if p_enable_1h and v_1h > now() then
    insert into public.booking_reminders (
      booking_id, user_id, reminder_window, remind_at, status, channel
    )
    values (
      p_booking_id, v_user_id, '1h', v_1h, 'pending', p_channel
    )
    on conflict (booking_id, reminder_window)
    do update set
      remind_at = excluded.remind_at,
      status = 'pending',
      channel = excluded.channel;
  end if;

  return query
    select * from public.booking_reminders
    where booking_id = p_booking_id
      and user_id = v_user_id
    order by remind_at asc;
end;
$$;

-- RPC: cancel_booking_reminders
create or replace function public.cancel_booking_reminders(
  p_booking_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  update public.booking_reminders
  set status = 'cancelled'
  where booking_id = p_booking_id
    and user_id = auth.uid()
    and status = 'pending';
end;
$$;
