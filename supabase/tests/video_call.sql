-- pgTAP test suite for CALL-2: Owner-vet video call
begin;

select plan(5);

select has_table('public', 'call_sessions', 'call_sessions table exists');
select has_column('public', 'call_sessions', 'call_type', 'call_sessions.call_type exists');
select has_function('public', 'initiate_call', array['uuid', 'text'], 'initiate_call RPC exists');
select has_function('public', 'end_call', array['uuid', 'integer'], 'end_call RPC exists');
select policy_exists(
  'public', 'call_sessions', 'call_sessions: participants can update',
  'Participants can update call_sessions policy exists'
);

select * from finish();

rollback;
