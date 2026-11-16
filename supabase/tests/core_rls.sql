-- ============================================================
-- pgTAP tests for DB-6: RLS Framework & Core Table Security
-- ============================================================

begin;
select plan(16);

-- 1. Verify helper functions exist
select has_function('public', 'has_role', array['user_role'], 'has_role(user_role) exists');
select has_function('public', 'has_role', array['uuid', 'user_role'], 'has_role(uuid, user_role) exists');
select has_function('public', 'is_admin', array[]::text[], 'is_admin() exists');
select has_function('public', 'is_admin', array['uuid'], 'is_admin(uuid) exists');

-- 2. Verify RLS is enabled on all core tables
select row_level_security_is_active('public', 'profiles', 'RLS is active on profiles');
select row_level_security_is_active('public', 'user_roles', 'RLS is active on user_roles');
select row_level_security_is_active('public', 'addresses', 'RLS is active on addresses');
select row_level_security_is_active('public', 'rescuer_profiles', 'RLS is active on rescuer_profiles');
select row_level_security_is_active('public', 'app_config', 'RLS is active on app_config');
select row_level_security_is_active('public', 'divisions', 'RLS is active on divisions');
select row_level_security_is_active('public', 'districts', 'RLS is active on districts');
select row_level_security_is_active('public', 'upazilas', 'RLS is active on upazilas');

-- 3. Verify key security policies exist
select policy_exists('public', 'profiles', 'profiles: select own or admin', 'Policy profiles select own or admin exists');
select policy_exists('public', 'user_roles', 'user_roles: select own or admin', 'Policy user_roles select own or admin exists');
select policy_exists('public', 'user_roles', 'user_roles: update admin only', 'Policy user_roles update admin only exists');
select policy_exists('public', 'app_config', 'app_config: admin write', 'Policy app_config admin write exists');

select * from finish();
rollback;
