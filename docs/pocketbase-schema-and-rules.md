# PocketBase 컬렉션 스키마 및 API Rules

이 문서는 PocketBase Admin UI에서 생성해야 하는 컬렉션, 필드, 인덱스, API Rules 기준입니다.

## 공통 규칙

- 최종 권한 검증은 PocketBase API Rules에서 수행합니다.
- 프론트에서 버튼을 숨겨도 API Rules가 허용하지 않으면 요청은 실패해야 합니다.
- 삭제는 기본적으로 soft delete를 사용합니다.
- 이메일 미인증, 정지, 탈퇴 사용자는 쓰기 액션을 제한합니다.
- 관리자 판단은 기본적으로 `@request.auth.role = "admin"` 기준으로 합니다.
- PocketBase import JSON의 내부 collection id와 field id는 15자 이하로 관리합니다. 화면에 노출되는 컬렉션/필드 `name`은 별도로 유지합니다.

## users

PocketBase auth collection입니다.

기본 인증 설정:

- Password auth: 활성화
- Identity fields: `email`
- Email verification: 활성화
- OAuth2: Google, Naver, Kakao provider 등록 후 활성화

추가 필드:

| 필드       | 타입   | 필수 | 기본값   | 설명                               |
| ---------- | ------ | ---- | -------- | ---------------------------------- |
| `name`     | text   | no   |          | 실명 또는 표시 이름                |
| `nickname` | text   | no   |          | 서비스 표시 닉네임                 |
| `avatar`   | file   | no   |          | 프로필 이미지                      |
| `bio`      | text   | no   |          | 한 줄 소개                         |
| `role`     | select | yes  | `user`   | `user`, `admin`                    |
| `status`   | select | yes  | `active` | `active`, `suspended`, `withdrawn` |

권장 인덱스:

```text
CREATE UNIQUE INDEX idx_users_nickname_unique ON users (nickname) WHERE nickname != "";
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);
```

API Rules:

```text
List rule: @request.auth.role = "admin"
View rule: id = @request.auth.id || @request.auth.role = "admin"
Create rule: true
Update rule: id = @request.auth.id || @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

주의:

- 회원가입 create rule을 열어두는 대신 Turnstile 서버 검증 hook이 반드시 필요합니다.
- `role`, `status`는 일반 사용자가 임의 수정하지 못하도록 서버 hook 또는 field rule 정책으로 막아야 합니다.

## posts

게시판/갤러리 게시글 컬렉션입니다.

필드:

| 필드            | 타입           | 필수 | 기본값      | 설명                                                                     |
| --------------- | -------------- | ---- | ----------- | ------------------------------------------------------------------------ |
| `title`         | text           | yes  |             | 제목                                                                     |
| `content`       | editor/text    | yes  |             | 본문                                                                     |
| `type`          | select         | yes  | `board`     | `board`, `gallery`                                                       |
| `author`        | relation users | yes  |             | 작성자                                                                   |
| `status`        | select         | yes  | `published` | `draft`, `published`, `hidden`, `deleted`                                |
| `tags`          | json           | no   | `[]`        | 태그 배열                                                                |
| `viewCount`     | number         | no   | `0`         | 조회수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.                 |
| `commentCount`  | number         | no   | `0`         | 댓글 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.                |
| `likeCount`     | number         | no   | `0`         | 좋아요 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.              |
| `dislikeCount`  | number         | no   | `0`         | 싫어요 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.              |
| `bookmarkCount` | number         | no   | `0`         | 스크랩 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.              |
| `deleted`       | bool           | no   | `false`     | soft delete 여부. false를 허용해야 하므로 Nonfalsey를 사용하지 않습니다. |
| `deletedAt`     | date           | no   |             | 삭제 시각                                                                |

권장 인덱스:

```text
CREATE INDEX idx_posts_status_deleted ON posts (status, deleted);
```

추후 수동 검토 인덱스:

```text
CREATE INDEX idx_posts_type_status_created ON posts (type, status, created);
CREATE INDEX idx_posts_author_created ON posts (author, created);
```

주의: 현재 운영 PocketBase import에서는 `created` 시스템 필드 기반 인덱스가 import 단계에서 실패했으므로, 실제 필요 시 Admin UI 또는 서버 마이그레이션으로 별도 검토합니다.

API Rules:

```text
List rule: status = "published" && deleted = false || @request.auth.role = "admin"
View rule: status = "published" && deleted = false || author = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true
Update rule: (author = @request.auth.id && status != "hidden") || @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## comments

댓글/대댓글 컬렉션입니다.

필드:

| 필드            | 타입              | 필수 | 기본값      | 설명                                                                         |
| --------------- | ----------------- | ---- | ----------- | ---------------------------------------------------------------------------- |
| `post`          | relation posts    | yes  |             | 게시글                                                                       |
| `author`        | relation users    | yes  |             | 작성자                                                                       |
| `content`       | text              | yes  |             | 댓글 내용                                                                    |
| `parentComment` | relation comments | no   |             | 대댓글 부모                                                                  |
| `status`        | select            | yes  | `published` | `published`, `hidden`, `deleted`                                             |
| `likeCount`     | number            | no   | `0`         | 좋아요 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.                  |
| `dislikeCount`  | number            | no   | `0`         | 싫어요 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.                  |
| `deleted`       | bool              | no   | `false`     | soft delete 여부. `false` 값을 허용해야 하므로 Nonempty를 사용하지 않습니다. |
| `deletedAt`     | date              | no   |             | 삭제 시각                                                                    |

현재 import 적용 인덱스: 없음

추후 수동 검토 인덱스:

```text
CREATE INDEX idx_comments_post_created ON comments (post, created);
CREATE INDEX idx_comments_author_created ON comments (author, created);
```

API Rules:

```text
List rule: status = "published" && deleted = false || @request.auth.role = "admin"
View rule: status = "published" && deleted = false || author = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true
Update rule: author = @request.auth.id || @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## post_images

게시글/갤러리 이미지 컬렉션입니다.

필드:

| 필드        | 타입           | 필수 | 기본값  | 설명                                                                |
| ----------- | -------------- | ---- | ------- | ------------------------------------------------------------------- |
| `post`      | relation posts | yes  |         | 게시글                                                              |
| `image`     | file           | yes  |         | 이미지 파일                                                         |
| `alt`       | text           | no   |         | 대체 텍스트                                                         |
| `sortOrder` | number         | no   | `0`     | 정렬 순서. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.         |
| `isCover`   | bool           | no   | `false` | 대표 이미지. false를 허용해야 하므로 Nonfalsey를 사용하지 않습니다. |

API Rules:

```text
List rule: post.status = "published" && post.deleted = false || @request.auth.role = "admin"
View rule: post.status = "published" && post.deleted = false || post.author = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && post.author = @request.auth.id
Update rule: post.author = @request.auth.id || @request.auth.role = "admin"
Delete rule: post.author = @request.auth.id || @request.auth.role = "admin"
```

## reactions

좋아요/싫어요 컬렉션입니다.

필드:

| 필드         | 타입           | 필수 | 기본값 | 설명              |
| ------------ | -------------- | ---- | ------ | ----------------- |
| `targetType` | select         | yes  |        | `post`, `comment` |
| `targetId`   | text           | yes  |        | 대상 record id    |
| `user`       | relation users | yes  |        | 사용자            |
| `type`       | select         | yes  | `like` | `like`, `dislike` |

권장 인덱스:

```text
CREATE UNIQUE INDEX idx_reactions_unique ON reactions (targetType, targetId, user);
CREATE INDEX idx_reactions_target ON reactions (targetType, targetId);
```

API Rules:

```text
List rule: @request.auth.id != ""
View rule: user = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true && user = @request.auth.id
Update rule: null
Delete rule: user = @request.auth.id || @request.auth.role = "admin"
```

## bookmarks

게시글 스크랩 컬렉션입니다.

필드:

| 필드   | 타입           | 필수 | 기본값 | 설명   |
| ------ | -------------- | ---- | ------ | ------ |
| `post` | relation posts | yes  |        | 게시글 |
| `user` | relation users | yes  |        | 사용자 |

권장 인덱스:

```text
CREATE UNIQUE INDEX idx_bookmarks_unique ON bookmarks (post, user);
```

추후 수동 검토 인덱스:

```text
CREATE INDEX idx_bookmarks_user_created ON bookmarks (user, created);
```

API Rules:

```text
List rule: user = @request.auth.id || @request.auth.role = "admin"
View rule: user = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true && user = @request.auth.id
Update rule: null
Delete rule: user = @request.auth.id || @request.auth.role = "admin"
```

## reports

신고 컬렉션입니다.

필드:

| 필드         | 타입           | 필수 | 기본값    | 설명                                          |
| ------------ | -------------- | ---- | --------- | --------------------------------------------- |
| `targetType` | select         | yes  |           | `post`, `comment`, `user`                     |
| `targetId`   | text           | yes  |           | 대상 record id                                |
| `reporter`   | relation users | yes  |           | 신고자                                        |
| `reason`     | select         | yes  |           | 신고 사유                                     |
| `detail`     | text           | no   |           | 상세 설명                                     |
| `status`     | select         | yes  | `pending` | `pending`, `reviewed`, `rejected`, `resolved` |

API Rules:

```text
List rule: @request.auth.role = "admin"
View rule: reporter = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true && reporter = @request.auth.id
Update rule: @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## device_reports

모바일 디바이스별 웹 해상도 측정 데이터 컬렉션입니다.

필드:

| 필드               | 타입           | 필수 | 기본값      | 설명                                                                    |
| ------------------ | -------------- | ---- | ----------- | ----------------------------------------------------------------------- |
| `manufacturer`     | text           | yes  |             | 제조사                                                                  |
| `model`            | text           | yes  |             | 모델                                                                    |
| `screenWidth`      | number         | yes  |             | `window.screen.width`                                                   |
| `screenHeight`     | number         | yes  |             | `window.screen.height`                                                  |
| `windowWidthMin`   | number         | yes  |             | 작성 중 관측된 최소 `window.innerWidth`                                 |
| `windowWidthMax`   | number         | yes  |             | 작성 중 관측된 최대 `window.innerWidth`                                 |
| `windowHeightMin`  | number         | yes  |             | 작성 중 관측된 최소 `window.innerHeight`                                |
| `windowHeightMax`  | number         | yes  |             | 작성 중 관측된 최대 `window.innerHeight`                                |
| `devicePixelRatio` | number         | yes  |             | `window.devicePixelRatio`                                               |
| `orientation`      | select         | yes  | `portrait`  | `portrait`, `landscape`                                                 |
| `userAgent`        | text           | yes  |             | 브라우저 userAgent                                                      |
| `displaySetting`   | number         | no   | `0`         | Android 표시 크기 단계. iOS는 0으로 고정. PocketBase number 필드는 `0`을 required 값으로 안정적으로 통과시키기 어려우므로 필수값을 끄고 프론트 검증으로 보완합니다. |
| `description`      | text           | no   |             | 추가 설명                                                               |
| `author`           | relation users | yes  |             | 작성자                                                                  |
| `status`           | select         | yes  | `published` | `published`, `hidden`, `deleted`                                        |
| `deleted`          | bool           | no   | `false`     | soft delete 여부. false를 허용해야 하므로 required로 설정하지 않습니다. |
| `deletedAt`        | date           | no   |             | 삭제 시각                                                               |

API Rules:

```text
List rule: status = "published" && deleted = false || @request.auth.role = "admin"
View rule: status = "published" && deleted = false || author = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true
Update rule: (author = @request.auth.id && status != "hidden") || @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## pic_logs

하루 사진 로그 방 컬렉션입니다.

API Rules:

```text
List rule: status = "published" && deleted = false && (visibility = "public" || visibility = "link" || participants ?= @request.auth.id || author = @request.auth.id || @request.auth.role = "admin")
View rule: status = "published" && deleted = false && (visibility = "public" || visibility = "link" || participants ?= @request.auth.id || author = @request.auth.id || @request.auth.role = "admin" || (@request.auth.id != "" && @request.auth.verified = true && visibility != "private"))
Create rule: @request.auth.id != "" && @request.auth.verified = true
Update rule: (author = @request.auth.id && status != "hidden") || @request.auth.role = "admin" || (@request.auth.id != "" && @request.auth.verified = true && visibility != "private" && invitePassword = @request.body.invitePassword && @request.body.participants ?= @request.auth.id)
Delete rule: @request.auth.role = "admin"
```

## pic_log_entries

picLog 사진 항목 컬렉션입니다.

API Rules:

```text
List rule: deleted = false && log.status = "published" && log.deleted = false && (log.visibility = "public" || log.visibility = "link" || log.participants ?= @request.auth.id || log.author = @request.auth.id || @request.auth.role = "admin")
View rule: deleted = false && log.status = "published" && log.deleted = false && (log.visibility = "public" || log.visibility = "link" || log.participants ?= @request.auth.id || log.author = @request.auth.id || @request.auth.role = "admin")
Create rule: @request.auth.id != "" && @request.auth.verified = true && author = @request.auth.id
Update rule: author = @request.auth.id || log.author = @request.auth.id || @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

주의:

- PocketBase create rule에서 새로 생성되는 relation record의 `log.participants ?= @request.auth.id`처럼 연쇄 relation 조건을 평가하면 생성 요청이 400으로 막힐 수 있습니다. 생성 시에는 `author = @request.auth.id`를 API rule로 보장하고, 참여자 여부 검증은 프론트와 추후 hook에서 보완합니다.

## pic_log_comments

picLog 시간 챕터 댓글 컬렉션입니다.

API Rules:

```text
List rule: status = "published" && deleted = false && log.status = "published" && log.deleted = false && (log.visibility = "public" || log.visibility = "link" || log.participants ?= @request.auth.id || log.author = @request.auth.id || @request.auth.role = "admin")
View rule: status = "published" && deleted = false && log.status = "published" && log.deleted = false && (log.visibility = "public" || log.visibility = "link" || log.participants ?= @request.auth.id || log.author = @request.auth.id || @request.auth.role = "admin")
Create rule: @request.auth.id != "" && @request.auth.verified = true && author = @request.auth.id
Update rule: author = @request.auth.id || @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## pic_log_order_requests

picLog 참여자 순서 변경 요청 컬렉션입니다.

API Rules:

```text
List rule: log.participants ?= @request.auth.id || @request.auth.role = "admin"
View rule: log.participants ?= @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true && requester = @request.auth.id && requester != targetUser
Update rule: targetUser = @request.auth.id || @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## notices

공지 컬렉션입니다.

필드:

| 필드        | 타입        | 필수 | 기본값   | 설명                         |
| ----------- | ----------- | ---- | -------- | ---------------------------- |
| `title`     | text        | yes  |          | 제목                         |
| `content`   | editor/text | yes  |          | 내용                         |
| `placement` | select      | yes  | `global` | `global`, `board`, `gallery` |
| `active`    | bool        | yes  | `true`   | 활성 여부                    |
| `startsAt`  | date        | no   |          | 시작일                       |
| `endsAt`    | date        | no   |          | 종료일                       |

API Rules:

```text
List rule: active = true || @request.auth.role = "admin"
View rule: active = true || @request.auth.role = "admin"
Create rule: @request.auth.role = "admin"
Update rule: @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## notifications

사용자별 알림함 컬렉션입니다.

필드:

| 필드         | 타입 | 필수 | 기본값  | 설명                                                                                            |
| ------------ | ---- | ---- | ------- | ----------------------------------------------------------------------------------------------- |
| `recipient`  | text | yes  |         | 알림을 받을 사용자 id                                                                           |
| `actor`      | text | no   |         | 알림을 발생시킨 사용자 id                                                                       |
| `type`       | text | yes  |         | `post_comment`, `comment_reply`, `mention`, `pic_log_invite`, `pic_log_order_request`, `system` |
| `title`      | text | yes  |         | 알림 제목                                                                                       |
| `message`    | text | yes  |         | 알림 설명                                                                                       |
| `targetUrl`  | text | yes  |         | 클릭 시 이동할 프론트 경로                                                                      |
| `targetType` | text | yes  |         | `post`, `comment`, `picLog`, `picLogOrderRequest`, `system`                                     |
| `targetId`   | text | no   |         | 연결 대상 record id                                                                             |
| `isRead`     | bool | no   | `false` | 읽음 여부. false를 허용해야 하므로 required로 설정하지 않습니다.                                |
| `readAt`     | date | no   |         | 읽은 시각                                                                                       |
| `hidden`     | bool | no   | `false` | 사용자 숨김 여부. false를 허용해야 하므로 required로 설정하지 않습니다.                         |

권장 인덱스:

```text
CREATE INDEX idx_notifications_recipient_created ON notifications (recipient, created);
CREATE INDEX idx_notifications_recipient_read ON notifications (recipient, isRead);
```

API Rules:

```text
List rule: recipient = @request.auth.id || @request.auth.role = "admin"
View rule: recipient = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != ""
Update rule: recipient = @request.auth.id || @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

주의:

- 1차 프론트 구현은 댓글 작성, picLog 태그, picLog 순서 변경 요청 시 클라이언트에서 알림을 생성합니다.
- 운영 안정성을 높이려면 이후 PocketBase hook에서 알림 생성을 서버 책임으로 옮겨 중복 생성과 권한 우회를 방지합니다.
- 사용자가 자기 글 또는 자기 댓글에 직접 남긴 액션은 프론트에서 자기 알림을 만들지 않습니다.

## Turnstile 회원가입 서버 훅 개요

회원가입 요청 body의 `turnstileToken`을 읽어 Cloudflare Siteverify API로 검증합니다.

검증 실패 시:

- 회원 생성 중단
- 일반화된 오류 메시지 반환
- `turnstileToken`은 DB에 저장하지 않음

자세한 설정은 [turnstile-setup.md](/Users/anoju/git-workspace/anoju-react/docs/turnstile-setup.md)를 따릅니다.
