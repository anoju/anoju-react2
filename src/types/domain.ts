import type { RecordModel } from 'pocketbase';
import type {
  COMMENT_STATUSES,
  CONTENT_DELETE_PERMISSIONS,
  CONTENT_EDIT_PERMISSIONS,
  CONTENT_SETTING_GROUPS,
  CONTENT_SETTING_KEYS,
  CONTENT_SETTING_STATUSES,
  CONTENT_SETTING_TYPES,
  CONTENT_VIEW_PERMISSIONS,
  CONTENT_WRITE_PERMISSIONS,
  NOTICE_PLACEMENTS,
  NOTIFICATION_TYPES,
  POST_STATUSES,
  POST_TYPES,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  REPORT_REASONS,
  USER_ROLES,
  USER_STATUSES,
  DEVICE_ORIENTATIONS,
  DEVICE_REPORT_STATUSES,
  PIC_LOG_ORDER_REQUEST_STATUSES,
  PIC_LOG_STATUSES,
  PIC_LOG_VISIBILITIES,
} from '@/constants/pocketbaseCollections';

export type UserRoleValue = (typeof USER_ROLES)[number];

export type UserStatus = (typeof USER_STATUSES)[number];

export type PostType = (typeof POST_TYPES)[number];

export type PostStatus = (typeof POST_STATUSES)[number];

export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type ReportReason = (typeof REPORT_REASONS)[number];

export type ContentSettingKey = (typeof CONTENT_SETTING_KEYS)[number];

export type ContentSettingType = (typeof CONTENT_SETTING_TYPES)[number];

export type ContentSettingGroup = (typeof CONTENT_SETTING_GROUPS)[number];

export type ContentWritePermission = (typeof CONTENT_WRITE_PERMISSIONS)[number];

export type ContentEditPermission = (typeof CONTENT_EDIT_PERMISSIONS)[number];

export type ContentDeletePermission = (typeof CONTENT_DELETE_PERMISSIONS)[number];

export type ContentViewPermission = (typeof CONTENT_VIEW_PERMISSIONS)[number];

export type ContentSettingStatus = (typeof CONTENT_SETTING_STATUSES)[number];

export type NoticePlacement = (typeof NOTICE_PLACEMENTS)[number];

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type DeviceReportStatus = (typeof DEVICE_REPORT_STATUSES)[number];

export type DeviceOrientation = (typeof DEVICE_ORIENTATIONS)[number];

export type PicLogVisibility = (typeof PIC_LOG_VISIBILITIES)[number];

export type PicLogStatus = (typeof PIC_LOG_STATUSES)[number];

export type PicLogOrderRequestStatus = (typeof PIC_LOG_ORDER_REQUEST_STATUSES)[number];

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
  nickname?: string;
  avatar?: string;
  bio?: string;
  role: UserRoleValue;
  status: UserStatus;
  verified?: boolean;
  suspendedAt?: string;
  suspendedUntil?: string;
  suspendedReason?: string;
  suspendedBy?: string;
  adminMemo?: string;
  warningCount?: number;
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
  dislikeCount?: number;
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
  dislikeCount?: number;
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
  targetType: 'post' | 'comment' | 'clip' | 'clip_comment';
  targetId: string;
  user: string;
  type: 'like' | 'dislike';
}

export interface BookmarkRecord extends RecordModel {
  post: string;
  user: string;
}

export interface ReportRecord extends RecordModel {
  targetType: ReportTargetType;
  targetId: string;
  reporter: string;
  reason: ReportReason;
  detail?: string;
  status: ReportStatus;
  handledBy?: string;
  handledAt?: string;
  resolution?: string;
  adminMemo?: string;
  expand?: {
    reporter?: UserRecord;
    handledBy?: UserRecord;
  };
}

export interface ContentSettingRecord extends RecordModel {
  contentKey: ContentSettingKey | string;
  label: string;
  group: ContentSettingGroup | string;
  contentType: ContentSettingType;
  listPath: string;
  writePermission: ContentWritePermission;
  editPermission: ContentEditPermission;
  deletePermission: ContentDeletePermission;
  viewPermission: ContentViewPermission;
  showComments: boolean;
  allowComments: boolean;
  showReactions: boolean;
  allowReactions: boolean;
  showShare: boolean;
  showReport: boolean;
  showInList: boolean;
  status: ContentSettingStatus;
}

export interface NoticeRecord extends RecordModel {
  title: string;
  content: string;
  placement: NoticePlacement;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface NotificationRecord extends RecordModel {
  recipient: string;
  actor?: string;
  type: NotificationType;
  title: string;
  message: string;
  targetUrl: string;
  targetType: 'post' | 'comment' | 'picLog' | 'picLogOrderRequest' | 'system';
  targetId?: string;
  isRead: boolean;
  readAt?: string;
  hidden?: boolean;
}

export interface DeviceReportRecord extends RecordModel {
  manufacturer: string;
  model: string;
  screenWidth: number;
  screenHeight: number;
  windowWidthMin: number;
  windowWidthMax: number;
  windowHeightMin: number;
  windowHeightMax: number;
  devicePixelRatio: number;
  orientation: DeviceOrientation;
  userAgent: string;
  displaySetting: number;
  description?: string;
  author: string;
  status: DeviceReportStatus;
  deleted: boolean;
  deletedAt?: string;
}

export interface ClipRecord extends RecordModel {
  title: string;
  description: string;
  video: string;
  poster?: string;
  author: string;
  status: PostStatus;
  tags?: string[];
  viewCount: number;
  likeCount: number;
  dislikeCount?: number;
  deleted: boolean;
  deletedAt?: string;
}

export interface ClipCommentRecord extends RecordModel {
  clip: string;
  author: string;
  content: string;
  parentComment?: string;
  status: CommentStatus;
  likeCount: number;
  dislikeCount?: number;
  deleted: boolean;
  deletedAt?: string;
}

export interface PicLogRecord extends RecordModel {
  title: string;
  logDate: string;
  author: string;
  participants: string[];
  participantOrder: string[];
  invitePassword?: string;
  visibility: PicLogVisibility;
  status: PicLogStatus;
  deleted: boolean;
  deletedAt?: string;
}

export interface PicLogEntryRecord extends RecordModel {
  log: string;
  author: string;
  logDate: string;
  chapter: string;
  image: string;
  alt?: string;
  memo: string;
  deleted: boolean;
  deletedAt?: string;
}

export interface PicLogCommentRecord extends RecordModel {
  log: string;
  chapter: string;
  author: string;
  content: string;
  taggedUser?: string;
  parentComment?: string;
  status: CommentStatus;
  deleted: boolean;
  deletedAt?: string;
}

export interface PicLogOrderRequestRecord extends RecordModel {
  log: string;
  requester: string;
  targetUser: string;
  status: PicLogOrderRequestStatus;
}
