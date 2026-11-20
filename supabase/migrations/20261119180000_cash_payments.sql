-- PAY-1: Cash at clinic payment confirmation RPC
-- Allows provider/clinic staff or admin to mark a cash payment as received/paid.

create or replace function public.record_cash_payment(
  p_booking_id uuid,
  p_amount numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
begin
  select b.*
  into v_booking
  from public.bookings b
  where b.id = p_booking_id;

  if v_booking.id is null then
    raise exception 'Booking not found';
  end if;

  -- Verify permissions: Provider, Vet, Admin, or superuser
  if not (
    public.is_admin() or
    public.has_role('provider'::user_role) or
    public.has_role('vet'::user_role) or
    auth.uid() = v_booking.vet_id or
    current_user in ('postgres', 'supabase_admin')
  ) then
    raise exception 'Not authorized to record payment for this booking';
  end if;

  if v_booking.payment_status = 'paid' then
    return jsonb_build_object(
      'success', true,
      'bookingId', p_booking_id,
      'paymentStatus', 'paid',
      'message', 'Booking is already marked as paid'
    );
  end if;

  -- Update payment status and price if specified
  update public.bookings
  set payment_status = 'paid',
      payment_method = 'cash',
      price = coalesce(p_amount, price),
      updated_at = now()
  where id = p_booking_id;

  return jsonb_build_object(
    'success', true,
    'bookingId', p_booking_id,
    'paymentStatus', 'paid',
    'paymentMethod', 'cash',
    'amount', coalesce(p_amount, v_booking.price),
    'message', 'Cash payment recorded successfully'
  );
end;
$$;

grant execute on function public.record_cash_payment(uuid, numeric) to anon, authenticated;
