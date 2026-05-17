import type { RecordModel } from 'pocketbase';
import type {
  COMMENT_STATUSES,
  NOTICE_PLACEMENTS,
  POST_STATUSES,
  POST_TYPES,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  USER_ROLES,
  USER_STATUSES,
} from '@/constants/pocketbaseCollections';

export type UserRoleValue = (typeof USER_ROLES)[number];

export type UserStatus = (typeof USER_STATUSES)[number];

export type PostType = (typeof POST_TYPES)[number];

export type PostStatus = (typeof POST_STATUSES)[number];

export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type NoticePlacement = (typeof NOTICE_PLACEMENTS)[number];

export type AppRecord = RecordModel & {
  title?: string;
  content?: string;
  deleted?: boolean;
  deletedAt?: string;
};

export interface ListParams {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  expand?: string;
}

export type CreatePayload = Record<string, unknown> | FormData;

export type UpdatePayload = Record<string, unknown> | FormData;

export interface SearchParamsState {
  keyword: string;
  tag: string;
  sort: string;
}

export interface UserRecord extends RecordModel {
  email?: string;
  name?: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  role: UserRoleValue;
  status: UserStatus;
  verified?: boolean;
}

export interface PostRecord extends RecordModel {
  title: string;
  content: string;
  type: PostType;
  author: string;
  status: PostStatus;
  tags?: string[];
  viewCount: number;
  commentCount: number;
  likeCount: number;
  bookmarkCount: number;
  deleted: boolean;
  deletedAt?: string;
}

export interface CommentRecord extends RecordModel {
  post: string;
  author: string;
  content: string;
  parentComment?: string;
  status: CommentStatus;
  likeCount: number;
  deleted: boolean;
  deletedAt?: string;
}

export interface PostImageRecord extends RecordModel {
  post: string;
  image: string;
  alt?: string;
  sortOrder: number;
  isCover: boolean;
}

export interface ReactionRecord extends RecordModel {
  targetType: 'post' | 'comment';
  targetId: string;
  user: string;
  type: 'like';
}

export interface BookmarkRecord extends RecordModel {
  post: string;
  user: string;
}

export interface ReportRecord extends RecordModel {
  targetType: ReportTargetType;
  targetId: string;
  reporter: string;
  reason: string;
  detail?: string;
  status: ReportStatus;
}

export interface NoticeRecord extends RecordModel {
  title: string;
  content: string;
  placement: NoticePlacement;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}
