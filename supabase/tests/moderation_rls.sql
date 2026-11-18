-- ============================================================
-- pgTAP tests for ADM-2: Content Moderation & Abuse Prevention
-- Owner: Afridi | Branch: afridi | Sprint: S5
-- ============================================================

begin;
select plan(8);

-- 1. Table exists
select has_table('public', 'content_reports', 'content_reports table exists');

-- 2. Columns exist
select has_column('public', 'content_reports', 'id', 'content_reports has id column');
select has_column('public', 'content_reports', 'reporter_id', 'content_reports has reporter_id column');
select has_column('public', 'content_reports', 'target_type', 'content_reports has target_type column');
select has_column('public', 'content_reports', 'target_id', 'content_reports has target_id column');
select has_column('public', 'content_reports', 'status', 'content_reports has status column');

-- 3. RLS is enabled
select row_level_security_active('public', 'content_reports', 'content_reports has RLS enabled');

-- 4. RPCs exist
select has_function('public', 'moderate_content', Array['uuid', 'text', 'text', 'boolean'], 'moderate_content RPC exists');

select * from finish();
rollback;
