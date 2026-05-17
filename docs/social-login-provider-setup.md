# 소셜 로그인 Provider 설정 준비 문서

Google, Naver, Kakao 소셜 로그인/회원가입을 사용하려면 각 provider 콘솔에서 앱을 만들고 PocketBase `users` 컬렉션 OAuth2 설정에 값을 등록해야 합니다.

## 공통 원칙

- PocketBase `users` auth collection에서 OAuth2를 활성화합니다.
- 프론트는 `listAuthMethods()` 결과에 실제 활성화된 provider만 노출합니다.
- redirect URL은 PocketBase OAuth2 간편 흐름 기준으로 아래 값을 등록합니다.

```text
https://서비스도메인/api/oauth2-redirect
```

로컬 개발 시에는 PocketBase가 실행되는 주소 기준으로 등록합니다.

```text
http://127.0.0.1:8090/api/oauth2-redirect
```

## Google

필요한 값:

- Google OAuth Client ID
- Google OAuth Client Secret

Google Cloud Console에서 준비할 것:

- OAuth 동의 화면 설정
- 승인된 JavaScript 원본
- 승인된 리디렉션 URI

PocketBase provider 이름:

```text
google
```

## Naver

필요한 값:

- Naver Client ID
- Naver Client Secret

Naver Developers에서 준비할 것:

- 애플리케이션 등록
- 로그인 API 사용 설정
- Callback URL 등록
- 이메일 제공 동의 항목 확인

PocketBase provider 이름:

```text
naver
```

## Kakao

필요한 값:

- Kakao REST API Key
- Kakao Client Secret 사용 시 Client Secret

Kakao Developers에서 준비할 것:

- 카카오 로그인 활성화
- Redirect URI 등록
- 동의항목에서 이메일 제공 범위 확인
- Client Secret 사용 여부 결정

PocketBase provider 이름:

```text
kakao
```

## 계정 연결 정책

- 이메일/비밀번호 계정이 대표 계정입니다.
- Google, Naver, Kakao는 같은 사용자 계정에 연결되는 로그인 수단입니다.
- 일반 가입 후 마이페이지에서 소셜 계정을 연결할 수 있습니다.
- 소셜 가입 후에도 추후 비밀번호 설정으로 이메일 로그인을 사용할 수 있어야 합니다.
- 서로 다른 이메일의 계정은 자동 병합하지 않습니다.
- 마지막 로그인 수단은 해제할 수 없습니다.

## 확인해야 할 운영 이슈

- Naver/Kakao는 사용자 동의 상태에 따라 이메일이 전달되지 않을 수 있습니다.
- 이메일이 없는 소셜 로그인은 추가 이메일 입력 및 인증 화면이 필요합니다.
- provider 콘솔의 앱 심사 또는 서비스 도메인 등록이 필요할 수 있습니다.
- 운영 도메인, 개발 도메인, PocketBase 도메인이 다르면 각 콘솔의 redirect URL 설정을 모두 맞춰야 합니다.
