export const PB_COLLECTIONS = {
  users: 'users',
  posts: 'posts',
  comments: 'comments',
  postImages: 'post_images',
  reactions: 'reactions',
  bookmarks: 'bookmarks',
  reports: 'reports',
  notices: 'notices',
  notifications: 'notifications',
  deviceReports: 'device_reports',
  picLogs: 'pic_logs',
  picLogEntries: 'pic_log_entries',
  picLogComments: 'pic_log_comments',
  picLogOrderRequests: 'pic_log_order_requests',
} as const;

export type PocketBaseCollectionName = (typeof PB_COLLECTIONS)[keyof typeof PB_COLLECTIONS];

export const POST_TYPES = ['board', 'gallery', 'it_logs'] as const;

export const POST_STATUSES = ['draft', 'published', 'hidden', 'deleted'] as const;

export const COMMENT_STATUSES = ['published', 'hidden', 'deleted'] as const;

export const USER_ROLES = ['user', 'admin'] as const;

export const USER_STATUSES = ['active', 'suspended', 'withdrawn'] as const;

export const REPORT_TARGET_TYPES = ['post', 'comment', 'user'] as const;

export const REPORT_STATUSES = ['pending', 'reviewed', 'rejected', 'resolved'] as const;

export const NOTICE_PLACEMENTS = ['global', 'board', 'gallery'] as const;

export const NOTIFICATION_TYPES = [
  'post_comment',
  'comment_reply',
  'mention',
  'pic_log_invite',
  'pic_log_order_request',
  'system',
] as const;

export const DEVICE_REPORT_STATUSES = ['published', 'hidden', 'deleted'] as const;

export const DEVICE_ORIENTATIONS = ['portrait', 'landscape'] as const;

export const PIC_LOG_VISIBILITIES = ['private', 'invited', 'link', 'public'] as const;

export const PIC_LOG_STATUSES = ['published', 'hidden', 'deleted'] as const;

export const PIC_LOG_ORDER_REQUEST_STATUSES = ['pending', 'accepted', 'rejected', 'expired'] as const;
