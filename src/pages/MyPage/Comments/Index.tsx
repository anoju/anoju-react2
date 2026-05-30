import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataList } from '@/components';
import { clipApi, clipCommentApi, communityApi, getUserMessage } from '@/apis';
import { CLIPS_PATH, FREE_BOARD_PATH, IT_LOGS_PATH, PICS_PATH } from '@/constants/app';
import type { ClipCommentRecord, ClipRecord, CommentRecord, PostRecord } from '@/types/domain';
import { compareByCreatedDesc, formatRelativeTime } from '@/utils/community';

interface MyPostCommentItem {
  type: 'post';
  comment: CommentRecord;
  post?: PostRecord;
}

interface MyClipCommentItem {
  type: 'clip';
  comment: ClipCommentRecord;
  clip?: ClipRecord;
}

type MyCommentItem = MyPostCommentItem | MyClipCommentItem;

const getPostPath = (post?: PostRecord) => {
  if (post?.type === 'gallery') {
    return PICS_PATH;
  }

  if (post?.type === 'it_logs') {
    return IT_LOGS_PATH;
  }

  return FREE_BOARD_PATH;
};

const getPostTypeLabel = (post?: PostRecord) => {
  if (post?.type === 'gallery') {
    return 'Pics';
  }

  if (post?.type === 'it_logs') {
    return 'ITLogs';
  }

  return '자유게시판';
};

const getCommentCreatedTime = (item: MyCommentItem) => item.comment.created;

const MyComments = () => {
  const [comments, setComments] = useState<MyCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [postCommentsResult, clipCommentsResult] = await Promise.allSettled([
        communityApi.listMyComments(),
        clipCommentApi.listMyComments(),
      ]);
      const nextPostComments = postCommentsResult.status === 'fulfilled' ? postCommentsResult.value : [];
      const nextClipComments = clipCommentsResult.status === 'fulfilled' ? clipCommentsResult.value : [];
      const postItems = await Promise.all(
        nextPostComments.map(async (comment): Promise<MyPostCommentItem> => {
          try {
            return {
              type: 'post',
              comment,
              post: await communityApi.getPost(comment.post),
            };
          } catch {
            return { type: 'post', comment };
          }
        }),
      );
      const clipItems = await Promise.all(
        nextClipComments.map(async (comment): Promise<MyClipCommentItem> => {
          try {
            return {
              type: 'clip',
              comment,
              clip: await clipApi.getClip(comment.clip),
            };
          } catch {
            return { type: 'clip', comment };
          }
        }),
      );

      setComments([...postItems, ...clipItems].sort((a, b) => compareByCreatedDesc(
        { created: getCommentCreatedTime(a) },
        { created: getCommentCreatedTime(b) },
      )));
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
        renderItem={(item) => {
          if (item.type === 'clip') {
            return (
              <Link className="activity-item" to={`${CLIPS_PATH}/${item.comment.clip}`}>
                <span className="activity-item__type">Clips · {formatRelativeTime(item.comment.created)}</span>
                <strong>{item.comment.content}</strong>
                <span>{item.clip?.title ?? '연결된 Clips'}로 이동</span>
              </Link>
            );
          }

          return (
            <Link className="activity-item" to={`${getPostPath(item.post)}/${item.comment.post}`}>
              <span className="activity-item__type">
                {getPostTypeLabel(item.post)} · {formatRelativeTime(item.comment.created)}
              </span>
              <strong>{item.comment.content}</strong>
              <span>{item.post?.title ?? '연결된 글'}로 이동</span>
            </Link>
          );
        }}
      />
    </section>
  );
};

export default MyComments;
