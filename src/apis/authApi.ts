import { DEFAULT_HOME_PATH } from '@/constants/app';
import { pb } from '@/lib/pocketBase';
import { useAuthStore } from '@/stores/authStore';
import { runApi } from './apiClient';

const USERS_COLLECTION = 'users';

interface LoginParams {
  identity: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
}

export const authApi = {
  login: ({ identity, password }: LoginParams) =>
    runApi(async () => {
      const result = await pb.collection(USERS_COLLECTION).authWithPassword(identity, password);
      useAuthStore.getState().initialize();
      return result;
    }),

  logout: () => {
    pb.authStore.clear();
    useAuthStore.getState().logout();
  },

  register: (params: RegisterParams) =>
    runApi(async () => {
      const user = await pb.collection(USERS_COLLECTION).create(params);
      await pb.collection(USERS_COLLECTION).requestVerification(params.email);
      return user;
    }),

  requestEmailVerification: (email: string) =>
    runApi(() => pb.collection(USERS_COLLECTION).requestVerification(email)),

  requestPasswordReset: (email: string) => runApi(() => pb.collection(USERS_COLLECTION).requestPasswordReset(email)),

  getOAuthProviders: () => runApi(() => pb.collection(USERS_COLLECTION).listAuthMethods()),

  getRedirectPath: (search: string) => {
    const params = new URLSearchParams(search);
    return params.get('redirect') || DEFAULT_HOME_PATH;
  },
};
