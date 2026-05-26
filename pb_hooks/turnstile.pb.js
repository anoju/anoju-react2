var TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
var TURNSTILE_SECRET_ENV_KEY = 'TURNSTILE_SECRET_KEY';

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function getTurnstileToken(e) {
  var body = e.requestInfo().body || {};
  var token = body.turnstileToken;

  return typeof token === 'string' ? token.trim() : '';
}

function verifyTurnstile(e) {
  var secretKey = $os.getenv(TURNSTILE_SECRET_ENV_KEY);
  var token = getTurnstileToken(e);

  if (isBlank(secretKey)) {
    throw e.internalServerError('보안 확인 설정이 필요합니다.', {});
  }

  if (isBlank(token)) {
    throw e.badRequestError('보안 확인을 완료해주세요.', {});
  }

  var formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  var remoteIP = e.remoteIP();

  if (!isBlank(remoteIP)) {
    formData.append('remoteip', remoteIP);
  }

  var response;

  try {
    response = $http.send({
      method: 'POST',
      url: TURNSTILE_SITEVERIFY_URL,
      body: formData,
      timeout: 10,
    });
  } catch (error) {
    e.app.logger().error('Turnstile Siteverify 요청 실패', 'error', error);
    throw e.internalServerError('보안 확인을 처리하지 못했습니다.', {});
  }

  if (response.statusCode !== 200 || !response.json || response.json.success !== true) {
    throw e.badRequestError('보안 확인에 실패했습니다. 다시 시도해주세요.', {});
  }
}

onRecordCreateRequest(function (e) {
  if (e.hasSuperuserAuth()) {
    e.next();
    return;
  }

  verifyTurnstile(e);
  e.next();
}, 'users');

onRecordAuthWithPasswordRequest(function (e) {
  verifyTurnstile(e);
  e.next();
}, 'users');
