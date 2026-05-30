import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Eye, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { Avatar, Button, ReactionActions, ShareButton, TextArea, VideoPlayer, confirm, toast } from '@/components';
import { clipApi, clipCommentApi, getClipPosterUrl, getClipVideoUrl, getUserMessage, reactionApi, type ReactionType } from '@/apis';
import { CLIPS_PATH, LOGIN_PATH } from '@/constants/app';
import type { ClipCommentRecord, ClipRecord } from '@/types/domain';
import { formatRelativeTime, getRecordAuthorAvatarUrl, getRecordAuthorName } from '@/utils/community';
import { canEditAuthoredRecord } from '@/utils/recordPermission';
import { applyReactionCount, getReactionKey } from '@/utils/reactionState';
import { useAuthStore } from '@/stores/authStore';

const ClipsDetail = () => {
  const { clipId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [clip, setClip] = useState<ClipRecord | null>(null);
  const [comments, setComments] = useState<ClipCommentRecord[]>([]);
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentActionId, setCommentActionId] = useState<string | null>(null);
  const [reactionSubmittingKey, setReactionSubmittingKey] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({});
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClip = useCallback(async () => {
    if (!clipId) {
      setError('Clips 영상을 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextClip = await clipApi.getClip(clipId);
      setClip(nextClip);

      try {
        const nextComments = await clipCommentApi.listComments(clipId);
        const reactions = isAuthenticated
          ? await reactionApi
            .listMyReactions([
              { targetType: 'clip', targetId: clipId },
              ...nextComments.map((item) => ({
                targetType: 'clip_comment' as const,
                targetId: item.id,
              })),
            ])
            .catch(() => [])
          : [];

        setComments(nextComments);
        setUserReactions(
          Object.fromEntries(
            reactions.map((reaction) => [
              getReactionKey(reaction.targetType, reaction.targetId),
              reaction.type,
            ]),
          ),
        );
      } catch {
        setComments([]);
        setUserReactions({});
      }
    } catch (loadError) {
      setError(getUserMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [clipId, isAuthenticated]);

  useEffect(() => {
    void loadClip();
  }, [loadClip]);

  const handleHideClip = async () => {
    const confirmed = await confirm('Clips를 목록에서 숨김 처리할까요?', {
      title: 'Clips 삭제 확인',
      confirmLabel: '삭제',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const nextClip = await clipApi.hideClip(clipId);
      setClip(nextClip);
      toast('Clips를 숨김 처리했습니다.', { tone: 'success' });
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' });
    } finally {
      setDeleting(false);
    }
  };

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!comment.trim()) {
      toast('댓글 내용을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setSubmittingComment(true);

    try {
      await clipCommentApi.createComment({ clipId, content: comment });
      setComment('');
      setComments(await clipCommentApi.listComments(clipId));
      toast('댓글을 등록했습니다.', { tone: 'success' });
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReactionToggle = async (
    targetType: 'clip' | 'clip_comment',
    targetId: string,
    type: ReactionType,
  ) => {
    if (!isAuthenticated || !user?.verified) {
      toast('로그인 및 이메일 인증 후 반응을 남길 수 있습니다.', { tone: 'warning' });
      return;
    }

    const reactionKey = getReactionKey(targetType, targetId);
    const previousReaction = userReactions[reactionKey] ?? null;
    const nextReaction = previousReaction === type ? null : type;

    setReactionSubmittingKey(reactionKey);
    setUserReactions((current) => {
      const next = { ...current };

      if (nextReaction) {
        next[reactionKey] = nextReaction;
      } else {
        delete next[reactionKey];
      }

      return next;
    });

    if (targetType === 'clip') {
      setClip((current) => (current ? applyReactionCount(current, previousReaction, nextReaction) : current));
    } else {
      setComments((current) =>
        current.map((item) => (item.id === targetId ? applyReactionCount(item, previousReaction, nextReaction) : item)),
      );
    }

    try {
      await reactionApi.toggle({ targetType, targetId, type });
    } catch (reactionError) {
      setUserReactions((current) => {
        const next = { ...current };

        if (previousReaction) {
          next[reactionKey] = previousReaction;
        } else {
          delete next[reactionKey];
        }

        return next;
      });

      if (targetType === 'clip') {
        setClip((current) => (current ? applyReactionCount(current, nextReaction, previousReaction) : current));
      } else {
        setComments((current) =>
          current.map((item) => (item.id === targetId ? applyReactionCount(item, nextReaction, previousReaction) : item)),
        );
      }

      toast(getUserMessage(reactionError), { tone: 'danger' });
    } finally {
      setReactionSubmittingKey(null);
    }
  };

  const handleCommentUpdate = async (commentId: string) => {
    if (!editingCommentContent.trim()) {
      toast('댓글 내용을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setCommentActionId(commentId);

    try {
      await clipCommentApi.updateComment({ commentId, content: editingCommentContent });
      setEditingCommentId(null);
      setEditingCommentContent('');
      setComments(await clipCommentApi.listComments(clipId));
      toast('댓글을 수정했습니다.', { tone: 'success' });
    } catch (updateError) {
      toast(getUserMessage(updateError), { tone: 'danger' });
    } finally {
      setCommentActionId(null);
    }
  };

  const handleCommentHide = async (commentId: string) => {
    const confirmed = await confirm('댓글을 삭제할까요? 삭제 후 목록에서 숨김 처리됩니다.', {
      title: '댓글 삭제 확인',
      confirmLabel: '삭제',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    setCommentActionId(commentId);

    try {
      await clipCommentApi.hideComment(commentId);
      setComments(await clipCommentApi.listComments(clipId));
      toast('댓글을 삭제했습니다.', { tone: 'success' });
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' });
    } finally {
      setCommentActionId(null);
    }
  };

  const handleDeleteClipPermanently = async () => {
    const confirmed = await confirm('Clips와 연결된 동영상을 완전히 삭제할까요? 이 작업은 되돌릴 수 없습니다.', {
      title: '완전 삭제 확인',
      confirmLabel: '완전 삭제',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await clipApi.deleteClipPermanently(clipId);
      toast('Clips를 완전히 삭제했습니다.', { tone: 'success' });
      navigate(CLIPS_PATH, { replace: true });
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <section className="container clips-detail">Clips를 불러오고 있습니다.</section>;
  }

  if (error || !clip) {
    return (
      <section className="container clips-detail">
        <p className="board-page__message">{error ?? 'Clips 영상을 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={CLIPS_PATH}>
          목록으로
        </Link>
      </section>
    );
  }

  const posterUrl = getClipPosterUrl(clip);
  const shareUrl = new URL(`${CLIPS_PATH}/${clip.id}`, window.location.origin).toString();
  const canEditClip = canEditAuthoredRecord(clip, user);
  const getCommentShareUrl = (commentId: string) => new URL(
    `${CLIPS_PATH}/${clip.id}?comment=${commentId}`,
    window.location.origin,
  ).toString();

  return (
    <article className="container clips-detail">
      <VideoPlayer src={getClipVideoUrl(clip)} poster={posterUrl} title={clip.title} className="clips-detail__player" />

      <section className="clips-detail__content" aria-label="영상 정보">
        <header className="clips-detail__header">
          <Link to={CLIPS_PATH}>Clips</Link>
          <h2>{clip.title}</h2>
          <p>
            <Eye size={16} /> 조회 {clip.viewCount ?? 0}회 · {formatRelativeTime(clip.created)}
          </p>
        </header>

        <div className="clips-detail__channel">
          <Avatar src={getRecordAuthorAvatarUrl(clip)} name={getRecordAuthorName(clip)} size="md" />
          <div>
            <strong>{getRecordAuthorName(clip)}</strong>
            <span>{clip.tags?.map((tag) => `#${tag}`).join(' ') || 'Clips'}</span>
          </div>
        </div>

        <p className="clips-detail__description">{clip.description}</p>
      </section>

      <div className="board-detail__actions">
        <ReactionActions
          likeCount={clip.likeCount ?? 0}
          dislikeCount={clip.dislikeCount ?? 0}
          selected={userReactions[getReactionKey('clip', clip.id)] ?? null}
          disabled={reactionSubmittingKey === getReactionKey('clip', clip.id)}
          onToggle={(type) => handleReactionToggle('clip', clip.id, type)}
        />
        <ShareButton title={clip.title} text={clip.description} url={shareUrl} />
      </div>

      {canEditClip || isAdmin ? (
        <div className="admin-actions" aria-label="Clips 관리">
          {canEditClip ? (
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              size="lg"
              leftIcon={<Pencil size={18} />}
              onClick={() => navigate(`${CLIPS_PATH}/${clip.id}/edit`)}
            >
              수정
            </Button>
          ) : null}
          {clip.status === 'hidden' || clip.deleted ? (
            isAdmin ? (
              <Button
                type="button"
                variant="outline"
                tone="danger"
                size="lg"
                loading={deleting}
                leftIcon={<Trash2 size={18} />}
                onClick={handleDeleteClipPermanently}
              >
                완전 삭제
              </Button>
            ) : null
          ) : canEditClip ? (
            <Button
              type="button"
              variant="outline"
              tone="danger"
              size="lg"
              loading={deleting}
              leftIcon={<Trash2 size={18} />}
              onClick={handleHideClip}
            >
              삭제
            </Button>
          ) : null}
        </div>
      ) : null}

      <section className="comment-box" aria-labelledby="clip-comments-title">
        <h3 id="clip-comments-title">
          <MessageCircle size={18} /> 댓글 {comments.length}
        </h3>
        <div className="comment-box__list">
          {comments.length > 0 ? (
            comments.map((item) => {
              const canEditComment = canEditAuthoredRecord(item, user);

              return (
                <article className="comment-item" key={item.id}>
                  <div className="comment-item__header">
                    <div className="comment-item__author">
                      <Avatar src={getRecordAuthorAvatarUrl(item)} name={getRecordAuthorName(item)} size="sm" />
                      <div className="comment-item__meta">
                        <strong>{getRecordAuthorName(item)}</strong>
                        <span>{formatRelativeTime(item.created)}</span>
                      </div>
                    </div>
                    <div className="comment-item__actions">
                      <ReactionActions
                        compact
                        likeCount={item.likeCount ?? 0}
                        dislikeCount={item.dislikeCount ?? 0}
                        selected={userReactions[getReactionKey('clip_comment', item.id)] ?? null}
                        disabled={reactionSubmittingKey === getReactionKey('clip_comment', item.id)}
                        onToggle={(type) => handleReactionToggle('clip_comment', item.id, type)}
                      />
                      <ShareButton
                        title={`${getRecordAuthorName(item)} 댓글`}
                        text={item.content}
                        url={getCommentShareUrl(item.id)}
                        iconOnly
                      />
                    </div>
                  </div>

                  {editingCommentId === item.id ? (
                    <div className="comment-item__edit">
                      <TextArea
                        label="댓글 수정"
                        value={editingCommentContent}
                        onChange={(event) => setEditingCommentContent(event.target.value)}
                      />
                      <div className="comment-item__edit-actions">
                        <Button type="button" variant="outline" tone="neutral" size="sm" onClick={() => setEditingCommentId(null)}>
                          취소
                        </Button>
                        <Button type="button" size="sm" loading={commentActionId === item.id} onClick={() => void handleCommentUpdate(item.id)}>
                          저장
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p>{item.content}</p>
                  )}

                  {canEditComment && editingCommentId !== item.id ? (
                    <div className="comment-item__manage-actions" aria-label="댓글 관리">
                      <div />
                      <div className="comment-item__owner-actions">
                        <Button
                          type="button"
                          variant="ghost"
                          tone="neutral"
                          size="sm"
                          leftIcon={<Pencil size={14} />}
                          onClick={() => {
                            setEditingCommentId(item.id);
                            setEditingCommentContent(item.content);
                          }}
                        >
                          수정
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          tone="danger"
                          size="sm"
                          loading={commentActionId === item.id}
                          leftIcon={<Trash2 size={14} />}
                          onClick={() => void handleCommentHide(item.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
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
            <Button type="submit" loading={submittingComment}>
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

export default ClipsDetail;
