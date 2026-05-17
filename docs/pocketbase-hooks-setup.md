# PocketBase Hook 운영 문서

이 문서는 NAS PocketBase 서버에 적용해야 하는 `pb_hooks` 파일과 역할을 정리합니다.

## 적용 위치

PocketBase Docker 구성 기준으로 아래 경로에 hook 파일을 배치합니다.

```text
/volume1/docker/pocketbase/pb_hooks/oauth_virtual_email.pb.js
```

프로젝트 저장소 기준 원본 파일:

```text
pb_hooks/oauth_virtual_email.pb.js
```

## 적용 후 조치

1. NAS의 PocketBase 컨테이너에 `pb_hooks/oauth_virtual_email.pb.js`를 복사합니다.
2. PocketBase 컨테이너를 재시작합니다.
3. Admin UI의 Logs에서 hook 로딩 오류가 없는지 확인합니다.
4. Naver/Kakao 소셜 로그인을 테스트합니다.

## `oauth_virtual_email.pb.js`

목적:

- Naver/Kakao 소셜 로그인에서 이메일을 받지 못하는 경우 가입 실패를 막습니다.
- provider 사용자 id 기반 가상 이메일을 생성합니다.

가상 이메일 규칙:

```text
naver_{providerUserId}@oauth.anoju.synology.me
kakao_{providerUserId}@oauth.anoju.synology.me
```

주의:

- 가상 이메일은 로그인 식별용입니다.
- 실제 연락/인증 이메일로 취급하지 않습니다.
- 가상 이메일 계정은 `verified=false` 상태로 두고, 마이페이지에서 실제 이메일 등록 및 인증을 유도합니다.
- 게시글/댓글 작성 같은 쓰기 기능은 이메일 인증 완료 후에만 허용합니다.

## 참고한 PocketBase 공식 문서

- https://pocketbase.io/docs/js-event-hooks/
- https://pocketbase.io/jsvm/interfaces/core.RecordAuthWithOAuth2RequestEvent.html
