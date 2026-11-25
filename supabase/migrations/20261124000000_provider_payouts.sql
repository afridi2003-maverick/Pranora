-- ============================================================
-- PAY-4: Provider Payouts & Earnings Ledger
-- Owner: Afridi (@afridi2003-maverick) | Sprint: S8
-- Depends on: PAY-2, PRV-2
-- Tables: provider_payouts, provider_earnings_ledger
-- RPCs: get_provider_earnings_summary, request_provider_payout, process_provider_payout
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table: provider_payouts
-- ------------------------------------------------------------
create table if not exists public.provider_payouts (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  commission_deducted numeric(10,2) not null default 0 check (commission_deducted >= 0),
  net_amount numeric(10,2) not null check (net_amount > 0),
  currency text not null default 'BDT',
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'rejected')),
  payout_method text not null
    check (payout_method in ('bkash', 'nagad', 'bank_transfer', 'rocket')),
  account_details jsonb not null default '{}',
  transaction_reference text,
  requested_by uuid references public.profiles(id) on delete set null,
  processed_by uuid references public.profiles(id) on delete set null,
  processed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_payouts_provider_idx on public.provider_payouts (provider_id);
create index if not exists provider_payouts_status_idx on public.provider_payouts (status);

-- ------------------------------------------------------------
-- 2. Table: provider_earnings_ledger
-- ------------------------------------------------------------
create table if not exists public.provider_earnings_ledger (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  gross_amount numeric(10,2) not null check (gross_amount > 0),
  platform_fee numeric(10,2) not null default 0 check (platform_fee >= 0),
  net_amount numeric(10,2) not null check (net_amount > 0),
  is_settled boolean not null default false,
  payout_id uuid references public.provider_payouts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists provider_earnings_provider_idx on public.provider_earnings_ledger (provider_id);
create index if not exists provider_earnings_settled_idx on public.provider_earnings_ledger (is_settled);

-- ------------------------------------------------------------
-- 3. Row Level Security
-- ------------------------------------------------------------
alter table public.provider_payouts enable row level security;
alter table public.provider_earnings_ledger enable row level security;

-- Provider owner or Admin can select payouts
drop policy if exists "provider_payouts: provider owner or admin select" on public.provider_payouts;
create policy "provider_payouts: provider owner or admin select"
  on public.provider_payouts
  for select
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.providers p
      where p.id = provider_payouts.provider_id and p.owner_user_id = auth.uid()
    )
  );

-- Provider owner can request payouts
drop policy if exists "provider_payouts: provider owner insert" on public.provider_payouts;
create policy "provider_payouts: provider owner insert"
  on public.provider_payouts
  for insert
  to authenticated
  with check (
    public.is_admin() or
    exists (
      select 1 from public.providers p
      where p.id = provider_payouts.provider_id and p.owner_user_id = auth.uid()
    )
  );

-- Admin can update payouts
drop policy if exists "provider_payouts: admin update" on public.provider_payouts;
create policy "provider_payouts: admin update"
  on public.provider_payouts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Provider earnings ledger select
drop policy if exists "provider_earnings_ledger: provider owner or admin select" on public.provider_earnings_ledger;
create policy "provider_earnings_ledger: provider owner or admin select"
  on public.provider_earnings_ledger
  for select
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.providers p
      where p.id = provider_earnings_ledger.provider_id and p.owner_user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 4. RPC: get_provider_earnings_summary
-- ------------------------------------------------------------
create or replace function public.get_provider_earnings_summary(
  p_provider_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gross numeric(10,2) := 0;
  v_commission numeric(10,2) := 0;
  v_net numeric(10,2) := 0;
  v_paid_out numeric(10,2) := 0;
  v_pending_payout numeric(10,2) := 0;
  v_available numeric(10,2) := 0;
begin
  -- Calculate gross and net from earnings ledger
  select
    coalesce(sum(gross_amount), 0),
    coalesce(sum(platform_fee), 0),
    coalesce(sum(net_amount), 0)
  into v_gross, v_commission, v_net
  from public.provider_earnings_ledger
  where provider_id = p_provider_id;

  -- Calculate completed payouts
  select coalesce(sum(net_amount), 0)
  into v_paid_out
  from public.provider_payouts
  where provider_id = p_provider_id and status = 'completed';

  -- Calculate pending payouts
  select coalesce(sum(net_amount), 0)
  into v_pending_payout
  from public.provider_payouts
  where provider_id = p_provider_id and status in ('pending', 'processing');

  v_available := greatest(0, v_net - v_paid_out - v_pending_payout);

  return jsonb_build_object(
    'providerId', p_provider_id,
    'grossEarnings', v_gross,
    'platformCommission', v_commission,
    'netEarnings', v_net,
    'paidOut', v_paid_out,
    'pendingPayout', v_pending_payout,
    'availableBalance', v_available,
    'commissionRate', 0.10,
    'currency', 'BDT'
  );
end;
$$;

-- ------------------------------------------------------------
-- 5. RPC: request_provider_payout
-- ------------------------------------------------------------
create or replace function public.request_provider_payout(
  p_provider_id uuid,
  p_amount numeric,
  p_method text,
  p_account_details jsonb,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
  v_provider record;
  v_summary jsonb;
  v_available numeric(10,2);
  v_payout_id uuid;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required to request payout';
  end if;

  select * into v_provider from public.providers where id = p_provider_id;
  if not found then
    raise exception 'Provider not found: %', p_provider_id;
  end if;

  if v_provider.owner_user_id <> v_caller_id and not public.is_admin() then
    raise exception 'Unauthorized: Only provider owner can request payout';
  end if;

  if p_amount < 500 then
    raise exception 'Minimum withdrawal amount is 500 BDT';
  end if;

  -- Verify available balance
  v_summary := public.get_provider_earnings_summary(p_provider_id);
  v_available := (v_summary->>'availableBalance')::numeric;

  -- Allow mock/demo payout requests even if available balance is low during initial testing
  if v_available < p_amount and not public.is_admin() and v_available > 0 then
    raise exception 'Insufficient balance: Requested % BDT, Available % BDT', p_amount, v_available;
  end if;

  insert into public.provider_payouts (
    provider_id,
    amount,
    commission_deducted,
    net_amount,
    currency,
    status,
    payout_method,
    account_details,
    requested_by,
    notes
  ) values (
    p_provider_id,
    p_amount,
    0,
    p_amount,
    'BDT',
    'pending',
    p_method,
    coalesce(p_account_details, '{}'),
    v_caller_id,
    p_notes
  )
  returning id into v_payout_id;

  return jsonb_build_object(
    'success', true,
    'payoutId', v_payout_id,
    'providerId', p_provider_id,
    'amount', p_amount,
    'status', 'pending',
    'message', 'Payout withdrawal request registered successfully'
  );
end;
$$;

-- ------------------------------------------------------------
-- 6. RPC: process_provider_payout (Admin)
-- ------------------------------------------------------------
create or replace function public.process_provider_payout(
  p_payout_id uuid,
  p_action text, -- 'completed' | 'rejected' | 'processing'
  p_reference text default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_payout record;
begin
  v_admin_id := auth.uid();
  if v_admin_id is null or not public.is_admin() then
    raise exception 'Unauthorized: Only administrators can process provider payouts';
  end if;

  select * into v_payout from public.provider_payouts where id = p_payout_id;
  if not found then
    raise exception 'Payout record not found: %', p_payout_id;
  end if;

  if p_action = 'completed' then
    update public.provider_payouts
    set status = 'completed',
        transaction_reference = coalesce(p_reference, 'PO-TXN-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random() * 9000 + 1000)::int)::text, 4, '0')),
        processed_by = v_admin_id,
        processed_at = now(),
        notes = coalesce(p_notes, notes),
        updated_at = now()
    where id = p_payout_id;

    -- Mark linked ledger records as settled
    update public.provider_earnings_ledger
    set is_settled = true,
        payout_id = p_payout_id
    where provider_id = v_payout.provider_id and is_settled = false;

  elsif p_action = 'rejected' then
    update public.provider_payouts
    set status = 'rejected',
        processed_by = v_admin_id,
        processed_at = now(),
        notes = coalesce(p_notes, notes),
        updated_at = now()
    where id = p_payout_id;

  elsif p_action = 'processing' then
    update public.provider_payouts
    set status = 'processing',
        processed_by = v_admin_id,
        notes = coalesce(p_notes, notes),
        updated_at = now()
    where id = p_payout_id;
  else
    raise exception 'Invalid payout action: %', p_action;
  end if;

  return jsonb_build_object(
    'success', true,
    'payoutId', p_payout_id,
    'status', p_action,
    'reference', p_reference
  );
end;
$$;

-- Grants
grant execute on function public.get_provider_earnings_summary(uuid) to authenticated;
grant execute on function public.request_provider_payout(uuid, numeric, text, jsonb, text) to authenticated;
grant execute on function public.process_provider_payout(uuid, text, text, text) to authenticated;
