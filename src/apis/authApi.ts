import { DEFAULT_HOME_PATH } from '@/constants/app';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import { pb } from '@/lib/pocketBase';
import { useAuthStore } from '@/stores/authStore';
import { runApi } from './apiClient';

const USERS_COLLECTION = PB_COLLECTIONS.users;
const SUPPORTED_OAUTH_PROVIDERS = ['google', 'naver', 'kakao'] as const;

export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export interface OAuthProviderOption {
  name: SupportedOAuthProvider;
  displayName: string;
}

export interface LinkedOAuthProvider {
  id: string;
  provider: SupportedOAuthProvider;
}

interface LoginParams {
  identity: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
  turnstileToken: string;
}

interface UpdateProfileParams {
  name?: string;
}

const isSupportedOAuthProvider = (provider: string): provider is SupportedOAuthProvider =>
  SUPPORTED_OAUTH_PROVIDERS.includes(provider as SupportedOAuthProvider);

const getProviderFromRecord = (record: Record<string, unknown>) => {
  const rawProvider = record.provider ?? record.name;

  if (typeof rawProvider !== 'string' || !isSupportedOAuthProvider(rawProvider)) {
    return null;
  }

  return rawProvider;
};

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
      const { turnstileToken, ...createParams } = params;
      const user = await pb.collection(USERS_COLLECTION).create({
        ...createParams,
        turnstileToken,
      });
      await pb.collection(USERS_COLLECTION).requestVerification(params.email);
      return user;
    }),

  requestEmailVerification: (email: string) =>
    runApi(() => pb.collection(USERS_COLLECTION).requestVerification(email)),

  requestPasswordReset: (email: string) => runApi(() => pb.collection(USERS_COLLECTION).requestPasswordReset(email)),

  getOAuthProviders: () =>
    runApi(async (): Promise<OAuthProviderOption[]> => {
      const methods = await pb.collection(USERS_COLLECTION).listAuthMethods();

      if (!methods.oauth2.enabled) {
        return [];
      }

      return methods.oauth2.providers.reduce<OAuthProviderOption[]>((providers, provider) => {
        if (!isSupportedOAuthProvider(provider.name)) {
          return providers;
        }

        providers.push({
          name: provider.name,
          displayName: provider.displayName || provider.name,
        });

        return providers;
      }, []);
    }),

  loginWithOAuth: (provider: SupportedOAuthProvider) =>
    runApi(async () => {
      const result = await pb.collection(USERS_COLLECTION).authWithOAuth2({
        provider,
        createData: {
          emailVisibility: false,
        },
      });
      useAuthStore.getState().initialize();
      return result;
    }),

  listLinkedOAuthProviders: () =>
    runApi(async (): Promise<LinkedOAuthProvider[]> => {
      const userId = pb.authStore.model?.id;

      if (!userId) {
        return [];
      }

      const records = await pb.collection(USERS_COLLECTION).listExternalAuths(userId);

      return records
        .map((record) => {
          const provider = getProviderFromRecord(record as Record<string, unknown>);

          if (!provider) {
            return null;
          }

          return {
            id: record.id,
            provider,
          };
        })
        .filter((record): record is LinkedOAuthProvider => Boolean(record));
    }),

  unlinkOAuthProvider: (provider: SupportedOAuthProvider) =>
    runApi(async () => {
      const userId = pb.authStore.model?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      return pb.collection(USERS_COLLECTION).unlinkExternalAuth(userId, provider);
    }),

  updateProfile: (params: UpdateProfileParams) =>
    runApi(async () => {
      const userId = pb.authStore.model?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const result = await pb.collection(USERS_COLLECTION).update(userId, params);
      useAuthStore.getState().initialize();
      return result;
    }),

  getRedirectPath: (search: string) => {
    const params = new URLSearchParams(search);
    return params.get('redirect') || DEFAULT_HOME_PATH;
  },
};
