import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, MessageCircle, Search } from 'lucide-react';
import { Button, DataList, Input, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { FREE_BOARD_PATH, FREE_BOARD_WRITE_PATH } from '@/constants/app';
import type { PostRecord } from '@/types/domain';
import { createTextFilter } from '@/utils/queryString';
import { formatDate, getRecordAuthorName } from '@/utils/community';
import { useAuthStore } from '@/stores/authStore';

const PER_PAGE = 20;

const FreeBoard = () => {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const filter = useMemo(() => createTextFilter(keyword, ['title', 'content']), [keyword]);

  const loadPosts = useCallback(
    async (nextPage = 1) => {
      if (nextPage === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const result = await communityApi.listPosts({
          type: 'board',
          page: nextPage,
          perPage: PER_PAGE,
          filter,
        });

        const sortedItems = [...result.items].sort((a, b) => b.created.localeCompare(a.created));
        setPosts((currentPosts) => (nextPage === 1 ? sortedItems : [...currentPosts, ...sortedItems]));
        setPage(result.page);
        setTotalPages(result.totalPages);
      } catch (loadError) {
        setError(getUserMessage(loadError));
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    void loadPosts(1);
  }, [loadPosts]);

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadPosts(1);
  };

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      toast('글 작성은 이메일 인증을 완료한 회원만 가능합니다.', { tone: 'warning' });
    }
  };

  return (
    <section className="container board-page">
      <header className="board-page__header">
        <div>
          <span className="board-page__eyebrow">playground</span>
          <h2>자유게시판</h2>
          <p>편하게 쓰고 천천히 이어가는 모바일 커뮤니티 게시판입니다.</p>
        </div>
        {isAuthenticated ? (
          <Link className="button-link" to={FREE_BOARD_WRITE_PATH}>
            <Edit3 size={16} />
            글쓰기
          </Link>
        ) : (
          <Button type="button" size="sm" leftIcon={<Edit3 size={16} />} onClick={handleWriteClick}>
            글쓰기
          </Button>
        )}
      </header>

      <form className="board-page__search" onSubmit={handleSubmitSearch}>
        <Input
          label="검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="제목이나 본문 검색"
          leftIcon={<Search size={16} />}
        />
      </form>

      <DataList
        items={posts}
        getKey={(post) => post.id}
        mode="loadMore"
        loadingInitial={loadingInitial}
        loadingMore={loadingMore}
        hasMore={page < totalPages}
        error={error}
        emptyTitle="아직 게시글이 없습니다."
        emptyDescription="첫 이야기를 남겨보세요."
        onLoadMore={() => void loadPosts(page + 1)}
        onRetry={() => void loadPosts(1)}
        renderItem={(post) => (
          <Link to={`${FREE_BOARD_PATH}/${post.id}`} className="board-list-item">
            <span className="board-list-item__title">{post.title}</span>
            <span className="board-list-item__meta">
              {getRecordAuthorName(post)} · {formatDate(post.created)}
            </span>
            <span className="board-list-item__stats">
              <MessageCircle size={14} /> 댓글 {post.commentCount ?? 0} · 조회 {post.viewCount ?? 0} · 좋아요{' '}
              {post.likeCount ?? 0}
            </span>
          </Link>
        )}
      />
    </section>
  );
};

export default FreeBoard;
