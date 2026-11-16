-- ============================================================
-- pgTAP tests for DB-3: Pets & Health Tables Security & Schema
-- Owner: zihad | Task: DB-3
-- ============================================================

begin;
select plan(24);

-- 1. Verify tables exist
select has_table('public', 'breeds', 'Table breeds exists');
select has_table('public', 'pets', 'Table pets exists');
select has_table('public', 'pet_weights', 'Table pet_weights exists');
select has_table('public', 'pet_ownership_history', 'Table pet_ownership_history exists');
select has_table('public', 'vaccine_templates', 'Table vaccine_templates exists');
select has_table('public', 'vaccinations', 'Table vaccinations exists');
select has_table('public', 'medical_records', 'Table medical_records exists');
select has_table('public', 'prescriptions', 'Table prescriptions exists');
select has_table('public', 'pet_documents', 'Table pet_documents exists');
select has_table('public', 'reminders', 'Table reminders exists');
select has_table('public', 'vets', 'Table vets exists');

-- 2. Verify RLS is active on all tables
select row_level_security_is_active('public', 'breeds', 'RLS is active on breeds');
select row_level_security_is_active('public', 'pets', 'RLS is active on pets');
select row_level_security_is_active('public', 'pet_weights', 'RLS is active on pet_weights');
select row_level_security_is_active('public', 'pet_ownership_history', 'RLS is active on pet_ownership_history');
select row_level_security_is_active('public', 'vaccine_templates', 'RLS is active on vaccine_templates');
select row_level_security_is_active('public', 'vaccinations', 'RLS is active on vaccinations');
select row_level_security_is_active('public', 'medical_records', 'RLS is active on medical_records');
select row_level_security_is_active('public', 'prescriptions', 'RLS is active on prescriptions');
select row_level_security_is_active('public', 'pet_documents', 'RLS is active on pet_documents');
select row_level_security_is_active('public', 'reminders', 'RLS is active on reminders');
select row_level_security_is_active('public', 'vets', 'RLS is active on vets');

-- 3. Verify helper functions exist
select has_function('public', 'register_pet_ownership', array['uuid'], 'register_pet_ownership(uuid) exists');
select has_function('public', 'generate_vaccine_schedule', array['uuid', 'integer'], 'generate_vaccine_schedule(uuid, integer) exists');

select * from finish();
rollback;
