import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationApi, getUserMessage } from '@/apis';
import { Button, DataList, toast } from '@/components';
import type { NotificationRecord, NotificationType, UserRecord } from '@/types/domain';
import { formatRelativeTime } from '@/utils/community';

type NotificationFilter = 'all' | 'unread' | NotificationType;

interface FilterOption {
  label: string;
  value: NotificationFilter;
}

const filterOptions: FilterOption[] = [
  { label: '전체', value: 'all' },
  { label: '읽지 않음', value: 'unread' },
  { label: '댓글', value: 'post_comment' },
  { label: '답글', value: 'comment_reply' },
  { label: '태그', value: 'mention' },
  { label: '요청', value: 'pic_log_order_request' },
];

const getFilterFromParams = (value: string | null): NotificationFilter => {
  const matchedFilter = filterOptions.find((option) => option.value === value);

  return matchedFilter?.value ?? 'all';
};

const getActorName = (notification: NotificationRecord) => {
  const actor = notification.expand?.actor;

  if (!actor || typeof actor !== 'object' || Array.isArray(actor)) {
    return 'Anoju';
  }

  const user = actor as UserRecord;

  return user.nickname ?? user.email ?? '회원';
};

const Notifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = useMemo(() => getFilterFromParams(searchParams.get('filter')), [searchParams]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setNotifications(await notificationApi.listMine({ filter }));
    } catch (loadError) {
      setError(getUserMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    void notificationApi.subscribeMine(() => {
      void loadNotifications();
    }).then((nextUnsubscribe) => {
      if (!mounted) {
        nextUnsubscribe?.();
        return;
      }

      unsubscribe = nextUnsubscribe;
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [loadNotifications]);

  const handleFilterChange = (nextFilter: NotificationFilter) => {
    setSearchParams(nextFilter === 'all' ? {} : { filter: nextFilter });
  };

  const handleNotificationClick = async (notification: NotificationRecord) => {
    if (notification.isRead) {
      return;
    }

    try {
      await notificationApi.markAsRead(notification.id);
      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification.id === notification.id
            ? { ...currentNotification, isRead: true, readAt: new Date().toISOString() }
            : currentNotification,
        ),
      );
    } catch {
      // 이동 흐름을 우선하고, 읽음 처리 실패는 다음 조회에서 다시 동기화합니다.
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);

    try {
      const updatedCount = await notificationApi.markAllAsRead();
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? new Date().toISOString(),
        })),
      );
      toast(updatedCount > 0 ? '모든 알림을 읽음 처리했습니다.' : '읽지 않은 알림이 없습니다.', { tone: 'success' });
    } catch (markError) {
      toast(getUserMessage(markError), { tone: 'danger' });
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <section className="container my-page notification-page">
      <header className="my-page__header">
        <h2>알림함</h2>
        <p>댓글, 답글, 태그와 picLog 요청을 모아봅니다.</p>
      </header>

      <div className="notification-page__toolbar">
        <div className="notification-page__filters" role="tablist" aria-label="알림 필터">
          {filterOptions.map((option) => (
            <button
              className="notification-page__filter"
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              data-active={filter === option.value}
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          tone="neutral"
          size="sm"
          loading={markingAll}
          disabled={unreadCount === 0}
          onClick={handleMarkAllAsRead}
          leftIcon={<CheckCheck size={16} />}
        >
          모두 읽음
        </Button>
      </div>

      <DataList
        items={notifications}
        getKey={(notification) => notification.id}
        loadingInitial={loading}
        error={error}
        emptyTitle="알림이 없습니다."
        emptyDescription="새 댓글, 답글, 태그가 생기면 이곳에 표시됩니다."
        onRetry={() => void loadNotifications()}
        renderItem={(notification) => (
          <Link
            className="notification-item"
            data-read={notification.isRead}
            to={notification.targetUrl || notificationApi.fallbackPath}
            onClick={() => void handleNotificationClick(notification)}
          >
            <span className="notification-item__icon" aria-hidden="true">
              <Bell size={18} />
            </span>
            <span className="notification-item__content">
              <span className="notification-item__meta">
                <span>{getActorName(notification)}</span>
                <time dateTime={notification.created}>{formatRelativeTime(notification.created)}</time>
              </span>
              <strong>{notification.title}</strong>
              <span>{notification.message}</span>
            </span>
            {!notification.isRead ? <span className="notification-item__badge">새 알림</span> : null}
          </Link>
        )}
      />
    </section>
  );
};

export default Notifications;
