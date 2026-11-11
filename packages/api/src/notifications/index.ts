export type NotificationChannel = 'in_app' | 'push' | 'sms';

export interface SendNotificationPayload {
  userId: string;
  templateKey: string;
  data: Record<string, unknown>;
  channels: NotificationChannel[];
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

