# PocketBase Hook 운영 문서

이 문서는 NAS PocketBase 서버에 적용해야 하는 `pb_hooks` 파일과 역할을 정리합니다.

## 적용 위치

PocketBase Docker 구성 기준으로 아래 경로에 hook 파일을 배치합니다.

```text
/volume1/docker/pocketbase/pb_hooks
```

프로젝트 저장소 기준 원본 폴더:

```text
pb_hooks
```

## 적용 후 조치

1. NAS의 PocketBase 컨테이너에 필요한 `pb_hooks/*.pb.js` 파일을 복사합니다.
2. PocketBase 컨테이너를 재시작합니다.
3. Admin UI의 Logs에서 hook 로딩 오류가 없는지 확인합니다.
4. 기능별 테스트를 진행합니다.

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

## `clip_video_policy.pb.js`

목적:

- Clips 동영상 업로드를 서버에서 최종 처리합니다.
- 클라이언트에서 전달한 선택 구간을 기준으로 `ffmpeg`가 최대 30초로 자르고 720p 이하 MP4로 변환합니다.
- 클라이언트 검증 우회를 막기 위해 변환 후 `ffprobe`로 실제 영상 메타데이터를 다시 확인합니다.

검증 정책:

```text
파일 필드: clips.video
원본 입력 최대 용량: 300MB
저장 길이: 30초 이하
저장 해상도: 720p 이하
720p 판정: 긴 변 1280px 이하, 짧은 변 720px 이하
저장 형식: mp4, H.264, AAC
```

필수 조건:

- PocketBase 컨테이너 안에서 `ffprobe` 명령이 실행 가능해야 합니다.
- 현재 운영 컨테이너는 `anoju-pocketbase-ffmpeg:latest`처럼 `ffmpeg/ffprobe`가 포함된 이미지를 사용합니다.

배치:

```text
/volume1/docker/pocketbase/pb_hooks/clip_video_policy.pb.js
```

컨테이너에서 확인:

```bash
command -v ffmpeg
command -v ffprobe
ffprobe -version | head -n 1
```

적용 후 테스트:

1. PocketBase 컨테이너를 재시작합니다.
2. Admin UI Logs에서 hook 로딩 오류가 없는지 확인합니다.
3. 30초 이하/720p 이하 Clips 업로드가 성공하는지 확인합니다.
4. 30초 초과 영상에서 선택한 30초 구간만 저장되는지 확인합니다.
5. 1080p 영상이 720p 이하로 변환되어 저장되는지 확인합니다.

## 참고한 PocketBase 공식 문서

- https://pocketbase.io/docs/js-event-hooks/
- https://pocketbase.io/jsvm/interfaces/core.RecordAuthWithOAuth2RequestEvent.html
- https://pocketbase.io/jsvm/interfaces/core.RecordRequestEvent.html
- https://pocketbase.io/jsvm/functions/_os.exec.html
