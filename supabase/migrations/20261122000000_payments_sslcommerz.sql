-- ============================================================
-- PAY-2: Online payments with SSLCommerz (bKash, Nagad, Rocket, cards)
-- Owner: Afridi (@afridi2003-maverick) | Sprint: S7
-- Depends on: PAY-1, (SVC-SHOP)
-- Tables: payments
-- RPCs: init_online_payment, verify_and_complete_payment, cancel_or_fail_payment
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table: payments
-- ------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  currency text not null default 'BDT',
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  gateway text not null default 'sslcommerz',
  gateway_tran_id text unique not null,
  gateway_val_id text,
  bank_tran_id text,
  card_type text,
  card_brand text,
  raw_response jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_target_check check (booking_id is not null or order_id is not null)
);

-- Indices
create index if not exists payments_booking_idx on public.payments (booking_id);
create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists payments_tran_id_idx on public.payments (gateway_tran_id);
create index if not exists payments_status_idx on public.payments (status);

-- Updated_at trigger
drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 2. Row Level Security
-- ------------------------------------------------------------
alter table public.payments enable row level security;

-- User can view their own payments
drop policy if exists "payments: user can select own payments" on public.payments;
create policy "payments: user can select own payments"
  on public.payments
  for select
  to authenticated
  using (
    auth.uid() = user_id or
    public.is_admin() or
    exists (
      select 1 from public.bookings b
      join public.location_vets lv on lv.vet_id = b.vet_id
      where b.id = payments.booking_id and lv.vet_id = auth.uid()
    )
  );

-- Authenticated user can initiate payment for their own booking
drop policy if exists "payments: user can insert own payment" on public.payments;
create policy "payments: user can insert own payment"
  on public.payments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- System / Admin can update payment records
drop policy if exists "payments: admin update" on public.payments;
create policy "payments: admin update"
  on public.payments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 3. RPC: init_online_payment
-- ------------------------------------------------------------
create or replace function public.init_online_payment(
  p_booking_id uuid,
  p_method public.payment_method,
  p_amount numeric,
  p_gateway text default 'sslcommerz'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
  v_booking record;
  v_tran_id text;
  v_payment_id uuid;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required to initiate payment';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id;

  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.owner_id <> v_caller_id and not public.is_admin() then
    raise exception 'Unauthorized: Booking does not belong to caller';
  end if;

  -- Generate unique Pranora transaction ID: PRN-<timestamp>-<random 4 digits>
  v_tran_id := 'PRN-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || lpad((floor(random() * 9000 + 1000)::int)::text, 4, '0');

  insert into public.payments (
    booking_id,
    user_id,
    amount,
    currency,
    method,
    status,
    gateway,
    gateway_tran_id
  ) values (
    p_booking_id,
    v_caller_id,
    p_amount,
    'BDT',
    p_method,
    'pending',
    coalesce(p_gateway, 'sslcommerz'),
    v_tran_id
  )
  returning id into v_payment_id;

  -- Update booking with method
  update public.bookings
  set payment_method = p_method,
      updated_at = now()
  where id = p_booking_id;

  return jsonb_build_object(
    'success', true,
    'paymentId', v_payment_id,
    'transactionId', v_tran_id,
    'amount', p_amount,
    'currency', 'BDT',
    'method', p_method,
    'gateway', coalesce(p_gateway, 'sslcommerz')
  );
end;
$$;

-- ------------------------------------------------------------
-- 4. RPC: verify_and_complete_payment
-- ------------------------------------------------------------
create or replace function public.verify_and_complete_payment(
  p_gateway_tran_id text,
  p_val_id text,
  p_raw_response jsonb default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment record;
begin
  select * into v_payment
  from public.payments
  where gateway_tran_id = p_gateway_tran_id;

  if not found then
    raise exception 'Payment transaction not found for tran_id: %', p_gateway_tran_id;
  end if;

  if v_payment.status = 'paid' then
    return jsonb_build_object(
      'success', true,
      'paymentId', v_payment.id,
      'status', 'paid',
      'message', 'Payment was already verified and marked as paid'
    );
  end if;

  -- Update payment record
  update public.payments
  set status = 'paid',
      gateway_val_id = coalesce(p_val_id, gateway_val_id),
      bank_tran_id = p_raw_response->>'bank_tran_id',
      card_type = p_raw_response->>'card_type',
      card_brand = p_raw_response->>'card_brand',
      raw_response = coalesce(p_raw_response, raw_response),
      updated_at = now()
  where id = v_payment.id;

  -- If tied to a booking, update booking payment status and confirm booking
  if v_payment.booking_id is not null then
    update public.bookings
    set payment_status = 'paid',
        payment_method = v_payment.method,
        status = case when status = 'pending' then 'confirmed' else status end,
        updated_at = now()
    where id = v_payment.booking_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'paymentId', v_payment.id,
    'bookingId', v_payment.booking_id,
    'transactionId', p_gateway_tran_id,
    'status', 'paid',
    'amount', v_payment.amount
  );
end;
$$;

-- ------------------------------------------------------------
-- 5. RPC: cancel_or_fail_payment
-- ------------------------------------------------------------
create or replace function public.cancel_or_fail_payment(
  p_gateway_tran_id text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment record;
begin
  select * into v_payment
  from public.payments
  where gateway_tran_id = p_gateway_tran_id;

  if not found then
    raise exception 'Payment transaction not found for tran_id: %', p_gateway_tran_id;
  end if;

  update public.payments
  set status = 'failed',
      raw_response = jsonb_build_object('failure_reason', coalesce(p_reason, 'User cancelled or gateway failed')),
      updated_at = now()
  where id = v_payment.id;

  if v_payment.booking_id is not null then
    update public.bookings
    set payment_status = 'failed',
        updated_at = now()
    where id = v_payment.booking_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'paymentId', v_payment.id,
    'status', 'failed',
    'reason', p_reason
  );
end;
$$;

-- Grants
grant execute on function public.init_online_payment(uuid, public.payment_method, numeric, text) to authenticated;
grant execute on function public.verify_and_complete_payment(text, text, jsonb) to anon, authenticated;
grant execute on function public.cancel_or_fail_payment(text, text) to anon, authenticated;
