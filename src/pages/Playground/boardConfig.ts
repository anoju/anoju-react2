import {
  FREE_BOARD_PATH,
  FREE_BOARD_WRITE_PATH,
  DEV_LOG_PATH,
  DEV_LOG_WRITE_PATH,
} from '@/constants/app';
import type { UserRole } from '@/types/common';
import type { PostType } from '@/types/domain';

interface BoardPermissionUser {
  id?: string;
  role?: UserRole;
}

export interface PlaygroundBoardConfig {
  type: Extract<PostType, 'board' | 'it_logs'>;
  title: string;
  eyebrow: string;
  description: string;
  listPath: string;
  writePath: string;
  getDetailPath: (postId: string) => string;
  getEditPath: (postId: string) => string;
  emptyTitle: string;
  emptyDescription: string;
  floatingActionLabel: string;
  writeDeniedMessage: string;
  adminOnlyWrite: boolean;
}

export const FREE_BOARD_CONFIG: PlaygroundBoardConfig = {
  type: 'board',
  title: '자유게시판',
  eyebrow: 'playground',
  description: '편하게 쓰고 천천히 이어가는 모바일 커뮤니티 게시판입니다.',
  listPath: FREE_BOARD_PATH,
  writePath: FREE_BOARD_WRITE_PATH,
  getDetailPath: (postId) => `${FREE_BOARD_PATH}/${postId}`,
  getEditPath: (postId) => `${FREE_BOARD_PATH}/${postId}/edit`,
  emptyTitle: '아직 게시글이 없습니다.',
  emptyDescription: '첫 이야기를 남겨보세요.',
  floatingActionLabel: '자유게시판 주요 액션',
  writeDeniedMessage: '글 작성은 이메일 인증을 완료한 회원만 가능합니다.',
  adminOnlyWrite: false,
};

export const DEV_LOG_CONFIG: PlaygroundBoardConfig = {
  type: 'it_logs',
  title: 'DevLog',
  eyebrow: 'playground',
  description: '관리자가 IT 기록과 안내를 정리하는 게시판입니다.',
  listPath: DEV_LOG_PATH,
  writePath: DEV_LOG_WRITE_PATH,
  getDetailPath: (postId) => `${DEV_LOG_PATH}/${postId}`,
  getEditPath: (postId) => `${DEV_LOG_PATH}/${postId}/edit`,
  emptyTitle: '아직 DevLog 게시글이 없습니다.',
  emptyDescription: '관리자 작성 글이 등록되면 이곳에 표시됩니다.',
  floatingActionLabel: 'DevLog 주요 액션',
  writeDeniedMessage: 'DevLog 작성은 관리자만 가능합니다.',
  adminOnlyWrite: true,
};

export const canWriteBoardContent = (config: PlaygroundBoardConfig, user?: BoardPermissionUser | null) => {
  if (config.adminOnlyWrite) {
    return user?.role === 'admin';
  }

  return Boolean(user?.id);
};
