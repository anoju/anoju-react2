import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Avatar,
  Button,
  CommentSection,
  ContentActions,
  Img,
  confirm,
  toast,
} from '@/components'
import { communityApi, getUserMessage, reactionApi, type ReactionTargetType, type ReactionType } from '@/apis'
import { LOGIN_PATH } from '@/constants/app'
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
import { canWriteBoardContent, FREE_BOARD_CONFIG, type PlaygroundBoardConfig } from '../../boardConfig'

interface FreeBoardDetailProps {
  config?: PlaygroundBoardConfig
}

const FreeBoardDetail = ({ config = FREE_BOARD_CONFIG }: FreeBoardDetailProps) => {
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
  const canWriteInteraction = canWriteBoardContent(config, user)

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

      if (nextPost.type !== config.type) {
        setError('게시글을 찾을 수 없습니다.')
        return
      }

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
  }, [config.type, isAuthenticated, postId])

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
    if (!canWriteInteraction) {
      toast(config.adminOnlyWrite ? 'ITLogs 반응은 관리자만 남길 수 있습니다.' : '로그인 후 반응을 남길 수 있습니다.', {
        tone: 'warning',
      })
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
      navigate(config.listPath, { replace: true })
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
        <Link className="button-link" to={config.listPath}>
          목록으로
        </Link>
      </section>
    )
  }

  const hasLegacyImageToken = post.content.includes('[[image:')
  const contentParts = hasLegacyImageToken ? createContentParts(post.content, images) : []
  const sanitizedContent = sanitizeRichTextHtml(post.content)
  const shareUrl = new URL(config.getDetailPath(post.id), window.location.origin).toString()
  const canEditPost = config.adminOnlyWrite ? isAdmin : canEditAuthoredRecord(post, user)
  const getCommentShareUrl = (commentId: string) => {
    const url = new URL(shareUrl)
    url.searchParams.set('comment', commentId)
    return url.toString()
  }

  return (
    <article className="container board-detail">
      <header className="board-detail__header">
        <Link to={config.listPath} className="board-detail__back">
          {config.title}
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

      <ContentActions
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

      {canEditPost || isAdmin ? (
        <div className="admin-actions" aria-label="게시글 관리">
          {canEditPost ? (
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              size="lg"
              leftIcon={<Pencil size={18} />}
              onClick={() => navigate(config.getEditPath(post.id))}
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
        titleId="comments-title"
        comments={comments}
        ownerId={post.author}
        canWrite={canWriteInteraction}
        writeFallback={config.adminOnlyWrite ? (
          <p className="board-page__message">관리자만 댓글을 작성할 수 있습니다.</p>
        ) : (
          <Link
            className="button-link"
            to={`${LOGIN_PATH}?redirect=${encodeURIComponent(location.pathname)}`}
          >
            로그인 후 댓글 작성
          </Link>
        )}
        highlightedCommentId={highlightedCommentId}
        actionSubmittingId={commentActionSubmittingId}
        reactionTargetType="comment"
        reactionSubmittingKey={reactionSubmittingKey}
        userReactions={userReactions}
        canEditComment={(item) => (config.adminOnlyWrite ? isAdmin : canEditAuthoredRecord(item, user))}
        getCommentShareUrl={getCommentShareUrl}
        onCreateComment={handleCommentCreate}
        onUpdateComment={handleCommentUpdate}
        onDeleteComment={handleCommentHide}
        onReactionToggle={handleReactionToggle}
      />
    </article>
  )
}

export default FreeBoardDetail
