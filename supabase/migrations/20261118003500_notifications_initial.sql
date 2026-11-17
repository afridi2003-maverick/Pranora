-- ============================================================
-- NOTIF-1: Notifications Migration
-- In-app notifications table, RLS, indexes, notify RPC
-- Owner: afridi | Branch: afridi | Sprint: S3
-- ============================================================

-- ------------------------------------------------------------
-- 1. Notifications Table
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title_bn text,
  title_en text,
  body_bn text,
  body_en text,
  data jsonb default '{}'::jsonb,
  channel text not null default 'in_app',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes for fast query performance
create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_unread_idx
  on public.notifications (user_id, read_at)
  where read_at is null;

-- Enable Row Level Security
alter table public.notifications enable row level security;

-- ------------------------------------------------------------
-- 2. RLS Policies
-- ------------------------------------------------------------

-- Users can read their own notifications; admins can read all
create policy "notifications: select own or admin"
  on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());

-- Users can update read_at on their own notifications
create policy "notifications: update own read_at"
  on public.notifications for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Users can delete their own notifications; admins can delete any
create policy "notifications: delete own or admin"
  on public.notifications for delete
  using (auth.uid() = user_id or public.is_admin());

-- Only admins or service role can directly insert
create policy "notifications: admin insert"
  on public.notifications for insert
  with check (public.is_admin() or auth.role() = 'service_role');

-- ------------------------------------------------------------
-- 3. Notification RPC Functions
-- ------------------------------------------------------------

-- create_notification helper function
create or replace function public.create_notification(
  p_user_id uuid,
  p_title_bn text,
  p_title_en text,
  p_body_bn text,
  p_body_en text,
  p_data jsonb default '{}'::jsonb,
  p_channel text default 'in_app'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (
    user_id,
    title_bn,
    title_en,
    body_bn,
    body_en,
    data,
    channel,
    created_at
  ) values (
    p_user_id,
    p_title_bn,
    p_title_en,
    p_body_bn,
    p_body_en,
    coalesce(p_data, '{}'::jsonb),
    coalesce(p_channel, 'in_app'),
    now()
  )
  returning id into v_notification_id;

  return v_notification_id;
end;
$$;

-- notify: High-level RPC (Integration Point 5)
-- Can be called by backend logic, triggers, Edge Functions or admin users
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
  v_channel text;
begin
  -- Resolve standard template keys
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
      v_title_bn := 'জরুরি উদ্ধার রিপোর্ট';
      v_title_en := 'Urgent Rescue Report';
      v_body_bn  := coalesce(p_data->>'body_bn', 'জরুরি উদ্ধার রিপোর্ট জমা হয়েছে — দ্রুত মনোযোগ দিন।');
      v_body_en  := coalesce(p_data->>'body_en', 'An urgent rescue report has been submitted — needs immediate attention.');
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

  -- Create in_app notification record if requested
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

-- Grant execution to authenticated and anon
grant execute on function public.create_notification to authenticated, service_role;
grant execute on function public.notify to authenticated, service_role;

-- ------------------------------------------------------------
-- 4. Supabase Realtime Publication
-- ------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
exception
  when duplicate_object then null;
end $$;
