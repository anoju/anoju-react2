import { matchPath } from 'react-router-dom';
import {
  CLIPS_EDIT_PATH,
  CLIPS_PATH,
  CLIPS_WRITE_PATH,
  DEFAULT_HOME_PATH,
  DEVICE_INFO_EDIT_PATH,
  DEVICE_INFO_PATH,
  DEVICE_INFO_WRITE_PATH,
  FREE_BOARD_EDIT_PATH,
  FREE_BOARD_PATH,
  FREE_BOARD_WRITE_PATH,
  DEV_LOG_EDIT_PATH,
  DEV_LOG_PATH,
  DEV_LOG_WRITE_PATH,
  LOGIN_PATH,
  MENU_PATH,
  MY_PAGE_COMMENTS_PATH,
  MY_PAGE_NOTIFICATIONS_PATH,
  MY_PAGE_PATH,
  MY_PAGE_POSTS_PATH,
  MY_PAGE_PROFILE_PATH,
  PICS_EDIT_PATH,
  PICS_PATH,
  PICS_WRITE_PATH,
  PIC_LOG_ADD_PATH,
  PIC_LOG_EDIT_PATH,
  PIC_LOG_JOIN_PATH,
  PIC_LOG_NEW_PATH,
  PIC_LOG_PATH,
  LOUNGE_PATH,
  REGISTER_PATH,
  SETTINGS_PATH,
  SNAPS_PATH,
} from '@/constants/app';

const knownRoutePatterns = [
  DEFAULT_HOME_PATH,
  LOGIN_PATH,
  REGISTER_PATH,
  MENU_PATH,
  MY_PAGE_PATH,
  MY_PAGE_PROFILE_PATH,
  MY_PAGE_POSTS_PATH,
  MY_PAGE_COMMENTS_PATH,
  MY_PAGE_NOTIFICATIONS_PATH,
  SETTINGS_PATH,
  LOUNGE_PATH,
  FREE_BOARD_PATH,
  FREE_BOARD_WRITE_PATH,
  `${FREE_BOARD_PATH}/:postId`,
  FREE_BOARD_EDIT_PATH,
  DEV_LOG_PATH,
  DEV_LOG_WRITE_PATH,
  `${DEV_LOG_PATH}/:postId`,
  DEV_LOG_EDIT_PATH,
  DEVICE_INFO_PATH,
  DEVICE_INFO_WRITE_PATH,
  `${DEVICE_INFO_PATH}/:deviceReportId`,
  DEVICE_INFO_EDIT_PATH,
  SNAPS_PATH,
  CLIPS_PATH,
  `${CLIPS_PATH}/:clipId`,
  CLIPS_WRITE_PATH,
  CLIPS_EDIT_PATH,
  PICS_PATH,
  PICS_WRITE_PATH,
  `${PICS_PATH}/:postId`,
  PICS_EDIT_PATH,
  PIC_LOG_PATH,
  PIC_LOG_NEW_PATH,
  PIC_LOG_JOIN_PATH,
  `${PIC_LOG_PATH}/:logId`,
  PIC_LOG_ADD_PATH,
  PIC_LOG_EDIT_PATH,
  '/about',
] as const;

const writeRouteFallbacks = [
  { pattern: FREE_BOARD_WRITE_PATH, fallbackPath: FREE_BOARD_PATH },
  { pattern: DEV_LOG_WRITE_PATH, fallbackPath: DEV_LOG_PATH },
  { pattern: DEVICE_INFO_WRITE_PATH, fallbackPath: DEVICE_INFO_PATH },
  { pattern: CLIPS_WRITE_PATH, fallbackPath: CLIPS_PATH },
  { pattern: PICS_WRITE_PATH, fallbackPath: PICS_PATH },
  { pattern: PIC_LOG_NEW_PATH, fallbackPath: PIC_LOG_PATH },
  { pattern: PIC_LOG_ADD_PATH, fallbackPath: PIC_LOG_PATH },
] as const;

const isInternalPath = (path: string) => path.startsWith('/') && !path.startsWith('//');

const getPathname = (path: string) => {
  try {
    return new URL(path, window.location.origin).pathname;
  } catch {
    return path.split('?')[0] ?? path;
  }
};

export const getWriteRouteFallbackPath = (path: string) => {
  const pathname = getPathname(path);
  const matchedRoute = writeRouteFallbacks.find(({ pattern }) => matchPath({ path: pattern, end: true }, pathname));

  return matchedRoute?.fallbackPath;
};

const isKnownRoutePath = (path: string) => {
  const pathname = getPathname(path);

  return knownRoutePatterns.some((pattern) => matchPath({ path: pattern, end: true }, pathname));
};

export const resolveLoginRedirectPath = (redirectPath: string | null) => {
  if (!redirectPath || !isInternalPath(redirectPath)) {
    return DEFAULT_HOME_PATH;
  }

  const pathname = getPathname(redirectPath);

  if (pathname === LOGIN_PATH) {
    return DEFAULT_HOME_PATH;
  }

  return isKnownRoutePath(redirectPath) ? redirectPath : getWriteRouteFallbackPath(redirectPath) ?? DEFAULT_HOME_PATH;
};

export const resolveLoginFallbackPath = (redirectPath: string | null) => {
  return resolveLoginRedirectPath(redirectPath);
};
