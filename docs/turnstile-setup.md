# Cloudflare Turnstile 설정 문서

일반 이메일 회원가입과 이메일/비밀번호 로그인의 봇/스팸 요청 방지를 위해 Cloudflare Turnstile을 사용합니다.

## 받아와야 하는 값

Cloudflare Dashboard에서 Turnstile widget을 생성한 뒤 아래 값을 준비합니다.

- Sitekey: 프론트엔드에서 사용
- Secret key: PocketBase 서버 검증에서만 사용
- Widget 도메인: `anoju.synology.me`

## 프론트엔드 환경 변수

`.env`에 Sitekey를 추가합니다.

```bash
VITE_TURNSTILE_SITE_KEY=Cloudflare에서_발급받은_Sitekey
```

주의:

- `VITE_TURNSTILE_SITE_KEY`는 브라우저에 노출되는 값입니다.
- Secret key는 절대 `VITE_` 환경 변수에 넣지 않습니다.
- 개발 환경에서 Sitekey가 없으면 Cloudflare 테스트 Sitekey를 사용하도록 구현되어 있습니다.

## PocketBase 서버 환경 변수

PocketBase 서버 또는 Docker 환경에는 Secret key를 서버 전용 환경 변수로 등록합니다.

```bash
TURNSTILE_SECRET_KEY=Cloudflare에서_발급받은_Secret_key
```

로컬 개발 또는 자동화 테스트에서는 Cloudflare 공식 테스트 Secret key를 사용할 수 있습니다.

```bash
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

## 서버 검증 정책

Turnstile은 클라이언트 위젯만 붙이면 완료가 아닙니다. 회원 생성과 이메일/비밀번호 로그인 처리 전에 서버에서 반드시 Cloudflare Siteverify API로 token을 검증해야 합니다.

검증 엔드포인트:

```text
https://challenges.cloudflare.com/turnstile/v0/siteverify
```

검증 시 전달할 값:

- `secret`: 서버 환경 변수의 `TURNSTILE_SECRET_KEY`
- `response`: 회원가입 또는 로그인 요청에서 전달된 `turnstileToken`
- `remoteip`: 가능하면 요청 IP

성공 조건:

- Siteverify 응답의 `success`가 `true`일 때만 회원 생성 또는 로그인을 허용합니다.
- 실패하면 회원 생성/로그인 요청을 거부하고 일반화된 오류 메시지를 반환합니다.

## 프론트엔드 요청 값

회원가입 시 프론트엔드는 `users` 생성 요청 body에 아래 값을 함께 전달합니다.

```json
{
  "email": "user@example.com",
  "password": "password",
  "passwordConfirm": "password",
  "name": "사용자",
  "turnstileToken": "Cloudflare Turnstile token"
}
```

로그인 시 프론트엔드는 `users/auth-with-password` 요청 body에 아래 값을 함께 전달합니다.

```json
{
  "identity": "user@example.com",
  "password": "password",
  "turnstileToken": "Cloudflare Turnstile token"
}
```

PocketBase 서버 훅은 `turnstileToken`을 읽어 검증하고, 실제 `users` 컬렉션 필드로 저장하지 않아야 합니다.

## 운영 체크리스트

- Cloudflare Turnstile widget 도메인에 운영 도메인 `anoju.synology.me` 등록
- 로컬 개발용 도메인 또는 테스트 키 사용 여부 결정
- PocketBase 서버에 `TURNSTILE_SECRET_KEY` 등록
- 회원가입 create hook에서 Siteverify 검증
- 이메일/비밀번호 로그인 hook에서 Siteverify 검증
- 실패 메시지는 계정 존재 여부나 내부 검증 사유를 과도하게 노출하지 않기

## 참고 링크

- [Cloudflare Turnstile client-side rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
