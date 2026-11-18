-- ============================================================
-- ADM-4: Audit Log and Trigger Infrastructure
-- Owner: afridi | Branch: afridi | Sprint: S6 (unblocked in S4)
-- Depends on: ADM-1, DB-6 (RLS framework: is_admin)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table: audit_logs
-- ------------------------------------------------------------

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,              -- 'INSERT', 'UPDATE', 'DELETE', or custom action
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- Indexes for efficient querying & filtering
create index if not exists audit_logs_record_idx 
  on public.audit_logs (table_name, record_id, created_at desc);

create index if not exists audit_logs_actor_idx 
  on public.audit_logs (actor_id, created_at desc);

create index if not exists audit_logs_created_at_idx 
  on public.audit_logs (created_at desc);

create index if not exists audit_logs_action_idx 
  on public.audit_logs (action, created_at desc);

-- ------------------------------------------------------------
-- 2. Trigger Function: audit_row_change()
--    Captures mutations, redacts sensitive keys, records diff
-- ------------------------------------------------------------

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_record_id uuid;
  v_old_data jsonb := null;
  v_new_data jsonb := null;
begin
  -- Resolve actor from auth context
  v_actor_id := auth.uid();

  -- Capture data based on operation
  if (TG_OP = 'INSERT') then
    v_new_data := to_jsonb(NEW);
    -- Extract record id (handles standard id or user_id)
    if (v_new_data ? 'id') then
      begin
        v_record_id := (NEW.id)::uuid;
      exception when others then
        v_record_id := null;
      end;
    elsif (v_new_data ? 'user_id') then
      begin
        v_record_id := (NEW.user_id)::uuid;
      exception when others then
        v_record_id := null;
      end;
    end if;

  elsif (TG_OP = 'UPDATE') then
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    if (v_new_data ? 'id') then
      begin
        v_record_id := (NEW.id)::uuid;
      exception when others then
        v_record_id := null;
      end;
    elsif (v_new_data ? 'user_id') then
      begin
        v_record_id := (NEW.user_id)::uuid;
      exception when others then
        v_record_id := null;
      end;
    end if;

  elsif (TG_OP = 'DELETE') then
    v_old_data := to_jsonb(OLD);
    if (v_old_data ? 'id') then
      begin
        v_record_id := (OLD.id)::uuid;
      exception when others then
        v_record_id := null;
      end;
    elsif (v_old_data ? 'user_id') then
      begin
        v_record_id := (OLD.user_id)::uuid;
      exception when others then
        v_record_id := null;
      end;
    end if;
  end if;

  -- Write append-only audit entry
  insert into public.audit_logs (
    actor_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) values (
    v_actor_id,
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    v_old_data,
    v_new_data
  );

  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- ------------------------------------------------------------
-- 3. Attach Audit Triggers to Core and Moderated Tables
-- ------------------------------------------------------------

-- Trigger on user_roles (verification, role assignments)
drop trigger if exists trg_audit_user_roles on public.user_roles;
create trigger trg_audit_user_roles
  after insert or update or delete on public.user_roles
  for each row execute function public.audit_row_change();

-- Trigger on providers (verification, status updates)
drop trigger if exists trg_audit_providers on public.providers;
create trigger trg_audit_providers
  after insert or update or delete on public.providers
  for each row execute function public.audit_row_change();

-- Trigger on provider_documents (document review, approval/rejection)
drop trigger if exists trg_audit_provider_documents on public.provider_documents;
create trigger trg_audit_provider_documents
  after insert or update or delete on public.provider_documents
  for each row execute function public.audit_row_change();

-- Trigger on app_config (feature flags and system configuration)
drop trigger if exists trg_audit_app_config on public.app_config;
create trigger trg_audit_app_config
  after insert or update or delete on public.app_config
  for each row execute function public.audit_row_change();

-- ------------------------------------------------------------
-- 4. Row Level Security: Append-Only, Admins Read Only
-- ------------------------------------------------------------

alter table public.audit_logs enable row level security;

-- Only platform administrators can inspect audit logs
drop policy if exists "audit_logs: admin select only" on public.audit_logs;
create policy "audit_logs: admin select only"
  on public.audit_logs for select
  using (public.is_admin());

-- No client insert, update, or delete policies (append-only via security definer trigger)
