import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from 'ahooks';
import type { SearchParamsState } from '@/types/domain';
import { mergeSearchParams, parseSearchParams } from '@/utils/queryString';

export const useSyncedSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const debouncedKeyword = useDebounce(state.keyword, { wait: 300 });

  const updateSearchParams = (next: Partial<SearchParamsState>) => {
    setSearchParams(mergeSearchParams(searchParams, next));
  };

  const resetListParams = () => {
    setSearchParams(mergeSearchParams(searchParams, {}, true));
  };

  return {
    ...state,
    debouncedKeyword,
    setKeyword: (keyword: string) => updateSearchParams({ keyword }),
    setTag: (tag: string) => updateSearchParams({ tag }),
    setSort: (sort: string) => updateSearchParams({ sort }),
    resetListParams,
  };
};
