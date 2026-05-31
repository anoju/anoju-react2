import { create } from 'zustand';
import type { AuthRecord } from 'pocketbase';
import { pb } from '@/lib/pocketBase';
import type { AuthStatus, UserRole } from '@/types/common';
import { isVirtualOAuthEmail } from '@/utils/oauthEmail';

const USERS_COLLECTION = 'users';

interface AuthUser {
  id: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  avatarUrl?: string;
  role: UserRole;
  verified?: boolean;
  isVirtualEmail: boolean;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  setAnonymous: () => void;
  logout: () => void;
}

let unsubscribeAuthStore: (() => void) | null = null;
let initializeVersion = 0;

const syncCurrentUserRecord = async () => {
  const model = pb.authStore.model;
  const token = pb.authStore.token;

  if (!pb.authStore.isValid || !model?.id || !token) {
    return;
  }

  const user = await pb.collection(USERS_COLLECTION).getOne<AuthRecord>(model.id, { $autoCancel: false });
  pb.authStore.save(token, user);
};

const getUserFromStore = (): AuthUser | null => {
  const model = pb.authStore.model;

  if (!model?.id) {
    return null;
  }

  const role = typeof model.role === 'string' ? (model.role as UserRole) : 'guest';

  return {
    id: model.id,
    email: typeof model.email === 'string' ? model.email : undefined,
    nickname: typeof model.nickname === 'string' ? model.nickname : undefined,
    avatar: typeof model.avatar === 'string' ? model.avatar : undefined,
    avatarUrl: typeof model.avatar === 'string' && model.avatar ? pb.files.getURL(model, model.avatar) : undefined,
    role,
    verified: typeof model.verified === 'boolean' ? model.verified : undefined,
    isVirtualEmail: isVirtualOAuthEmail(typeof model.email === 'string' ? model.email : undefined),
  };
};

const getStatusFromStore = (): AuthStatus => {
  if (!pb.authStore.isValid) {
    return 'anonymous';
  }

  const model = pb.authStore.model;

  if (model?.status === 'suspended') return 'suspended';
  if (model?.status === 'withdrawn') return 'withdrawn';
  if (model?.verified === false) return 'emailUnverified';

  return 'authenticated';
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'initializing',
  user: null,
  isAuthenticated: false,
  initialize: async () => {
    const currentVersion = initializeVersion + 1;
    initializeVersion = currentVersion;

    if (unsubscribeAuthStore) {
      unsubscribeAuthStore();
      unsubscribeAuthStore = null;
    }

    set({ status: 'initializing' });

    if (pb.authStore.isValid) {
      try {
        await pb.collection(USERS_COLLECTION).authRefresh();
        await syncCurrentUserRecord();
      } catch {
        pb.authStore.clear();
      }
    }

    if (currentVersion !== initializeVersion) {
      return;
    }

    const status = getStatusFromStore();
    const user = getUserFromStore();
    set({ status, user, isAuthenticated: status === 'authenticated' });

    unsubscribeAuthStore = pb.authStore.onChange(() => {
      if (currentVersion !== initializeVersion) {
        return;
      }

      const nextStatus = getStatusFromStore();
      const nextUser = getUserFromStore();
      set({
        status: nextStatus,
        user: nextUser,
        isAuthenticated: nextStatus === 'authenticated',
      });
    });
  },
  setAnonymous: () => set({ status: 'anonymous', user: null, isAuthenticated: false }),
  logout: () => {
    pb.authStore.clear();
    set({ status: 'anonymous', user: null, isAuthenticated: false });
  },
}));
