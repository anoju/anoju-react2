import type React from 'react';
import { useState } from 'react';
import { CornerDownRight, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import type { ReactionTargetType, ReactionType } from '@/apis';
import { Avatar, Button, TextArea } from '@/components/atoms';
import { createCommentThreads, type CommentThreadNode } from '@/utils/commentThread';
import { formatRelativeTime, getRecordAuthorAvatarUrl, getRecordAuthorName } from '@/utils/community';
import { getReactionKey } from '@/utils/reactionState';
import { ReactionActions } from '../ReactionActions';
import { ShareButton } from '../ShareButton';

export interface CommentSectionItem {
  id: string;
  author: string;
  content: string;
  created?: string;
  parentComment?: string;
  likeCount?: number;
  dislikeCount?: number;
  expand?: Record<string, unknown>;
}

interface CommentSectionProps<TComment extends CommentSectionItem> {
  titleId: string;
  comments: TComment[];
  ownerId: string;
  canWrite: boolean;
  writeFallback: React.ReactNode;
  emptyMessage?: string;
  highlightedCommentId?: string | null;
  actionSubmittingId?: string | null;
  reactionTargetType: ReactionTargetType;
  reactionSubmittingKey?: string | null;
  userReactions: Record<string, ReactionType>;
  canEditComment: (comment: TComment) => boolean;
  getCommentShareUrl: (commentId: string) => string;
  onCreateComment: (content: string, parentCommentId?: string) => Promise<void>;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onReactionToggle: (targetType: ReactionTargetType, targetId: string, type: ReactionType) => void;
}

export const CommentSection = <TComment extends CommentSectionItem>({
  titleId,
  comments,
  ownerId,
  canWrite,
  writeFallback,
  emptyMessage = '아직 댓글이 없습니다.',
  highlightedCommentId,
  actionSubmittingId,
  reactionTargetType,
  reactionSubmittingKey,
  userReactions,
  canEditComment,
  getCommentShareUrl,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onReactionToggle,
}: CommentSectionProps<TComment>) => {
  const [commentContent, setCommentContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const commentThreads = createCommentThreads(comments);

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!commentContent.trim()) {
      return;
    }

    setCreating(true);

    try {
      await onCreateComment(commentContent.trim());
      setCommentContent('');
    } finally {
      setCreating(false);
    }
  };

  const handleEditStart = (comment: TComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editingCommentContent.trim()) {
      return;
    }

    await onUpdateComment(commentId, editingCommentContent.trim());
    handleEditCancel();
  };

  const handleReplyStart = (commentId: string) => {
    setReplyingCommentId(commentId);
    setReplyContent('');
  };

  const handleReplyCancel = () => {
    setReplyingCommentId(null);
    setReplyContent('');
  };

  const handleReplySubmit = async (parentCommentId: string) => {
    if (!replyContent.trim()) {
      return;
    }

    await onCreateComment(replyContent.trim(), parentCommentId);
    handleReplyCancel();
  };

  const renderComment = (node: CommentThreadNode<TComment>, depth = 0): React.ReactNode => {
    const item = node.comment;
    const reactionKey = getReactionKey(reactionTargetType, item.id);
    const isOwnerComment = item.author === ownerId;

    return (
      <article
        className="comment-item"
        data-depth={depth > 0 ? depth : undefined}
        data-highlighted={highlightedCommentId === item.id || undefined}
        data-post-author={isOwnerComment || undefined}
        id={`comment-${item.id}`}
        key={item.id}
      >
        <div className="comment-item__header">
          <div className="comment-item__author">
            <Avatar src={getRecordAuthorAvatarUrl(item)} name={getRecordAuthorName(item)} size="sm" />
            <div className="comment-item__meta">
              <strong>{getRecordAuthorName(item)}</strong>
              {isOwnerComment ? <span className="comment-item__badge">글쓴이</span> : null}
              <span>{formatRelativeTime(item.created ?? '')}</span>
            </div>
          </div>
          <div className="comment-item__actions">
            <ReactionActions
              compact
              likeCount={item.likeCount ?? 0}
              dislikeCount={item.dislikeCount ?? 0}
              selected={userReactions[reactionKey] ?? null}
              disabled={reactionSubmittingKey === reactionKey}
              onToggle={(type) => onReactionToggle(reactionTargetType, item.id, type)}
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
              <Button type="button" variant="outline" tone="neutral" size="sm" onClick={handleEditCancel}>
                취소
              </Button>
              <Button type="button" size="sm" loading={actionSubmittingId === item.id} onClick={() => void handleEditSubmit(item.id)}>
                저장
              </Button>
            </div>
          </div>
        ) : (
          <p>{item.content}</p>
        )}

        {replyingCommentId === item.id ? (
          <div className="comment-item__reply-form">
            <TextArea
              label="답글 작성"
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              placeholder="답글을 입력해주세요."
            />
            <div className="comment-item__edit-actions">
              <Button type="button" variant="outline" tone="neutral" size="sm" onClick={handleReplyCancel}>
                취소
              </Button>
              <Button type="button" size="sm" loading={actionSubmittingId === item.id} onClick={() => void handleReplySubmit(item.id)}>
                등록
              </Button>
            </div>
          </div>
        ) : null}

        {editingCommentId !== item.id ? (
          <div className="comment-item__manage-actions" aria-label="댓글 관리">
            <div className="comment-item__reply-actions">
              {canWrite ? (
                <Button
                  type="button"
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  leftIcon={<CornerDownRight size={14} />}
                  onClick={() => handleReplyStart(item.id)}
                >
                  답글
                </Button>
              ) : null}
            </div>
            <div className="comment-item__owner-actions">
              {canEditComment(item) ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    tone="neutral"
                    size="sm"
                    leftIcon={<Pencil size={14} />}
                    onClick={() => handleEditStart(item)}
                  >
                    수정
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    tone="danger"
                    size="sm"
                    loading={actionSubmittingId === item.id}
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => void onDeleteComment(item.id)}
                  >
                    삭제
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {node.replies.length > 0 ? (
          <div className="comment-item__replies">
            {node.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <section className="comment-box" aria-labelledby={titleId}>
      <h3 id={titleId}>
        <MessageCircle size={18} /> 댓글 {comments.length}
      </h3>
      <div className="comment-box__list">
        {commentThreads.length > 0 ? (
          commentThreads.map((thread) => renderComment(thread))
        ) : (
          <p className="board-page__message">{emptyMessage}</p>
        )}
      </div>

      {canWrite ? (
        <form className="comment-box__form" onSubmit={handleCreateSubmit}>
          <TextArea
            label="댓글 작성"
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            placeholder="댓글을 입력해주세요."
          />
          <Button type="submit" loading={creating}>
            댓글 등록
          </Button>
        </form>
      ) : (
        writeFallback
      )}
    </section>
  );
};
