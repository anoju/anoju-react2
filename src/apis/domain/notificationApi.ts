import type { UnsubscribeFunc } from 'pocketbase';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import { MY_PAGE_NOTIFICATIONS_PATH } from '@/constants/app';
import { pb } from '@/lib/pocketBase';
import type { NotificationRecord, NotificationType, UserRecord } from '@/types/domain';
import { runApi } from '../apiClient';

export interface NotificationListParams {
  filter?: 'all' | 'unread' | NotificationType;
}

export interface CreateNotificationParams {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  message: string;
  targetUrl: string;
  targetType: NotificationRecord['targetType'];
  targetId?: string;
}

const escapeFilterValue = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const getCurrentUserId = () => {
  const userId = pb.authStore.model?.id;

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  return userId;
};

const getRecipientFilter = (userId: string, filter: NotificationListParams['filter']) =>
  [
    `recipient = "${escapeFilterValue(userId)}"`,
    'hidden != true',
    filter === 'unread' ? 'isRead = false' : '',
    filter && filter !== 'all' && filter !== 'unread' ? `type = "${filter}"` : '',
  ]
    .filter(Boolean)
    .join(' && ');

const createNotificationSafely = async ({
  recipientId,
  actorId,
  type,
  title,
  message,
  targetUrl,
  targetType,
  targetId,
}: CreateNotificationParams) => {
  if (!recipientId || recipientId === actorId) {
    return null;
  }

  return pb.collection(PB_COLLECTIONS.notifications).create<NotificationRecord>(
    {
      recipient: recipientId,
      ...(actorId ? { actor: actorId } : {}),
      type,
      title,
      message,
      targetUrl,
      targetType,
      ...(targetId ? { targetId } : {}),
      isRead: false,
      hidden: false,
    },
    { $autoCancel: false },
  );
};

export const notificationApi = {
  listMine: ({ filter = 'all' }: NotificationListParams = {}) =>
    runApi(() => {
      const userId = getCurrentUserId();

      return pb.collection(PB_COLLECTIONS.notifications).getFullList<NotificationRecord>({
        $autoCancel: false,
        filter: getRecipientFilter(userId, filter),
        sort: '-created',
      });
    }),

  getUnreadCount: () =>
    runApi(async () => {
      const userId = getCurrentUserId();
      const result = await pb.collection(PB_COLLECTIONS.notifications).getList<NotificationRecord>(1, 1, {
        $autoCancel: false,
        filter: getRecipientFilter(userId, 'unread'),
      });

      return result.totalItems;
    }),

  markAsRead: (notificationId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.notifications).update<NotificationRecord>(
        notificationId,
        {
          isRead: true,
          readAt: new Date().toISOString(),
        },
        { $autoCancel: false },
      ),
    ),

  markAllAsRead: () =>
    runApi(async () => {
      const notifications = await notificationApi.listMine({ filter: 'unread' });

      await Promise.all(
        notifications.map((notification) =>
          pb.collection(PB_COLLECTIONS.notifications).update<NotificationRecord>(
            notification.id,
            {
              isRead: true,
              readAt: new Date().toISOString(),
            },
            { $autoCancel: false },
          ),
        ),
      );

      return notifications.length;
    }),

  create: (params: CreateNotificationParams) => runApi(() => createNotificationSafely(params)),

  createSafely: createNotificationSafely,

  notifyMentionedUsers: async ({
    content,
    actorId,
    title,
    message,
    targetUrl,
    targetType,
    targetId,
  }: Omit<CreateNotificationParams, 'recipientId' | 'type'> & { content: string }) => {
    const mentionMatches = Array.from(content.matchAll(/@([\p{L}\p{N}_-]{2,24})/gu));
    const mentionNames = [...new Set(mentionMatches.map((match) => match[1]).filter(Boolean))];

    if (mentionNames.length === 0) {
      return [];
    }

    const nicknameFilters = mentionNames.map((name) => `nickname = "${escapeFilterValue(name)}"`).join(' || ');
    const users = await pb.collection(PB_COLLECTIONS.users).getFullList<UserRecord>({
      $autoCancel: false,
      filter: nicknameFilters,
    });

    return Promise.all(
      users.map((user) =>
        createNotificationSafely({
          recipientId: user.id,
          actorId,
          type: 'mention',
          title,
          message,
          targetUrl,
          targetType,
          targetId,
        }),
      ),
    );
  },

  subscribeMine: async (onChange: () => void): Promise<UnsubscribeFunc | null> => {
    const userId = pb.authStore.model?.id;

    if (!userId) {
      return null;
    }

    return pb.collection(PB_COLLECTIONS.notifications).subscribe(
      '*',
      () => {
        onChange();
      },
      {
        filter: `recipient = "${escapeFilterValue(userId)}"`,
      },
    );
  },

  fallbackPath: MY_PAGE_NOTIFICATIONS_PATH,
};
