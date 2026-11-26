-- pgTAP test suite for SVC-ONL: Online consultation
begin;

select plan(7);

select has_table('public', 'online_consultations', 'online_consultations table exists');
select has_column('public', 'online_consultations', 'call_mode', 'online_consultations.call_mode exists');
select has_column('public', 'online_consultations', 'fee_bdt', 'online_consultations.fee_bdt exists');
select has_column('public', 'online_consultations', 'payment_status', 'online_consultations.payment_status exists');
select has_column('public', 'online_consultations', 'call_session_id', 'online_consultations.call_session_id exists');
select has_function('public', 'create_online_consultation', array['uuid', 'uuid', 'text', 'text', 'integer', 'timestamptz'], 'create_online_consultation RPC exists');
select policy_exists(
  'public', 'online_consultations', 'online_consultations: owner can view',
  'Owner can view online_consultations policy exists'
);

select * from finish();

rollback;
