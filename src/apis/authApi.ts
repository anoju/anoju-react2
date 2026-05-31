import { DEFAULT_HOME_PATH } from '@/constants/app';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import { setAutoLoginEnabled } from '@/lib/authPersistence';
import { pb } from '@/lib/pocketBase';
import { useAuthStore } from '@/stores/authStore';
import type { UserRecord } from '@/types/domain';
import { createTemporaryNickname, normalizeNickname } from '@/utils/nickname';
import { runApi } from './apiClient';

const USERS_COLLECTION = PB_COLLECTIONS.users;
const DEFAULT_USER_ROLE = 'user';
const DEFAULT_USER_STATUS = 'active';
const SUPPORTED_OAUTH_PROVIDERS = ['google', 'naver', 'kakao'] as const;
const PB_PROVIDER_BY_OAUTH_PROVIDER: Record<SupportedOAuthProvider, string> = {
  google: 'google',
  naver: 'oidc',
  kakao: 'kakao',
};
const OAUTH_PROVIDER_BY_PB_PROVIDER: Record<string, SupportedOAuthProvider> = {
  google: 'google',
  oidc: 'naver',
  kakao: 'kakao',
};

export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export interface OAuthProviderOption {
  name: SupportedOAuthProvider;
  providerName: string;
  displayName: string;
}

export interface LinkedOAuthProvider {
  id: string;
  provider: SupportedOAuthProvider;
}

interface LoginParams {
  identity: string;
  password: string;
  autoLogin: boolean;
  turnstileToken: string;
}

interface RegisterParams {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  turnstileToken: string;
}

interface UpdateProfileParams {
  nickname?: string;
  avatarFile?: File;
  removeAvatar?: boolean;
}

interface RequestEmailChangeParams {
  email: string;
}

const isSupportedOAuthProvider = (provider: string): provider is SupportedOAuthProvider =>
  SUPPORTED_OAUTH_PROVIDERS.includes(provider as SupportedOAuthProvider);

const getProviderFromRecord = (record: Record<string, unknown>) => {
  const rawProvider = record.provider ?? record.name;

  if (typeof rawProvider !== 'string') {
    return null;
  }

  return OAUTH_PROVIDER_BY_PB_PROVIDER[rawProvider] ?? (isSupportedOAuthProvider(rawProvider) ? rawProvider : null);
};

const escapeFilterValue = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const authApi = {
  login: ({ identity, password, autoLogin, turnstileToken }: LoginParams) =>
    runApi(async () => {
      setAutoLoginEnabled(autoLogin);
      const result = await pb.collection(USERS_COLLECTION).authWithPassword(identity, password, {
        body: {
          identity,
          password,
          turnstileToken,
        },
      });
      await useAuthStore.getState().initialize();
      const authStatus = useAuthStore.getState().status;

      if (authStatus === 'suspended' || authStatus === 'withdrawn') {
        pb.authStore.clear();
        useAuthStore.getState().logout();
        throw new Error(authStatus === 'suspended' ? '정지된 계정입니다.' : '탈퇴한 계정입니다.');
      }

      return result;
    }),

  logout: () => {
    pb.authStore.clear();
    useAuthStore.getState().logout();
  },

  withdrawAccount: () =>
    runApi(async () => {
      const userId = pb.authStore.model?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const result = await pb.collection(USERS_COLLECTION).update<UserRecord>(userId, {
        status: 'withdrawn',
      });
      pb.authStore.clear();
      useAuthStore.getState().logout();
      return result;
    }),

  register: (params: RegisterParams) =>
    runApi(async () => {
      const { turnstileToken, ...createParams } = params;
      const nickname = normalizeNickname(createParams.nickname);
      const user = await pb.collection(USERS_COLLECTION).create({
        ...createParams,
        nickname,
        role: DEFAULT_USER_ROLE,
        status: DEFAULT_USER_STATUS,
        turnstileToken,
      });
      await pb.collection(USERS_COLLECTION).requestVerification(params.email);
      return user;
    }),

  isNicknameAvailable: (nickname: string, excludeUserId?: string) =>
    runApi(async () => {
      const normalizedNickname = normalizeNickname(nickname);

      if (!normalizedNickname) {
        return false;
      }

      try {
        const existingUser = await pb
          .collection(USERS_COLLECTION)
          .getFirstListItem<UserRecord>(`nickname = "${escapeFilterValue(normalizedNickname)}"`, {
            $autoCancel: false,
          });

        return existingUser.id === excludeUserId;
      } catch (error) {
        if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
          return true;
        }

        throw error;
      }
    }),

  requestEmailVerification: (email: string) =>
    runApi(() => pb.collection(USERS_COLLECTION).requestVerification(email)),

  requestPasswordReset: (email: string) => runApi(() => pb.collection(USERS_COLLECTION).requestPasswordReset(email)),

  requestEmailChange: ({ email }: RequestEmailChangeParams) =>
    runApi(() => pb.collection(USERS_COLLECTION).requestEmailChange(email)),

  getOAuthProviders: () =>
    runApi(async (): Promise<OAuthProviderOption[]> => {
      const methods = await pb.collection(USERS_COLLECTION).listAuthMethods();

      if (!methods.oauth2.enabled) {
        return [];
      }

      return methods.oauth2.providers.reduce<OAuthProviderOption[]>((providers, provider) => {
        const providerName = OAUTH_PROVIDER_BY_PB_PROVIDER[provider.name];

        if (!providerName || !isSupportedOAuthProvider(providerName)) {
          return providers;
        }

        providers.push({
          name: providerName,
          providerName: provider.name,
          displayName: provider.displayName || providerName,
        });

        return providers;
      }, []);
    }),

  loginWithOAuth: (provider: SupportedOAuthProvider, autoLogin?: boolean) =>
    runApi(async () => {
      if (typeof autoLogin === 'boolean') {
        setAutoLoginEnabled(autoLogin);
      }

      const result = await pb.collection(USERS_COLLECTION).authWithOAuth2({
        provider: PB_PROVIDER_BY_OAUTH_PROVIDER[provider],
        createData: {
          emailVisibility: false,
          nickname: createTemporaryNickname(),
          role: DEFAULT_USER_ROLE,
          status: DEFAULT_USER_STATUS,
        },
      });
      await useAuthStore.getState().initialize();
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

      return pb.collection(USERS_COLLECTION).unlinkExternalAuth(userId, PB_PROVIDER_BY_OAUTH_PROVIDER[provider]);
    }),

  updateProfile: ({ nickname, avatarFile, removeAvatar }: UpdateProfileParams) =>
    runApi(async () => {
      const userId = pb.authStore.model?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      let payload: FormData | Record<string, unknown>;

      if (avatarFile) {
        const formData = new FormData();

        if (nickname !== undefined) {
          formData.append('nickname', normalizeNickname(nickname));
        }

        formData.append('avatar', avatarFile);
        payload = formData;
      } else {
        payload = {
          ...(nickname !== undefined ? { nickname: normalizeNickname(nickname) } : {}),
          ...(removeAvatar ? { avatar: null } : {}),
        };
      }

      const result = await pb.collection(USERS_COLLECTION).update(userId, payload);
      await useAuthStore.getState().initialize();
      return result;
    }),

  getRedirectPath: (search: string) => {
    const params = new URLSearchParams(search);
    return params.get('redirect') || DEFAULT_HOME_PATH;
  },
};
