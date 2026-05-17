import { BaseAuthStore } from 'pocketbase';
import type { AuthRecord } from 'pocketbase';

type AuthPersistenceMode = 'session' | 'local';

interface StoredAuthData {
  token?: string;
  record?: AuthRecord | null;
  model?: AuthRecord | null;
}

const AUTH_STORAGE_KEY = 'pocketbase_auth';
const AUTH_PERSISTENCE_KEY = 'anoju_auth_persistence';

const canUseStorage = (storage?: Storage): storage is Storage => Boolean(storage);

const readStorageData = (storage: Storage | undefined): StoredAuthData | null => {
  if (!canUseStorage(storage)) {
    return null;
  }

  const rawValue = storage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return null;
    }

    return parsedValue as StoredAuthData;
  } catch {
    return null;
  }
};

const writeStorageData = (storage: Storage | undefined, data: StoredAuthData) => {
  if (!canUseStorage(storage)) {
    return;
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
};

const removeStorageData = (storage: Storage | undefined) => {
  if (!canUseStorage(storage)) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEY);
};

const getLocalStorage = () => (typeof window === 'undefined' ? undefined : window.localStorage);
const getSessionStorage = () => (typeof window === 'undefined' ? undefined : window.sessionStorage);

class AnojuAuthStore extends BaseAuthStore {
  private mode: AuthPersistenceMode = 'session';

  constructor() {
    super();
    this.restore();
  }

  setPersistenceMode(mode: AuthPersistenceMode) {
    this.mode = mode;

    const localStorage = getLocalStorage();

    if (canUseStorage(localStorage)) {
      localStorage.setItem(AUTH_PERSISTENCE_KEY, mode);
    }
  }

  getPersistenceMode() {
    return this.mode;
  }

  save(token: string, record?: AuthRecord | null) {
    const data = { token, record: record ?? null };

    if (this.mode === 'local') {
      writeStorageData(getLocalStorage(), data);
      removeStorageData(getSessionStorage());
    } else {
      writeStorageData(getSessionStorage(), data);
      removeStorageData(getLocalStorage());
    }

    super.save(token, record);
  }

  clear() {
    removeStorageData(getLocalStorage());
    removeStorageData(getSessionStorage());
    getLocalStorage()?.removeItem(AUTH_PERSISTENCE_KEY);
    super.clear();
  }

  private restore() {
    const localStorage = getLocalStorage();
    const sessionStorage = getSessionStorage();
    const savedMode = localStorage?.getItem(AUTH_PERSISTENCE_KEY);
    const localData = readStorageData(localStorage);
    const sessionData = readStorageData(sessionStorage);

    if (savedMode === 'local' && localData?.token) {
      this.mode = 'local';
      super.save(localData.token, localData.record ?? localData.model ?? null);
      return;
    }

    if (sessionData?.token) {
      this.mode = 'session';
      super.save(sessionData.token, sessionData.record ?? sessionData.model ?? null);
      return;
    }

    if (localData?.token) {
      this.mode = 'local';
      localStorage?.setItem(AUTH_PERSISTENCE_KEY, 'local');
      super.save(localData.token, localData.record ?? localData.model ?? null);
    }
  }
}

export const authPersistenceStore = new AnojuAuthStore();

export const setAutoLoginEnabled = (enabled: boolean) => {
  authPersistenceStore.setPersistenceMode(enabled ? 'local' : 'session');
};

export const isAutoLoginEnabled = () => authPersistenceStore.getPersistenceMode() === 'local';
