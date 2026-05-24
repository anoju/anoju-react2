import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataList } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { FREE_BOARD_PATH, PICS_PATH } from '@/constants/app';
import type { CommentRecord, PostRecord } from '@/types/domain';
import { compareByCreatedDesc, formatRelativeTime } from '@/utils/community';

interface MyCommentItem {
  comment: CommentRecord;
  post?: PostRecord;
}

const MyComments = () => {
  const [comments, setComments] = useState<MyCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextComments = await communityApi.listMyComments();
      const sortedComments = [...nextComments].sort(compareByCreatedDesc);
      const items = await Promise.all(
        sortedComments.map(async (comment) => {
          try {
            return {
              comment,
              post: await communityApi.getPost(comment.post),
            };
          } catch {
            return { comment };
          }
        }),
      );

      setComments(items);
    } catch (loadError) {
      setError(getUserMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  return (
    <section className="container my-page activity-page">
      <header className="my-page__header">
        <h2>내가 작성한 댓글</h2>
        <p>작성한 댓글을 모아보고 연결된 글로 이동합니다.</p>
      </header>

      <DataList
        items={comments}
        getKey={(item) => item.comment.id}
        loadingInitial={loading}
        error={error}
        emptyTitle="작성한 댓글이 없습니다."
        emptyDescription="댓글을 남기면 이곳에 모입니다."
        onRetry={() => void loadComments()}
        renderItem={({ comment, post }) => (
          <Link className="activity-item" to={`${post?.type === 'gallery' ? PICS_PATH : FREE_BOARD_PATH}/${comment.post}`}>
            <span className="activity-item__type">{post?.type === 'gallery' ? 'Pics' : '자유게시판'} · {formatRelativeTime(comment.created)}</span>
            <strong>{comment.content}</strong>
            <span>{post?.title ?? '연결된 글'}로 이동</span>
          </Link>
        )}
      />
    </section>
  );
};

export default MyComments;
