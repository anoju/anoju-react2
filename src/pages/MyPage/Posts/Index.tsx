import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataList } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { FREE_BOARD_PATH, IT_LOGS_PATH, PICS_PATH } from '@/constants/app';
import type { PostRecord } from '@/types/domain';
import { compareByCreatedDesc, formatRelativeTime } from '@/utils/community';

const getPostPath = (post: PostRecord) => {
  if (post.type === 'gallery') {
    return `${PICS_PATH}/${post.id}`;
  }

  if (post.type === 'it_logs') {
    return `${IT_LOGS_PATH}/${post.id}`;
  }

  return `${FREE_BOARD_PATH}/${post.id}`;
};

const getPostTypeLabel = (post: PostRecord) => {
  if (post.type === 'gallery') {
    return 'Pics';
  }

  if (post.type === 'it_logs') {
    return 'ITLogs';
  }

  return '자유게시판';
};

const MyPosts = () => {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextPosts = await communityApi.listMyPosts();
      setPosts([...nextPosts].sort(compareByCreatedDesc));
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
        <p>자유게시판과 Pics에 올린 글을 모아봅니다.</p>
      </header>

      <DataList
        items={posts}
        getKey={(post) => post.id}
        loadingInitial={loading}
        error={error}
        emptyTitle="작성한 글이 없습니다."
        emptyDescription="첫 글을 작성하면 이곳에 모입니다."
        onRetry={() => void loadPosts()}
        renderItem={(post) => (
          <Link className="activity-item" to={getPostPath(post)}>
            <span className="activity-item__type">{getPostTypeLabel(post)}</span>
            <strong>{post.title}</strong>
            <span>
              {formatRelativeTime(post.created)} · 댓글 {post.commentCount ?? 0} · 좋아요 {post.likeCount ?? 0}
            </span>
          </Link>
        )}
      />
    </section>
  );
};

export default MyPosts;
