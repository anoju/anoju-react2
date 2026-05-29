import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Bell, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import anojuLogo from '@/assets/images/common/logo.svg';
import { notificationApi } from '@/apis';
import { DEFAULT_HOME_PATH, MY_PAGE_NOTIFICATIONS_PATH } from '@/constants/app';
import { IconButton, Img } from '@/components/atoms';
import type { HeaderConfig } from '@/routes/types';
import { useAuthStore } from '@/stores/authStore';

interface AppHeaderProps {
  config: HeaderConfig;
  visible: boolean;
}

export const AppHeader = ({ config, visible }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { status, user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const canUseNotifications = status === 'authenticated' && Boolean(user?.id);
  const visibleUnreadCount = canUseNotifications ? unreadCount : 0;

  const loadUnreadCount = useCallback(async () => {
    if (!canUseNotifications) {
      return;
    }

    try {
      setUnreadCount(await notificationApi.getUnreadCount());
    } catch {
      setUnreadCount(0);
    }
  }, [canUseNotifications]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUnreadCount();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadUnreadCount]);

  useEffect(() => {
    if (!canUseNotifications || !config.showNotificationButton) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, 30000);

    const handleFocus = () => {
      void loadUnreadCount();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [canUseNotifications, config.showNotificationButton, loadUnreadCount]);

  if (!config.enabled) {
    return null;
  }

  const handleBack = () => {
    const backButton = config.backButton;

    if (!backButton || backButton.type === 'history') {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      navigate(backButton ? backButton.fallbackPath ?? DEFAULT_HOME_PATH : DEFAULT_HOME_PATH);
      return;
    }

    if (backButton.type === 'route') {
      navigate(backButton.path, { replace: backButton.replace });
      return;
    }

    window.dispatchEvent(new CustomEvent('anoju:header-back-action', { detail: backButton }));

    if (backButton.fallbackPath) {
      navigate(backButton.fallbackPath);
    }
  };

  return (
    <motion.header
      className="app-header"
      data-variant={config.variant ?? 'default'}
      data-visible={visible}
      initial={false}
      animate={{ y: visible ? 0 : '-100%' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="app-header__inner">
        <div className="app-header__left">
          {config.showBackButton ? (
            <IconButton label="뒤로가기" icon={<ArrowLeft size={20} />} onClick={handleBack} />
          ) : null}
          {config.showBrandLogo ? (
            <h1 className="app-header__brand">
              <Img src={anojuLogo} alt="Anoju 로고" className="app-header__brand-logo" />
              <span className="app-header__brand-text">{config.title ?? 'Anoju'}</span>
            </h1>
          ) : config.title ? (
            <h1 className="app-header__title">{config.title}</h1>
          ) : null}
          <div className="app-header__slot app-header__slot--left" data-slot={config.leftSlotKey} />
        </div>

        <div className="app-header__right">
          <div className="app-header__slot app-header__slot--right" data-slot={config.rightSlotKey} />
          {config.showNotificationButton ? (
            <span className="app-header__notification">
              <IconButton
                label={visibleUnreadCount > 0 ? `알림함, 읽지 않은 알림 ${visibleUnreadCount}개` : '알림함'}
                icon={<Bell size={20} />}
                onClick={() => navigate(MY_PAGE_NOTIFICATIONS_PATH)}
              />
              {visibleUnreadCount > 0 ? (
                <span className="app-header__notification-badge" aria-hidden="true">
                  {visibleUnreadCount > 99 ? '99+' : visibleUnreadCount}
                </span>
              ) : null}
            </span>
          ) : null}
          {config.showHomeButton ? (
            <IconButton label="홈" icon={<Home size={20} />} onClick={() => navigate(DEFAULT_HOME_PATH)} />
          ) : null}
        </div>
      </div>
    </motion.header>
  );
};
