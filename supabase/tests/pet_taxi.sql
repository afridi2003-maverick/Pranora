-- pgTAP test suite for SVC-TAXI: Pet taxi
begin;

select plan(7);

select has_table('public', 'pet_taxi_rides', 'pet_taxi_rides table exists');
select has_column('public', 'pet_taxi_rides', 'pickup_address', 'pet_taxi_rides.pickup_address exists');
select has_column('public', 'pet_taxi_rides', 'dropoff_address', 'pet_taxi_rides.dropoff_address exists');
select has_column('public', 'pet_taxi_rides', 'vehicle_type', 'pet_taxi_rides.vehicle_type exists');
select has_column('public', 'pet_taxi_rides', 'estimated_fare_bdt', 'pet_taxi_rides.estimated_fare_bdt exists');
select has_function('public', 'request_pet_taxi', array['uuid', 'text', 'text', 'text', 'boolean', 'boolean', 'timestamptz', 'integer', 'text'], 'request_pet_taxi RPC exists');
select policy_exists(
  'public', 'pet_taxi_rides', 'pet_taxi_rides: owner can view',
  'Owner can view pet_taxi_rides policy exists'
);

select * from finish();

rollback;
