import { useEffect, useMemo } from 'react';
import type React from 'react';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '@/constants/app';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useLayoutStore } from '@/stores/layoutStore';
import type { AppRouteConfig } from '@/routes/types';
import { AppHeader } from './AppHeader';
import { FloatingMenu } from './FloatingMenu';
import { Page } from './Page';

interface AppLayoutProps {
  route: AppRouteConfig;
  children: React.ReactNode;
}

export const AppLayout = ({ route, children }: AppLayoutProps) => {
  const { direction, isNearTop } = useScrollDirection();
  const {
    setHeaderVisible,
    setFloatingMenuVisible,
    setTopOffset,
    setBottomOffset,
    revision,
  } = useLayoutStore();

  const headerVisible = useMemo(() => {
    const header = route.layout.header;

    if (!header.enabled) return false;
    if (header.alwaysFixed || !header.hideOnScroll) return true;
    return isNearTop || direction === 'up';
  }, [direction, isNearTop, route.layout.header]);

  const floatingMenuVisible = useMemo(() => {
    const floatingMenu = route.layout.floatingMenu;

    if (!floatingMenu.enabled) return false;
    if (!floatingMenu.hideOnScroll) return true;
    return isNearTop || direction === 'up';
  }, [direction, isNearTop, route.layout.floatingMenu]);

  useEffect(() => {
    setHeaderVisible(headerVisible);
    setFloatingMenuVisible(floatingMenuVisible);
    setTopOffset(route.layout.header.enabled ? 56 : 0);
    setBottomOffset(route.layout.floatingMenu.enabled ? 88 : 0);
  }, [
    floatingMenuVisible,
    headerVisible,
    revision,
    route.layout.floatingMenu.enabled,
    route.layout.header.enabled,
    setBottomOffset,
    setFloatingMenuVisible,
    setHeaderVisible,
    setTopOffset,
  ]);

  const pageTitle = `${route.meta.title} | ${APP_NAME}`;
  const appShellClassName = route.layout.floatingMenu.enabled ? 'app-shell app-shell--has-floating-menu' : 'app-shell';

  return (
    <div className={appShellClassName}>
      <Helmet>
        <title>{pageTitle}</title>
        {route.meta.description ? <meta name="description" content={route.meta.description} /> : null}
        {route.meta.robots ? <meta name="robots" content={route.meta.robots} /> : null}
      </Helmet>

      <AppHeader config={route.layout.header} visible={headerVisible} />
      <Page>{children}</Page>
      <FloatingMenu config={route.layout.floatingMenu} visible={floatingMenuVisible} />
    </div>
  );
};
