-- ============================================================
-- ADP-9: Post-Adoption Follow-Up & Welfare Checks Migration
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S6
-- Depends on: ADP-6 (adoption_followups table), HLT-2 (reminders/notifications)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Index on adoption_followups for pending due follow-ups
-- ------------------------------------------------------------
create index if not exists adoption_followups_pending_due_idx
  on public.adoption_followups (due_on, sent_at)
  where answered_at is null;

-- ------------------------------------------------------------
-- 2. submit_adoption_followup RPC
--    Allows the adopter (or admin) to record the pet's wellbeing,
--    notes, and photo updates for a scheduled milestone.
-- ------------------------------------------------------------
create or replace function public.submit_adoption_followup(
  p_followup_id uuid,
  p_wellbeing text,
  p_note text default null,
  p_photos text[] default '{}'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_handover_id uuid;
  v_to_user_id uuid;
begin
  -- Validate wellbeing value
  if p_wellbeing not in ('good', 'okay', 'needs_help') then
    raise exception 'Invalid wellbeing status: %. Allowed: good, okay, needs_help', p_wellbeing;
  end if;

  -- Fetch associated handover record
  select f.handover_id, h.to_user_id
    into v_handover_id, v_to_user_id
    from public.adoption_followups f
    join public.adoption_handovers h on h.id = f.handover_id
   where f.id = p_followup_id;

  if not found then
    raise exception 'Adoption follow-up milestone not found';
  end if;

  -- Authorization check: Caller must be adopter or admin
  if auth.uid() <> v_to_user_id and not public.is_admin() then
    raise exception 'Unauthorized: Only the adopter can submit this follow-up update';
  end if;

  -- Update follow-up record
  update public.adoption_followups
     set wellbeing = p_wellbeing,
         note = p_note,
         photos = coalesce(p_photos, '{}'),
         answered_at = now()
   where id = p_followup_id;

  return true;
end;
$$;

grant execute on function public.submit_adoption_followup to authenticated;

-- ------------------------------------------------------------
-- 3. process_due_adoption_followups RPC
--    Finds due follow-ups where notification hasn't been sent,
--    marks sent_at = now(), and sends an in-app notification to the adopter.
-- ------------------------------------------------------------
create or replace function public.process_due_adoption_followups()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
  r record;
begin
  for r in
    select f.id as followup_id,
           f.due_on,
           h.to_user_id,
           h.pet_id,
           coalesce(p.name, 'আপনার পোষা প্রাণী') as pet_name_bn,
           coalesce(p.name, 'your adopted pet') as pet_name_en
      from public.adoption_followups f
      join public.adoption_handovers h on h.id = f.handover_id
      left join public.pets p on p.id = h.pet_id
     where f.due_on <= current_date
       and f.sent_at is null
  loop
    -- Mark sent
    update public.adoption_followups
       set sent_at = now()
     where id = r.followup_id;

    -- Send notification to adopter
    perform public.create_notification(
      r.to_user_id,
      'দত্তক পরবর্তী ফলো-আপ: কেমন আছে ' || r.pet_name_bn || '?',
      'Adoption Follow-Up: How is ' || r.pet_name_en || ' doing?',
      'দত্তক নেওয়ার পর প্রাণীর সার্বিক সুস্থতা ও খবরাখবর জানাতে একটি ছোট চেক-ইন করুন।',
      'Please take a moment to provide a quick welfare check-in update on your adopted pet.',
      jsonb_build_object(
        'type', 'adoption_followup',
        'followup_id', r.followup_id,
        'pet_id', r.pet_id
      ),
      'in_app'
    );

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.process_due_adoption_followups to authenticated, service_role;
