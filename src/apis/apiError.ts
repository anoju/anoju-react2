import { ClientResponseError } from 'pocketbase';

export type AppErrorCode =
  | 'UNKNOWN'
  | 'NETWORK'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'SERVER';

export class AppError extends Error {
  code: AppErrorCode;
  status?: number;

  constructor(message: string, code: AppErrorCode = 'UNKNOWN', status?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

const getErrorCode = (status?: number): AppErrorCode => {
  if (status === 0) return 'NETWORK';
  if (status === 400) return 'VALIDATION';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status && status >= 500) return 'SERVER';
  return 'UNKNOWN';
};

export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ClientResponseError) {
    return new AppError(
      error.message || '요청을 처리하지 못했습니다.',
      getErrorCode(error.status),
      error.status,
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message || '알 수 없는 오류가 발생했습니다.');
  }

  return new AppError('알 수 없는 오류가 발생했습니다.');
};

export const getUserMessage = (error: unknown): string => {
  const appError = toAppError(error);

  switch (appError.code) {
    case 'NETWORK':
      return '네트워크 연결을 확인해주세요.';
    case 'UNAUTHORIZED':
      return '로그인이 필요합니다.';
    case 'FORBIDDEN':
      return '접근 권한이 없습니다.';
    case 'NOT_FOUND':
      return '요청한 정보를 찾을 수 없습니다.';
    case 'VALIDATION':
      return '입력한 정보를 다시 확인해주세요.';
    case 'SERVER':
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    default:
      return appError.message || '알 수 없는 오류가 발생했습니다.';
  }
};
