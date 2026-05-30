import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Avatar,
  Button,
  CommentSection,
  ContentActions,
  ImageSwipe,
  confirm,
  toast,
  type ImageSwipeItem,
} from '@/components'
import { communityApi, getUserMessage, reactionApi, type ReactionTargetType, type ReactionType } from '@/apis'
import { LOGIN_PATH, PICS_PATH } from '@/constants/app'
import type { CommentRecord, PostImageRecord, PostRecord } from '@/types/domain'
import {
  compareByCreatedAsc,
  formatRelativeTime,
  getPostImageUrl,
  getRecordAuthorAvatarUrl,
  getRecordAuthorName,
} from '@/utils/community'
import { applyReactionCount, getReactionKey } from '@/utils/reactionState'
import { useAuthStore } from '@/stores/authStore'
import { canEditAuthoredRecord } from '@/utils/recordPermission'

const PicsDetail = () => {
  const { postId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [post, setPost] = useState<PostRecord | null>(null)
  const [images, setImages] = useState<PostImageRecord[]>([])
  const [comments, setComments] = useState<CommentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [commentActionSubmittingId, setCommentActionSubmittingId] = useState<string | null>(null)
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

  const handleCommentCreate = async (content: string, parentCommentId?: string) => {
    try {
      await communityApi.createComment({ postId, content, parentCommentId })
      toast(parentCommentId ? '답글을 등록했습니다.' : '댓글을 등록했습니다.', { tone: 'success' })
      await loadDetail()
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' })
    }
  }

  const handleReactionToggle = async (
    targetType: ReactionTargetType,
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

  const handleCommentUpdate = async (commentId: string, content: string) => {
    setCommentActionSubmittingId(commentId)

    try {
      await communityApi.updateComment({ commentId, content })
      toast('댓글을 수정했습니다.', { tone: 'success' })
      await loadDetail()
    } catch (updateError) {
      toast(getUserMessage(updateError), { tone: 'danger' })
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
      'Pics를 피드에서 숨김 처리할까요? 숨김 처리 후 관리자만 확인할 수 있습니다.',
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
      toast('Pics를 숨김 처리했습니다.', { tone: 'success' })
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeletePostPermanently = async () => {
    const confirmed = await confirm(
      'Pics와 연결된 이미지, 댓글을 완전히 삭제할까요? 이 작업은 되돌릴 수 없습니다.',
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
      toast('Pics를 완전히 삭제했습니다.', { tone: 'success' })
      navigate(PICS_PATH, { replace: true })
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <section className="container pics-detail">Pics를 불러오고 있습니다.</section>
  }

  if (error || !post) {
    return (
      <section className="container pics-detail">
        <p className="board-page__message">{error ?? 'Pics를 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={PICS_PATH}>
          피드로
        </Link>
      </section>
    )
  }

  const swipeItems: ImageSwipeItem[] = images.map((image) => ({
    id: image.id,
    src: getPostImageUrl(image),
    alt: image.alt || post.title,
  }))
  const shareUrl = new URL(`${PICS_PATH}/${post.id}`, window.location.origin).toString()
  const getCommentShareUrl = (commentId: string) => new URL(
    `${PICS_PATH}/${post.id}?comment=${commentId}`,
    window.location.origin,
  ).toString()
  const canEditPost = canEditAuthoredRecord(post, user)
  return (
    <article className="container pics-detail">
      <header className="pics-detail__author">
        <Link to={PICS_PATH}>Pics</Link>
        <div className="pics-detail__author-main">
          <Avatar src={getRecordAuthorAvatarUrl(post)} name={getRecordAuthorName(post)} size="md" />
          <div>
            <strong>{getRecordAuthorName(post)}</strong>
            <span>{formatRelativeTime(post.created)}</span>
          </div>
        </div>
      </header>

      <ImageSwipe
        items={swipeItems}
        label={`${post.title} 이미지`}
        className="pics-detail__media"
      />

      <div className="pics-detail__body">
        <p>{post.content}</p>
        <ContentActions
          className="pic-card__actions"
          targetType="post"
          targetId={post.id}
          likeCount={post.likeCount ?? 0}
          dislikeCount={post.dislikeCount ?? 0}
          selectedReaction={userReactions[getReactionKey('post', post.id)] ?? null}
          reactionDisabled={reactionSubmittingKey === getReactionKey('post', post.id)}
          shareTitle={post.title}
          shareText={post.content}
          shareUrl={shareUrl}
          onReactionToggle={handleReactionToggle}
        />
      </div>

      {canEditPost || isAdmin ? (
        <div className="admin-actions" aria-label="Pics 관리">
          {canEditPost ? (
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              size="lg"
              leftIcon={<Pencil size={18} />}
              onClick={() => navigate(`${PICS_PATH}/${post.id}/edit`)}
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

      <CommentSection
        titleId="pics-comments-title"
        comments={comments}
        ownerId={post.author}
        canWrite={isAuthenticated}
        writeFallback={
          <Link
            className="button-link"
            to={`${LOGIN_PATH}?redirect=${encodeURIComponent(location.pathname)}`}
          >
            로그인 후 댓글 작성
          </Link>
        }
        highlightedCommentId={highlightedCommentId}
        actionSubmittingId={commentActionSubmittingId}
        reactionTargetType="comment"
        reactionSubmittingKey={reactionSubmittingKey}
        userReactions={userReactions}
        canEditComment={(item) => canEditAuthoredRecord(item, user)}
        getCommentShareUrl={getCommentShareUrl}
        onCreateComment={handleCommentCreate}
        onUpdateComment={handleCommentUpdate}
        onDeleteComment={handleCommentHide}
        onReactionToggle={handleReactionToggle}
      />
    </article>
  )
}

export default PicsDetail
