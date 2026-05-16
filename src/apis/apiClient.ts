import { pb } from '@/lib/pocketBase';
import { useAuthStore } from '@/stores/authStore';
import { toAppError } from './apiError';

export const apiClient = pb;

export const runApi = async <T>(request: () => Promise<T>): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    const appError = toAppError(error);

    if (appError.code === 'UNAUTHORIZED') {
      useAuthStore.getState().setAnonymous();
    }

    throw appError;
  }
};
