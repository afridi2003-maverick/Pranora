-- ============================================================
-- Migration: 20261118230000_pets_ownership_transfer.sql
-- Sprint S4: PET-5 "One profile for life"
-- Enables pet ownership transfers preserving health history
-- and linking rescued animals to their lifelong pet profile.
-- ============================================================

-- 1. Policy for previous/new owners to view transfer history
create policy "pet_ownership_history: parties read"
  on public.pet_ownership_history for select
  using (
    from_user_id = auth.uid() or to_user_id = auth.uid()
  );

-- 2. Function: transfer_pet_ownership
-- Transports ownership of a pet from one user to another.
-- Callable by current owner or admin.
create or replace function public.transfer_pet_ownership(
  p_pet_id uuid,
  p_to_user_id uuid,
  p_reason text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_owner_id uuid;
begin
  -- Validate reason
  if p_reason not in ('registered', 'rescue_intake', 'adoption', 'admin_transfer') then
    raise exception 'invalid ownership transfer reason: %', p_reason;
  end if;

  -- Validate recipient exists
  if not exists (select 1 from public.profiles where id = p_to_user_id) then
    raise exception 'recipient profile not found: %', p_to_user_id;
  end if;

  -- Get current owner
  select owner_id into v_current_owner_id
  from public.pets
  where id = p_pet_id and deleted_at is null;

  if v_current_owner_id is null then
    raise exception 'pet not found or has been deleted: %', p_pet_id;
  end if;

  -- Verify authorization: current owner or admin
  if auth.uid() <> v_current_owner_id and not public.is_admin() then
    raise exception 'permission denied: only current owner or admin can transfer ownership';
  end if;

  -- Cannot transfer to self
  if v_current_owner_id = p_to_user_id then
    raise exception 'cannot transfer ownership to yourself';
  end if;

  -- Update pet owner and clear shelter_id
  update public.pets
  set owner_id = p_to_user_id,
      shelter_id = null,
      updated_at = now()
  where id = p_pet_id;

  -- Record ownership history
  insert into public.pet_ownership_history (
    pet_id,
    from_user_id,
    to_user_id,
    reason,
    note
  ) values (
    p_pet_id,
    v_current_owner_id,
    p_to_user_id,
    p_reason,
    p_note
  );
end;
$$;

grant execute on function public.transfer_pet_ownership(uuid, uuid, text, text) to authenticated;

-- 3. Function: link_pet_rescue_case
-- Links a pet profile to a rescue case, establishing the animal's profile for life.
create or replace function public.link_pet_rescue_case(
  p_pet_id uuid,
  p_rescue_case_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pets
  set rescue_case_id = p_rescue_case_id,
      updated_at = now()
  where id = p_pet_id;

  update public.rescue_cases
  set pet_id = p_pet_id,
      updated_at = now()
  where id = p_rescue_case_id;
end;
$$;

grant execute on function public.link_pet_rescue_case(uuid, uuid) to authenticated;
