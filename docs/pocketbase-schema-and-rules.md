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
| `suspendedAt` | date | no | | 정지 처리 시각 |
| `suspendedUntil` | date | no | | 정지 만료 시각 |
| `suspendedReason` | text | no | | 정지 사유 |
| `suspendedBy` | relation users | no | | 정지 처리 관리자 |
| `adminMemo` | text | no | | 관리자 메모 |
| `warningCount` | number | no | `0` | 경고 횟수 |

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
| `type`          | select         | yes  | `board`     | `board`, `gallery`, `it_logs`                                            |
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
Create rule: @request.auth.id != "" && @request.auth.verified = true && (type != "it_logs" || @request.auth.role = "admin")
Update rule: (author = @request.auth.id && status != "hidden" && type != "it_logs") || @request.auth.role = "admin"
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
Create rule: @request.auth.id != "" && @request.auth.verified = true && (post.type != "it_logs" || @request.auth.role = "admin")
Update rule: (author = @request.auth.id && post.type != "it_logs") || @request.auth.role = "admin"
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
같은 사용자는 같은 대상에 좋아요와 싫어요 중 하나만 가질 수 있으며, 같은 반응을 다시 누르면 해당 반응 레코드를 삭제해 취소합니다. 좋아요에서 싫어요로 전환하거나 반대로 전환할 때도 기존 반응 레코드를 삭제한 뒤 새 반응 레코드를 생성합니다.

`reactions`는 토글 상태를 나타내는 휘발성 데이터이므로 다른 컬렉션에서 필수 relation으로 참조하지 않습니다. 알림, 활동 로그, 감사 로그처럼 반응 사실을 남겨야 하는 컬렉션은 `reaction` relation 대신 `actor`, `targetType`, `targetId`, `type` 같은 스냅샷 값을 저장합니다. 운영 PocketBase에서 `reactions`를 required relation으로 참조하는 필드가 있으면 반응 취소 DELETE가 400 오류로 막히므로 해당 필드를 optional로 바꾸거나 스냅샷 필드로 분리해야 합니다.

필드:

| 필드         | 타입           | 필수 | 기본값 | 설명              |
| ------------ | -------------- | ---- | ------ | ----------------- |
| `targetType` | select         | yes  |        | `post`, `comment`, `clip`, `clip_comment` |
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
| `targetType` | select         | yes  |           | `post`, `comment`, `pics`, `picLog`, `clip`, `clip_comment`, `user` |
| `targetId`   | text           | yes  |           | 대상 record id                                |
| `reporter`   | relation users | yes  |           | 신고자                                        |
| `reason`     | select         | yes  |           | `spam`, `abuse`, `sexual`, `violence`, `illegal`, `privacy`, `copyright`, `other` |
| `detail`     | text           | no   |           | 상세 설명                                     |
| `status`     | select         | yes  | `pending` | `pending`, `reviewing`, `reviewed`, `resolved`, `rejected` |
| `handledBy`  | relation users | no   |           | 처리 관리자                                   |
| `handledAt`  | date           | no   |           | 처리 시각                                     |
| `resolution` | text           | no   |           | 처리 결과                                     |
| `adminMemo`  | text           | no   |           | 관리자 메모                                   |

API Rules:

```text
List rule: @request.auth.role = "admin"
View rule: reporter = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true && reporter = @request.auth.id
Update rule: @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

운영 규칙:

- 로그인 및 이메일 인증 완료 사용자만 신고할 수 있습니다.
- 본인이 작성한 대상은 신고할 수 없습니다.
- 같은 사용자는 같은 대상에 중복 신고할 수 없습니다.
- 신고 접수만으로 자동 삭제하지 않고, 관리자 검토 후 숨김, 삭제, 회원 경고, 회원 정지, 기각, 메모 기록 중 하나로 조치합니다.
- 중복 신고 방지를 위해 `targetType`, `targetId`, `reporter` 조합의 unique 인덱스를 권장합니다.

## content_settings

게시판/갤러리 운영 설정 컬렉션입니다. 현재 존재하는 모든 게시판/갤러리와 추후 추가되는 모든 게시판/갤러리는 이 컬렉션에 등록합니다.

필드:

| 필드 | 타입 | 필수 | 기본값 | 설명 |
| ---- | ---- | ---- | ------ | ---- |
| `contentKey` | text | yes | | `freeBoard`, `deviceInfo`, `devLog`, `pics`, `picLog`, `clips`와 추후 추가 키 |
| `label` | text | yes | | 관리자 화면 노출명 |
| `group` | select | yes | | `lounge`, `snaps` |
| `contentType` | select | yes | | `board`, `gallery` |
| `listPath` | text | yes | | 목록 경로 |
| `writePermission` | select | yes | `verifiedUser` | `adminOnly`, `verifiedUser`, `user`, `closed` |
| `editPermission` | select | yes | `authorAndAdmin` | `authorAndAdmin`, `adminOnly`, `closed` |
| `deletePermission` | select | yes | `authorAndAdmin` | `authorAndAdmin`, `adminOnly` |
| `viewPermission` | select | yes | `public` | `public`, `user`, `verifiedUser`, `adminOnly` |
| `showComments` | bool | no | `true` | 댓글 영역 노출 여부 |
| `allowComments` | bool | no | `true` | 댓글 작성 허용 여부 |
| `showReactions` | bool | no | `true` | 좋아요/싫어요 노출 여부 |
| `allowReactions` | bool | no | `true` | 좋아요/싫어요 사용 허용 여부 |
| `showShare` | bool | no | `true` | 공유하기 노출 여부 |
| `showReport` | bool | no | `true` | 신고하기 노출 여부 |
| `showInList` | bool | no | `true` | 목록 노출 여부 |
| `status` | select | yes | `active` | `active`, `readonly`, `hidden` |

권장 인덱스:

```text
CREATE UNIQUE INDEX idx_content_settings_key ON content_settings (contentKey);
CREATE INDEX idx_content_settings_group ON content_settings (group);
```

API Rules:

```text
List rule: @request.auth.role = "admin"
View rule: @request.auth.role = "admin"
Create rule: @request.auth.role = "admin"
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

## clips

Snaps 하위 동영상 게시판 컬렉션입니다. 일반 회원은 로그인 및 이메일 인증 완료 후 작성할 수 있고, 수정/삭제는 작성자 본인과 관리자만 가능합니다.

필드:

| 필드           | 타입           | 필수 | 기본값      | 설명                                                                    |
| -------------- | -------------- | ---- | ----------- | ----------------------------------------------------------------------- |
| `title`        | text           | yes  |             | 동영상 제목                                                             |
| `description`  | text           | yes  |             | 동영상 설명                                                             |
| `video`        | file           | yes  |             | `mp4`, `webm`, `mov`, 원본 입력 최대 300MB                              |
| `poster`       | file           | no   |             | 썸네일 이미지. `jpg`, `png`, `webp`, 최대 5MB                           |
| `author`       | relation users | yes  |             | 작성자                                                                  |
| `status`       | select         | yes  | `published` | `published`, `hidden`, `deleted`                                        |
| `tags`         | json           | no   | `[]`        | 태그 배열                                                               |
| `viewCount`    | number         | no   | `0`         | 조회수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.                |
| `likeCount`    | number         | no   | `0`         | 좋아요 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.             |
| `dislikeCount` | number         | no   | `0`         | 싫어요 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.             |
| `deleted`      | bool           | no   | `false`     | soft delete 여부. false를 허용해야 하므로 required로 설정하지 않습니다. |
| `deletedAt`    | date           | no   |             | 삭제 시각                                                               |
| `created`      | autodate       | no   |             | 생성 시각                                                               |
| `updated`      | autodate       | no   |             | 수정 시각                                                               |

API Rules:

```text
List rule: status = "published" && deleted = false || @request.auth.role = "admin"
View rule: status = "published" && deleted = false || author = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true
Update rule: (author = @request.auth.id && status != "hidden") || @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## clip_comments

Clips 상세 댓글 컬렉션입니다. 로그인 및 이메일 인증 완료 회원만 작성할 수 있고, 댓글 수정/삭제는 작성자 본인과 관리자만 가능합니다. 삭제는 soft delete로 숨김 처리합니다.

필드:

| 필드        | 타입           | 필수 | 기본값      | 설명                                                                    |
| ----------- | -------------- | ---- | ----------- | ----------------------------------------------------------------------- |
| `clip`      | relation clips | yes  |             | 댓글이 달린 Clips                                                       |
| `author`    | relation users | yes  |             | 작성자                                                                  |
| `content`   | text           | yes  |             | 댓글 내용, 최대 1000자                                                  |
| `parentComment` | relation clip_comments | no |       | 대댓글 부모                                                             |
| `status`    | select         | yes  | `published` | `published`, `hidden`, `deleted`                                        |
| `likeCount` | number         | no   | `0`         | 좋아요 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.             |
| `dislikeCount` | number      | no   | `0`         | 싫어요 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다.             |
| `deleted`   | bool           | no   | `false`     | soft delete 여부. false를 허용해야 하므로 required로 설정하지 않습니다. |
| `deletedAt` | date           | no   |             | 삭제 시각                                                               |
| `created`   | autodate       | no   |             | 생성 시각                                                               |
| `updated`   | autodate       | no   |             | 수정 시각                                                               |

API Rules:

```text
List rule: status = "published" && deleted = false && clip.status = "published" && clip.deleted = false || @request.auth.role = "admin"
View rule: status = "published" && deleted = false && clip.status = "published" && clip.deleted = false || author = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true && clip.status = "published" && clip.deleted = false
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
Update rule: (author = @request.auth.id && status != "hidden") || @request.auth.role = "admin" || (@request.auth.id != "" && @request.auth.verified = true && visibility != "private" && invitePassword = @request.body.invitePassword)
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

- 댓글/답글/댓글 `@nickname` 멘션 알림은 `comment_notifications.pb.js` hook에서 서버 책임으로 생성합니다.
- 일반 회원은 `users` list rule이 막혀 다른 회원 닉네임을 직접 검색할 수 없으므로, 멘션 대상 매칭은 클라이언트가 아니라 서버 hook에서 처리해야 합니다.
- picLog 태그와 picLog 순서 변경 요청 알림은 1차 구현 범위에서 클라이언트 생성을 유지하되, 운영 안정화 시 서버 hook으로 옮깁니다.
- 사용자가 자기 글 또는 자기 댓글에 직접 남긴 액션은 프론트에서 자기 알림을 만들지 않습니다.

## Turnstile 회원가입 서버 훅 개요

회원가입 요청 body의 `turnstileToken`을 읽어 Cloudflare Siteverify API로 검증합니다.

검증 실패 시:

- 회원 생성 중단
- 일반화된 오류 메시지 반환
- `turnstileToken`은 DB에 저장하지 않음

자세한 설정은 [turnstile-setup.md](/Users/anoju/git-workspace/anoju-react/docs/turnstile-setup.md)를 따릅니다.
