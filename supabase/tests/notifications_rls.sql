-- ============================================================
-- pgTAP tests for NOTIF-1: Notifications Schema & Security
-- ============================================================

begin;
select plan(8);

-- 1. Check notifications table exists
select has_table('public', 'notifications', 'Table notifications exists');

-- 2. Check RLS is active
select row_level_security_is_active('public', 'notifications', 'RLS is active on notifications');

-- 3. Check policies exist
select policy_exists('public', 'notifications', 'notifications: select own or admin', 'Policy select own or admin exists');
select policy_exists('public', 'notifications', 'notifications: update own read_at', 'Policy update own read_at exists');
select policy_exists('public', 'notifications', 'notifications: delete own or admin', 'Policy delete own or admin exists');
select policy_exists('public', 'notifications', 'notifications: admin insert', 'Policy admin insert exists');

-- 4. Check functions exist
select has_function('public', 'create_notification', array['uuid', 'text', 'text', 'text', 'text', 'jsonb', 'text'], 'create_notification function exists');
select has_function('public', 'notify', array['uuid', 'text', 'jsonb', 'text[]'], 'notify RPC function exists');

select * from finish();
rollback;
