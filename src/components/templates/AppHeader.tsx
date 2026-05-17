import { ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import anojuLogo from '@/assets/images/common/logo.svg';
import { DEFAULT_HOME_PATH } from '@/constants/app';
import { IconButton, Img } from '@/components/atoms';
import type { HeaderConfig } from '@/routes/types';

interface AppHeaderProps {
  config: HeaderConfig;
  visible: boolean;
}

export const AppHeader = ({ config, visible }: AppHeaderProps) => {
  const navigate = useNavigate();

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
          {config.showHomeButton ? (
            <IconButton label="홈" icon={<Home size={20} />} onClick={() => navigate(DEFAULT_HOME_PATH)} />
          ) : null}
        </div>
      </div>
    </motion.header>
  );
};
