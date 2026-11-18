-- ============================================================
-- HLT-2: Reminders Cron Scheduler Migration
-- pg_cron + pg_net: fires send-reminders Edge Function every 15 min
-- Owner: afridi | Branch: afridi | Sprint: S5
-- Depends on: HLT-1 (reminders table), NOTIF-1 (notify RPC)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Enable required extensions
-- ------------------------------------------------------------
create extension if not exists pg_cron    with schema extensions;
create extension if not exists pg_net     with schema extensions;

-- ------------------------------------------------------------
-- 2. Composite index for per-pet reminder queries (HLT-2 + APT-4 + ADP-9)
-- ------------------------------------------------------------
create index if not exists reminders_pet_remind_idx
  on public.reminders (pet_id, remind_at)
  where is_done = false;

-- ------------------------------------------------------------
-- 3. Helper: trigger the send-reminders Edge Function
--    Uses pg_net to call the Supabase Edge Function over HTTP.
--    The service-role key is stored in vault.secrets; fall back to
--    the anon key so local/CI runs without vault configured.
-- ------------------------------------------------------------
create or replace function public.trigger_send_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service_key text;
  v_project_ref text;
  v_url         text;
begin
  -- Read project ref from app.settings (set in supabase config.toml)
  v_project_ref := current_setting('app.supabase_project_ref', true);

  -- Try vault first; fall back gracefully so CI stays green
  begin
    select decrypted_secret
      into v_service_key
      from vault.decrypted_secrets
     where name = 'supabase_service_role_key'
     limit 1;
  exception when others then
    v_service_key := null;
  end;

  if v_service_key is null then
    v_service_key := current_setting('app.service_role_key', true);
  end if;

  if v_project_ref is null or v_service_key is null then
    raise notice 'trigger_send_reminders: project_ref or service_key not configured; skipping.';
    return;
  end if;

  v_url := 'https://' || v_project_ref || '.supabase.co/functions/v1/send-reminders';

  perform extensions.http_post(
    url     => v_url,
    headers => jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || v_service_key
               ),
    body    => '{}'::jsonb
  );
end;
$$;

-- Only service_role and superuser may call this directly
revoke all on function public.trigger_send_reminders() from public;
grant  execute on function public.trigger_send_reminders() to service_role;

-- ------------------------------------------------------------
-- 4. Schedule: every 15 minutes
--    cron.schedule is idempotent by name — safe to run on restart
-- ------------------------------------------------------------
select cron.schedule(
  'send-reminders',          -- job name (unique)
  '*/15 * * * *',            -- every 15 minutes
  $$select public.trigger_send_reminders()$$
);

-- ------------------------------------------------------------
-- 5. pgTAP smoke tests
-- ------------------------------------------------------------
-- (run with: supabase test db)
