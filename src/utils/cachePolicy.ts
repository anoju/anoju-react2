import type { QueryClient, QueryKey } from '@tanstack/react-query';

interface OptimisticUpdateOptions<T> {
  queryClient: QueryClient;
  queryKey: QueryKey;
  updater: (current: T | undefined) => T | undefined;
  action: () => Promise<unknown>;
}

export const invalidateListAndDetail = (queryClient: QueryClient, listKey: QueryKey, detailKey?: QueryKey) => {
  queryClient.invalidateQueries({ queryKey: listKey });

  if (detailKey) {
    queryClient.invalidateQueries({ queryKey: detailKey });
  }
};

export const runOptimisticUpdate = async <T>({
  queryClient,
  queryKey,
  updater,
  action,
}: OptimisticUpdateOptions<T>) => {
  await queryClient.cancelQueries({ queryKey });
  const previous = queryClient.getQueryData<T>(queryKey);
  queryClient.setQueryData<T | undefined>(queryKey, updater);

  try {
    await action();
  } catch (error) {
    queryClient.setQueryData(queryKey, previous);
    throw error;
  } finally {
    queryClient.invalidateQueries({ queryKey });
  }
};
