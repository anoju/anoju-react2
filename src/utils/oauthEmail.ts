const VIRTUAL_OAUTH_EMAIL_DOMAIN = 'oauth.anoju.synology.me';

export const isVirtualOAuthEmail = (email?: string) => {
  if (!email) return false;

  return email.toLowerCase().endsWith(`@${VIRTUAL_OAUTH_EMAIL_DOMAIN}`);
};

export const getVirtualOAuthEmailDomain = () => VIRTUAL_OAUTH_EMAIL_DOMAIN;
