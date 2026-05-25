export const PB_COLLECTIONS = {
  users: 'users',
  posts: 'posts',
  comments: 'comments',
  postImages: 'post_images',
  reactions: 'reactions',
  bookmarks: 'bookmarks',
  reports: 'reports',
  notices: 'notices',
  deviceReports: 'device_reports',
} as const;

export type PocketBaseCollectionName = (typeof PB_COLLECTIONS)[keyof typeof PB_COLLECTIONS];

export const POST_TYPES = ['board', 'gallery'] as const;

export const POST_STATUSES = ['draft', 'published', 'hidden', 'deleted'] as const;

export const COMMENT_STATUSES = ['published', 'hidden', 'deleted'] as const;

export const USER_ROLES = ['user', 'admin'] as const;

export const USER_STATUSES = ['active', 'suspended', 'withdrawn'] as const;

export const REPORT_TARGET_TYPES = ['post', 'comment', 'user'] as const;

export const REPORT_STATUSES = ['pending', 'reviewed', 'rejected', 'resolved'] as const;

export const NOTICE_PLACEMENTS = ['global', 'board', 'gallery'] as const;

export const DEVICE_REPORT_STATUSES = ['published', 'hidden', 'deleted'] as const;

export const DEVICE_ORIENTATIONS = ['portrait', 'landscape'] as const;
