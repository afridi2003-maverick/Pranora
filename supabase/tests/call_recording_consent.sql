-- pgTAP test suite for CALL-4: Call recording (both must consent)
begin;

select plan(7);

select has_table('public', 'call_recording_consents', 'call_recording_consents table exists');
select has_column('public', 'call_sessions', 'recording_status', 'call_sessions.recording_status exists');
select has_column('public', 'call_sessions', 'recording_url', 'call_sessions.recording_url exists');
select has_column('public', 'call_recording_consents', 'consented', 'call_recording_consents.consented exists');
select has_index('public', 'call_recording_consents', 'idx_call_recording_consents_unique', 'unique consent index exists');
select has_function('public', 'set_call_recording_consent', array['uuid', 'boolean', 'text'], 'set_call_recording_consent RPC exists');
select policy_exists(
  'public', 'call_recording_consents', 'call_recording_consents: participants can view',
  'Participants can view recording consents policy exists'
);

select * from finish();

rollback;
