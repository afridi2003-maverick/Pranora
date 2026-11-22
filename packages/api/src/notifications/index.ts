import type { TypedSupabaseClient } from '../client';
import type { AppLocale, Json } from '@pranora/types';

export type NotificationChannel = 'in_app' | 'push' | 'sms';

export type NotificationTemplateKey =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'vaccine_due'
  | 'rescue_assigned'
  | 'rescue_update'
  | 'adoption_update'
  | 'urgent_rescue'
  | 'otp'
  | 'role_verified'
  | 'system';

export interface SendNotificationPayload {
  userId: string;
  templateKey: NotificationTemplateKey | string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  titleBn: string | null;
  titleEn: string | null;
  bodyBn: string | null;
  bodyEn: string | null;
  data: Record<string, unknown> | null;
  channel: string;
  readAt: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ListNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
}

/**
 * Helper to map DB row to NotificationItem
 */
function mapRowToNotification(row: {
  id: string;
  user_id: string;
  title_bn: string | null;
  title_en: string | null;
  body_bn: string | null;
  body_en: string | null;
  data: Json;
  channel: string;
  read_at: string | null;
  created_at: string;
}): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id,
    titleBn: row.title_bn,
    titleEn: row.title_en,
    bodyBn: row.body_bn,
    bodyEn: row.body_en,
    data: (row.data as Record<string, unknown>) ?? null,
    channel: row.channel,
    readAt: row.read_at,
    isRead: row.read_at !== null,
    createdAt: row.created_at,
  };
}

/**
 * Fetch in-app notifications for a user, sorted by most recent first
 */
export async function listNotifications(
  client: TypedSupabaseClient,
  userId: string,
  options: ListNotificationsOptions = {}
): Promise<NotificationItem[]> {
  let query = client
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options.unreadOnly) {
    query = query.is('read_at', null);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data || []).map(mapRowToNotification);
}

/**
 * Get count of unread notifications for a user
 */
export async function getUnreadNotificationCount(
  client: TypedSupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await client
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    throw error;
  }

  return count || 0;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  client: TypedSupabaseClient,
  notificationId: string
): Promise<void> {
  const { error } = await client
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    throw error;
  }
}

/**
 * Mark all unread notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  client: TypedSupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await client
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  client: TypedSupabaseClient,
  notificationId: string
): Promise<void> {
  const { error } = await client
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    throw error;
  }
}

/**
 * Send a notification via the notify RPC (Integration Point 5)
 */
export * from './reminders';
export * from './sms';

export async function notify(
  client: TypedSupabaseClient,
  payload: SendNotificationPayload
): Promise<{ success: boolean; notificationId?: string }> {
  const { data, error } = await client.rpc('notify', {
    p_user_id: payload.userId,
    p_template_key: payload.templateKey,
    p_data: (payload.data as Json) ?? {},
    p_channels: payload.channels ?? ['in_app'],
  });

  if (error) {
    throw error;
  }

  return (data as { success: boolean; notificationId?: string }) ?? { success: true };
}

/**
 * Helper to get localized title and body
 */
export function getLocalizedNotification(
  notification: NotificationItem,
  locale: AppLocale = 'bn'
): { title: string; body: string } {
  if (locale === 'en') {
    return {
      title: notification.titleEn || notification.titleBn || 'Notification',
      body: notification.bodyEn || notification.bodyBn || '',
    };
  }

  return {
    title: notification.titleBn || notification.titleEn || 'বিজ্ঞপ্তি',
    body: notification.bodyBn || notification.bodyEn || '',
  };
}

/**
 * Subscribe to realtime notification updates for a user
 */
export function subscribeToNotifications(
  client: TypedSupabaseClient,
  userId: string,
  onNotification: (notification: NotificationItem) => void
): () => void {
  const channel = client
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          onNotification(mapRowToNotification(payload.new as any));
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
