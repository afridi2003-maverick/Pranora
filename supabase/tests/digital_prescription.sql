-- pgTAP test suite for APT-5: Digital prescription (vet only)
begin;

select plan(7);

-- ── 1. Table existence ───────────────────────────────────────────────────────

select has_table('public', 'medical_records', 'medical_records table exists');
select has_table('public', 'prescriptions',    'prescriptions table exists');

-- ── 2. Columns & foreign keys ────────────────────────────────────────────────

select has_column('public', 'medical_records', 'booking_id', 'medical_records.booking_id exists');
select has_column('public', 'prescriptions', 'medicine',     'prescriptions.medicine exists');
select has_column('public', 'prescriptions', 'dosage',       'prescriptions.dosage exists');

-- ── 3. RLS Policies ─────────────────────────────────────────────────────────

select policy_exists(
  'public', 'prescriptions', 'prescriptions: vet manages via record',
  'Vet manages prescriptions policy exists'
);

select policy_exists(
  'public', 'prescriptions', 'prescriptions: owner reads via record',
  'Owner reads prescriptions policy exists'
);

select * from finish();

rollback;
