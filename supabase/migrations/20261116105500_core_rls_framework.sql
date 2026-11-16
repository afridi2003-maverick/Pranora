-- ============================================================
-- DB-6: RLS Framework & Core Table Security Policies
-- Helper functions: has_role, is_admin
-- Core table policies: profiles, user_roles, rescuer_profiles, app_config, addresses, locations
-- Owner: afridi | Branch: afridi | Sprint: S2
-- ============================================================

-- ------------------------------------------------------------
-- 1. Helper Functions
-- ------------------------------------------------------------

-- Check role for current user: has_role(role)
create or replace function public.has_role(check_role user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = check_role
      and status = 'verified'
  );
$$;

-- Check role for specific user: has_role(user_id, role)
create or replace function public.has_role(target_user_id uuid, check_role user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = target_user_id
      and role = check_role
      and status = 'verified'
  );
$$;

-- Check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin'::user_role);
$$;

-- Check if specific user is admin
create or replace function public.is_admin(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(target_user_id, 'admin'::user_role);
$$;

-- Grant execution to authenticated and anon
grant execute on function public.has_role(user_role) to authenticated, anon;
grant execute on function public.has_role(uuid, user_role) to authenticated, anon;
grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.is_admin(uuid) to authenticated, anon;

-- ------------------------------------------------------------
-- 2. Core Policies Update
-- ------------------------------------------------------------

-- Profiles:
-- Select: Own row OR admin
drop policy if exists "profiles: owner can read own" on public.profiles;
create policy "profiles: select own or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Update: Own row OR admin
drop policy if exists "profiles: owner can update own" on public.profiles;
create policy "profiles: update own or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Insert: Own row on signup OR admin
drop policy if exists "profiles: insert on signup" on public.profiles;
create policy "profiles: insert own or admin"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

-- Delete: Admin only
drop policy if exists "profiles: delete admin only" on public.profiles;
create policy "profiles: delete admin only"
  on public.profiles for delete
  using (public.is_admin());

-- User Roles:
-- Select: Own roles OR admin
drop policy if exists "user_roles: owner reads own" on public.user_roles;
create policy "user_roles: select own or admin"
  on public.user_roles for select
  using (auth.uid() = user_id or public.is_admin());

-- Insert: Users can request a role (status starts pending, owner is verified) OR admin can insert any
drop policy if exists "user_roles: owner inserts own owner role" on public.user_roles;
create policy "user_roles: insert request or admin"
  on public.user_roles for insert
  with check (
    (auth.uid() = user_id and (
      (role = 'owner' and status = 'verified') or
      (role <> 'owner' and status = 'pending')
    )) or
    public.is_admin()
  );

-- Update: Only admins can verify/update roles
create policy "user_roles: update admin only"
  on public.user_roles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Delete: Admin can revoke, or user can withdraw pending request
create policy "user_roles: delete own pending or admin"
  on public.user_roles for delete
  using (
    (auth.uid() = user_id and status = 'pending') or
    public.is_admin()
  );

-- Addresses:
-- All: Owner OR admin
drop policy if exists "addresses: owner manages own" on public.addresses;
create policy "addresses: owner or admin manage"
  on public.addresses for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Rescuer Profiles:
-- Select: Authenticated users can view available rescuers, owner reads own, admin reads all
drop policy if exists "rescuer_profiles: owner manages own" on public.rescuer_profiles;
drop policy if exists "rescuer_profiles: authenticated read" on public.rescuer_profiles;

create policy "rescuer_profiles: select access"
  on public.rescuer_profiles for select
  using (
    auth.uid() = user_id or
    public.is_admin() or
    (auth.role() = 'authenticated' and is_available = true)
  );

create policy "rescuer_profiles: owner or admin manage"
  on public.rescuer_profiles for insert
  with check (auth.uid() = user_id or public.is_admin());

create policy "rescuer_profiles: update own or admin"
  on public.rescuer_profiles for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "rescuer_profiles: delete own or admin"
  on public.rescuer_profiles for delete
  using (auth.uid() = user_id or public.is_admin());

-- App Config:
-- Select: Authenticated read
-- Insert/Update/Delete: Admin only
drop policy if exists "app_config: authenticated read" on public.app_config;
create policy "app_config: select authenticated"
  on public.app_config for select
  using (auth.role() = 'authenticated');

create policy "app_config: admin write"
  on public.app_config for insert
  with check (public.is_admin());

create policy "app_config: admin update"
  on public.app_config for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "app_config: admin delete"
  on public.app_config for delete
  using (public.is_admin());

-- Divisions, Districts, Upazilas:
-- Select is public
-- Insert/Update/Delete: Admin only
create policy "divisions: admin manage"
  on public.divisions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "districts: admin manage"
  on public.districts for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "upazilas: admin manage"
  on public.upazilas for all
  using (public.is_admin())
  with check (public.is_admin());
