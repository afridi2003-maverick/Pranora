-- pgTAP test suite for APT-4: Booking reminders 24h / 1h
begin;

select plan(8);

select has_table('public', 'booking_reminders', 'booking_reminders table exists');
select has_column('public', 'booking_reminders', 'reminder_window', 'booking_reminders.reminder_window exists');
select has_column('public', 'booking_reminders', 'remind_at', 'booking_reminders.remind_at exists');
select has_column('public', 'booking_reminders', 'status', 'booking_reminders.status exists');
select has_index('public', 'booking_reminders', 'idx_booking_reminders_unique_window', 'unique window index exists');
select has_function('public', 'schedule_booking_reminders', array['uuid', 'timestamptz', 'boolean', 'boolean', 'text'], 'schedule_booking_reminders RPC exists');
select has_function('public', 'cancel_booking_reminders', array['uuid'], 'cancel_booking_reminders RPC exists');
select policy_exists(
  'public', 'booking_reminders', 'booking_reminders: owner can view',
  'Owner can view booking_reminders policy exists'
);

select * from finish();

rollback;
