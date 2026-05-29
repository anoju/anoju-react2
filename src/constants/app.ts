export const APP_NAME = 'Anoju';

export const DEFAULT_HOME_PATH = '/';

export const LOGIN_PATH = '/login';

export const REGISTER_PATH = '/register';

export const MENU_PATH = '/menu';

export const MY_PAGE_PATH = '/my-page';

export const MY_PAGE_PROFILE_PATH = '/my-page/profile';

export const MY_PAGE_POSTS_PATH = '/my-page/posts';

export const MY_PAGE_COMMENTS_PATH = '/my-page/comments';

export const MY_PAGE_NOTIFICATIONS_PATH = '/my-page/notifications';

export const SETTINGS_PATH = '/settings';

export const PLAYGROUND_PATH = '/playground';

export const FREE_BOARD_PATH = '/playground/free-board';

export const FREE_BOARD_WRITE_PATH = '/playground/free-board/write';

export const FREE_BOARD_EDIT_PATH = '/playground/free-board/:postId/edit';

export const IT_LOGS_PATH = '/playground/it-logs';

export const IT_LOGS_WRITE_PATH = '/playground/it-logs/write';

export const IT_LOGS_EDIT_PATH = '/playground/it-logs/:postId/edit';

export const DEVICE_INFO_PATH = '/playground/device';

export const DEVICE_INFO_WRITE_PATH = '/playground/device/write';

export const DEVICE_INFO_EDIT_PATH = '/playground/device/:deviceReportId/edit';

export const SNAPS_PATH = '/snaps';

export const CLIPS_PATH = '/snaps/clips';

export const CLIPS_WRITE_PATH = '/snaps/clips/write';

export const CLIPS_EDIT_PATH = '/snaps/clips/:clipId/edit';

export const PICS_PATH = '/snaps/pics';

export const PICS_WRITE_PATH = '/snaps/pics/write';

export const PICS_EDIT_PATH = '/snaps/pics/:postId/edit';

export const PIC_LOG_PATH = '/snaps/pic-log';

export const PIC_LOG_NEW_PATH = '/snaps/pic-log/new';

export const PIC_LOG_ADD_PATH = '/snaps/pic-log/:logId/add';

export const PIC_LOG_EDIT_PATH = '/snaps/pic-log/:logId/edit';

export const PIC_LOG_JOIN_PATH = '/snaps/pic-log/:logId/join';

export const STORAGE_KEYS = {
  theme: 'anoju-theme',
  fontMode: 'anoju-font-mode',
} as const;
