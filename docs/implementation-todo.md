# 구현 진행 체크리스트

이 문서는 구현 작업을 단계별로 추적하기 위한 체크리스트입니다. 작업을 시작하면 해당 항목을 진행 중 메모로 남기고, 완료 시 체크합니다.

## 진행 규칙

- [x] 구현 요청을 받은 뒤 이 문서의 체크리스트 순서대로 진행합니다.
- [x] 진행 중인 항목은 필요 시 하위 메모를 추가합니다.
- [x] 완료한 항목은 `[x]`로 체크합니다.
- [x] 중단 후 재개할 때는 마지막으로 체크되지 않은 항목부터 확인합니다.
- [x] 설계 변경이 필요하면 구현을 멈추고 `plan.md`, `AGENTS.md`를 먼저 업데이트합니다.

## 현재 진행 메모

- 2026-05-16: 구현 시작. 현재 프로젝트 구조, 패키지, 기존 라우팅/레이아웃/스타일 파일을 확인했습니다.
- 2026-05-16: `zustand`, `pocketbase`는 미설치 상태라 설치 진행 대상으로 확정했습니다.
- 2026-05-16: `zustand`, `pocketbase` 설치를 완료했습니다. `npm audit` 기준 취약점 알림은 별도 보안 점검 항목으로 남깁니다.
- 2026-05-16: 공통 폴더, 스타일 토큰, Zustand 스토어, routeConfig, 인증 가드, AppHeader/FloatingMenu/Page 레이아웃, 기본 페이지를 1차 구현했습니다.
- 2026-05-16: `npm run build` 검증을 통과했습니다.
- 2026-05-16: `npm run lint` 검증을 통과했습니다.
- 2026-05-16: 기존 `BaseLayout`과 컴포넌트 내부 SCSS 잔여 파일을 제거해 새 레이아웃/스타일 정책과 충돌하지 않도록 정리했습니다.
- 2026-05-16: 로컬 브라우저에서 홈 화면 DOM, 헤더, 하단 플로팅 메뉴 렌더링을 확인했습니다.
- 2026-05-16: 설정 화면을 추가해 전체메뉴에서 테마/글자모드를 변경할 수 있도록 구현했습니다.
- 2026-05-16: 공통 UI 1차 목록의 폼/선택 컴포넌트(`Input`, `TextArea`, `Checkbox`, `Radio`, `Switch`, `Tabs`, `Select`)를 구현했습니다.
- 2026-05-16: 피드백 UI(`Dialog`, `Alert`, `Confirm`, `Toast`, `BottomSheet`)와 `alert()`, `confirm()`, `toast()` 명령형 헬퍼를 구현했습니다.
- 2026-05-16: `DataList`, 인증 API, 도메인 CRUD API 초안, 검색/필터/정렬 URL 동기화, 파일 업로드 정책, 캐시/실시간 정책, 작성/수정/삭제 UX 공통 훅을 구현했습니다.
- 2026-05-16: `/my-page` 미로그인 접근 시 로그인 화면 이동, `/settings` 테마/글자모드 컨트롤 렌더링을 브라우저에서 확인했습니다.

## 1단계: 프로젝트 기반 정리

- [x] 현재 프로젝트 구조 확인
- [x] 패키지 현황 확인
- [x] 필요한 의존성 목록 확정
- [x] `zustand` 설치 여부 확인
- [x] `lucide-react` 설치 여부 확인
- [x] PocketBase SDK 설치 여부 확인
- [x] 기존 파일/폴더와 설계 충돌 여부 확인
- [x] 구현 브랜치/작업 범위 확인

## 2단계: 폴더 구조 생성

- [x] `src/apis`
- [x] `src/data`
- [x] `src/types`
- [x] `src/constants`
- [x] `src/utils`
- [x] `src/hooks`
- [x] `src/lib`
- [x] `src/routes`
- [x] `src/stores`
- [x] `src/assets/styles/base`
- [x] `src/assets/styles/layout`
- [x] `src/assets/styles/components`
- [x] `src/assets/styles/pages`

## 3단계: 스타일 기반 구축

- [x] `src/assets/styles/base/_tokens.scss`
- [x] `src/assets/styles/base/_variables.scss`
- [x] `src/assets/styles/base/_mixins.scss`
- [x] 전역 SCSS 엔트리 구성
- [x] `data-theme` 토큰 구조 작성
- [x] `data-font-mode` 토큰 구조 작성
- [x] CSS 변수 네이밍 반영
- [x] light/dark 토큰 반영
- [x] small/base/large 글자모드 반영
- [x] layout offset 토큰 반영

## 4단계: 전역 상태 구축

- [x] `authStore.ts`
- [x] `themeStore.ts`
- [x] `layoutStore.ts`
- [x] `appStore.ts`
- [x] 테마 변경 시 `html[data-theme]` 반영
- [x] 글자모드 변경 시 `html[data-font-mode]` 반영
- [x] 레이아웃 재계산 트리거 설계
- [x] PocketBase authStore 동기화 준비

## 5단계: 라우팅 기반 구축

- [x] `routeConfig.ts` 타입 정의
- [x] `BackButtonConfig` 정의
- [x] `RouteMeta` 정의
- [x] `LayoutMeta` 정의
- [x] 기본 라우트 `/home`
- [x] 기본 라우트 `/login`
- [x] 기본 라우트 `/menu`
- [x] 기본 라우트 `/my-page`
- [x] `requiresAuth` 처리 준비
- [x] `roles`, `adminOnly` 확장 필드 준비
- [x] `meta.title`, `description`, `robots` 반영

## 6단계: 인증 가드 구축

- [x] `authGuard.ts`
- [x] 미로그인 접근 처리
- [x] 로그인 후 redirect 복귀 처리
- [x] 이메일 미인증 상태 처리
- [x] 정지 사용자 상태 처리
- [x] 탈퇴 사용자 상태 처리
- [x] 인증 초기화 중 `PageLoading` 처리

## 7단계: 공통 UI 1차 구현

- [x] `Button`
- [x] `IconButton`
- [x] `Img`
- [x] `Input`
- [x] `TextArea`
- [x] `Checkbox`
- [x] `Radio`
- [x] `Switch`
- [x] `Tabs`
- [x] `Select` 단순형
- [x] `Spinner`
- [x] `PageLoading`
- [x] `EmptyState`
- [x] `ErrorState`
- [x] `VisuallyHidden`

## 8단계: 피드백 UI 구현

- [x] `Dialog`
- [x] `Alert`
- [x] `Confirm`
- [x] `Toast`
- [x] `BottomSheet`
- [x] `alert()` 명령형 헬퍼
- [x] `confirm()` 명령형 헬퍼
- [x] 포커스 트랩
- [x] ESC/오버레이 닫기 정책
- [x] 닫힌 뒤 포커스 복귀

## 9단계: 전역 레이아웃 구현

- [x] `Page`
- [x] `AppHeader`
- [x] `FloatingMenu`
- [x] routeConfig 기반 header 렌더링
- [x] routeConfig 기반 floating menu 렌더링
- [x] backButton `history` 처리
- [x] backButton `route` 처리
- [x] backButton `custom/actionKey` 처리
- [x] 스크롤 방향 감지
- [x] 헤더 숨김/노출 인터랙션
- [x] 플로팅 메뉴 숨김/노출 인터랙션
- [x] 상하단 fixed area offset 계산

## 10단계: DataList 구현

- [x] `DataList` 기본 구조
- [x] `mode="infinite"`
- [x] `mode="loadMore"`
- [x] `loadingInitial`
- [x] `loadingMore`
- [x] `hasMore`
- [x] `error`
- [x] `empty`
- [x] 하단 재시도 액션
- [x] 중복 호출 방지
- [x] IntersectionObserver cleanup
- [x] 글자모드 변경 시 위치 재계산

## 11단계: API 기반 구축

- [x] `apiClient.ts`
- [x] PocketBase client 생성
- [x] `.env`의 `VITE_PB_URL` 사용
- [x] `apiError.ts`
- [x] `AppErrorCode`
- [x] `AppError`
- [x] PocketBase 에러 변환
- [x] 인증 만료 공통 처리
- [x] 사용자 한글 메시지 변환

## 12단계: 인증 API 구현

- [x] 로그인
- [x] 로그아웃
- [x] 회원가입
- [x] 이메일 인증 요청
- [x] 비밀번호 재설정 요청
- [x] SNS 로그인 준비
- [x] authStore 동기화
- [x] 로그인 성공 redirect 처리

## 13단계: 기본 페이지 구현

- [x] `src/pages/Home/Index.tsx`
- [x] `src/pages/Login/Index.tsx`
- [x] `src/pages/Menu/Index.tsx`
- [x] `src/pages/MyPage/Index.tsx`
- [x] `src/pages/Settings/Index.tsx`
- [x] 전체메뉴 설정 링크 추가
- [x] 설정 화면 테마 변경
- [x] 설정 화면 글자모드 변경
- [x] 각 페이지 메타 적용
- [x] 각 페이지 routeConfig 연결
- [x] 보호 페이지 인증 확인

## 14단계: 도메인 API 초안

- [x] `userApi.ts`
- [x] `postApi.ts`
- [x] `commentApi.ts`
- [x] `reactionApi.ts`
- [x] `bookmarkApi.ts`
- [x] `reportApi.ts`
- [x] `noticeApi.ts`
- [x] 목록 조회
- [x] 상세 조회
- [x] 생성/수정/삭제 기본 함수

## 15단계: 작성/수정/삭제 UX

- [x] 작성 폼 기본 구조
- [x] 수정 폼 기본 구조
- [x] 작성 중 이탈 감지
- [x] 이탈 전 `Confirm`
- [x] 저장 성공 `Toast`
- [x] 삭제 전 `Confirm`
- [x] soft delete 처리
- [x] 삭제 후 목록 이동
- [x] 관리자 hard delete 추후 확장 지점 표시

## 16단계: 검색/필터/정렬

- [x] query string 유틸
- [x] 검색어 URL 동기화
- [x] 태그 URL 동기화
- [x] 정렬 URL 동기화
- [x] debounce 검색
- [x] 필터 변경 시 DataList 초기화
- [x] EmptyState 처리
- [x] ErrorState 처리

## 17단계: 파일 업로드

- [x] 확장자 검증
- [x] 용량 검증
- [x] 프로필 이미지 제한
- [x] 게시글 이미지 제한
- [x] 미리보기
- [x] 업로드 실패 Toast
- [x] `Img` 렌더링 연결
- [x] 다중 이미지 sortOrder
- [x] 대표 이미지 isCover

## 18단계: 캐시/실시간

- [x] 생성 후 목록 무효화
- [x] 수정 후 상세/목록 갱신
- [x] 삭제 후 목록 갱신
- [x] 좋아요 낙관적 업데이트
- [x] 스크랩 낙관적 업데이트
- [x] 실패 시 rollback
- [x] 댓글 subscribe
- [x] 카운트 subscribe 후보 처리
- [x] 구독 cleanup

## 19단계: 접근성/인터랙션 검증

- [x] 키보드 탐색
- [x] 포커스 이동
- [x] Dialog/Alert/Confirm 포커스
- [x] IconButton 접근성 이름
- [x] Img alt
- [x] 스크롤 숨김/노출 인터랙션
- [x] reduced motion 고려
- [x] 모바일 터치 타깃 확인

## 20단계: 최종 검증

- [x] TypeScript 검사
- [x] 수정 파일 lint
- [x] 라우팅 동작 확인
- [x] 인증 가드 확인
- [x] 테마 전환 확인
- [x] 글자모드 전환 확인
- [x] 모바일 레이아웃 확인
- [x] DataList 동작 확인
- [x] API 에러 처리 확인
- [x] 주요 플로우 수동 QA
