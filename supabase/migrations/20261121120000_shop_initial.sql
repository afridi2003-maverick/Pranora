-- ============================================================
-- Migration: 20261121120000_shop_initial.sql
-- Owner: Brehat (@brihoth) | Sprint: S7 | Task: SVC-SHOP
-- Pet shop catalog, orders, and order items with Cash on Delivery and online payment support
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table: products
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  name_bn text not null,
  name_en text not null,
  description_bn text,
  description_en text,
  category text not null check (category in ('food', 'medicine', 'accessories', 'toys', 'hygiene')),
  species public.species_type[] not null default '{dog,cat}',
  price numeric(10,2) not null check (price >= 0),
  sale_price numeric(10,2) check (sale_price is null or (sale_price >= 0 and sale_price <= price)),
  stock integer not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  requires_prescription boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_provider_idx on public.products (provider_id);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_active_idx on public.products (is_active) where is_active = true;
create index if not exists products_species_idx on public.products using gin (species);

-- Updated_at trigger for products
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 2. Table: orders
-- ------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  address_id uuid references public.addresses(id) on delete set null,
  shipping_address text not null,
  phone text not null,
  status public.order_status not null default 'placed',
  subtotal numeric(10,2) not null check (subtotal >= 0),
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  payment_method public.payment_method not null default 'cash',
  payment_status public.payment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_owner_idx on public.orders (owner_id, created_at desc);
create index if not exists orders_provider_idx on public.orders (provider_id, created_at desc);
create index if not exists orders_code_idx on public.orders (code);
create index if not exists orders_status_idx on public.orders (status);

-- Updated_at trigger for orders
drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 3. Table: order_items
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

-- ------------------------------------------------------------
-- 4. Row Level Security
-- ------------------------------------------------------------
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products: Everyone can view active products; provider/admin can view and edit all
drop policy if exists "products: public view active" on public.products;
create policy "products: public view active"
  on public.products
  for select
  using (
    is_active = true or
    public.is_admin() or
    exists (
      select 1 from public.providers p
      where p.id = products.provider_id
      and p.user_id = auth.uid()
    )
  );

drop policy if exists "products: provider manage own" on public.products;
create policy "products: provider manage own"
  on public.products
  for all
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.providers p
      where p.id = products.provider_id
      and p.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin() or
    exists (
      select 1 from public.providers p
      where p.id = products.provider_id
      and p.user_id = auth.uid()
    )
  );

-- Orders: Owner, shop provider, or admin can select
drop policy if exists "orders: select own or shop" on public.orders;
create policy "orders: select own or shop"
  on public.orders
  for select
  to authenticated
  using (
    auth.uid() = owner_id or
    public.is_admin() or
    exists (
      select 1 from public.providers p
      where p.id = orders.provider_id
      and p.user_id = auth.uid()
    )
  );

drop policy if exists "orders: customer insert own" on public.orders;
create policy "orders: customer insert own"
  on public.orders
  for insert
  to authenticated
  with check (
    auth.uid() = owner_id
  );

drop policy if exists "orders: customer cancel placed or shop update" on public.orders;
create policy "orders: customer cancel placed or shop update"
  on public.orders
  for update
  to authenticated
  using (
    (auth.uid() = owner_id and status in ('placed', 'confirmed')) or
    public.is_admin() or
    exists (
      select 1 from public.providers p
      where p.id = orders.provider_id
      and p.user_id = auth.uid()
    )
  );

-- Order Items: Follows parent order visibility
drop policy if exists "order_items: select related order" on public.order_items;
create policy "order_items: select related order"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
      and (
        o.owner_id = auth.uid() or
        public.is_admin() or
        exists (
          select 1 from public.providers p
          where p.id = o.provider_id
          and p.user_id = auth.uid()
        )
      )
    )
  );

drop policy if exists "order_items: insert via order" on public.order_items;
create policy "order_items: insert via order"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
      and o.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 5. RPC: create_shop_order
-- ------------------------------------------------------------
create or replace function public.create_shop_order(
  p_provider_id uuid,
  p_address_id uuid default null,
  p_shipping_address text default null,
  p_phone text default null,
  p_items jsonb default '[]'::jsonb,
  p_payment_method public.payment_method default 'cash',
  p_delivery_fee numeric default 60.00,
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
  v_order_id uuid;
  v_order_code text;
  v_item record;
  v_product record;
  v_subtotal numeric(10,2) := 0;
  v_total numeric(10,2) := 0;
  v_delivery_fee numeric(10,2) := coalesce(p_delivery_fee, 60.00);
  v_shipping text;
  v_phone text;
  v_item_count integer := 0;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required to place an order';
  end if;

  -- Verify provider exists
  select * into v_provider from public.providers where id = p_provider_id;
  if not found then
    raise exception 'Shop provider not found';
  end if;

  -- Validate items
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one product item';
  end if;

  -- Resolve shipping address and phone
  if p_shipping_address is not null and trim(p_shipping_address) <> '' then
    v_shipping := trim(p_shipping_address);
  elsif p_address_id is not null then
    select address_line into v_shipping from public.addresses where id = p_address_id and user_id = v_caller_id;
    if v_shipping is null then
      raise exception 'Shipping address not found';
    end if;
  else
    raise exception 'Shipping address is required';
  end if;

  if p_phone is not null and trim(p_phone) <> '' then
    v_phone := trim(p_phone);
  else
    select phone into v_phone from public.profiles where id = v_caller_id;
    if v_phone is null or trim(v_phone) = '' then
      raise exception 'Contact phone number is required';
    end if;
  end if;

  -- Generate readable unique order code: PR-ORD-YYMMDD-XXXX
  v_order_code := 'PR-ORD-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random() * 9000 + 1000)::int)::text, 4, '0');

  -- Pre-validate items and stock, calculate subtotal
  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  loop
    v_item_count := v_item_count + 1;
    if v_item.quantity is null or v_item.quantity <= 0 then
      raise exception 'Invalid quantity for product %', v_item.product_id;
    end if;

    select * into v_product from public.products
    where id = v_item.product_id and is_active = true
    for update;

    if not found then
      raise exception 'Product % is not available', v_item.product_id;
    end if;

    if v_product.stock < v_item.quantity then
      raise exception 'Insufficient stock for product % (available: %, requested: %)',
        v_product.name_bn, v_product.stock, v_item.quantity;
    end if;

    -- Calculate item price
    v_subtotal := v_subtotal + (coalesce(v_product.sale_price, v_product.price) * v_item.quantity);
  end loop;

  v_total := v_subtotal + v_delivery_fee;

  -- Insert order
  insert into public.orders (
    code,
    owner_id,
    provider_id,
    address_id,
    shipping_address,
    phone,
    status,
    subtotal,
    delivery_fee,
    total,
    payment_method,
    payment_status,
    notes
  ) values (
    v_order_code,
    v_caller_id,
    p_provider_id,
    p_address_id,
    v_shipping,
    v_phone,
    'placed',
    v_subtotal,
    v_delivery_fee,
    v_total,
    p_payment_method,
    'pending',
    p_notes
  )
  returning id into v_order_id;

  -- Insert order items and deduct stock
  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  loop
    select * into v_product from public.products where id = v_item.product_id;

    insert into public.order_items (
      order_id,
      product_id,
      quantity,
      unit_price
    ) values (
      v_order_id,
      v_item.product_id,
      v_item.quantity,
      coalesce(v_product.sale_price, v_product.price)
    );

    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id;
  end loop;

  -- Create in-app notification for the customer
  insert into public.notifications (
    user_id,
    title_bn,
    title_en,
    body_bn,
    body_en,
    data,
    channel
  ) values (
    v_caller_id,
    'অর্ডার সফলভাবে গ্রহণ করা হয়েছে (' || v_order_code || ')',
    'Order Placed Successfully (' || v_order_code || ')',
    'আপনার ৳' || v_total::text || ' মূল্যের অর্ডারটি গ্রহণ করা হয়েছে। ডেলিভারির সময় আপনাকে অবহিত করা হবে।',
    'Your order of BDT ' || v_total::text || ' has been placed. You will be notified when shipped.',
    jsonb_build_object('order_id', v_order_id, 'order_code', v_order_code, 'total', v_total),
    'in_app'
  );

  -- Create in-app notification for the provider if distinct
  if v_provider.user_id is not null and v_provider.user_id <> v_caller_id then
    insert into public.notifications (
      user_id,
      title_bn,
      title_en,
      body_bn,
      body_en,
      data,
      channel
    ) values (
      v_provider.user_id,
      'নতুন শপ অর্ডার প্রাপ্তি (' || v_order_code || ')',
      'New Shop Order Received (' || v_order_code || ')',
      'গ্রাহক ' || v_phone || ' থেকে ৳' || v_total::text || ' এর একটি নতুন অর্ডার এসেছে।',
      'A new order of BDT ' || v_total::text || ' received from customer ' || v_phone || '.',
      jsonb_build_object('order_id', v_order_id, 'order_code', v_order_code, 'total', v_total),
      'in_app'
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_code', v_order_code,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total,
    'payment_method', p_payment_method,
    'payment_status', 'pending',
    'status', 'placed'
  );
end;
$$;

-- ------------------------------------------------------------
-- 6. RPC: cancel_shop_order
-- ------------------------------------------------------------
create or replace function public.cancel_shop_order(
  p_order_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
  v_order record;
  v_item record;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required to cancel an order';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;

  -- Caller must be owner, provider, or admin
  if v_order.owner_id <> v_caller_id and not public.is_admin() then
    if not exists (select 1 from public.providers p where p.id = v_order.provider_id and p.user_id = v_caller_id) then
      raise exception 'Unauthorized to cancel this order';
    end if;
  end if;

  if v_order.status not in ('placed', 'confirmed') then
    raise exception 'Cannot cancel order in % status', v_order.status;
  end if;

  -- Restore product stock
  for v_item in select product_id, quantity from public.order_items where order_id = p_order_id
  loop
    update public.products
    set stock = stock + v_item.quantity
    where id = v_item.product_id;
  end loop;

  -- Mark order cancelled
  update public.orders
  set status = 'cancelled',
      notes = case when p_reason is not null then coalesce(notes || ' | Reason: ' || p_reason, p_reason) else notes end,
      updated_at = now()
  where id = p_order_id;

  -- Customer notification
  insert into public.notifications (
    user_id,
    title_bn,
    title_en,
    body_bn,
    body_en,
    data,
    channel
  ) values (
    v_order.owner_id,
    'অর্ডার বাতিল হয়েছে (' || v_order.code || ')',
    'Order Cancelled (' || v_order.code || ')',
    'আপনার অর্ডার ' || v_order.code || ' বাতিল করা হয়েছে।',
    'Your order ' || v_order.code || ' has been cancelled.',
    jsonb_build_object('order_id', p_order_id, 'reason', p_reason),
    'in_app'
  );

  return jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'status', 'cancelled'
  );
end;
$$;

-- ------------------------------------------------------------
-- 7. RPC: init_order_online_payment
-- ------------------------------------------------------------
create or replace function public.init_order_online_payment(
  p_order_id uuid,
  p_method public.payment_method default 'card',
  p_gateway text default 'sslcommerz'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
  v_order record;
  v_tran_id text;
  v_payment_id uuid;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required to initiate payment';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.owner_id <> v_caller_id and not public.is_admin() then
    raise exception 'Unauthorized to pay for this order';
  end if;

  if v_order.payment_status = 'paid' then
    raise exception 'Order is already paid';
  end if;

  -- Unique transaction ID: PRN-ORD-<timestamp>-<rand4>
  v_tran_id := 'PRN-ORD-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || lpad((floor(random() * 9000 + 1000)::int)::text, 4, '0');

  -- Update order payment method
  update public.orders
  set payment_method = p_method,
      updated_at = now()
  where id = p_order_id;

  -- Insert payment if payments table exists
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'payments') then
    insert into public.payments (
      order_id,
      user_id,
      amount,
      currency,
      method,
      status,
      gateway,
      gateway_tran_id
    ) values (
      p_order_id,
      v_caller_id,
      v_order.total,
      'BDT',
      p_method,
      'pending',
      coalesce(p_gateway, 'sslcommerz'),
      v_tran_id
    )
    returning id into v_payment_id;
  end if;

  return jsonb_build_object(
    'paymentId', v_payment_id,
    'orderId', p_order_id,
    'transactionId', v_tran_id,
    'amount', v_order.total,
    'currency', 'BDT',
    'method', p_method,
    'status', 'pending'
  );
end;
$$;

-- Permissions
grant execute on function public.create_shop_order(uuid, uuid, text, text, jsonb, public.payment_method, numeric, text) to authenticated;
grant execute on function public.cancel_shop_order(uuid, text) to authenticated;
grant execute on function public.init_order_online_payment(uuid, public.payment_method, text) to authenticated;
