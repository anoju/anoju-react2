import type { ReactNode } from 'react';
import type { UserRole } from '@/types/common';

export type BackButtonConfig =
  | false
  | { type: 'history'; fallbackPath?: string }
  | { type: 'route'; path: string; replace?: boolean }
  | { type: 'custom'; actionKey: string; fallbackPath?: string };

export interface RouteMeta {
  title: string;
  description?: string;
  robots?: string;
}

export interface HeaderConfig {
  enabled: boolean;
  title?: string;
  alwaysFixed?: boolean;
  hideOnScroll?: boolean;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  backButton?: BackButtonConfig;
  leftSlotKey?: string;
  rightSlotKey?: string;
}

export interface FloatingMenuConfig {
  enabled: boolean;
  hideOnScroll?: boolean;
}

export interface LayoutMeta {
  header: HeaderConfig;
  floatingMenu: FloatingMenuConfig;
}

export interface AppRouteConfig {
  id: string;
  path: string;
  element: ReactNode;
  meta: RouteMeta;
  layout: LayoutMeta;
  requiresAuth?: boolean;
  roles?: UserRole[];
  adminOnly?: boolean;
}
