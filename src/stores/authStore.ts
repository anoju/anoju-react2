import { create } from 'zustand';
import { pb } from '@/lib/pocketBase';
import type { AuthStatus, UserRole } from '@/types/common';
import { isVirtualOAuthEmail } from '@/utils/oauthEmail';

const USERS_COLLECTION = 'users';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
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

const getUserFromStore = (): AuthUser | null => {
  const model = pb.authStore.model;

  if (!model?.id) {
    return null;
  }

  const role = typeof model.role === 'string' ? (model.role as UserRole) : 'user';

  return {
    id: model.id,
    email: typeof model.email === 'string' ? model.email : undefined,
    name: typeof model.name === 'string' ? model.name : undefined,
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
    if (unsubscribeAuthStore) {
      unsubscribeAuthStore();
      unsubscribeAuthStore = null;
    }

    set({ status: 'initializing' });

    if (pb.authStore.isValid) {
      try {
        await pb.collection(USERS_COLLECTION).authRefresh();
      } catch {
        pb.authStore.clear();
      }
    }

    const status = getStatusFromStore();
    const user = getUserFromStore();
    set({ status, user, isAuthenticated: status === 'authenticated' });

    unsubscribeAuthStore = pb.authStore.onChange(() => {
      const nextStatus = getStatusFromStore();
      const nextUser = getUserFromStore();
      set({
        status: nextStatus,
        user: nextUser,
        isAuthenticated: nextStatus === 'authenticated',
      });
    }, true);
  },
  setAnonymous: () => set({ status: 'anonymous', user: null, isAuthenticated: false }),
  logout: () => {
    pb.authStore.clear();
    set({ status: 'anonymous', user: null, isAuthenticated: false });
  },
}));
