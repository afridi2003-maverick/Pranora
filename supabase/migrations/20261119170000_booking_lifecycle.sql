-- APT-2: Booking status lifecycle and provider confirm RPC
-- Implements state machine:
--   pending     -> confirmed, cancelled_by_provider, cancelled_by_owner, expired
--   confirmed   -> in_progress, completed, cancelled_by_provider, cancelled_by_owner, no_show
--   in_progress -> completed, cancelled_by_provider
--   terminal states cannot be transitioned away from

create or replace function public.update_booking_status(
  p_booking_id uuid,
  p_status booking_status,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_curr_status booking_status;
begin
  select b.*
  into v_booking
  from public.bookings b
  where b.id = p_booking_id;

  if v_booking.id is null then
    raise exception 'Booking not found';
  end if;

  v_curr_status := v_booking.status;

  -- 1. Check permissions:
  -- Provider / Vet / Admin can change to confirmed, in_progress, completed, no_show, cancelled_by_provider.
  -- Owner can only cancel (via cancelled_by_owner).
  if p_status = 'cancelled_by_owner' then
    if not (
      auth.uid() = v_booking.owner_id or
      public.is_admin() or
      current_user in ('postgres', 'supabase_admin')
    ) then
      raise exception 'Only the booking owner or admin can mark cancelled_by_owner';
    end if;
  else
    if not (
      public.is_admin() or
      public.has_role('provider'::user_role) or
      public.has_role('vet'::user_role) or
      auth.uid() = v_booking.vet_id or
      current_user in ('postgres', 'supabase_admin')
    ) then
      raise exception 'Not authorized to update booking status to %', p_status;
    end if;
  end if;

  -- 2. State machine validation:
  if v_curr_status = p_status then
    return jsonb_build_object(
      'success', true,
      'bookingId', p_booking_id,
      'status', p_status,
      'message', 'Status unchanged'
    );
  end if;

  -- Disallow transitions from terminal states
  if v_curr_status in ('completed', 'cancelled_by_owner', 'cancelled_by_provider', 'no_show', 'expired') then
    raise exception 'Cannot transition booking from terminal status % to %', v_curr_status, p_status;
  end if;

  -- Validate allowed transitions:
  case v_curr_status
    when 'pending' then
      if p_status not in ('confirmed', 'cancelled_by_provider', 'cancelled_by_owner', 'expired') then
        raise exception 'Invalid transition from pending to %', p_status;
      end if;
    when 'confirmed' then
      if p_status not in ('in_progress', 'completed', 'cancelled_by_provider', 'cancelled_by_owner', 'no_show') then
        raise exception 'Invalid transition from confirmed to %', p_status;
      end if;
    when 'in_progress' then
      if p_status not in ('completed', 'cancelled_by_provider') then
        raise exception 'Invalid transition from in_progress to %', p_status;
      end if;
    else
      raise exception 'Unhandled current status %', v_curr_status;
  end case;

  -- 3. Perform update
  update public.bookings
  set status = p_status,
      cancel_reason = case when p_reason is not null then p_reason else cancel_reason end,
      updated_at = now()
  where id = p_booking_id;

  return jsonb_build_object(
    'success', true,
    'bookingId', p_booking_id,
    'status', p_status,
    'previousStatus', v_curr_status,
    'message', 'Booking status updated successfully'
  );
end;
$$;

grant execute on function public.update_booking_status(uuid, booking_status, text) to anon, authenticated;
