import type { SearchParamsState } from '@/types/domain';

export const DEFAULT_SORT = '-created';

export const parseSearchParams = (searchParams: URLSearchParams): SearchParamsState => ({
  keyword: searchParams.get('keyword') ?? '',
  tag: searchParams.get('tag') ?? '',
  sort: searchParams.get('sort') ?? DEFAULT_SORT,
});

export const mergeSearchParams = (
  current: URLSearchParams,
  next: Partial<SearchParamsState>,
  resetCursor = true,
) => {
  const params = new URLSearchParams(current);

  Object.entries(next).forEach(([key, value]) => {
    if (!value) {
      params.delete(key);
      return;
    }

    params.set(key, value);
  });

  if (resetCursor) {
    params.delete('page');
    params.delete('cursor');
  }

  return params;
};

export const createTextFilter = (keyword: string, fields: string[]) => {
  const trimmedKeyword = keyword.trim().replaceAll('"', '\\"');

  if (!trimmedKeyword) {
    return '';
  }

  return fields.map((field) => `${field} ~ "${trimmedKeyword}"`).join(' || ');
};
