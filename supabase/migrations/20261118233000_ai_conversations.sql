-- Migration: 20261118233000_ai_conversations.sql
-- Description: AI assistant conversations and messages tables, indexes, and RLS policies (§4.13)

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  pet_id uuid references pets(id) on delete set null,
  share_pet_context boolean not null default false,
  locale app_locale not null default 'bn',
  created_at timestamptz not null default now()
);

create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool')),
  content text not null,
  is_voice boolean not null default false,
  emergency_flag boolean not null default false,
  handoff_flag boolean not null default false,
  proposed_booking jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_ai_conversations_user_id on ai_conversations(user_id);
create index if not exists idx_ai_conversations_pet_id on ai_conversations(pet_id);
create index if not exists idx_ai_messages_conversation_id on ai_messages(conversation_id);
create index if not exists idx_ai_messages_created_at on ai_messages(created_at);

-- RLS
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;

-- Policies for ai_conversations:
create policy "ai_conversations_select_owner"
  on ai_conversations for select
  using (auth.uid() = user_id);

create policy "ai_conversations_insert_owner"
  on ai_conversations for insert
  with check (auth.uid() = user_id);

create policy "ai_conversations_update_owner"
  on ai_conversations for update
  using (auth.uid() = user_id);

create policy "ai_conversations_delete_owner"
  on ai_conversations for delete
  using (auth.uid() = user_id);

-- Policies for ai_messages:
create policy "ai_messages_select_owner"
  on ai_messages for select
  using (
    exists (
      select 1 from ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );

create policy "ai_messages_insert_owner"
  on ai_messages for insert
  with check (
    exists (
      select 1 from ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );

-- Admin policies
create policy "ai_conversations_admin_all"
  on ai_conversations for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "ai_messages_admin_all"
  on ai_messages for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
