import type React from 'react';
import { useEffect, useRef } from 'react';
import { Button, Spinner } from '@/components/atoms';
import { usePageLoadingEffect } from '@/hooks';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';

interface DataListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T, index: number) => React.Key;
  mode?: 'infinite' | 'loadMore';
  loadingInitial?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  loadMoreLabel?: string;
  retryLabel?: string;
  onLoadMore?: () => void;
  onRetry?: () => void;
  className?: string;
}

export const DataList = <T,>({
  items,
  renderItem,
  getKey,
  mode = 'loadMore',
  loadingInitial = false,
  loadingMore = false,
  hasMore = false,
  error = null,
  emptyTitle = '표시할 내용이 없습니다.',
  emptyDescription,
  loadMoreLabel = '더보기',
  retryLabel = '다시 시도',
  onLoadMore,
  onRetry,
  className = '',
}: DataListProps<T>) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestingRef = useRef(false);
  const classNames = ['data-list', className].join(' ').trim();
  usePageLoadingEffect(loadingInitial, '목록을 불러오고 있습니다.');

  useEffect(() => {
    requestingRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    const handleFontModeChange = () => {
      sentinelRef.current?.scrollIntoView({ block: 'nearest' });
    };

    window.addEventListener('anoju:font-mode-change', handleFontModeChange);

    return () => {
      window.removeEventListener('anoju:font-mode-change', handleFontModeChange);
    };
  }, []);

  useEffect(() => {
    if (mode !== 'infinite' || !onLoadMore || !hasMore) {
      return undefined;
    }

    const target = sentinelRef.current;

    if (!target) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || requestingRef.current) {
          return;
        }

        requestingRef.current = true;
        onLoadMore();
      },
      { rootMargin: '160px 0px' },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, mode, onLoadMore]);

  if (loadingInitial) {
    return null;
  }

  if (error && items.length === 0) {
    return <ErrorState description={error} retryLabel={retryLabel} onRetry={onRetry} />;
  }

  if (!loadingInitial && items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const handleLoadMore = () => {
    if (requestingRef.current || !onLoadMore) {
      return;
    }

    requestingRef.current = true;
    onLoadMore();
  };

  return (
    <div className={classNames}>
      <div className="data-list__items">
        {items.map((item, index) => (
          <div className="data-list__item" key={getKey(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {error ? <ErrorState description={error} retryLabel={retryLabel} onRetry={onRetry} /> : null}

      <div className="data-list__footer">
        {mode === 'loadMore' && hasMore ? (
          <Button type="button" variant="outline" fullWidth loading={loadingMore} onClick={handleLoadMore}>
            {loadMoreLabel}
          </Button>
        ) : null}
        {mode === 'infinite' ? <div ref={sentinelRef} className="data-list__sentinel" aria-hidden="true" /> : null}
        {loadingMore && mode === 'infinite' ? (
          <div className="data-list__loading-more" role="status" aria-live="polite">
            <Spinner size="sm" label="다음 목록을 불러오고 있습니다." />
            <span>다음 목록을 불러오고 있습니다.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
