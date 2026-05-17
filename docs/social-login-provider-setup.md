# 소셜 로그인 Provider 설정 준비 문서

Google, Naver, Kakao 소셜 로그인/회원가입을 사용하려면 각 provider 콘솔에서 앱을 만들고 PocketBase `users` 컬렉션 OAuth2 설정에 값을 등록해야 합니다.

## 공통 원칙

- PocketBase `users` auth collection에서 OAuth2를 활성화합니다.
- 프론트는 `listAuthMethods()` 결과에 실제 활성화된 provider만 노출합니다.
- 프론트 운영 도메인은 `https://anoju.synology.me`입니다.
- PocketBase API/Admin 도메인은 `https://pocketbase.anoju.synology.me`입니다.
- redirect URL은 PocketBase OAuth2 간편 흐름 기준으로 아래 값을 등록합니다.

```text
https://pocketbase.anoju.synology.me/api/oauth2-redirect
```

로컬 개발 시에는 PocketBase가 실행되는 주소 기준으로 등록합니다.

```text
http://127.0.0.1:8090/api/oauth2-redirect
```

## Google

설정 상태:

- PocketBase Google provider 등록 완료
- Google Client Secret은 저장소 문서/코드에 저장하지 않습니다.

필요한 값:

- Google OAuth Client ID
- Google OAuth Client Secret

값을 받는 URL:

- Google Auth Platform Clients: https://console.developers.google.com/auth/clients
- Google Cloud Console: https://console.cloud.google.com/
- 공식 도움말: https://support.google.com/cloud/answer/15549257

발급 순서:

1. Google Cloud Console에 로그인합니다.
2. 새 프로젝트를 만들거나 기존 프로젝트를 선택합니다.
3. Google Auth Platform에서 앱 정보를 먼저 등록합니다.
4. Google Auth Platform Clients 화면으로 이동합니다.
5. `CREATE CLIENT`를 선택합니다.
6. Application type은 `Web application`을 선택합니다.
7. Name은 `Anoju Web`처럼 식별 가능한 이름으로 입력합니다.
8. Authorized JavaScript origins에 아래 값을 추가합니다.

```text
https://anoju.synology.me
```

9. Authorized redirect URIs에 아래 값을 추가합니다.

```text
https://pocketbase.anoju.synology.me/api/oauth2-redirect
```

10. 로컬 PocketBase로 테스트할 경우 아래 URI도 추가합니다.

```text
http://127.0.0.1:8090/api/oauth2-redirect
```

11. Create 후 표시되는 `Client ID`와 `Client Secret`을 저장합니다.

PocketBase에 입력할 값:

| PocketBase 항목 | Google에서 가져올 값 |
| --- | --- |
| Client ID | OAuth client의 Client ID |
| Client secret | OAuth client의 Client Secret |

주의:

- Google Client Secret은 생성 직후에만 전체 값을 확인/다운로드할 수 있으므로 바로 안전한 곳에 보관합니다.
- JavaScript origins에는 path를 넣지 않고 origin만 넣습니다. 예: `https://anoju.synology.me`
- Redirect URI는 PocketBase redirect URL 전체를 넣습니다. 예: `https://pocketbase.anoju.synology.me/api/oauth2-redirect`

PocketBase provider 이름:

```text
google
```

## Naver

설정 상태:

- PocketBase Naver provider 등록 완료
- PocketBase 기본 provider 목록에 Naver가 없어 OpenID Connect provider(`oidc`)로 연결합니다.
- Naver Client Secret은 저장소 문서/코드에 저장하지 않습니다.

필요한 값:

- Naver Client ID
- Naver Client Secret

값을 받는 URL:

- Naver Developers: https://developers.naver.com/
- 내 애플리케이션: https://developers.naver.com/apps/#/list
- 애플리케이션 등록: https://developers.naver.com/apps/#/register
- 공식 개발 가이드: https://developers.naver.com/docs/login/devguide/devguide.md

발급 순서:

1. Naver Developers에 로그인합니다.
2. `Application` 또는 `내 애플리케이션` 메뉴로 이동합니다.
3. `애플리케이션 등록`을 선택합니다.
4. 애플리케이션 이름은 `Anoju`처럼 입력합니다.
5. 사용 API에서 `네이버 로그인`을 선택합니다.
6. 제공 정보에서 최소 `이메일`, 필요 시 `이름`, `프로필 이미지`를 선택합니다.
7. 로그인 오픈 API 서비스 환경은 `PC 웹`과 `Mobile 웹`을 선택합니다.
8. 서비스 URL에 아래 값을 입력합니다.

```text
https://anoju.synology.me
```

9. Callback URL에 아래 값을 입력합니다.

```text
https://pocketbase.anoju.synology.me/api/oauth2-redirect
```

10. 등록 후 `내 애플리케이션` 상세 화면에서 `Client ID`와 `Client Secret`을 확인합니다.

PocketBase에 입력할 값:

| PocketBase 항목 | Naver에서 가져올 값 |
| --- | --- |
| Client ID | 애플리케이션 상세의 Client ID |
| Client secret | 애플리케이션 상세의 Client Secret |

주의:

- Naver의 Client ID는 변경할 수 없고, Client Secret은 재발급할 수 있습니다.
- Callback URL이 정확히 일치하지 않으면 로그인 연동이 실패할 수 있습니다.
- 사용자가 이메일 제공을 거부할 수 있으므로, 이메일이 없는 경우의 추가 입력 흐름을 고려합니다.

PocketBase provider 이름:

```text
oidc
```

프론트 표시 이름:

```text
Naver
```

## Kakao

설정 상태:

- PocketBase Kakao provider 등록 완료
- Kakao는 아직 인증 상태 문제로 이메일을 받아올 수 없습니다.
- 이메일을 받지 못하면 provider 사용자 id 기반 가상 이메일을 사용합니다.
- Kakao Client Secret은 저장소 문서/코드에 저장하지 않습니다.

필요한 값:

- Kakao REST API Key
- Kakao Client Secret 사용 시 Client Secret

값을 받는 URL:

- Kakao Developers: https://developers.kakao.com/
- 내 애플리케이션: https://developers.kakao.com/console/app
- 공식 설정 문서: https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite

발급 순서:

1. Kakao Developers에 로그인합니다.
2. `내 애플리케이션`에서 새 애플리케이션을 추가합니다.
3. 앱 이름과 사업자명을 입력해 앱을 생성합니다.
4. 생성된 앱의 `앱 키` 화면에서 `REST API 키`를 확인합니다.
5. `플랫폼`에서 Web 플랫폼을 등록하고 사이트 도메인에 아래 값을 추가합니다.

```text
https://anoju.synology.me
```

6. `카카오 로그인` > `활성화 설정`에서 상태를 `ON`으로 변경합니다.
7. `카카오 로그인` > `Redirect URI`에 아래 값을 추가합니다.

```text
https://pocketbase.anoju.synology.me/api/oauth2-redirect
```

8. `카카오 로그인` > `동의항목`에서 이메일 제공 항목을 설정합니다.
9. `앱` > `플랫폼 키` > `REST API 키` > `Client Secret` 화면에서 Client Secret 사용 여부를 확인합니다.
10. Client Secret을 사용하는 경우 해당 값을 발급/확인해서 PocketBase에 함께 입력합니다.

PocketBase에 입력할 값:

| PocketBase 항목 | Kakao에서 가져올 값 |
| --- | --- |
| Client ID | 앱 키의 REST API 키 |
| Client secret | Client Secret 사용 시 발급된 Client Secret |

주의:

- 카카오 로그인은 사용 설정과 Redirect URI 등록이 필수입니다.
- REST API 방식에서는 `REST API 키`가 PocketBase의 Client ID 역할을 합니다.
- 이메일 동의항목은 앱 상태/비즈 앱 여부에 따라 추가 심사가 필요할 수 있습니다.
- 현재 Kakao 앱은 이메일을 받아올 수 없는 상태이므로, 서버 hook에서 `kakao_{providerUserId}@oauth.anoju.synology.me` 형식의 가상 이메일을 부여해야 합니다.
- Client Secret 기능이 켜져 있으면 토큰 발급 시 Secret도 필요합니다.

PocketBase provider 이름:

```text
kakao
```

## 계정 연결 정책

- 이메일/비밀번호 계정이 대표 계정입니다.
- Google, Naver, Kakao는 같은 사용자 계정에 연결되는 로그인 수단입니다.
- 일반 가입 후 마이페이지에서 소셜 계정을 연결할 수 있습니다.
- 소셜 가입 후에도 추후 비밀번호 설정으로 이메일 로그인을 사용할 수 있어야 합니다.
- Naver/Kakao에서 실제 이메일을 받지 못하면 `naver_{providerUserId}@oauth.anoju.synology.me`, `kakao_{providerUserId}@oauth.anoju.synology.me` 형식의 가상 이메일을 사용합니다.
- 가상 이메일은 로그인 식별용이며, 실제 연락/인증 이메일로 취급하지 않습니다.
- 가상 이메일 계정은 이메일 미인증 상태로 두고 마이페이지에서 실제 이메일 등록 및 인증을 유도합니다.
- 가상 이메일 생성은 `pb_hooks/oauth_virtual_email.pb.js`에서 처리하며, NAS PocketBase 서버에 해당 hook 파일을 배치해야 실제 동작합니다.
- 서로 다른 이메일의 계정은 자동 병합하지 않습니다.
- 마지막 로그인 수단은 해제할 수 없습니다.

## 확인해야 할 운영 이슈

- Naver/Kakao는 사용자 동의 또는 앱 인증 상태에 따라 이메일이 전달되지 않을 수 있습니다.
- 이메일이 없는 소셜 로그인은 가상 이메일을 사용하되, 실제 이메일 등록/인증 화면이 필요합니다.
- provider 콘솔의 앱 심사 또는 서비스 도메인 등록이 필요할 수 있습니다.
- 운영 프론트 도메인(`https://anoju.synology.me`)과 PocketBase redirect 도메인(`https://pocketbase.anoju.synology.me/api/oauth2-redirect`)을 혼동하지 않도록 각 콘솔 설정을 맞춥니다.
