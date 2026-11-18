-- ============================================================
-- pgTAP tests for DB-5: Bookings, Scheduling & RLS Security
-- ============================================================

begin;
select plan(21);

-- 1. Verify tables exist
select has_table('public', 'availability_rules', 'availability_rules table exists');
select has_table('public', 'availability_exceptions', 'availability_exceptions table exists');
select has_table('public', 'bookings', 'bookings table exists');

-- 2. Verify key columns
select has_column('public', 'availability_rules', 'location_id', 'availability_rules has location_id');
select has_column('public', 'availability_rules', 'weekday', 'availability_rules has weekday');
select has_column('public', 'availability_rules', 'mode', 'availability_rules has mode');
select has_column('public', 'availability_rules', 'max_serials', 'availability_rules has max_serials');

select has_column('public', 'availability_exceptions', 'location_id', 'availability_exceptions has location_id');
select has_column('public', 'availability_exceptions', 'date', 'availability_exceptions has date');
select has_column('public', 'availability_exceptions', 'is_closed', 'availability_exceptions has is_closed');

select has_column('public', 'bookings', 'code', 'bookings has code');
select has_column('public', 'bookings', 'owner_id', 'bookings has owner_id');
select has_column('public', 'bookings', 'location_id', 'bookings has location_id');
select has_column('public', 'bookings', 'provider_service_id', 'bookings has provider_service_id');
select has_column('public', 'bookings', 'type', 'bookings has type');
select has_column('public', 'bookings', 'status', 'bookings has status');

-- 3. Verify Row Level Security is active
select row_level_security_is_active('public', 'availability_rules', 'RLS is active on availability_rules');
select row_level_security_is_active('public', 'availability_exceptions', 'RLS is active on availability_exceptions');
select row_level_security_is_active('public', 'bookings', 'RLS is active on bookings');

-- 4. Verify double-booking prevention indexes
select has_index('public', 'bookings', 'bookings_no_double_slot', 'Double-slot prevention partial index exists');
select has_index('public', 'bookings', 'bookings_no_double_serial', 'Double-serial prevention partial index exists');

select * from finish();
rollback;
