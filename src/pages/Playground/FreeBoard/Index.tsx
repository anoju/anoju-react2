import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MessageCircle, Plus, Search } from 'lucide-react';
import { Avatar, Checkbox, DataList, FloatingActionButton, FloatingActions, Input, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { FREE_BOARD_PATH, FREE_BOARD_WRITE_PATH, LOGIN_PATH } from '@/constants/app';
import type { PostRecord } from '@/types/domain';
import { createTextFilter } from '@/utils/queryString';
import { compareByCreatedDesc, formatRelativeTime, getRecordAuthorAvatarUrl, getRecordAuthorName } from '@/utils/community';
import { useAuthStore } from '@/stores/authStore';

const PER_PAGE = 20;

const FreeBoard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authStatus = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const showMyPosts = searchParams.get('mine') === '1';

  const filter = useMemo(() => createTextFilter(keyword, ['title', 'content']), [keyword]);

  const loadPosts = useCallback(
    async (nextPage = 1) => {
      if (nextPage === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      const authorId = showMyPosts ? user?.id : undefined;

      if (showMyPosts && !authorId) {
        setPosts([]);
        setPage(1);
        setTotalPages(1);
        setLoadingInitial(false);
        setLoadingMore(false);
        return;
      }

      try {
        const result = await communityApi.listPosts({
          type: 'board',
          page: nextPage,
          perPage: PER_PAGE,
          filter,
          authorId,
        });

        const sortedItems = [...result.items].sort(compareByCreatedDesc);
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
    [filter, showMyPosts, user?.id],
  );

  useEffect(() => {
    void loadPosts(1);
  }, [loadPosts]);

  useEffect(() => {
    if (!showMyPosts || authStatus === 'initializing' || isAuthenticated) {
      return;
    }

    const redirectParams = new URLSearchParams(searchParams);
    redirectParams.set('mine', '1');
    const redirectSearch = redirectParams.toString();
    const redirect = encodeURIComponent(`${location.pathname}${redirectSearch ? `?${redirectSearch}` : ''}`);
    navigate(`${LOGIN_PATH}?redirect=${redirect}`, { replace: true });
  }, [authStatus, isAuthenticated, location.pathname, navigate, searchParams, showMyPosts]);

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadPosts(1);
  };

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      toast('글 작성은 이메일 인증을 완료한 회원만 가능합니다.', { tone: 'warning' });
    }
  };

  const handleMineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && !isAuthenticated) {
      const redirectParams = new URLSearchParams(searchParams);
      redirectParams.set('mine', '1');
      const redirect = encodeURIComponent(`${location.pathname}?${redirectParams.toString()}`);
      navigate(`${LOGIN_PATH}?redirect=${redirect}`);
      return;
    }

    const nextParams = new URLSearchParams(searchParams);

    if (event.target.checked) {
      nextParams.set('mine', '1');
    } else {
      nextParams.delete('mine');
    }

    nextParams.delete('page');
    nextParams.delete('cursor');
    setSearchParams(nextParams);
  };

  return (
    <section className="container board-page">
      <header className="board-page__header">
        <div>
          <span className="board-page__eyebrow">playground</span>
          <h2>자유게시판</h2>
          <p>편하게 쓰고 천천히 이어가는 모바일 커뮤니티 게시판입니다.</p>
        </div>
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

      <div className="content-filter">
        <Checkbox label="내 게시물 보기" checked={showMyPosts} onChange={handleMineChange} />
      </div>

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
            <span className="board-list-item__meta board-list-item__meta--author">
              <Avatar src={getRecordAuthorAvatarUrl(post)} name={getRecordAuthorName(post)} size="sm" />
              <span>
                {getRecordAuthorName(post)} · {formatRelativeTime(post.created)}
              </span>
            </span>
            <span className="board-list-item__stats">
              <MessageCircle size={14} /> 댓글 {post.commentCount ?? 0} · 조회 {post.viewCount ?? 0} · 좋아요{' '}
              {post.likeCount ?? 0} · 싫어요 {post.dislikeCount ?? 0}
            </span>
          </Link>
        )}
      />

      <FloatingActions label="자유게시판 주요 액션">
        {isAuthenticated ? (
          <FloatingActionButton label="글쓰기" to={FREE_BOARD_WRITE_PATH} icon={<Plus size={24} />} />
        ) : (
          <FloatingActionButton label="글쓰기" icon={<Plus size={24} />} onClick={handleWriteClick} />
        )}
      </FloatingActions>
    </section>
  );
};

export default FreeBoard;
