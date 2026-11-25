-- ============================================================
-- PAY-3: Invoices & Refunds
-- Owner: Afridi (@afridi2003-maverick) | Sprint: S8
-- Depends on: PAY-2, (SVC-SHOP)
-- Tables: payments (refund columns), invoices
-- RPCs: request_payment_refund, process_payment_refund, get_booking_invoice
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extend payments table for refunds
-- ------------------------------------------------------------
alter table public.payments
  add column if not exists refund_status text not null default 'none'
    check (refund_status in ('none', 'requested', 'approved', 'rejected', 'processed')),
  add column if not exists refund_amount numeric(10,2) default null,
  add column if not exists refund_reason text default null,
  add column if not exists refund_admin_note text default null,
  add column if not exists refunded_at timestamptz default null,
  add column if not exists refund_tran_id text default null;

create index if not exists payments_refund_status_idx
  on public.payments (refund_status) where refund_status <> 'none';

-- ------------------------------------------------------------
-- 2. Table: invoices
-- ------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  booking_id uuid references public.bookings(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  discount numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null check (total >= 0),
  currency text not null default 'BDT',
  status text not null default 'issued' check (status in ('issued', 'paid', 'refunded', 'void')),
  invoice_date timestamptz not null default now(),
  due_date timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_user_idx on public.invoices (user_id);
create index if not exists invoices_booking_idx on public.invoices (booking_id);
create index if not exists invoices_number_idx on public.invoices (invoice_number);

-- RLS
alter table public.invoices enable row level security;

drop policy if exists "invoices: user can view own invoice" on public.invoices;
create policy "invoices: user can view own invoice"
  on public.invoices
  for select
  to authenticated
  using (
    auth.uid() = user_id or
    public.is_admin() or
    exists (
      select 1 from public.providers p
      where p.id = invoices.provider_id and p.owner_user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 3. RPC: request_payment_refund
-- ------------------------------------------------------------
create or replace function public.request_payment_refund(
  p_payment_id uuid,
  p_reason text,
  p_amount numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
  v_payment record;
  v_refund_amt numeric;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required to request a refund';
  end if;

  select * into v_payment
  from public.payments
  where id = p_payment_id;

  if not found then
    raise exception 'Payment not found: %', p_payment_id;
  end if;

  if v_payment.user_id <> v_caller_id and not public.is_admin() then
    raise exception 'Unauthorized: Payment does not belong to caller';
  end if;

  if v_payment.status <> 'paid' then
    raise exception 'Only paid transactions can be refunded (current status: %)', v_payment.status;
  end if;

  if v_payment.refund_status in ('requested', 'approved', 'processed') then
    raise exception 'A refund has already been requested or processed for this payment';
  end if;

  v_refund_amt := coalesce(p_amount, v_payment.amount);
  if v_refund_amt > v_payment.amount or v_refund_amt <= 0 then
    raise exception 'Invalid refund amount: % (original: %)', v_refund_amt, v_payment.amount;
  end if;

  update public.payments
  set refund_status = 'requested',
      refund_amount = v_refund_amt,
      refund_reason = p_reason,
      updated_at = now()
  where id = p_payment_id;

  return jsonb_build_object(
    'success', true,
    'paymentId', p_payment_id,
    'refundStatus', 'requested',
    'refundAmount', v_refund_amt,
    'message', 'Refund request submitted for administrator review'
  );
end;
$$;

-- ------------------------------------------------------------
-- 4. RPC: process_payment_refund (Admin or Provider)
-- ------------------------------------------------------------
create or replace function public.process_payment_refund(
  p_payment_id uuid,
  p_action text, -- 'approved' | 'rejected' | 'processed'
  p_admin_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_payment record;
  v_new_status text;
  v_ref_tran text;
begin
  v_admin_id := auth.uid();
  if v_admin_id is null or not public.is_admin() then
    raise exception 'Unauthorized: Only administrators can process refunds';
  end if;

  select * into v_payment
  from public.payments
  where id = p_payment_id;

  if not found then
    raise exception 'Payment not found: %', p_payment_id;
  end if;

  if p_action = 'approved' or p_action = 'processed' then
    v_new_status := 'processed';
    v_ref_tran := 'REF-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random() * 9000 + 1000)::int)::text, 4, '0');

    update public.payments
    set status = 'refunded',
        refund_status = 'processed',
        refund_admin_note = p_admin_note,
        refunded_at = now(),
        refund_tran_id = v_ref_tran,
        updated_at = now()
    where id = p_payment_id;

    if v_payment.booking_id is not null then
      update public.bookings
      set payment_status = 'refunded',
          status = 'cancelled_by_provider',
          updated_at = now()
      where id = v_payment.booking_id;
    end if;

  elsif p_action = 'rejected' then
    v_new_status := 'rejected';

    update public.payments
    set refund_status = 'rejected',
        refund_admin_note = p_admin_note,
        updated_at = now()
    where id = p_payment_id;
  else
    raise exception 'Invalid refund action: %', p_action;
  end if;

  return jsonb_build_object(
    'success', true,
    'paymentId', p_payment_id,
    'refundStatus', v_new_status,
    'refundTranId', v_ref_tran,
    'action', p_action
  );
end;
$$;

-- ------------------------------------------------------------
-- 5. RPC: get_booking_invoice
-- ------------------------------------------------------------
create or replace function public.get_booking_invoice(
  p_booking_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_provider record;
  v_owner record;
  v_payment record;
  v_inv_num text;
  v_service_name text;
begin
  select b.*, ps.name_en as svc_name_en, ps.name_bn as svc_name_bn, ps.price as svc_price, ps.provider_id
  into v_booking
  from public.bookings b
  left join public.provider_services ps on ps.id = b.provider_service_id
  where b.id = p_booking_id;

  if not found then
    raise exception 'Booking not found: %', p_booking_id;
  end if;

  select * into v_provider from public.providers where id = v_booking.provider_id;
  select * into v_owner from public.profiles where id = v_booking.owner_id;
  select * into v_payment from public.payments where booking_id = p_booking_id order by created_at desc limit 1;

  v_inv_num := 'INV-' || to_char(coalesce(v_booking.created_at, now()), 'YYMMDD') || '-' || substr(p_booking_id::text, 1, 6);
  v_service_name := coalesce(v_booking.svc_name_bn, v_booking.svc_name_en, 'Veterinary Consultation');

  return jsonb_build_object(
    'invoiceNumber', v_inv_num,
    'bookingId', p_booking_id,
    'date', coalesce(v_booking.starts_at, v_booking.created_at),
    'issuedAt', coalesce(v_booking.created_at, now()),
    'customer', jsonb_build_object(
      'name', coalesce(v_owner.full_name, 'Pet Owner'),
      'phone', v_owner.phone,
      'email', v_owner.email
    ),
    'provider', jsonb_build_object(
      'nameEn', coalesce(v_provider.name_en, 'Pranora Veterinary Care'),
      'nameBn', coalesce(v_provider.name_bn, 'প্রণোরা ভেটেরিনারি সেবা'),
      'phone', v_provider.phone
    ),
    'items', jsonb_build_array(
      jsonb_build_object(
        'description', v_service_name,
        'quantity', 1,
        'unitPrice', coalesce(v_booking.price, v_booking.svc_price, 500),
        'total', coalesce(v_booking.price, v_booking.svc_price, 500)
      )
    ),
    'subtotal', coalesce(v_booking.price, v_booking.svc_price, 500),
    'discount', 0,
    'tax', 0,
    'total', coalesce(v_booking.price, v_booking.svc_price, 500),
    'currency', 'BDT',
    'paymentMethod', coalesce(v_booking.payment_method, 'cash'),
    'paymentStatus', coalesce(v_booking.payment_status, 'pending'),
    'transactionId', v_payment.gateway_tran_id
  );
end;
$$;

-- Grants
grant execute on function public.request_payment_refund(uuid, text, numeric) to authenticated;
grant execute on function public.process_payment_refund(uuid, text, text) to authenticated;
grant execute on function public.get_booking_invoice(uuid) to authenticated, anon;
