-- pgTAP test suite for CALL-3: Call history
begin;

select plan(5);

select has_table('public', 'call_sessions', 'call_sessions table exists');
select has_index('public', 'call_sessions', 'idx_call_sessions_owner', 'owner index exists for call history');
select has_index('public', 'call_sessions', 'idx_call_sessions_vet', 'vet index exists for call history');
select has_column('public', 'call_sessions', 'started_at', 'call_sessions.started_at exists');
select has_column('public', 'call_sessions', 'ended_at', 'call_sessions.ended_at exists');

select * from finish();

rollback;
