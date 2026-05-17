import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button, Img, TextArea, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { FREE_BOARD_PATH, LOGIN_PATH } from '@/constants/app';
import type { CommentRecord, PostImageRecord, PostRecord } from '@/types/domain';
import { createContentParts, formatDate, getPostImageUrl, getRecordAuthorName } from '@/utils/community';
import { useAuthStore } from '@/stores/authStore';

const FreeBoardDetail = () => {
  const { postId = '' } = useParams();
  const location = useLocation();
  const [post, setPost] = useState<PostRecord | null>(null);
  const [images, setImages] = useState<PostImageRecord[]>([]);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const loadDetail = useCallback(async () => {
    if (!postId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [nextPost, nextImages, nextComments] = await Promise.all([
        communityApi.getPost(postId),
        communityApi.listImages(postId),
        communityApi.listComments(postId),
      ]);
      setPost(nextPost);
      setImages([...nextImages].sort((a, b) => a.sortOrder - b.sortOrder));
      setComments([...nextComments].sort((a, b) => a.created.localeCompare(b.created)));
    } catch (loadError) {
      setError(getUserMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!comment.trim()) {
      toast('댓글 내용을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      await communityApi.createComment({ postId, content: comment.trim() });
      setComment('');
      toast('댓글을 등록했습니다.', { tone: 'success' });
      await loadDetail();
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <section className="container board-page">게시글을 불러오고 있습니다.</section>;
  }

  if (error || !post) {
    return (
      <section className="container board-page">
        <p className="board-page__message">{error ?? '게시글을 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={FREE_BOARD_PATH}>
          목록으로
        </Link>
      </section>
    );
  }

  const contentParts = createContentParts(post.content, images);

  return (
    <article className="container board-detail">
      <header className="board-detail__header">
        <Link to={FREE_BOARD_PATH} className="board-detail__back">
          자유게시판
        </Link>
        <h2>{post.title}</h2>
        <p>
          {getRecordAuthorName(post)} · {formatDate(post.created)} · 조회 {post.viewCount ?? 0}
        </p>
      </header>

      <div className="board-detail__content">
        {contentParts.map((part) =>
          part.type === 'image' && part.image ? (
            <figure className="board-detail__image" key={part.key}>
              <Img src={getPostImageUrl(part.image)} alt={part.image.alt || post.title} />
            </figure>
          ) : (
            <p key={part.key}>{part.text}</p>
          ),
        )}
      </div>

      <section className="comment-box" aria-labelledby="comments-title">
        <h3 id="comments-title">
          <MessageCircle size={18} /> 댓글 {comments.length}
        </h3>
        <div className="comment-box__list">
          {comments.length > 0 ? (
            comments.map((item) => (
              <article className="comment-item" key={item.id}>
                <strong>{getRecordAuthorName(item)}</strong>
                <p>{item.content}</p>
                <span>{formatDate(item.created)}</span>
              </article>
            ))
          ) : (
            <p className="board-page__message">아직 댓글이 없습니다.</p>
          )}
        </div>

        {isAuthenticated ? (
          <form className="comment-box__form" onSubmit={handleCommentSubmit}>
            <TextArea
              label="댓글 작성"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="댓글을 입력해주세요."
            />
            <Button type="submit" loading={submitting}>
              댓글 등록
            </Button>
          </form>
        ) : (
          <Link className="button-link" to={`${LOGIN_PATH}?redirect=${encodeURIComponent(location.pathname)}`}>
            로그인 후 댓글 작성
          </Link>
        )}
      </section>
    </article>
  );
};

export default FreeBoardDetail;
