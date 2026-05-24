import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Heart, MessageCircle, Plus, Send } from 'lucide-react'
import {
  Avatar,
  Checkbox,
  DataList,
  FloatingActionButton,
  FloatingActions,
  ImageSwipe,
  toast,
  type ImageSwipeItem,
} from '@/components'
import { communityApi, getUserMessage } from '@/apis'
import { LOGIN_PATH, PICS_PATH, PICS_WRITE_PATH } from '@/constants/app'
import type { PostImageRecord, PostRecord } from '@/types/domain'
import {
  compareByCreatedDesc,
  formatRelativeTime,
  getPostImageUrl,
  getRecordAuthorAvatarUrl,
  getRecordAuthorName,
} from '@/utils/community'
import { shareContent } from '@/utils/share'
import { useAuthStore } from '@/stores/authStore'

interface PicsFeedItem {
  post: PostRecord
  images: PostImageRecord[]
}

const PER_PAGE = 12

const Pics = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<PicsFeedItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authStatus = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const showMyPosts = searchParams.get('mine') === '1'

  const loadPics = useCallback(async (nextPage = 1) => {
    if (nextPage === 1) {
      setLoadingInitial(true)
    } else {
      setLoadingMore(true)
    }

    setError(null)

    const authorId = showMyPosts ? user?.id : undefined

    if (showMyPosts && !authorId) {
      setItems([])
      setPage(1)
      setTotalPages(1)
      setLoadingInitial(false)
      setLoadingMore(false)
      return
    }

    try {
      const result = await communityApi.listPosts({
        type: 'gallery',
        page: nextPage,
        perPage: PER_PAGE,
        authorId,
      })
      const nextItems = await Promise.all(
        [...result.items].sort(compareByCreatedDesc).map(async (post) => {
          const images = (await communityApi.listImages(post.id)).sort(
            (a, b) => a.sortOrder - b.sortOrder,
          )
          return { post, images }
        }),
      )

      setItems((currentItems) => (nextPage === 1 ? nextItems : [...currentItems, ...nextItems]))
      setPage(result.page)
      setTotalPages(result.totalPages)
    } catch (loadError) {
      setError(getUserMessage(loadError))
    } finally {
      setLoadingInitial(false)
      setLoadingMore(false)
    }
  }, [showMyPosts, user?.id])

  useEffect(() => {
    void loadPics(1)
  }, [loadPics])

  useEffect(() => {
    if (!showMyPosts || authStatus === 'initializing' || isAuthenticated) {
      return
    }

    const redirectParams = new URLSearchParams(searchParams)
    redirectParams.set('mine', '1')
    const redirectSearch = redirectParams.toString()
    const redirect = encodeURIComponent(`${location.pathname}${redirectSearch ? `?${redirectSearch}` : ''}`)
    navigate(`${LOGIN_PATH}?redirect=${redirect}`, { replace: true })
  }, [authStatus, isAuthenticated, location.pathname, navigate, searchParams, showMyPosts])

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      toast('Pics 작성은 이메일 인증을 완료한 회원만 가능합니다.', { tone: 'warning' })
    }
  }

  const handleMineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && !isAuthenticated) {
      const redirectParams = new URLSearchParams(searchParams)
      redirectParams.set('mine', '1')
      const redirect = encodeURIComponent(`${location.pathname}?${redirectParams.toString()}`)
      navigate(`${LOGIN_PATH}?redirect=${redirect}`)
      return
    }

    const nextParams = new URLSearchParams(searchParams)

    if (event.target.checked) {
      nextParams.set('mine', '1')
    } else {
      nextParams.delete('mine')
    }

    nextParams.delete('page')
    nextParams.delete('cursor')
    setSearchParams(nextParams)
  }

  const handleShareClick = (post: PostRecord) => {
    const url = new URL(`${PICS_PATH}/${post.id}`, window.location.origin).toString()

    void shareContent({
      title: post.title,
      text: post.content,
      url,
    })
  }

  return (
    <section className="container pics-page">
      <header className="pics-page__header">
        <div>
          <span className="board-page__eyebrow">Snaps</span>
          <h2>Pics</h2>
          <p>나의 순간을 공유해보세요</p>
        </div>
      </header>

      <div className="content-filter">
        <Checkbox label="내 게시물 보기" checked={showMyPosts} onChange={handleMineChange} />
      </div>

      <DataList
        items={items}
        getKey={(item) => item.post.id}
        mode="infinite"
        loadingInitial={loadingInitial}
        loadingMore={loadingMore}
        hasMore={page < totalPages}
        error={error}
        emptyTitle="아직 Pics가 없습니다."
        emptyDescription="첫 장면을 올려보세요."
        onLoadMore={() => void loadPics(page + 1)}
        onRetry={() => void loadPics(1)}
        className="pics-feed"
        renderItem={({ post, images }) => {
          const swipeItems: ImageSwipeItem[] = images.map((image) => ({
            id: image.id,
            src: getPostImageUrl(image),
            alt: image.alt || post.title,
            href: `${PICS_PATH}/${post.id}`,
          }))

          return (
            <article className="pic-card">
              <ImageSwipe
                items={swipeItems}
                label={`${post.title} 이미지`}
                className="pic-card__media"
              />
              <div className="pic-card__body">
                <div className="pic-card__author">
                  <div className="pic-card__author-main">
                    <Avatar
                      src={getRecordAuthorAvatarUrl(post)}
                      name={getRecordAuthorName(post)}
                      size="sm"
                    />
                    <strong>{getRecordAuthorName(post)}</strong>
                  </div>
                  <span>{formatRelativeTime(post.created)}</span>
                </div>
                <p>{post.content}</p>
                <div className="pic-card__actions" aria-label="Pics 반응">
                  <span>
                    <Heart size={16} /> {post.likeCount ?? 0}
                  </span>
                  <span>
                    <MessageCircle size={16} /> {post.commentCount ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleShareClick(post)}
                    aria-label={`${post.title} 공유하기`}
                  >
                    <Send size={16} /> 공유
                  </button>
                </div>
              </div>
            </article>
          )
        }}
      />

      <FloatingActions label="Pics 주요 액션">
        {isAuthenticated ? (
          <FloatingActionButton
            label="Pics 올리기"
            to={PICS_WRITE_PATH}
            icon={<Plus size={24} />}
          />
        ) : (
          <FloatingActionButton
            label="Pics 올리기"
            icon={<Plus size={24} />}
            onClick={handleWriteClick}
          />
        )}
      </FloatingActions>
    </section>
  )
}

export default Pics
