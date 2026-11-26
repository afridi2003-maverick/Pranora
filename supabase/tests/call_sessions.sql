-- pgTAP test suite for CALL-1: Owner-vet audio call
begin;

select plan(9);

-- ── 1. Table existence ───────────────────────────────────────────────────────
select has_table('public', 'call_sessions', 'call_sessions table exists');

-- ── 2. Columns ───────────────────────────────────────────────────────────────
select has_column('public', 'call_sessions', 'booking_id', 'call_sessions.booking_id exists');
select has_column('public', 'call_sessions', 'call_type', 'call_sessions.call_type exists');
select has_column('public', 'call_sessions', 'status', 'call_sessions.status exists');
select has_column('public', 'call_sessions', 'room_name', 'call_sessions.room_name exists');
select has_column('public', 'call_sessions', 'duration_seconds', 'call_sessions.duration_seconds exists');

-- ── 3. Functions ─────────────────────────────────────────────────────────────
select has_function('public', 'initiate_call', array['uuid', 'text'], 'initiate_call RPC exists');
select has_function('public', 'end_call', array['uuid', 'integer'], 'end_call RPC exists');

-- ── 4. RLS Policies ──────────────────────────────────────────────────────────
select policy_exists(
  'public', 'call_sessions', 'call_sessions: participants can view',
  'Participants can view call_sessions policy exists'
);

select * from finish();

rollback;
