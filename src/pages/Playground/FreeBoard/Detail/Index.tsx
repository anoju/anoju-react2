import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { MessageCircle, Pencil, Reply, Trash2 } from 'lucide-react'
import {
  Avatar,
  Button,
  Img,
  ReactionActions,
  ShareButton,
  TextArea,
  confirm,
  toast,
} from '@/components'
import { communityApi, getUserMessage, reactionApi, type ReactionType } from '@/apis'
import { FREE_BOARD_PATH, LOGIN_PATH } from '@/constants/app'
import type { CommentRecord, PostImageRecord, PostRecord } from '@/types/domain'
import {
  compareByCreatedAsc,
  createContentParts,
  formatRelativeTime,
  getPostImageUrl,
  getRecordAuthorAvatarUrl,
  getRecordAuthorName,
} from '@/utils/community'
import { sanitizeRichTextHtml } from '@/utils/richTextSecurity'
import { applyReactionCount, getReactionKey } from '@/utils/reactionState'
import { useAuthStore } from '@/stores/authStore'
import { canEditAuthoredRecord } from '@/utils/recordPermission'
import { createCommentThreads, type CommentThreadNode } from '@/utils/commentThread'

const FreeBoardDetail = () => {
  const { postId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [post, setPost] = useState<PostRecord | null>(null)
  const [images, setImages] = useState<PostImageRecord[]>([])
  const [comments, setComments] = useState<CommentRecord[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [commentActionSubmittingId, setCommentActionSubmittingId] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [reactionSubmittingKey, setReactionSubmittingKey] = useState<string | null>(null)
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({})
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'

  const loadDetail = useCallback(async () => {
    if (!postId) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [nextPost, nextImages, nextComments] = await Promise.all([
        communityApi.getPost(postId),
        communityApi.listImages(postId),
        communityApi.listComments(postId),
      ])
      const sortedComments = [...nextComments].sort(compareByCreatedAsc)
      const reactions = isAuthenticated
        ? await reactionApi
            .listMyReactions([
              { targetType: 'post', targetId: postId },
              ...sortedComments.map((item) => ({
                targetType: 'comment' as const,
                targetId: item.id,
              })),
            ])
            .catch(() => [])
        : []

      setPost(nextPost)
      setImages([...nextImages].sort((a, b) => a.sortOrder - b.sortOrder))
      setComments(sortedComments)
      setUserReactions(
        Object.fromEntries(
          reactions.map((reaction) => [
            getReactionKey(reaction.targetType, reaction.targetId),
            reaction.type,
          ]),
        ),
      )
    } catch (loadError) {
      setError(getUserMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, postId])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  useEffect(() => {
    if (loading || comments.length === 0) {
      return undefined
    }

    const targetCommentId = new URLSearchParams(location.search).get('comment')

    if (!targetCommentId || !comments.some((item) => item.id === targetCommentId)) {
      return undefined
    }

    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById(`comment-${targetCommentId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedCommentId(targetCommentId)
    }, 100)
    const highlightTimer = window.setTimeout(() => {
      setHighlightedCommentId((current) => (current === targetCommentId ? null : current))
    }, 4500)

    return () => {
      window.clearTimeout(scrollTimer)
      window.clearTimeout(highlightTimer)
    }
  }, [comments, loading, location.search])

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!comment.trim()) {
      toast('댓글 내용을 입력해주세요.', { tone: 'warning' })
      return
    }

    setSubmitting(true)

    try {
      await communityApi.createComment({ postId, content: comment.trim() })
      setComment('')
      toast('댓글을 등록했습니다.', { tone: 'success' })
      await loadDetail()
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReactionToggle = async (
    targetType: 'post' | 'comment',
    targetId: string,
    type: ReactionType,
  ) => {
    if (!isAuthenticated) {
      toast('로그인 후 반응을 남길 수 있습니다.', { tone: 'warning' })
      return
    }

    const reactionKey = getReactionKey(targetType, targetId)
    const previousReaction = userReactions[reactionKey] ?? null
    const nextReaction = previousReaction === type ? null : type

    setReactionSubmittingKey(reactionKey)
    setUserReactions((current) => {
      const next = { ...current }

      if (nextReaction) {
        next[reactionKey] = nextReaction
      } else {
        delete next[reactionKey]
      }

      return next
    })

    if (targetType === 'post') {
      setPost((current) =>
        current ? applyReactionCount(current, previousReaction, nextReaction) : current,
      )
    } else {
      setComments((current) =>
        current.map((item) =>
          item.id === targetId ? applyReactionCount(item, previousReaction, nextReaction) : item,
        ),
      )
    }

    try {
      await reactionApi.toggle({ targetType, targetId, type })
    } catch (reactionError) {
      setUserReactions((current) => {
        const next = { ...current }

        if (previousReaction) {
          next[reactionKey] = previousReaction
        } else {
          delete next[reactionKey]
        }

        return next
      })

      if (targetType === 'post') {
        setPost((current) =>
          current ? applyReactionCount(current, nextReaction, previousReaction) : current,
        )
      } else {
        setComments((current) =>
          current.map((item) =>
            item.id === targetId ? applyReactionCount(item, nextReaction, previousReaction) : item,
          ),
        )
      }

      toast(getUserMessage(reactionError), { tone: 'danger' })
    } finally {
      setReactionSubmittingKey(null)
    }
  }

  const handleCommentEditStart = (item: CommentRecord) => {
    setEditingCommentId(item.id)
    setEditingCommentContent(item.content)
  }

  const handleCommentEditCancel = () => {
    setEditingCommentId(null)
    setEditingCommentContent('')
  }

  const handleCommentUpdate = async (commentId: string) => {
    if (!editingCommentContent.trim()) {
      toast('댓글 내용을 입력해주세요.', { tone: 'warning' })
      return
    }

    setCommentActionSubmittingId(commentId)

    try {
      await communityApi.updateComment({ commentId, content: editingCommentContent.trim() })
      toast('댓글을 수정했습니다.', { tone: 'success' })
      handleCommentEditCancel()
      await loadDetail()
    } catch (updateError) {
      toast(getUserMessage(updateError), { tone: 'danger' })
    } finally {
      setCommentActionSubmittingId(null)
    }
  }

  const handleCommentReplyStart = (commentId: string) => {
    setReplyingCommentId(commentId)
    setReplyContent('')
  }

  const handleCommentReplyCancel = () => {
    setReplyingCommentId(null)
    setReplyContent('')
  }

  const handleCommentReplySubmit = async (parentCommentId: string) => {
    if (!replyContent.trim()) {
      toast('답글 내용을 입력해주세요.', { tone: 'warning' })
      return
    }

    setCommentActionSubmittingId(parentCommentId)

    try {
      await communityApi.createComment({ postId, content: replyContent.trim(), parentCommentId })
      toast('답글을 등록했습니다.', { tone: 'success' })
      handleCommentReplyCancel()
      await loadDetail()
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' })
    } finally {
      setCommentActionSubmittingId(null)
    }
  }

  const handleCommentHide = async (commentId: string) => {
    const confirmed = await confirm('댓글을 삭제할까요? 삭제 후 목록에서 숨김 처리됩니다.', {
      title: '댓글 삭제 확인',
      confirmLabel: '삭제',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    setCommentActionSubmittingId(commentId)

    try {
      await communityApi.hideComment(commentId)
      toast('댓글을 삭제했습니다.', { tone: 'success' })
      await loadDetail()
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' })
    } finally {
      setCommentActionSubmittingId(null)
    }
  }

  const handleHidePost = async () => {
    const confirmed = await confirm(
      '게시글을 목록에서 숨김 처리할까요? 숨김 처리 후 관리자만 확인할 수 있습니다.',
      {
        title: '삭제 확인',
        confirmLabel: '삭제',
        tone: 'danger',
      },
    )

    if (!confirmed) {
      return
    }

    setDeleting(true)

    try {
      const nextPost = await communityApi.hidePost(postId)
      setPost(nextPost)
      toast('게시글을 숨김 처리했습니다.', { tone: 'success' })
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeletePostPermanently = async () => {
    const confirmed = await confirm(
      '게시글과 연결된 이미지, 댓글을 완전히 삭제할까요? 이 작업은 되돌릴 수 없습니다.',
      {
        title: '완전 삭제 확인',
        confirmLabel: '완전 삭제',
        tone: 'danger',
      },
    )

    if (!confirmed) {
      return
    }

    setDeleting(true)

    try {
      await communityApi.deletePostPermanently(postId)
      toast('게시글을 완전히 삭제했습니다.', { tone: 'success' })
      navigate(FREE_BOARD_PATH, { replace: true })
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <section className="container board-page">게시글을 불러오고 있습니다.</section>
  }

  if (error || !post) {
    return (
      <section className="container board-page">
        <p className="board-page__message">{error ?? '게시글을 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={FREE_BOARD_PATH}>
          목록으로
        </Link>
      </section>
    )
  }

  const hasLegacyImageToken = post.content.includes('[[image:')
  const contentParts = hasLegacyImageToken ? createContentParts(post.content, images) : []
  const sanitizedContent = sanitizeRichTextHtml(post.content)
  const shareUrl = new URL(`${FREE_BOARD_PATH}/${post.id}`, window.location.origin).toString()
  const canEditPost = canEditAuthoredRecord(post, user)
  const commentThreads = createCommentThreads(comments)
  const getCommentShareUrl = (commentId: string) => {
    const url = new URL(shareUrl)
    url.searchParams.set('comment', commentId)
    return url.toString()
  }
  const renderComment = (node: CommentThreadNode, depth = 0): React.ReactNode => {
    const item = node.comment
    const canEditComment = canEditAuthoredRecord(item, user)
    const isPostAuthorComment = item.author === post.author

    return (
      <article
        className="comment-item"
        data-depth={depth > 0 ? depth : undefined}
        data-highlighted={highlightedCommentId === item.id || undefined}
        data-post-author={isPostAuthorComment || undefined}
        id={`comment-${item.id}`}
        key={item.id}
      >
        <div className="comment-item__header">
          <div className="comment-item__author">
            <Avatar
              src={getRecordAuthorAvatarUrl(item)}
              name={getRecordAuthorName(item)}
              size="sm"
            />
            <div className="comment-item__meta">
              <strong>{getRecordAuthorName(item)}</strong>
              {isPostAuthorComment ? <span className="comment-item__badge">글쓴이</span> : null}
              <span>{formatRelativeTime(item.created)}</span>
            </div>
          </div>
          <div className="comment-item__actions">
            <ReactionActions
              compact
              likeCount={item.likeCount ?? 0}
              dislikeCount={item.dislikeCount ?? 0}
              selected={userReactions[getReactionKey('comment', item.id)] ?? null}
              disabled={reactionSubmittingKey === getReactionKey('comment', item.id)}
              onToggle={(type) => handleReactionToggle('comment', item.id, type)}
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
              <Button
                type="button"
                variant="outline"
                tone="neutral"
                size="sm"
                onClick={handleCommentEditCancel}
              >
                취소
              </Button>
              <Button
                type="button"
                size="sm"
                loading={commentActionSubmittingId === item.id}
                onClick={() => void handleCommentUpdate(item.id)}
              >
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
              <Button
                type="button"
                variant="outline"
                tone="neutral"
                size="sm"
                onClick={handleCommentReplyCancel}
              >
                취소
              </Button>
              <Button
                type="button"
                size="sm"
                loading={commentActionSubmittingId === item.id}
                onClick={() => void handleCommentReplySubmit(item.id)}
              >
                등록
              </Button>
            </div>
          </div>
        ) : null}

        {editingCommentId !== item.id ? (
          <div className="comment-item__manage-actions" aria-label="댓글 관리">
            <div className="comment-item__reply-actions">
              {isAuthenticated ? (
                <Button
                  type="button"
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  leftIcon={<Reply size={14} />}
                  onClick={() => handleCommentReplyStart(item.id)}
                >
                  답글
                </Button>
              ) : null}
            </div>
            <div className="comment-item__owner-actions">
              {canEditComment ? (
                <>
                <Button
                  type="button"
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  leftIcon={<Pencil size={14} />}
                  onClick={() => handleCommentEditStart(item)}
                >
                  수정
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  tone="danger"
                  size="sm"
                  loading={commentActionSubmittingId === item.id}
                  leftIcon={<Trash2 size={14} />}
                  onClick={() => void handleCommentHide(item.id)}
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
    )
  }

  return (
    <article className="container board-detail">
      <header className="board-detail__header">
        <Link to={FREE_BOARD_PATH} className="board-detail__back">
          자유게시판
        </Link>
        <h2>{post.title}</h2>
        <div className="board-detail__author">
          <Avatar src={getRecordAuthorAvatarUrl(post)} name={getRecordAuthorName(post)} size="md" />
          <p>
            {getRecordAuthorName(post)} · {formatRelativeTime(post.created)} · 조회{' '}
            {post.viewCount ?? 0}
          </p>
        </div>
      </header>

      <div className="board-detail__content">
        {hasLegacyImageToken ? (
          contentParts.map((part) =>
            part.type === 'image' && part.image ? (
              <figure className="board-detail__image" key={part.key}>
                <Img src={getPostImageUrl(part.image)} alt={part.image.alt || post.title} />
              </figure>
            ) : (
              <p key={part.key}>{part.text}</p>
            ),
          )
        ) : (
          <div
            className="board-detail__editor-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        )}
      </div>

      <div className="board-detail__actions">
        <ReactionActions
          likeCount={post.likeCount ?? 0}
          dislikeCount={post.dislikeCount ?? 0}
          selected={userReactions[getReactionKey('post', post.id)] ?? null}
          disabled={reactionSubmittingKey === getReactionKey('post', post.id)}
          onToggle={(type) => handleReactionToggle('post', post.id, type)}
        />
        <ShareButton title={post.title} text={post.content} url={shareUrl} />
      </div>

      {canEditPost || isAdmin ? (
        <div className="admin-actions" aria-label="게시글 관리">
          {canEditPost ? (
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              size="lg"
              leftIcon={<Pencil size={18} />}
              onClick={() => navigate(`${FREE_BOARD_PATH}/${post.id}/edit`)}
            >
              수정
            </Button>
          ) : null}
          {post.status === 'hidden' || post.deleted ? (
            isAdmin ? (
              <Button
                type="button"
                variant="outline"
                tone="danger"
                size="lg"
                loading={deleting}
                leftIcon={<Trash2 size={18} />}
                onClick={handleDeletePostPermanently}
              >
                완전 삭제
              </Button>
            ) : null
          ) : canEditPost ? (
            <Button
              type="button"
              variant="outline"
              tone="danger"
              size="lg"
              loading={deleting}
              leftIcon={<Trash2 size={18} />}
              onClick={handleHidePost}
            >
              삭제
            </Button>
          ) : null}
        </div>
      ) : null}

      <section className="comment-box" aria-labelledby="comments-title">
        <h3 id="comments-title">
          <MessageCircle size={18} /> 댓글 {comments.length}
        </h3>
        <div className="comment-box__list">
          {commentThreads.length > 0 ? (
            commentThreads.map((thread) => renderComment(thread))
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
          <Link
            className="button-link"
            to={`${LOGIN_PATH}?redirect=${encodeURIComponent(location.pathname)}`}
          >
            로그인 후 댓글 작성
          </Link>
        )}
      </section>
    </article>
  )
}

export default FreeBoardDetail
