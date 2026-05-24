var VIRTUAL_EMAIL_DOMAIN = 'oauth.anoju.synology.me';

var PROVIDER_ALIASES = {
  oidc: 'naver',
  kakao: 'kakao',
};

var DEFAULT_USER_ROLE = 'user';
var DEFAULT_USER_STATUS = 'active';

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function normalizeProvider(providerName) {
  return PROVIDER_ALIASES[providerName] || providerName;
}

function sanitizeProviderUserId(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getProviderUserId(oAuth2User) {
  if (!oAuth2User) return '';

  if (!isBlank(oAuth2User.id)) return oAuth2User.id;
  if (!isBlank(oAuth2User.username)) return oAuth2User.username;

  var rawUser = oAuth2User.rawUser || {};

  if (!isBlank(rawUser.id)) return rawUser.id;
  if (!isBlank(rawUser.sub)) return rawUser.sub;

  if (rawUser.response) {
    if (!isBlank(rawUser.response.id)) return rawUser.response.id;
    if (!isBlank(rawUser.response.sub)) return rawUser.response.sub;
  }

  return '';
}

function buildVirtualEmail(providerName, oAuth2User) {
  var provider = normalizeProvider(providerName);
  var providerUserId = sanitizeProviderUserId(getProviderUserId(oAuth2User));

  if (isBlank(providerUserId)) {
    throw new BadRequestError('소셜 계정 정보를 확인하지 못했습니다.');
  }

  return provider + '_' + providerUserId + '@' + VIRTUAL_EMAIL_DOMAIN;
}

function applyDefaultUserFields(createData) {
  if (isBlank(createData.role)) {
    createData.role = DEFAULT_USER_ROLE;
  }

  if (isBlank(createData.status)) {
    createData.status = DEFAULT_USER_STATUS;
  }
}

onRecordAuthWithOAuth2Request(function (e) {
  var provider = normalizeProvider(e.providerName);

  if (!e.record && e.isNewRecord) {
    applyDefaultUserFields(e.createData);
  }

  if (provider !== 'naver' && provider !== 'kakao') {
    e.next();
    return;
  }

  if (e.record || !e.isNewRecord) {
    e.next();
    return;
  }

  if (!isBlank(e.oAuth2User && e.oAuth2User.email)) {
    e.next();
    return;
  }

  e.createData.email = buildVirtualEmail(e.providerName, e.oAuth2User);
  e.createData.emailVisibility = false;
  e.createData.verified = false;

  e.next();
}, 'users');
