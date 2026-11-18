-- ============================================================
-- RSC-6: Urgent Report Alert (Push + SMS) + 15-min Escalation
-- Owner: Brehat (@brihothdey-ctrl) | Branch: brihoth | Sprint: S5
-- Depends on: DB-8, NOTIF-1, RSC-1
-- ============================================================

-- ------------------------------------------------------------
-- 1. Schema Additions for Animal Reports Escalation Tracking
-- ------------------------------------------------------------

alter table public.animal_reports
  add column if not exists escalated_at timestamptz default null;

-- Partial index for fast discovery of unreviewed urgent reports
create index if not exists animal_reports_unreviewed_urgent_idx
  on public.animal_reports (urgency, status, created_at)
  where status = 'submitted' and urgency in ('high', 'critical');

-- Ensure default escalation minutes config is present in app_config
insert into public.app_config (key, value)
values ('rescue_escalation_minutes', '15'::jsonb)
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- 2. Enhanced notify() Support for urgent_rescue_escalation
-- ------------------------------------------------------------

create or replace function public.notify(
  p_user_id uuid,
  p_template_key text,
  p_data jsonb default '{}'::jsonb,
  p_channels text[] default array['in_app']
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title_bn text;
  v_title_en text;
  v_body_bn text;
  v_body_en text;
  v_created_id uuid;
begin
  case p_template_key
    when 'booking_confirmed' then
      v_title_bn := 'বুকিং নিশ্চিত হয়েছে';
      v_title_en := 'Booking Confirmed';
      v_body_bn  := coalesce(p_data->>'body_bn', 'আপনার বুকিং সফলভাবে নিশ্চিত হয়েছে।');
      v_body_en  := coalesce(p_data->>'body_en', 'Your booking has been successfully confirmed.');
    when 'booking_cancelled' then
      v_title_bn := 'বুকিং বাতিল হয়েছে';
      v_title_en := 'Booking Cancelled';
      v_body_bn  := coalesce(p_data->>'body_bn', 'আপনার বুকিংটি বাতিল করা হয়েছে।');
      v_body_en  := coalesce(p_data->>'body_en', 'Your booking has been cancelled.');
    when 'urgent_rescue' then
      v_title_bn := coalesce(p_data->>'title_bn', 'জরুরি উদ্ধার রিপোর্ট');
      v_title_en := coalesce(p_data->>'title_en', 'Urgent Rescue Report');
      v_body_bn  := coalesce(p_data->>'body_bn', 'জরুরি উদ্ধার রিপোর্ট জমা হয়েছে — দ্রুত মনোযোগ দিন।');
      v_body_en  := coalesce(p_data->>'body_en', 'An urgent rescue report has been submitted — needs immediate attention.');
    when 'urgent_rescue_escalation' then
      v_title_bn := coalesce(p_data->>'title_bn', '🚨 জরুরি উদ্ধার এস্কেলেশন (১৫ মিনিট অমীমাংসিত)');
      v_title_en := coalesce(p_data->>'title_en', '🚨 Urgent Rescue Escalation (15 min unreviewed)');
      v_body_bn  := coalesce(p_data->>'body_bn', 'জরুরি উদ্ধার রিপোর্ট এখনও পর্যালোচনা করা হয়নি — অনতিবিলম্বে পদক্ষেপ নিন।');
      v_body_en  := coalesce(p_data->>'body_en', 'Urgent rescue report unreviewed after 15 minutes — immediate admin action required.');
    when 'rescue_assigned' then
      v_title_bn := 'উদ্ধার নিযুক্ত করা হয়েছে';
      v_title_en := 'Rescue Assigned';
      v_body_bn  := coalesce(p_data->>'body_bn', 'আপনাকে একটি উদ্ধারের দায়িত্ব দেওয়া হয়েছে।');
      v_body_en  := coalesce(p_data->>'body_en', 'You have been assigned to a rescue case.');
    when 'otp' then
      v_title_bn := 'OTP কোড';
      v_title_en := 'OTP Code';
      v_body_bn  := coalesce(p_data->>'body_bn', 'আপনার Pranora OTP কোড পাঠানো হয়েছে।');
      v_body_en  := coalesce(p_data->>'body_en', 'Your Pranora OTP code has been sent.');
    else
      v_title_bn := coalesce(p_data->>'title_bn', 'বিজ্ঞপ্তি');
      v_title_en := coalesce(p_data->>'title_en', 'Notification');
      v_body_bn  := coalesce(p_data->>'body_bn', '');
      v_body_en  := coalesce(p_data->>'body_en', '');
  end case;

  if 'in_app' = any(p_channels) then
    v_created_id := public.create_notification(
      p_user_id,
      v_title_bn,
      v_title_en,
      v_body_bn,
      v_body_en,
      p_data,
      'in_app'
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'notificationId', v_created_id,
    'channels', p_channels
  );
end;
$$;

-- ------------------------------------------------------------
-- 3. notify_urgent_rescue_report: Alert On-Duty Reviewers
-- ------------------------------------------------------------

create or replace function public.notify_urgent_rescue_report(
  p_report_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.animal_reports%rowtype;
  v_recipient_count integer := 0;
  v_reviewer_id uuid;
  v_payload jsonb;
  v_recipients uuid[] := array[]::uuid[];
  v_district_name text;
begin
  select * into v_report
  from public.animal_reports
  where id = p_report_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Report not found');
  end if;

  -- Only high or critical urgency triggers urgent alert
  if v_report.urgency not in ('high', 'critical') then
    return jsonb_build_object('success', false, 'skipped', 'Not urgent report');
  end if;

  -- Resolve district name if available
  if v_report.district_id is not null then
    select name_bn into v_district_name
    from public.districts
    where id = v_report.district_id;
  end if;

  v_payload := jsonb_build_object(
    'report_id', v_report.id,
    'species', v_report.species,
    'urgency', v_report.urgency,
    'area_text', coalesce(v_report.area_text, v_district_name, 'Unknown'),
    'kind', v_report.kind,
    'title_bn', case v_report.urgency
                  when 'critical' then '🚨 অতি জরুরি উদ্ধার রিপোর্ট (' || coalesce(v_district_name, 'স্থান অনির্দিষ্ট') || ')'
                  else '⚠️ জরুরি উদ্ধার রিপোর্ট (' || coalesce(v_district_name, 'স্থান অনির্দিষ্ট') || ')'
                end,
    'title_en', case v_report.urgency
                  when 'critical' then '🚨 Critical Rescue Report (' || coalesce(v_report.area_text, 'Unknown area') || ')'
                  else '⚠️ High Urgency Rescue Report (' || coalesce(v_report.area_text, 'Unknown area') || ')'
                end,
    'body_bn', 'নতুন ' || v_report.species::text || ' উদ্ধারের আবেদন জমা পড়েছে। জরুরি মাত্রা: ' || v_report.urgency::text || '। দ্রুত পর্যালোচনা করুন।',
    'body_en', 'New ' || v_report.species::text || ' rescue report submitted. Urgency: ' || v_report.urgency::text || '. Immediate review required.'
  );

  -- 1) Find verified shelters in that district
  for v_reviewer_id in
    select distinct p.user_id
    from public.providers p
    join public.user_roles ur on ur.user_id = p.user_id
    where p.type = 'shelter'
      and p.verified = true
      and ur.role = 'shelter'
      and ur.status = 'verified'
      and (v_report.district_id is null or p.district_id = v_report.district_id)
  loop
    v_recipients := array_append(v_recipients, v_reviewer_id);
    perform public.notify(
      v_reviewer_id,
      'urgent_rescue',
      v_payload,
      array['push', 'sms', 'in_app']
    );
    v_recipient_count := v_recipient_count + 1;
  end loop;

  -- 2) If no local shelter reviewers found, fallback immediately to admins
  if v_recipient_count = 0 then
    for v_reviewer_id in
      select distinct ur.user_id
      from public.user_roles ur
      where ur.role = 'admin'
        and ur.status = 'verified'
    loop
      v_recipients := array_append(v_recipients, v_reviewer_id);
      perform public.notify(
        v_reviewer_id,
        'urgent_rescue',
        v_payload,
        array['push', 'sms', 'in_app']
      );
      v_recipient_count := v_recipient_count + 1;
    end loop;
  end if;

  return jsonb_build_object(
    'success', true,
    'report_id', p_report_id,
    'alerted_count', v_recipient_count,
    'recipients', v_recipients
  );
end;
$$;

-- ------------------------------------------------------------
-- 4. Trigger on animal_reports Insertion
-- ------------------------------------------------------------

create or replace function public.trg_urgent_rescue_report_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.urgency in ('high', 'critical') and new.status = 'submitted' then
    perform public.notify_urgent_rescue_report(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_animal_reports_urgent_alert on public.animal_reports;
create trigger trg_animal_reports_urgent_alert
  after insert on public.animal_reports
  for each row execute function public.trg_urgent_rescue_report_alert();

-- ------------------------------------------------------------
-- 5. escalate_unreviewed_rescue_reports: 15-Minute Escalation to Admins
-- ------------------------------------------------------------

create or replace function public.escalate_unreviewed_rescue_reports()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_escalation_minutes integer := 15;
  v_overdue_record record;
  v_admin_id uuid;
  v_escalated_count integer := 0;
  v_escalated_ids uuid[] := array[]::uuid[];
  v_payload jsonb;
  v_district_name text;
begin
  -- Read configured escalation threshold (default 15)
  select coalesce((value#>>'{}')::integer, 15)
  into v_escalation_minutes
  from public.app_config
  where key = 'rescue_escalation_minutes';

  if v_escalation_minutes is null or v_escalation_minutes <= 0 then
    v_escalation_minutes := 15;
  end if;

  -- Scan for unreviewed urgent reports past threshold that have not yet been escalated
  for v_overdue_record in
    select id, species, urgency, area_text, district_id, kind, created_at
    from public.animal_reports
    where status = 'submitted'
      and urgency in ('high', 'critical')
      and escalated_at is null
      and created_at <= (now() - (v_escalation_minutes || ' minutes')::interval)
    order by created_at asc
  loop
    -- Mark as escalated
    update public.animal_reports
    set escalated_at = now(),
        updated_at = now()
    where id = v_overdue_record.id;

    v_escalated_ids := array_append(v_escalated_ids, v_overdue_record.id);
    v_escalated_count := v_escalated_count + 1;

    -- Lookup district name if present
    v_district_name := null;
    if v_overdue_record.district_id is not null then
      select name_bn into v_district_name
      from public.districts
      where id = v_overdue_record.district_id;
    end if;

    v_payload := jsonb_build_object(
      'report_id', v_overdue_record.id,
      'species', v_overdue_record.species,
      'urgency', v_overdue_record.urgency,
      'area_text', coalesce(v_overdue_record.area_text, v_district_name, 'Unknown'),
      'is_escalated', true,
      'elapsed_minutes', extract(epoch from (now() - v_overdue_record.created_at)) / 60,
      'title_bn', '🚨 [জরুরি এস্কেলেশন] উদ্ধার রিপোর্ট ' || v_escalation_minutes || ' মিনিট ধরে অমীমাংসিত',
      'title_en', '🚨 [Urgent Escalation] Rescue report unreviewed for ' || v_escalation_minutes || '+ minutes',
      'body_bn', 'রিপোর্ট #' || substr(v_overdue_record.id::text, 1, 8) || ' (' || coalesce(v_district_name, 'এলাকা') || ') এখনও কোনো পর্যালোচক গ্রহণ করেননি। অনতিবিলম্বে হস্তক্ষেপ করুন।',
      'body_en', 'Report #' || substr(v_overdue_record.id::text, 1, 8) || ' (' || coalesce(v_overdue_record.area_text, 'area') || ') is still unreviewed. Urgent admin action needed.'
    );

    -- Broadcast to all admins (Push + SMS + In-App)
    for v_admin_id in
      select distinct ur.user_id
      from public.user_roles ur
      where ur.role = 'admin'
        and ur.status = 'verified'
    loop
      perform public.notify(
        v_admin_id,
        'urgent_rescue_escalation',
        v_payload,
        array['push', 'sms', 'in_app']
      );
    end loop;
  end loop;

  return jsonb_build_object(
    'success', true,
    'escalated_count', v_escalated_count,
    'escalated_ids', v_escalated_ids,
    'threshold_minutes', v_escalation_minutes
  );
end;
$$;

-- Grant execution permissions
grant execute on function public.notify_urgent_rescue_report(uuid) to authenticated, service_role;
grant execute on function public.escalate_unreviewed_rescue_reports() to authenticated, service_role;

-- ------------------------------------------------------------
-- 6. pg_cron Scheduled Job (Every 5 minutes)
-- ------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Remove any old job with same name
    begin
      perform cron.unschedule('rescue-escalation-job');
    exception
      when others then null;
    end;

    -- Schedule job every 5 minutes
    perform cron.schedule(
      'rescue-escalation-job',
      '*/5 * * * *',
      'select public.escalate_unreviewed_rescue_reports();'
    );
  end if;
exception
  when others then null;
end $$;
