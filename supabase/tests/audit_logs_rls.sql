-- ============================================================
-- pgTAP tests for ADM-4: Audit Log and Trigger Infrastructure
-- Owner: afridi | Branch: afridi | Sprint: S6
-- ============================================================

begin;
select plan(7);

-- 1. Table exists
select has_table('public', 'audit_logs', 'audit_logs table exists');

-- 2. Columns exist
select has_column('public', 'audit_logs', 'id', 'audit_logs has id column');
select has_column('public', 'audit_logs', 'actor_id', 'audit_logs has actor_id column');
select has_column('public', 'audit_logs', 'action', 'audit_logs has action column');
select has_column('public', 'audit_logs', 'table_name', 'audit_logs has table_name column');

-- 3. RLS is enabled
select row_level_security_active('public', 'audit_logs', 'audit_logs has RLS enabled');

-- 4. Function audit_row_change exists
select has_function('public', 'audit_row_change', 'audit_row_change trigger function exists');

select * from finish();
rollback;
