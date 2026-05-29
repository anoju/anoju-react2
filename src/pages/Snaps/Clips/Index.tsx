import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Plus, Search } from 'lucide-react';
import {
  Avatar,
  Checkbox,
  DataList,
  FloatingActionButton,
  FloatingActions,
  Img,
  Input,
  toast,
} from '@/components';
import { clipApi, getClipPosterUrl, getUserMessage } from '@/apis';
import { CLIPS_PATH, CLIPS_WRITE_PATH, LOGIN_PATH } from '@/constants/app';
import type { ClipRecord } from '@/types/domain';
import { formatRelativeTime, getRecordAuthorAvatarUrl, getRecordAuthorName } from '@/utils/community';
import { createTextFilter } from '@/utils/queryString';
import { useAuthStore } from '@/stores/authStore';

const PER_PAGE = 12;

const Clips = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clips, setClips] = useState<ClipRecord[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authStatus = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const showMyClips = searchParams.get('mine') === '1';
  const filter = useMemo(() => createTextFilter(keyword, ['title', 'description']), [keyword]);

  const loadClips = useCallback(
    async (nextPage = 1) => {
      if (nextPage === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      const authorId = showMyClips ? user?.id : undefined;

      if (showMyClips && !authorId) {
        setClips([]);
        setPage(1);
        setTotalPages(1);
        setLoadingInitial(false);
        setLoadingMore(false);
        return;
      }

      try {
        const result = await clipApi.listClips({
          page: nextPage,
          perPage: PER_PAGE,
          filter,
          authorId,
        });

        setClips((currentClips) => (nextPage === 1 ? result.items : [...currentClips, ...result.items]));
        setPage(result.page);
        setTotalPages(result.totalPages);
      } catch (loadError) {
        setError(getUserMessage(loadError));
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [filter, showMyClips, user?.id],
  );

  useEffect(() => {
    void loadClips(1);
  }, [loadClips]);

  useEffect(() => {
    if (!showMyClips || authStatus === 'initializing' || isAuthenticated) {
      return;
    }

    const redirectParams = new URLSearchParams(searchParams);
    redirectParams.set('mine', '1');
    const redirectSearch = redirectParams.toString();
    const redirect = encodeURIComponent(`${location.pathname}${redirectSearch ? `?${redirectSearch}` : ''}`);
    navigate(`${LOGIN_PATH}?redirect=${redirect}`, { replace: true });
  }, [authStatus, isAuthenticated, location.pathname, navigate, searchParams, showMyClips]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadClips(1);
  };

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      toast('Clips 작성은 이메일 인증을 완료한 회원만 가능합니다.', { tone: 'warning' });
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
    <section className="container clips-page">
      <header className="clips-page__header">
        <span className="board-page__eyebrow">Snaps</span>
        <h2>Clips</h2>
        <p>짧게 훑고, 마음에 드는 영상은 집중해서 보는 동영상 게시판입니다.</p>
      </header>

      <form className="clips-page__search" onSubmit={handleSearchSubmit}>
        <Input
          label="검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="제목이나 설명 검색"
          leftIcon={<Search size={16} />}
        />
      </form>

      <div className="content-filter">
        <Checkbox label="내 Clips 보기" checked={showMyClips} onChange={handleMineChange} />
      </div>

      <DataList
        items={clips}
        getKey={(clip) => clip.id}
        mode="loadMore"
        loadingInitial={loadingInitial}
        loadingMore={loadingMore}
        hasMore={page < totalPages}
        error={error}
        emptyTitle="아직 Clips가 없습니다."
        emptyDescription="첫 동영상을 올려보세요."
        onLoadMore={() => void loadClips(page + 1)}
        onRetry={() => void loadClips(1)}
        className="clips-list"
        renderItem={(clip) => {
          const posterUrl = getClipPosterUrl(clip);

          return (
            <Link className="clip-list-item" to={`${CLIPS_PATH}/${clip.id}`}>
              <span className="clip-list-item__thumbnail">
                {posterUrl ? <Img src={posterUrl} alt="" loading="lazy" /> : null}
                <span className="clip-list-item__play" aria-hidden="true">
                  <Play size={22} fill="currentColor" />
                </span>
              </span>

              <span className="clip-list-item__body">
                <span className="clip-list-item__title">{clip.title}</span>
                <span className="clip-list-item__channel">
                  <Avatar src={getRecordAuthorAvatarUrl(clip)} name={getRecordAuthorName(clip)} size="sm" />
                  <span>{getRecordAuthorName(clip)}</span>
                </span>
                <span className="clip-list-item__meta">
                  조회 {clip.viewCount ?? 0}회 · {formatRelativeTime(clip.created)}
                </span>
                <span className="clip-list-item__description">{clip.description}</span>
              </span>
            </Link>
          );
        }}
      />

      <FloatingActions label="Clips 주요 액션">
        {isAuthenticated ? (
          <FloatingActionButton label="Clips 올리기" to={CLIPS_WRITE_PATH} icon={<Plus size={24} />} />
        ) : (
          <FloatingActionButton label="Clips 올리기" icon={<Plus size={24} />} onClick={handleWriteClick} />
        )}
      </FloatingActions>
    </section>
  );
};

export default Clips;
