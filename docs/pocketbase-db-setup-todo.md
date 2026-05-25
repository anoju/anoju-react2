# PocketBase DB 설정 체크리스트

PocketBase Admin UI에서 실제 DB/인증/보안 설정을 진행하기 위한 체크리스트입니다. 작업이 끊기면 마지막 미완료 항목부터 이어서 진행합니다.

## 진행 메모

- 2026-05-17: NAS PocketBase 서버 `https://pocketbase.anoju.synology.me` 헬스체크 성공을 확인했습니다.
- 2026-05-17: 프론트 `.env`에 `VITE_PB_URL=https://pocketbase.anoju.synology.me`를 추가했습니다.
- 2026-05-17: DB 설정 전용 체크리스트와 상세 스키마 문서 작성을 시작했습니다.
- 2026-05-17: PocketBase 컬렉션/필드/API Rules 상세 문서를 작성하고, 프론트 컬렉션 상수와 도메인 타입을 보강했습니다.
- 2026-05-17: Chrome의 PocketBase Admin UI에서 import collections로 도메인 컬렉션 7개를 생성했습니다.
- 2026-05-17: PocketBase import 제약에 맞춰 내부 collection/field id를 15자 이하로 정리하고, `created` 기반 보조 인덱스는 추후 수동 검토로 분리했습니다.
- 2026-05-17: 프론트 운영 도메인을 `https://anoju.synology.me`, PocketBase 운영 도메인을 `https://pocketbase.anoju.synology.me`로 분리 관리하도록 정리했습니다.
- 2026-05-17: PocketBase `users` 컬렉션 OAuth2 설정에 Google provider를 등록했습니다. Secret 값은 문서/코드에 저장하지 않았습니다.
- 2026-05-17: PocketBase `users` 컬렉션 OAuth2 설정에 Naver를 OpenID Connect provider(`oidc`)로 등록했습니다. Secret 값은 문서/코드에 저장하지 않았습니다.
- 2026-05-17: Naver/Kakao 이메일 미제공 시 provider 사용자 id 기반 가상 이메일 정책을 확정했습니다.
- 2026-05-17: PocketBase `users` 컬렉션 OAuth2 설정에 Kakao provider를 등록했습니다. 현재 Kakao 앱은 이메일 제공이 제한될 수 있어 가상 이메일 hook 구현이 필요합니다.
- 2026-05-17: Naver/Kakao 가상 이메일 생성을 위한 `pb_hooks/oauth_virtual_email.pb.js` 원본 파일과 운영 문서를 추가했습니다.

## 1단계: 서버 및 환경 변수

- [x] PocketBase 서버 헬스체크
- [x] 프론트 `.env`의 `VITE_PB_URL` 설정
- [ ] PocketBase SMTP 설정
- [x] 프론트 운영 도메인 확인: `https://anoju.synology.me`
- [x] PocketBase 운영 도메인 확인: `https://pocketbase.anoju.synology.me`
- [ ] Cloudflare Turnstile Secret key 서버 환경 변수 등록
- [ ] Google/Naver/Kakao OAuth provider 키 등록
  - [x] Google provider 키 등록
  - [x] Naver provider 키 등록
  - [x] Kakao provider 키 등록

## 2단계: users 인증 컬렉션 설정

- [ ] 이메일/비밀번호 로그인 활성화
- [ ] 이메일 인증 활성화
- [ ] 비밀번호 재설정 메일 템플릿 확인
- [ ] 이메일 인증 메일 템플릿 확인
- [x] `name` 필드 추가
- [ ] `nickname` 필드 추가
- [x] `avatar` 파일 필드 추가
- [ ] `bio` 필드 추가
- [ ] `role` 필드 추가
- [ ] `status` 필드 추가
- [ ] users API Rules 설정

## 3단계: 봇/스팸 방지

- [ ] 회원가입 create hook에서 `turnstileToken` 읽기
- [ ] Cloudflare Siteverify 검증
- [ ] 검증 실패 시 회원 생성 차단
- [ ] `turnstileToken`이 DB 필드로 저장되지 않도록 처리
- [ ] 일회용 이메일 도메인 blacklist 정책 적용
- [ ] 가입 요청 rate limit 정책 적용

## 4단계: 소셜 로그인

- [x] Google OAuth provider 활성화
- [x] Naver OAuth provider 활성화
- [x] Kakao OAuth provider 활성화
- [x] 각 provider redirect URL 확인
- [ ] 소셜 로그인 후 이메일 제공 여부 확인
- [x] Naver/Kakao 가상 이메일 생성 hook 원본 구현
- [ ] Naver/Kakao 가상 이메일 생성 hook NAS 서버 반영
- [x] 가상 이메일 계정의 실제 이메일 등록/인증 UX 구현
- [ ] 소셜 계정 연결/해제 동작 확인

## 5단계: 도메인 컬렉션 생성

- [x] `posts`
- [x] `comments`
- [x] `post_images`
- [x] `reactions`
- [x] `bookmarks`
- [x] `reports`
- [x] `notices`
- [x] `notifications`

## 5.5단계: 프론트 타입/상수

- [x] 컬렉션명 상수 추가
- [x] 사용자 상태/역할 타입 추가
- [x] 게시글 타입/상태 타입 추가
- [x] 댓글 상태 타입 추가
- [x] 신고/공지 타입 추가
- [x] 도메인 API 컬렉션명 상수 연결

## 6단계: API Rules

- [x] 공개 읽기 정책
- [x] 로그인 사용자 작성 정책
- [x] 이메일 인증 사용자 쓰기 정책
- [x] 본인 수정/삭제 정책
- [x] 관리자 관리 정책
- [x] soft delete 정책
- [x] 신고/공지 관리자 정책
- [ ] `created` 정렬 보조 인덱스 수동 추가 검토

## 7단계: 프론트 연동 확인

- [ ] 회원가입 실제 성공 확인
- [ ] 이메일 인증 메일 발송 확인
- [ ] 로그인 성공 확인
- [ ] 마이페이지 사용자 정보 조회 확인
- [ ] Google 로그인 확인
- [ ] Naver 로그인 확인
- [ ] Kakao 로그인 확인
- [ ] 게시글 목록 조회 확인
- [ ] 게시글 작성 확인
- [ ] 댓글 작성 확인
- [ ] 알림함 목록/읽음 처리 확인
- [ ] 파일 업로드 확인
