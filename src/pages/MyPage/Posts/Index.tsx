import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataList } from '@/components';
import { clipApi, communityApi, getUserMessage } from '@/apis';
import { CLIPS_PATH, FREE_BOARD_PATH, IT_LOGS_PATH, PICS_PATH } from '@/constants/app';
import type { ClipRecord, PostRecord } from '@/types/domain';
import { compareByCreatedDesc, formatRelativeTime } from '@/utils/community';

type MyActivityItem =
  | { kind: 'post'; record: PostRecord }
  | { kind: 'clip'; record: ClipRecord };

const getItemCreated = (item: MyActivityItem) => item.record.created;

const compareActivityByCreatedDesc = (a: MyActivityItem, b: MyActivityItem) => {
  if (a.record.created === b.record.created) {
    return 0;
  }

  return a.record.created < b.record.created ? 1 : -1;
};

const getItemPath = (item: MyActivityItem) => {
  if (item.kind === 'clip') {
    return `${CLIPS_PATH}/${item.record.id}`;
  }

  if (item.record.type === 'gallery') {
    return `${PICS_PATH}/${item.record.id}`;
  }

  if (item.record.type === 'it_logs') {
    return `${IT_LOGS_PATH}/${item.record.id}`;
  }

  return `${FREE_BOARD_PATH}/${item.record.id}`;
};

const getItemTypeLabel = (item: MyActivityItem) => {
  if (item.kind === 'clip') {
    return 'Clips';
  }

  if (item.record.type === 'gallery') {
    return 'Pics';
  }

  if (item.record.type === 'it_logs') {
    return 'ITLogs';
  }

  return '자유게시판';
};

const MyPosts = () => {
  const [items, setItems] = useState<MyActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextPosts, nextClips] = await Promise.all([
        communityApi.listMyPosts(),
        clipApi.listMyClips().catch(() => []),
      ]);
      setItems(
        [
          ...[...nextPosts].sort(compareByCreatedDesc).map((record) => ({ kind: 'post' as const, record })),
          ...nextClips.map((record) => ({ kind: 'clip' as const, record })),
        ].sort(compareActivityByCreatedDesc),
      );
    } catch (loadError) {
      setError(getUserMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  return (
    <section className="container my-page activity-page">
      <header className="my-page__header">
        <h2>내가 작성한 글</h2>
        <p>자유게시판, Pics, Clips에 올린 글을 모아봅니다.</p>
      </header>

      <DataList
        items={items}
        getKey={(item) => `${item.kind}-${item.record.id}`}
        loadingInitial={loading}
        error={error}
        emptyTitle="작성한 글이 없습니다."
        emptyDescription="첫 글을 작성하면 이곳에 모입니다."
        onRetry={() => void loadPosts()}
        renderItem={(item) => (
          <Link className="activity-item" to={getItemPath(item)}>
            <span className="activity-item__type">{getItemTypeLabel(item)}</span>
            <strong>{item.record.title}</strong>
            <span>
              {formatRelativeTime(getItemCreated(item))} · 좋아요 {item.record.likeCount ?? 0}
            </span>
          </Link>
        )}
      />
    </section>
  );
};

export default MyPosts;
