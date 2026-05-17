import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Plus, Send } from 'lucide-react';
import { Button, DataList, Img, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { PICS_PATH, PICS_WRITE_PATH } from '@/constants/app';
import type { PostImageRecord, PostRecord } from '@/types/domain';
import { formatDate, getPostImageUrl, getRecordAuthorName } from '@/utils/community';
import { useAuthStore } from '@/stores/authStore';

interface PicsFeedItem {
  post: PostRecord;
  cover?: PostImageRecord;
}

const PER_PAGE = 12;

const Pics = () => {
  const [items, setItems] = useState<PicsFeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const loadPics = useCallback(async (nextPage = 1) => {
    if (nextPage === 1) {
      setLoadingInitial(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      const result = await communityApi.listPosts({
        type: 'gallery',
        page: nextPage,
        perPage: PER_PAGE,
      });
      const nextItems = await Promise.all(
        [...result.items].sort((a, b) => b.created.localeCompare(a.created)).map(async (post) => {
          const images = (await communityApi.listImages(post.id)).sort((a, b) => a.sortOrder - b.sortOrder);
          return { post, cover: images.find((image) => image.isCover) ?? images[0] };
        }),
      );

      setItems((currentItems) => (nextPage === 1 ? nextItems : [...currentItems, ...nextItems]));
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (loadError) {
      setError(getUserMessage(loadError));
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPics(1);
  }, [loadPics]);

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      toast('Pics 작성은 이메일 인증을 완료한 회원만 가능합니다.', { tone: 'warning' });
    }
  };

  return (
    <section className="container pics-page">
      <header className="pics-page__header">
        <div>
          <span className="board-page__eyebrow">Snaps</span>
          <h2>Pics</h2>
          <p>사진과 짧은 캡션으로 이어지는 소셜 피드입니다.</p>
        </div>
        {isAuthenticated ? (
          <Link className="button-link" to={PICS_WRITE_PATH}>
            <Plus size={16} /> 올리기
          </Link>
        ) : (
          <Button type="button" size="sm" leftIcon={<Plus size={16} />} onClick={handleWriteClick}>
            올리기
          </Button>
        )}
      </header>

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
        renderItem={({ post, cover }) => (
          <article className="pic-card">
            <Link to={`${PICS_PATH}/${post.id}`} className="pic-card__media">
              {cover ? <Img src={getPostImageUrl(cover)} alt={cover.alt || post.title} /> : <span>이미지 없음</span>}
            </Link>
            <div className="pic-card__body">
              <div className="pic-card__author">
                <strong>{getRecordAuthorName(post)}</strong>
                <span>{formatDate(post.created)}</span>
              </div>
              <p>{post.content}</p>
              <div className="pic-card__actions" aria-label="Pics 반응">
                <span>
                  <Heart size={16} /> {post.likeCount ?? 0}
                </span>
                <span>
                  <MessageCircle size={16} /> {post.commentCount ?? 0}
                </span>
                <span>
                  <Send size={16} /> 공유
                </span>
              </div>
            </div>
          </article>
        )}
      />
    </section>
  );
};

export default Pics;
