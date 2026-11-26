-- SVC-TAXI: Pet taxi (pickup/dropoff booking, vehicle type, crate option, fare estimate & payment)

create table if not exists public.pet_taxi_rides (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  dropoff_address text not null,
  dropoff_lat double precision,
  dropoff_lng double precision,
  vehicle_type text not null default 'ac_car' check (vehicle_type in ('bike_carrier', 'ac_car', 'van')),
  needs_crate boolean not null default true,
  round_trip boolean not null default false,
  scheduled_at timestamptz not null,
  estimated_fare_bdt integer not null check (estimated_fare_bdt >= 0),
  payment_method text not null default 'sslcommerz' check (payment_method in ('cash', 'sslcommerz')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  status text not null default 'requested' check (
    status in ('requested', 'driver_assigned', 'in_transit', 'completed', 'cancelled')
  ),
  driver_name text,
  driver_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pet_taxi_rides_owner
  on public.pet_taxi_rides (owner_user_id, created_at desc);

alter table public.pet_taxi_rides enable row level security;

create policy "pet_taxi_rides: owner can view"
  on public.pet_taxi_rides
  for select
  using (auth.uid() = owner_user_id);

create policy "pet_taxi_rides: owner can insert"
  on public.pet_taxi_rides
  for insert
  with check (auth.uid() = owner_user_id);

create policy "pet_taxi_rides: owner can update"
  on public.pet_taxi_rides
  for update
  using (auth.uid() = owner_user_id);

-- RPC: request_pet_taxi
create or replace function public.request_pet_taxi(
  p_pet_id uuid,
  p_pickup_address text,
  p_dropoff_address text,
  p_vehicle_type text,
  p_needs_crate boolean,
  p_round_trip boolean,
  p_scheduled_at timestamptz,
  p_estimated_fare_bdt integer,
  p_payment_method text default 'sslcommerz'
)
returns public.pet_taxi_rides
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_ride public.pet_taxi_rides;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.pet_taxi_rides (
    owner_user_id,
    pet_id,
    pickup_address,
    dropoff_address,
    vehicle_type,
    needs_crate,
    round_trip,
    scheduled_at,
    estimated_fare_bdt,
    payment_method
  )
  values (
    v_user_id,
    p_pet_id,
    p_pickup_address,
    p_dropoff_address,
    p_vehicle_type,
    p_needs_crate,
    p_round_trip,
    p_scheduled_at,
    p_estimated_fare_bdt,
    p_payment_method
  )
  returning * into v_ride;

  return v_ride;
end;
$$;
