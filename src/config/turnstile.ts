export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

export const getTurnstileSiteKey = () => {
  if (import.meta.env.DEV) {
    return TURNSTILE_TEST_SITE_KEY;
  }

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  if (siteKey) {
    return siteKey;
  }

  return '';
};

export const isTurnstileConfigured = () => Boolean(getTurnstileSiteKey());
