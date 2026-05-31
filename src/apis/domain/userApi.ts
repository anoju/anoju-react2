import { pb } from '@/lib/pocketBase';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import type { UserRecord, UserStatus } from '@/types/domain';
import { runApi } from '../apiClient';
import { createCrudApi } from './createCrudApi';

const userCrudApi = createCrudApi(PB_COLLECTIONS.users);

export const userApi = {
  ...userCrudApi,

  listMembers: ({ page = 1, perPage = 20, status, keyword }: { page?: number; perPage?: number; status?: string; keyword?: string } = {}) => {
    const filters = [
      status ? `status="${status}"` : '',
      keyword ? `(nickname~"${keyword}" || email~"${keyword}")` : '',
    ].filter(Boolean);

    return runApi(() =>
      pb.collection(PB_COLLECTIONS.users).getList<UserRecord>(page, perPage, {
        $autoCancel: false,
        filter: filters.join(' && ') || undefined,
        sort: '-created',
      }),
    );
  },

  getMember: (userId: string) => runApi(() => pb.collection(PB_COLLECTIONS.users).getOne<UserRecord>(userId, { $autoCancel: false })),

  updateMemberStatus: (
    userId: string,
    payload: {
      status: UserStatus;
      suspendedReason?: string;
      suspendedUntil?: string;
      suspendedBy?: string;
      adminMemo?: string;
    },
  ) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.users).update<UserRecord>(userId, {
        ...payload,
        suspendedAt: payload.status === 'suspended' ? new Date().toISOString() : '',
        suspendedUntil: payload.status === 'suspended' ? payload.suspendedUntil : '',
        suspendedReason: payload.status === 'suspended' ? payload.suspendedReason : '',
      }, { $autoCancel: false }),
    ),
};
