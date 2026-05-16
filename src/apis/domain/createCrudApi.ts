import { pb } from '@/lib/pocketBase';
import type { AppRecord, CreatePayload, ListParams, UpdatePayload } from '@/types/domain';
import { runApi } from '../apiClient';

export const createCrudApi = (collectionName: string) => ({
  list: (params: ListParams = {}) =>
    runApi(() =>
      pb.collection(collectionName).getList<AppRecord>(params.page ?? 1, params.perPage ?? 20, {
        filter: params.filter,
        sort: params.sort,
        expand: params.expand,
      }),
    ),

  detail: (id: string, expand?: string) =>
    runApi(() =>
      pb.collection(collectionName).getOne<AppRecord>(id, {
        expand,
      }),
    ),

  create: (payload: CreatePayload) => runApi(() => pb.collection(collectionName).create<AppRecord>(payload)),

  update: (id: string, payload: UpdatePayload) =>
    runApi(() => pb.collection(collectionName).update<AppRecord>(id, payload)),

  delete: (id: string) => runApi(() => pb.collection(collectionName).delete(id)),

  softDelete: (id: string) =>
    runApi(() =>
      pb.collection(collectionName).update<AppRecord>(id, {
        deleted: true,
        deletedAt: new Date().toISOString(),
      }),
    ),
});
