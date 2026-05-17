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

| 필드 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `name` | text | no |  | 실명 또는 표시 이름 |
| `nickname` | text | no |  | 서비스 표시 닉네임 |
| `avatar` | file | no |  | 프로필 이미지 |
| `bio` | text | no |  | 한 줄 소개 |
| `role` | select | yes | `user` | `user`, `admin` |
| `status` | select | yes | `active` | `active`, `suspended`, `withdrawn` |

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

| 필드 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `title` | text | yes |  | 제목 |
| `content` | editor/text | yes |  | 본문 |
| `type` | select | yes | `board` | `board`, `gallery` |
| `author` | relation users | yes |  | 작성자 |
| `status` | select | yes | `published` | `draft`, `published`, `hidden`, `deleted` |
| `tags` | json | no | `[]` | 태그 배열 |
| `viewCount` | number | no | `0` | 조회수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다. |
| `commentCount` | number | no | `0` | 댓글 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다. |
| `likeCount` | number | no | `0` | 좋아요 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다. |
| `bookmarkCount` | number | no | `0` | 스크랩 수. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다. |
| `deleted` | bool | no | `false` | soft delete 여부. false를 허용해야 하므로 Nonfalsey를 사용하지 않습니다. |
| `deletedAt` | date | no |  | 삭제 시각 |

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

| 필드 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `post` | relation posts | yes |  | 게시글 |
| `author` | relation users | yes |  | 작성자 |
| `content` | text | yes |  | 댓글 내용 |
| `parentComment` | relation comments | no |  | 대댓글 부모 |
| `status` | select | yes | `published` | `published`, `hidden`, `deleted` |
| `likeCount` | number | yes | `0` | 좋아요 수 |
| `deleted` | bool | yes | `false` | soft delete 여부 |
| `deletedAt` | date | no |  | 삭제 시각 |

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

| 필드 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `post` | relation posts | yes |  | 게시글 |
| `image` | file | yes |  | 이미지 파일 |
| `alt` | text | no |  | 대체 텍스트 |
| `sortOrder` | number | no | `0` | 정렬 순서. 0을 허용해야 하므로 Nonzero를 사용하지 않습니다. |
| `isCover` | bool | no | `false` | 대표 이미지. false를 허용해야 하므로 Nonfalsey를 사용하지 않습니다. |

API Rules:

```text
List rule: post.status = "published" && post.deleted = false || @request.auth.role = "admin"
View rule: post.status = "published" && post.deleted = false || post.author = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && post.author = @request.auth.id
Update rule: post.author = @request.auth.id || @request.auth.role = "admin"
Delete rule: post.author = @request.auth.id || @request.auth.role = "admin"
```

## reactions

좋아요 컬렉션입니다.

필드:

| 필드 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `targetType` | select | yes |  | `post`, `comment` |
| `targetId` | text | yes |  | 대상 record id |
| `user` | relation users | yes |  | 사용자 |
| `type` | select | yes | `like` | `like` |

권장 인덱스:

```text
CREATE UNIQUE INDEX idx_reactions_unique ON reactions (targetType, targetId, user, type);
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

| 필드 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `post` | relation posts | yes |  | 게시글 |
| `user` | relation users | yes |  | 사용자 |

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

| 필드 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `targetType` | select | yes |  | `post`, `comment`, `user` |
| `targetId` | text | yes |  | 대상 record id |
| `reporter` | relation users | yes |  | 신고자 |
| `reason` | select | yes |  | 신고 사유 |
| `detail` | text | no |  | 상세 설명 |
| `status` | select | yes | `pending` | `pending`, `reviewed`, `rejected`, `resolved` |

API Rules:

```text
List rule: @request.auth.role = "admin"
View rule: reporter = @request.auth.id || @request.auth.role = "admin"
Create rule: @request.auth.id != "" && @request.auth.verified = true && reporter = @request.auth.id
Update rule: @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## notices

공지 컬렉션입니다.

필드:

| 필드 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `title` | text | yes |  | 제목 |
| `content` | editor/text | yes |  | 내용 |
| `placement` | select | yes | `global` | `global`, `board`, `gallery` |
| `active` | bool | yes | `true` | 활성 여부 |
| `startsAt` | date | no |  | 시작일 |
| `endsAt` | date | no |  | 종료일 |

API Rules:

```text
List rule: active = true || @request.auth.role = "admin"
View rule: active = true || @request.auth.role = "admin"
Create rule: @request.auth.role = "admin"
Update rule: @request.auth.role = "admin"
Delete rule: @request.auth.role = "admin"
```

## Turnstile 회원가입 서버 훅 개요

회원가입 요청 body의 `turnstileToken`을 읽어 Cloudflare Siteverify API로 검증합니다.

검증 실패 시:

- 회원 생성 중단
- 일반화된 오류 메시지 반환
- `turnstileToken`은 DB에 저장하지 않음

자세한 설정은 [turnstile-setup.md](/Users/anoju/git-workspace/anoju-react2/docs/turnstile-setup.md)를 따릅니다.
