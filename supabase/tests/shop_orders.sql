-- ============================================================
-- SVC-SHOP pgTAP tests: products, orders, order_items & RPCs
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S7
-- ============================================================

begin;

select plan(8);

-- ── 1. Table existence checks ───────────────────────────────────

select has_table('public', 'products',
  'products table exists');

select has_table('public', 'orders',
  'orders table exists');

select has_table('public', 'order_items',
  'order_items table exists');

-- ── 2. Column existence checks ──────────────────────────────────

select has_column('public', 'products', 'requires_prescription',
  'products has requires_prescription column');

select has_column('public', 'orders', 'code',
  'orders has code column');

select has_column('public', 'orders', 'payment_method',
  'orders has payment_method column');

-- ── 3. RPC function existence checks ─────────────────────────

select has_function('public', 'create_shop_order',
  array['uuid', 'uuid', 'text', 'text', 'jsonb', 'payment_method', 'numeric', 'text'],
  'function public.create_shop_order exists');

select has_function('public', 'cancel_shop_order',
  array['uuid', 'text'],
  'function public.cancel_shop_order exists');

select * from finish();

rollback;
