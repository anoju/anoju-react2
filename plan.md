# Anoju 프로젝트 구성 계획 (Project Setup Plan)

## 1. 프로젝트 초기화 (Project Initialization)

가장 빠르고 모던한 개발 경험을 제공하는 빌드 툴을 사용합니다.

- **스택:** **Vite + React + TypeScript + SCSS + ahooks + Framer Motion**
- **백엔드:** **PocketBase (BaaS)** - 시놀로지 NAS Docker 환경 기반의 자체 호스팅 백엔드 사용.
- **장점:** 기존 Create React App(CRA) 대비 압도적으로 빠른 로컬 서버 구동 및 빌드 속도
- **패키지 매니저:** `npm` (또는 프로젝트에 맞는 패키지 매니저 사용)
- **모바일 최우선 (Mobile First):** 모바일 기기 사용자 경험을 최우선으로 설계하며, 반응형 디자인 반영.

## 2. 디자인 컨셉 (Design Concept)

'Anoju'라는 브랜드명에 맞춰 사용자를 포근하게 감싸안는 느낌과 현대적인 사용성을 결합합니다.

- **방향**: **Warm Minimalism** (감성적 여백) + **Modern Essential** (직관적 기능성).
- **포인트 컬러**: **퍼플(Purple/Violet)** 계열을 시그니처 컬러로 사용합니다.
- **시각적 특징**: 부드러운 곡선(Rounded Corners), 적절한 여백, 글래스모피즘(Glassmorphism) 효과 활용.

## 3. 테마 지원 (Theme Management)

사용자 환경에 최적화된 다크/라이트 테마와 글자모드를 완벽하게 지원합니다.

- **테마 모드 구성**:
  - **라이트(Light)**: 따뜻한 화이트/베이지 톤의 배경.
  - **다크(Dark)**: 깊이 있는 차콜/네이비 톤의 배경.
  - **시스템 설정(Auto)**: OS 설정에 따라 자동으로 전환 (기본값).
- **글자모드 구성**:
  - **작게(Small)**: 정보 밀도가 높은 화면이나 작은 글자를 선호하는 사용자용.
  - **기본(Base)**: 서비스 기본 글자 크기.
  - **크게(Large)**: 가독성을 우선하는 사용자용.
- **기술 구현**: `html` 요소의 `data-theme`, `data-font-mode` 속성과 CSS 변수(Custom Properties)를 활용하여 실시간 전환에 대응합니다.
- **속성 예시**: 테마는 `data-theme="light|dark|auto"`, 글자모드는 `data-font-mode="small|base|large"` 형태를 기준으로 설계합니다.
- **CSS 변수 단일 출처**: 색상, 배경, 테두리, 그림자, 타이포그래피, 간격, 고정 영역 오프셋 등 디자인 토큰 CSS 변수는 `src/assets/styles/base/_tokens.scss`에서만 정의하고 추가/수정합니다.
- **테마별 변수 오버라이드**: 라이트/다크 및 글자모드별 차이는 `src/assets/styles/base/_tokens.scss` 안에서 `:root`, `[data-theme="dark"]`, `[data-font-mode="small"]`, `[data-font-mode="large"]` 범위로 관리합니다.
- **토큰 사용 원칙**: 컴포넌트와 페이지 스타일은 하드코딩된 색상/글자 크기/간격 대신 `var(--color-*)`, `var(--font-size-*)`, `var(--line-height-*)`, `var(--spacing-*)`, `var(--layout-*)` 등 토큰을 참조합니다.
- **글자모드 레이아웃 대응**: 글자모드 변경으로 높이, 줄 수, sticky 위치, 하단 고정 영역, 플로팅 버튼 위치가 달라질 수 있으므로 관련 컴포넌트는 현재 크기와 오프셋을 다시 계산할 수 있는 구조로 설계합니다.
- **이미지 테마 대응**: 라이트/다크 모드별 이미지가 별도로 존재할 수 있으므로 모든 이미지는 공통 `Img` 컴포넌트를 통해 렌더링하고, 테마별 이미지 소스와 `alt`를 일관되게 관리합니다.

## 4. 언어 및 주석 규칙 (Language & Commenting)

- **기본 언어:** 프로젝트 내의 모든 설명, README, 코드 내 주석은 반드시 **한글(Korean)**로 작성합니다.
- **표현 방식:** 명확하고 일관된 한글 가이드를 제공합니다.

## 5. 파일 및 폴더 구조화 (File & Folder Organization)

모든 시스템은 파일 증가에 대비하여 체계적으로 폴더화하여 관리합니다.

### 5.1 스타일링 (SCSS)

- **구조화:** 모든 SCSS 파일은 반드시 `src/assets/styles` 아래 기능별 서브 폴더를 생성하여 한곳에서 관리합니다.
  - `/base`: 리셋, 전역 변수, 믹스인
  - `/layout`: 헤더, 푸터, 레이아웃 관련 스타일
  - `/components`: 공통 컴포넌트 스타일
  - `/pages`: 각 페이지 전용 스타일
- **SCSS 위치 제한:** 컴포넌트 폴더, 페이지 폴더, 기능 폴더 내부에는 SCSS 파일을 생성하지 않습니다.
- **CSS 변수 관리:** CSS 변수는 `src/assets/styles/base/_tokens.scss`에서만 정의/수정하며, 다른 SCSS 파일에서는 정의를 추가하지 않고 참조만 합니다.
- **디자인 시스템 준수:**
  - 모든 수치(간격, 여백)는 `$spacing-*` 규격 변수를 사용합니다.
  - 모든 텍스트 스타일 세트는 `@include text-style($typo-*)` 믹스인을 사용합니다.
  - 컴포넌트 내 인라인 스타일(`style={{...}}`)은 절대 금지합니다.
- **네이밍:** **BEM (Block Element Modifier)** 방식 엄격 준수.
- **최신 문법 준수 (Sass Modules & Modernization):**
  - `@import` 대신 **`@use`** 및 **`@forward`** 사용을 필수화합니다.
  - 나눗셈 연산 시 `/` 연산자 대신 **`math.div()`** 사용을 권장합니다.
  - 내장 함수 사용 시 관련 모듈(`sass:color`, `sass:map` 등)을 명시적으로 불러와 사용하며, 레거시 함수 대신 최신 함수를 지향합니다.

### 5.2 에셋 (Assets)

- **이미지 관리:** `src/assets/images` 폴더를 생성하고 용도별로 하위 폴더를 두어 관리합니다.
- **통합 에셋 관리:** 미디어 파일과 스타일 파일을 `src/assets` 아래에 통합하여 중앙 집중형 관리를 지향합니다.
  - `/icons`: 아이콘 이미지
  - `/logos`: 로고 및 브랜드 이미지
  - `/contents`: 게시글 및 페이지 콘텐츠용 이미지
- **기타 에셋:** 폰트(`assets/fonts`), 데이터 파일 등도 각각 폴더별로 구분합니다.

### 5.3 공통 폴더 및 화면 구조

- **공통 요소 관리:** 여러 화면과 기능에서 공유되는 요소는 `src` 바로 아래의 역할별 폴더에서 관리합니다.
  - `/apis`: PocketBase API 호출 및 서버 통신 함수
  - `/data`: 공통 정적 데이터, 메뉴 목록, 옵션, mock 데이터
  - `/types`: 공통 타입, API 응답 타입, 도메인 타입
  - `/constants`: 라우트 경로, 스토리지 키, 공통 상수
  - `/utils`: 순수 유틸 함수
  - `/hooks`: 공통 커스텀 훅
  - `/lib`: 외부 SDK/클라이언트 초기화
- **화면 폴더 규칙:** 화면 컴포넌트는 `src/pages/화면명/Index.tsx` 구조를 사용하며, 화면명 폴더는 PascalCase로 작성합니다.
- **라우트 경로 규칙:** 실제 URL 경로는 화면명과 분리하여 소문자 kebab-case로 작성합니다. 예: `src/pages/Home/Index.tsx` 화면의 경로는 `/home`
- **화면 전용 요소:** 특정 화면에서만 사용하는 `data.ts`, `types.ts`, `api.ts`, `hooks.ts` 등은 해당 화면 폴더 내부에 둘 수 있습니다.
- **공통 승격 기준:** 화면 내부 요소가 2개 이상의 화면에서 재사용되면 `src/data`, `src/types`, `src/apis`, `src/hooks` 등 공통 폴더로 이동합니다.
- **스타일 예외 없음:** 화면 전용 스타일도 화면 폴더 내부에 두지 않고 `src/assets/styles/pages`에서 관리합니다.

### 5.4 컴포넌트 아키텍처

- **Atomic Design:** `Atoms`, `Molecules`, `Organisms`, `Templates` 폴더 구조를 유지하며, 각 컴포넌트는 전용 폴더 내에 `Index.tsx`를 두어 캡슐화합니다.
- **컴포넌트 스타일 위치:** 컴포넌트 전용 SCSS도 컴포넌트 폴더 내부가 아니라 `src/assets/styles/components`에서 관리합니다.

## 6. 주요 기능 정의 (Key Features)

### 6.1 회원 기능 (Membership - PocketBase 연동)

- **가입 및 인증:** 
  - 이메일 회원가입 및 SNS 간편 로그인(Google, Kakao 등) 연동.
  - **스팸 가입 및 봇 차단 (Anti-Spam):**
    - **이메일 실소유 검증:** 가입 즉시 전송되는 인증 메일을 통해서만 정식 가입 절차 완료 및 활동 권한 부여.
    - **자동 가입 방지 (CAPTCHA):** Google reCAPTCHA 또는 hCaptcha를 가입 단계에 필수 적용하여 봇(Bot)에 의한 대량 가입 원천 차단.
    - **일회용 이메일 필터링:** 임시/일회용 이메일 도메인을 식별하여 가입 시도를 차단하는 블랙리스트 기반 필터링 적용.
    - **가입 속도 제한 (Rate Limiting):** 동일 IP에서의 무분별한 연속 가입 요청을 차단하여 허위 스팸 계정 생성을 방지.
  - 아이디(이메일) 찾기, 비밀번호 재설정 기능 제공.
- **프로필 시스템:** 
  - **필수 정보:** 이메일, 패스워드 중심의 간결한 가입 모델.
  - **추가 프로필:** 닉네임(중복 확인), 프로필 이미지 업로드, 한 줄 소개(Bio).
  - **활동 통계:** 내 작성글/댓글 수, 받은 좋아요 합산 등 활동 스탯 대시보드.
- **개인화 및 보안:**
  - **환경 설정:** 테마 모드(라이트/다크/시스템), 알림 수신 설정 데이터 동기화.
  - **보안 관리:** 최근 로그인 기기 및 위치 이력 확인, 안전한 회원 탈퇴 프로세스.
- **마이페이지:** 프로필 편집, 스크랩(북마크) 및 좋아요 한 게시글 모아보기 목록 제공.

### 6.2 게시판 및 갤러리 (Board & Gallery - PocketBase 연동)

- **컨텐츠 레이아웃:** 
  - **자유게시판:** 텍스트 중심의 가독성 높은 레이아웃 및 리치 텍스트 에디터 적용.
  - **갤러리:** 이미지 중심의 그리드/메이슨리 레이아웃 및 라이트박스(확대/슬라이드) 기능.
- **소셜 인터랙션:**
  - **좋아요(Reaction):** 게시글 및 댓글 좋아요 기능 (중복 방지 및 실시간 카운트 반영).
  - **공유하기:** Web Share API 기반의 SNS 공유 및 현재 주소 링크 복사(Toast 피드백).
  - **스크랩/북마크:** 나중에 보고 싶은 게시글 저장 및 마이페이지 보관함 연동.
  - **조회수:** IP/세션 기반의 중복 카운팅 방지 로직이 포함된 조회 수 카운터.
- **분류 및 탐색:** 
  - **해시태그:** `#` 키워드 기반 태그 등록 및 태그 클라우드/필터링 검색.
  - **통합 검색:** 제목, 내용, 작성자, 태그를 아우르는 실시간 기반 검색 결과 제공.
- **신고 시스템:** 부적절 컨텐츠 신고 기능 및 관리자 페이지 검토 목록 연동.
- **권한 및 실시간성:**
  - **상세 권한:** PocketBase API Rules를 통한 읽기/쓰기/본인 수정 권한 엄격 분리.
  - **실시간 업데이트:** SDK의 Subscribe 기능을 통한 실시간 댓글 알림 및 수치 반영.

### 6.3 관리자 기능 (Administrator Features)

- **전용 관리 UI:** 게시판, 갤러리, 댓글 등 주요 서비스 영역에서 관리자 전용 관리 도구 및 메뉴 노출.
- **2단계 삭제 시스템:**
  - **1차 처리:** 사용자/관리자 삭제 시 '숨김' 처리 (Soft Delete).
  - **2차 처리:** 숨김 상태의 데이터를 관리자가 영구 삭제 (Hard Delete).
- **시스템 운영 설정:** 
  - **회원가입 통제:** 서비스 운영 상황에 따라 신규 회원가입 허용/차단 상태를 관리자가 실시간으로 전환할 수 있는 마스터 스위치 제공.
  - **공지사항 관리:** 사이트 전체 혹은 특정 게시판 상단 공지 등록 및 관리 기능.
- **회원 관리 페이지:** 별도의 관리자 전용 메뉴를 통한 체계적인 회원 관리 기능 제공.
  - **목록 및 검색:** 전체 회원 현황 파악 및 필터링 검색 (닉네임, 이메일, 상태 등).
  - **정보 수정 및 권한:** 관리자에 의한 회원 정보 보정 및 등급/권한 부여 수정.
  - **상태 제어:** 경고 부여, 서비스 이용 정지(차단), 강제 탈퇴 처리 기능.
  - **컨텐츠 매핑:** 특정 회원이 작성한 게시글 및 댓글 목록 조회 및 일괄 관리.
  - **탈퇴 관리:** 탈퇴 신청 접수 및 개인정보 파기 정책에 따른 최종 데이터 정리.

## 7. 상세 폴더 구조 기초 (Detailed Directory Structure)

```text
/src
 ├── /apis         # 공통 API 호출 및 서버 통신 함수
 ├── /assets       # 이미지, 스타일, 폰트 등 에셋 관리
 │   ├── /images   # 이미지 전용 (icons, logos, contents 하부 폴더)
 │   ├── /fonts    # Pretendard 등 폰트
 │   └── /styles   # 모든 SCSS 단일 관리 위치
 │       ├── /base
 │       │   ├── _tokens.scss
 │       │   ├── _variables.scss
 │       │   └── _mixins.scss
 │       ├── /layout
 │       ├── /components
 │       └── /pages
 ├── /components   # Atomic Design 기반 컴포넌트 폴더화
 │   ├── /atoms    # /Button/Index.tsx 등
 │   ├── /molecules
 │   ├── /organisms
 │   └── /templates
 ├── /constants    # 라우트 경로, 스토리지 키 등 공통 상수
 ├── /data         # 공통 정적 데이터 및 메뉴 구성
 ├── /hooks        # 공통 커스텀 훅 (ahooks 연동 등)
 ├── /lib          # PocketBase 인스턴스 (pocketbase.ts) 등 설정
 ├── /pages        # 페이지 컴포넌트
 │   └── /Home
 │       ├── Index.tsx
 │       ├── data.ts
 │       └── types.ts
 ├── /routes       # 라우트 설정 및 인증 가드
 │   ├── routeConfig.ts
 │   └── authGuard.ts
 ├── /stores       # Zustand 전역 상태
 │   ├── authStore.ts
 │   ├── themeStore.ts
 │   ├── layoutStore.ts
 │   └── appStore.ts
 ├── /types        # TypeScript 전역 및 공통 타입 정의
 ├── /utils        # 공통 함수 및 헬퍼
 ├── App.tsx       # 라우터 설정
 └── main.tsx      # 엔트리 포인트
```

## 8. 개발 원칙 및 최적화 전략 (Development Principles)

- **방어적 프로그래밍:** Optional Chaining, Nullish Coalescing, `try-catch` 필수 적용.
- **백엔드 연동:** 모든 데이터 통신은 PocketBase SDK 라이브러리를 통해 수행하며 예외 핸들링 필수.
- **메모리 최적화:** `useEffect` 클린업(이벤트/타이머 해제) 필수.
- **웹 접근성:** 시맨틱 HTML5 및 `aria-` 속성 준수.
- **린트(Lint):** 작성/수정한 파일에 대해서만 선별적으로 적용.
- **타입 안전성:** TypeScript 사용 시 **`any` 타입 사용을 금지**하거나 최소화합니다.

## 9. UI 레퍼런스 및 인터랙션 (UI Reference & Interactions)

UI 컴포넌트는 라이브러리를 직접 도입하지 않고 프로젝트 내부에서 직접 구현합니다. 단, 컴포넌트 API, 이벤트 명명, 상태 속성, 접근성 동작의 일관성을 위해 다음 라이브러리를 참고 기준으로 활용합니다.

- **Radix UI (1차 기준)**: 컴포넌트 구조, props 명명, 이벤트 명명, controlled/uncontrolled 패턴, 상태 속성, 키보드 인터랙션, 포커스 관리, 접근성(A11y) 동작의 우선 참고 기준으로 사용합니다.
- **React Aria (보조 기준)**: Dialog, Select, Tabs, Menu, ComboBox처럼 접근성 구현이 복잡한 컴포넌트의 동작과 ARIA 패턴을 검증할 때 참고합니다.
- **Shadcn UI (조합 참고)**: Radix 기반 컴포넌트를 실제 화면에서 어떻게 조합하는지 참고하되, 디자인과 코드를 그대로 복제하지 않습니다.
- **Nord / Polaris**: 따뜻한(Warm Minimalism) 무드와 친절한 상태 안내 문법.
- **Ant Design Mobile**: BottomSheet, Toast, Dialog, Picker, SwipeAction, PullToRefresh 등 모바일 전용 UX 흐름과 터치 인터랙션을 참고합니다.
- **직접 구현 원칙**: UI 라이브러리를 그대로 설치하거나 의존하지 않고, 필요한 컴포넌트는 프로젝트의 SCSS/BEM, 테마 변수, Framer Motion 기준에 맞춰 직접 구현합니다.
- **유틸리티 훅 (ahooks)**: **VueUse**와 같은 필수 기능을 위해 적극 활용합니다. (`useClickAway`, `useLocalStorageState`, `useDebounce` 등)
- **마이크로 인터랙션 (Framer Motion)**: 모든 컴포넌트의 상태 변화 시 부드러운 인터랙션 적용.
- **스타일링 원칙**: 모든 스타일은 `src/assets/styles` 아래 SCSS 파일로 분리하여 BEM 컨벤션을 적용하며, **인라인 스타일링을 절대 금지**합니다.

### 9.1 공통 UI 컴포넌트 1차 목록

구현 초기에는 화면 작업의 일관성과 속도를 위해 다음 공통 UI 컴포넌트를 우선 설계/구현 대상으로 둡니다.

- **기본 입력/액션:** `Button`, `IconButton`, `Input`, `TextArea`, `Checkbox`, `Radio`, `Switch`
- **선택/탐색:** `Tabs`, `Select`(1차는 단순형 중심)
- **피드백:** `Toast`, `Dialog`, `Alert`, `Confirm`, `BottomSheet`, `Spinner`, `PageLoading`, `EmptyState`, `ErrorState`
- **데이터 표시:** `DataList`
- **미디어:** `Img`
- **전역 레이아웃:** `AppHeader`, `FloatingMenu`, `Page`
- **접근성 유틸:** `VisuallyHidden`

공통 컴포넌트의 props와 이벤트는 Radix UI 스타일을 참고하여 일관되게 설계합니다.

- **공통 크기:** `size="xs|sm|md|lg|xl"`
- **공통 변형:** `variant="solid|soft|outline|ghost|plain"`
- **공통 톤:** `tone="primary|neutral|danger|success|warning|info"`
- **상태 props:** `disabled`, `loading`, `selected`, `active`, `invalid`
- **제어 패턴:** `value`, `defaultValue`, `onValueChange`, `open`, `defaultOpen`, `onOpenChange`
- **상태 속성:** `data-state`, `data-disabled`, `data-loading`, `data-selected`, `data-active`, `data-invalid`
- **접근성:** 아이콘만 있는 버튼은 반드시 `aria-label` 또는 접근성 이름을 제공하며, 시각적으로 숨길 텍스트는 `VisuallyHidden`을 사용합니다.

### 9.2 디자인 토큰 네이밍

디자인 토큰은 `src/assets/styles/base/_tokens.scss`에서만 정의하며, 실제 컴포넌트/페이지 SCSS에서는 토큰을 참조만 합니다. 토큰은 원시 팔레트보다 의미 기반 semantic token을 우선 사용합니다.

```scss
:root {
  /* Text colors */
  --color-text-primary;
  --color-text-secondary;
  --color-text-tertiary;
  --color-text-muted;
  --color-text-disabled;
  --color-text-inverse;
  --color-text-brand;
  --color-text-danger;
  --color-text-success;
  --color-text-warning;
  --color-text-info;

  /* Background colors */
  --color-bg-page;
  --color-bg-surface;
  --color-bg-surface-soft;
  --color-bg-surface-muted;
  --color-bg-elevated;
  --color-bg-overlay;
  --color-bg-inverse;
  --color-bg-brand;
  --color-bg-brand-soft;
  --color-bg-danger;
  --color-bg-danger-soft;
  --color-bg-success;
  --color-bg-success-soft;
  --color-bg-warning;
  --color-bg-warning-soft;
  --color-bg-info;
  --color-bg-info-soft;

  /* Border colors */
  --color-border-subtle;
  --color-border-default;
  --color-border-strong;
  --color-border-focus;
  --color-border-brand;
  --color-border-danger;
  --color-border-success;
  --color-border-warning;
  --color-border-info;

  /* Icon colors */
  --color-icon-primary;
  --color-icon-secondary;
  --color-icon-muted;
  --color-icon-disabled;
  --color-icon-brand;
  --color-icon-danger;
  --color-icon-success;
  --color-icon-warning;
  --color-icon-info;

  /* Interaction colors */
  --color-action-primary;
  --color-action-primary-hover;
  --color-action-primary-active;
  --color-action-primary-disabled;
  --color-action-neutral;
  --color-action-neutral-hover;
  --color-action-neutral-active;
  --color-action-danger;
  --color-action-danger-hover;
  --color-action-danger-active;
}
```

타이포그래피 토큰은 글자모드 변경에 대응할 수 있도록 역할별 사용처를 세분화합니다.

```scss
:root {
  /* Font sizes */
  --font-size-caption;
  --font-size-label;
  --font-size-helper;
  --font-size-body-sm;
  --font-size-body-md;
  --font-size-body-lg;
  --font-size-title-sm;
  --font-size-title-md;
  --font-size-title-lg;
  --font-size-heading-sm;
  --font-size-heading-md;
  --font-size-heading-lg;
  --font-size-display-sm;
  --font-size-display-md;

  /* Line heights */
  --line-height-caption;
  --line-height-label;
  --line-height-body-sm;
  --line-height-body-md;
  --line-height-body-lg;
  --line-height-title-sm;
  --line-height-title-md;
  --line-height-title-lg;
  --line-height-heading-sm;
  --line-height-heading-md;
  --line-height-heading-lg;

  /* Font weights */
  --font-weight-regular;
  --font-weight-medium;
  --font-weight-semibold;
  --font-weight-bold;
}
```

간격, 형태, 레이아웃, z-index, motion 토큰은 다음 네이밍을 기준으로 합니다.

```scss
:root {
  /* Spacing */
  --spacing-0;
  --spacing-1;
  --spacing-2;
  --spacing-3;
  --spacing-4;
  --spacing-5;
  --spacing-6;
  --spacing-8;
  --spacing-10;
  --spacing-12;
  --spacing-16;

  /* Radius */
  --radius-xs;
  --radius-sm;
  --radius-md;
  --radius-lg;
  --radius-xl;
  --radius-full;

  /* Layout */
  --layout-header-height;
  --layout-floating-menu-height;
  --layout-safe-top;
  --layout-safe-bottom;
  --layout-page-padding-x;
  --layout-content-max-width;
  --layout-fixed-top-offset;
  --layout-fixed-bottom-offset;

  /* Z-index */
  --z-base;
  --z-sticky;
  --z-header;
  --z-floating;
  --z-overlay;
  --z-dialog;
  --z-toast;

  /* Motion */
  --motion-duration-fast;
  --motion-duration-base;
  --motion-duration-slow;
  --motion-ease-standard;
  --motion-ease-emphasized;
}
```

### 9.3 공통 피드백 정책

사용자 피드백은 상황별로 역할을 분리하여 일관되게 제공합니다.

- **Toast:** 짧고 되돌릴 필요 없는 결과 알림에 사용합니다. 예: 저장 완료, 링크 복사 완료, 좋아요 반영, 설정 변경 완료
- **Dialog:** 콘텐츠나 복합 UI를 담는 범용 모달 컨테이너로 사용합니다. 단순 안내/확인 용도로 직접 사용하지 않습니다.
- **Alert:** 안내 메시지, 오류 안내, 로그인 필요 안내처럼 확인 버튼 하나로 닫히는 단순 알림에 사용합니다.
- **Confirm:** 삭제 확인, 로그아웃 확인, 작성 취소 확인처럼 사용자의 명확한 승인/취소 결정이 필요한 경우 사용합니다.
- **BottomSheet:** 모바일에서 여러 액션 중 하나를 선택할 때 사용합니다. 예: 공유하기, 게시글 더보기, 필터, 정렬, 이미지 액션
- **ErrorState:** 페이지 또는 섹션 단위 조회가 실패한 경우 사용합니다. 예: 게시글 불러오기 실패, 권한 없음, 네트워크 오류
- **EmptyState:** 요청은 성공했지만 표시할 데이터가 없을 때 사용합니다. 예: 작성글 없음, 댓글 없음, 검색 결과 없음
- **Spinner:** 짧은 로딩 또는 버튼 내부 로딩에 사용합니다.
- **PageLoading:** 인증 초기화, 필수 라우트 데이터 확인처럼 페이지 진입 자체를 막아야 할 때만 제한적으로 사용합니다.
- **Skeleton:** 1차 필수 컴포넌트에서는 제외하되, 리스트/상세 화면이 많아지는 시점에 2차 컴포넌트로 검토합니다. 짧은 시간 노출되면 오류처럼 느껴질 수 있으므로 지연 표시 기준을 둡니다.

피드백 우선순위는 `ErrorState`(페이지 문제) → `Confirm`(사용자 결정) → `Alert`(단순 안내) → `BottomSheet`(모바일 액션 선택) → `Toast`(짧은 결과 알림) → `EmptyState`(데이터 없음) → `Spinner`(진행 중) 순서로 판단합니다.

`Alert`와 `Confirm`은 내부적으로 `Dialog`를 활용하되 사용성이 최대한 편하도록 명령형 헬퍼와 컴포넌트 방식을 모두 지원하도록 설계합니다.

```ts
await confirm({
  title: '삭제할까요?',
  description: '삭제한 글은 목록에서 숨김 처리됩니다.',
  confirmText: '삭제',
  cancelText: '취소',
  tone: 'danger',
});

alert({
  title: '로그인이 필요합니다.',
  description: '마이페이지는 로그인 후 이용할 수 있습니다.',
  confirmText: '확인',
});
```

- **Alert 기본값:** 확인 버튼 하나를 기본으로 제공하고, 닫기 후 후속 동작을 선택적으로 받을 수 있습니다.
- **Confirm 기본값:** 확인/취소 버튼을 기본으로 제공하고, 결과는 `boolean` 또는 명확한 결과 타입으로 반환합니다.
- **접근성:** `Alert`와 `Confirm`은 제목, 설명, 포커스 트랩, ESC/오버레이 닫기 정책, 초기 포커스, 복귀 포커스를 일관되게 처리합니다.
- **사용 제한:** 단순 안내/확인 메시지에 원시 `Dialog`를 직접 사용하지 않고, 반드시 `Alert` 또는 `Confirm`을 사용합니다.

### 9.3.1 로딩 정책

로딩 UI는 사용자의 흐름을 막지 않는 것을 기본으로 하며, 필요한 범위에만 최소한으로 표시합니다.

- **페이지 로딩 최소화:** 전체 페이지를 막는 `PageLoading`은 인증 초기화 전, 보호 라우트 판정 전, 화면 렌더링에 필수인 초기 데이터 확인 전처럼 어쩔 수 없는 경우에만 사용합니다.
- **기존 데이터 유지:** 이미 화면에 데이터가 있는 상태에서 재요청이 발생하면 전체 로딩으로 덮지 않고 기존 데이터를 유지합니다.
- **버튼 로딩:** 로그인 제출, 저장, 삭제, 좋아요 등 중복 실행을 막아야 하는 액션은 `Button`의 `loading` 상태를 사용합니다.
- **리스트 추가 로딩:** 다음 페이지를 불러오는 중에는 리스트 하단 `Spinner` 또는 로딩 행을 사용합니다.
- **섹션 로딩:** 일부 영역만 데이터를 기다리는 경우 해당 섹션 내부에서만 로딩을 표시합니다.
- **Skeleton 지연 표시:** `0~300ms` 이내 로딩은 별도 로딩 UI를 표시하지 않고, `300ms` 이상이면 `Spinner` 또는 섹션 로딩을 표시하며, `500ms` 이상 예상되는 리스트/상세 구조에서만 `Skeleton`을 허용합니다.
- **작은 영역 로딩:** 버튼, 아이콘 버튼, 작은 위젯에는 `Skeleton` 대신 `loading`, `disabled`, `Spinner` 상태를 우선 사용합니다.

### 9.3.2 DataList 정책

리스트형 화면은 공통 `DataList` 컴포넌트를 통해 빈 상태, 에러, 추가 로딩, 더보기, 무한 스크롤을 일관되게 처리합니다.

- **지원 모드:** 1차 구현에서는 `mode="infinite"`와 `mode="loadMore"`를 지원합니다. 관리자성 목록이 필요해지는 시점에 `mode="pagination"`을 추가 검토합니다.
- **권장 사용처:** 홈/피드/게시판/갤러리 목록은 `infinite`, 검색 결과나 네트워크 안정성이 중요한 목록은 `loadMore`를 우선 고려합니다.
- **초기 실패:** 첫 페이지 조회 실패는 `ErrorState`로 표시합니다.
- **추가 조회 실패:** 기존 목록이 있는 상태에서 다음 페이지 조회가 실패하면 목록은 유지하고 리스트 하단에 `다시 시도` 액션을 표시합니다.
- **빈 상태:** 첫 조회는 성공했지만 데이터가 없으면 `EmptyState`를 표시합니다.
- **중복 호출 방지:** 무한 스크롤과 더보기 모두 `loadingMore` 상태에서 중복 호출을 방지합니다.
- **IntersectionObserver 정리:** `infinite` 모드에서 사용하는 `IntersectionObserver`는 컴포넌트 언마운트 시 반드시 해제합니다.
- **글자모드 대응:** 글자모드 변경으로 리스트 아이템 높이가 바뀔 수 있으므로 관찰 대상 위치와 하단 고정 영역 오프셋을 다시 계산할 수 있어야 합니다.

```tsx
<DataList
  items={posts}
  mode="infinite"
  hasMore={hasMore}
  loadingInitial={loadingInitial}
  loadingMore={loadingMore}
  error={error}
  emptyText="게시글이 없습니다."
  onLoadMore={loadMore}
  renderItem={(post) => <PostItem post={post} />}
/>
```

### 9.4 폼 및 검증 정책

폼은 사용자 입력을 방해하지 않으면서도 제출 전 오류를 명확히 안내하도록 설계합니다.

- **검증 시점:** 입력 중에는 에러를 과하게 노출하지 않고, `blur` 시 필드 단위 검증을 수행하며, `submit` 시 전체 검증을 수행합니다.
- **포커스 이동:** 제출 실패 시 첫 번째 에러 필드로 포커스를 이동합니다.
- **필드 에러:** 특정 입력값 문제에 사용합니다. 예: 이메일 형식 오류, 비밀번호 길이 부족, 닉네임 중복
- **폼 에러:** 특정 필드가 아닌 전체 요청 문제에 사용합니다. 예: 로그인 실패, 서버 연결 실패, 인증 만료
- **Helper text:** 입력 전 안내 문구에 사용합니다. 예: `8자 이상 입력해주세요.`
- **Success text:** 닉네임 사용 가능처럼 사용자가 확인해야 하는 성공 상태에만 제한적으로 사용합니다.
- **상태 표현:** 폼 필드는 `default`, `error`, `success` 상태를 지원하며 `aria-invalid`, `aria-describedby` 등 접근성 속성을 함께 제공합니다.
- **라이브러리 정책:** 초기 구현에서는 직접 구현 또는 가벼운 커스텀 훅을 우선 사용하고, 회원가입/게시글 작성이 복잡해지는 시점에 `react-hook-form` 도입을 별도 검토합니다.

```ts
type FieldStatus = 'default' | 'error' | 'success';

type FieldState = {
  value: string;
  touched: boolean;
  dirty: boolean;
  status: FieldStatus;
  message?: string;
};
```

### 9.5 API 에러 처리 정책

PocketBase 원본 에러는 화면에서 직접 다루지 않고, 공통 `AppError` 형태로 변환한 뒤 UI에 전달합니다.

```ts
type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'NETWORK'
  | 'SERVER'
  | 'UNKNOWN';

type AppError = {
  code: AppErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
};
```

- **UNAUTHORIZED:** 로그인 만료 또는 미로그인 상태입니다. 로그인 화면으로 이동하고 복귀 경로를 보존합니다.
- **FORBIDDEN:** 권한 없음 상태입니다. 페이지 단위 문제는 `ErrorState`, 액션 단위 문제는 `Toast`로 안내합니다.
- **NOT_FOUND:** 게시글/페이지 없음 상태입니다. `ErrorState`로 안내합니다.
- **VALIDATION:** 입력값 검증 오류입니다. `fieldErrors`를 폼 필드 에러로 매핑합니다.
- **NETWORK:** 네트워크 연결 문제입니다. 재시도 가능한 `ErrorState` 또는 `Toast`로 안내합니다.
- **SERVER:** 서버 오류입니다. `잠시 후 다시 시도해주세요.` 계열의 한글 메시지로 안내합니다.
- **UNKNOWN:** 예상하지 못한 오류입니다. 사용자에게는 일반 메시지를 보여주고, 개발 로그는 별도로 남길 수 있게 설계합니다.

API 호출 규칙은 다음을 따릅니다.

- 모든 API 함수는 `try-catch`를 사용합니다.
- PocketBase 원본 에러 메시지를 사용자에게 그대로 노출하지 않습니다.
- 사용자 메시지는 한글로 변환합니다.
- 폼에서는 `fieldErrors`를 우선 반영합니다.
- 인증 만료는 공통 처리합니다.
- 생성/수정/삭제 성공은 `Toast`로 안내합니다.
- 조회 실패는 `ErrorState`로 안내합니다.

### 9.6 아이콘 정책

아이콘은 일관된 선 굵기, 크기, 접근성을 위해 아이콘 라이브러리를 사용합니다.

- **기본 라이브러리:** 아이콘은 `lucide-react`를 기본 아이콘 라이브러리로 사용합니다.
- **직접 SVG 제한:** 라이브러리에 없는 특수 브랜드/서비스 아이콘을 제외하고 직접 SVG를 작성하지 않습니다.
- **IconButton 연동:** 아이콘 단독 버튼은 `IconButton` 컴포넌트를 사용하고, 반드시 접근성 이름(`aria-label` 등)을 제공합니다.
- **크기/색상:** 아이콘 크기와 색상은 컴포넌트 props 및 `--color-icon-*` 토큰으로 제어합니다.
- **장식 아이콘:** 의미 없는 장식 아이콘은 스크린 리더에서 제외되도록 처리합니다.

## 10. 백엔드 구성 (Backend Configuration - PocketBase)

- **서버 환경:** 시놀로지 NAS Docker 기반 자체 호스팅 (`https://pocketbase.anoju.synology.me`).
- **보안 전략:** PocketBase API Rules를 통해 컬렉션별 접근 권한(ACL) 제어.
- **실시간성:** SDK의 `subscribe` 기능을 활용하여 실시간 UI 업데이트 대응.

### 10.1 권한 및 역할 정책

권한은 단순한 역할 체계로 시작하되, 프론트 노출 제어와 PocketBase API Rules를 함께 사용합니다.

- **역할:** `guest`(비로그인), `user`(로그인 사용자), `admin`(관리자) 3단계를 기본으로 합니다.
- **라우트 권한:** `routeConfig`에는 `requiresAuth`, `roles`, `adminOnly`를 둘 수 있습니다.
- **guest:** 공개 읽기 화면, 로그인/회원가입 화면에 접근할 수 있습니다.
- **user:** 글쓰기, 댓글, 좋아요, 스크랩, 신고, 마이페이지 기능을 사용할 수 있습니다.
- **admin:** 숨김 처리, 영구 삭제, 공지 등록, 회원 관리 등 관리자 기능을 사용할 수 있습니다.
- **최종 권한:** 프론트에서 버튼을 숨기더라도 최종 권한 검증은 PocketBase API Rules에서 수행합니다.
- **상태 제한:** 이메일 미인증, 정지, 탈퇴 상태 사용자는 역할과 별개로 쓰기 액션이 제한될 수 있습니다.

```ts
{
  requiresAuth: true,
  roles: ['user', 'admin'],
  adminOnly: false,
}
```

### 10.2 PocketBase 데이터 모델 초안

초기 데이터 모델은 커뮤니티 기능과 관리자 운영에 필요한 최소 컬렉션을 기준으로 설계합니다.

- **users:** 사용자 계정과 프로필
  - `email`, `nickname`, `avatar`, `bio`, `role`, `status`, `emailVerified`, `created`
  - `role`: `user | admin`
  - `status`: `active | suspended | withdrawn`
- **posts:** 자유게시판/갤러리 게시글
  - `title`, `content`, `type`, `author`, `status`, `tags`, `viewCount`, `commentCount`, `likeCount`, `bookmarkCount`, `created`, `updated`
  - `type`: `board | gallery`
  - `status`: `draft | published | hidden | deleted`
- **comments:** 댓글과 대댓글
  - `post`, `author`, `content`, `parentComment`, `status`, `likeCount`, `created`, `updated`
  - `status`: `published | hidden | deleted`
- **post_images:** 게시글/갤러리 이미지
  - `post`, `image`, `alt`, `sortOrder`, `isCover`
- **reactions:** 좋아요 반응
  - `targetType`, `targetId`, `user`, `type`
  - `targetType`: `post | comment`
  - `type`: `like`
- **bookmarks:** 게시글 스크랩
  - `post`, `user`
- **reports:** 신고
  - `targetType`, `targetId`, `reporter`, `reason`, `detail`, `status`, `created`
  - `targetType`: `post | comment | user`
  - `status`: `pending | reviewed | rejected | resolved`
- **notices:** 공지
  - `title`, `content`, `placement`, `active`, `startsAt`, `endsAt`
  - `placement`: `global | board | gallery`

### 10.3 보안 및 인증 세부 흐름

인증 상태는 화면 접근과 액션 가능 여부를 판단하는 핵심 기준으로 관리합니다.

- **인증 상태:** `anonymous`, `initializing`, `authenticated`, `emailUnverified`, `suspended`, `withdrawn` 상태를 구분합니다.
- **이메일 미인증:** 이메일 미인증 사용자는 글쓰기, 댓글, 좋아요, 스크랩 등 쓰기 액션을 제한합니다.
- **정지 사용자:** 정지 사용자는 로그인 상태를 유지할 수 있으나 쓰기 액션과 주요 사용자 기능을 제한합니다.
- **탈퇴 사용자:** 탈퇴 상태 사용자는 세션을 무효화하거나 로그인 이후 즉시 안내 후 로그아웃 처리합니다.
- **로그인 성공:** redirect 경로가 있으면 해당 경로로 복귀하고, 없으면 `/home`으로 이동합니다.
- **로그아웃 성공:** 세션 정리 후 `/home`으로 이동합니다.
- **SNS 로그인 실패:** 원인을 한글 메시지로 변환하여 `Toast` 또는 폼 에러로 안내합니다.
- **비밀번호 재설정:** 보안상 가입 여부를 과도하게 노출하지 않는 문구를 사용합니다.
- **인증 만료:** `UNAUTHORIZED` 에러는 공통 처리하여 로그인 화면으로 이동하고 복귀 경로를 보존합니다.

### 10.4 검색, 필터, 정렬 정책

검색 조건은 URL query와 동기화하여 새로고침, 공유, 뒤로가기에서 동일한 상태를 유지합니다.

- **URL 동기화:** 검색어, 태그, 정렬, 필터는 query string으로 관리합니다. 예: `/board?keyword=react&tag=ui&sort=latest`
- **검색 debounce:** 검색어 입력은 debounce를 적용하여 불필요한 요청을 줄입니다.
- **필터 변경:** 필터나 정렬이 변경되면 페이지 또는 커서 상태를 초기화합니다.
- **DataList 연동:** 검색 결과는 `DataList`의 `infinite` 또는 `loadMore` 모드와 연결합니다.
- **빈 결과:** 검색 결과가 없으면 `EmptyState`를 사용합니다.
- **검색 실패:** 검색 API 실패는 `ErrorState` 또는 `Toast`로 안내합니다.
- **정렬 기본값:** 게시판/갤러리는 `latest`를 기본 정렬로 사용합니다.
- **정렬 후보:** `latest`, `popular`, `comments`, `views`를 기본 후보로 둡니다.

### 10.5 작성, 수정, 삭제 UX 정책

작성/수정/삭제 흐름은 데이터 손실 방지와 명확한 피드백을 우선합니다.

- **작성 이탈 방지:** 작성 중 내용이 있는 상태에서 뒤로가기/닫기/라우트 이동을 시도하면 `Confirm`으로 확인합니다.
- **저장 성공:** 작성/수정 성공은 `Toast`로 안내합니다.
- **작성 후 이동:** 새 글 저장 성공 후 상세 페이지로 이동합니다.
- **수정 후 이동:** 수정 성공 후 기본적으로 상세 페이지 또는 기존 위치를 유지하되, 화면별 정책은 `routeConfig` 또는 화면 설정에서 정합니다.
- **삭제 확인:** 삭제 전 반드시 `Confirm`을 사용합니다.
- **Soft delete:** 사용자/관리자 삭제는 기본적으로 `hidden` 또는 `deleted` 상태로 숨김 처리합니다.
- **Hard delete:** 영구 삭제는 관리자만 수행할 수 있습니다.
- **삭제 후 이동:** 게시글 삭제 후 목록으로 이동합니다.
- **임시저장:** 1차 구현에서는 보류하되, 추후 `localStorage` 또는 PocketBase `draft` 상태로 확장할 수 있게 설계합니다.

### 10.6 파일 업로드 정책

업로드는 용량, 확장자, 미리보기, 실패 처리를 일관되게 제한합니다.

- **허용 확장자:** `jpg`, `jpeg`, `png`, `webp`
- **프로필 이미지:** 2MB 이하를 권장합니다.
- **게시글/갤러리 이미지:** 장당 5MB 이하를 권장합니다.
- **미리보기:** 업로드 전 미리보기를 제공합니다.
- **실패 처리:** 업로드 실패는 `Toast`로 안내합니다.
- **alt 텍스트:** 콘텐츠 이미지에는 가능하면 `alt` 입력을 허용합니다.
- **렌더링:** 업로드된 이미지를 포함한 모든 이미지는 공통 `Img` 컴포넌트로 렌더링합니다.
- **갤러리 이미지:** 여러 장 업로드를 허용하고 `sortOrder`를 관리합니다.
- **대표 이미지:** 갤러리/게시글 대표 이미지가 필요한 경우 `isCover`를 사용합니다.
- **테마 이미지:** 정적 이미지 중 라이트/다크 모드별 리소스가 필요한 경우 `Img`의 테마별 source 기능을 사용합니다.

### 10.7 캐시 및 실시간 갱신 정책

초기 구현은 PocketBase SDK, Zustand, 화면 단위 재조회를 조합하고, 복잡한 캐시 라이브러리는 필요해지는 시점에 검토합니다.

- **기본 조회:** 상세/목록 화면 진입 시 기본 fetch를 수행합니다.
- **무효화:** 생성/수정/삭제 후 관련 상세와 목록 데이터를 재조회하거나 무효화합니다.
- **낙관적 업데이트:** 좋아요/스크랩처럼 즉각 반응이 중요한 액션은 낙관적 업데이트를 허용합니다.
- **롤백:** 낙관적 업데이트 실패 시 이전 상태로 rollback하고 `Toast`로 안내합니다.
- **실시간 후보:** 댓글, 좋아요/댓글 카운트, 공지, 알림은 PocketBase `subscribe` 우선 적용 후보입니다.
- **구독 해제:** 모든 실시간 구독은 컴포넌트 언마운트 시 반드시 해제합니다.
- **기존 데이터 유지:** 재조회 중에도 기존 목록/상세 데이터는 가능한 유지합니다.
- **고급 캐시:** React Query류 캐시 라이브러리는 1차 구현에서는 보류하고, 데이터 동기화 복잡도가 커질 때 별도 검토합니다.

## 11. 전역 화면 레이아웃 설계 (Global Screen Layout)

모바일 최우선 화면 경험을 기준으로 상단 헤더, 하단 플로팅 버튼, 화면 내부 고정 콘텐츠가 서로 겹치지 않도록 전역 레이아웃 관리 체계를 설계합니다. 본 항목은 구현 전 설계 기준이며, 세부 API와 컴포넌트 명세는 별도 구현 요청 시 확정합니다.

### 11.1 설계 진행 원칙

- **설계 요청 처리:** 사용자가 `설계`를 수정하거나 추가해 달라고 요청하면 `plan.md`와 `AGENTS.md`만 업데이트하고, 실제 구현은 진행하지 않습니다.
- **Plan 우선 업데이트:** 레이아웃 관련 구현 전에는 `plan.md`를 먼저 업데이트하여 설계 방향을 명확히 기록합니다.
- **사용자 확인 필수:** 헤더 정책, 플로팅 버튼 정책, 고정 영역 관리 방식처럼 사용자 경험에 영향을 주는 의사결정은 사용자 확인 후 확정합니다.
- **구현 보류:** 본 단계에서는 문서화만 진행하며, 실제 컴포넌트와 훅 구현은 별도 요청 시 진행합니다.
- **구현 요청 처리:** 사용자가 `구현`을 명시적으로 요청하면 해당 작업의 to-do 리스트를 먼저 만들고, 확인된 범위 안에서 순서대로 구현합니다.

### 11.2 상단 헤더 정책

- **기본 동작:** 헤더는 상단 고정 영역으로 제공하며, 아래로 스크롤하면 숨기고 위로 스크롤하면 다시 나타납니다.
- **숨김/노출 인터랙션:** 헤더의 숨김/노출은 단순 표시 전환이 아니라 이동, 투명도, 그림자 변화 등 사용자가 상태 변화를 자연스럽게 인지할 수 있는 인터랙션으로 설계합니다.
- **항시 고정 옵션:** 특정 화면에서는 스크롤 방향과 무관하게 헤더를 항상 노출하는 옵션을 제공합니다.
- **Sticky 콘텐츠 연동:** 본문 내부의 `sticky` 콘텐츠가 헤더와 충돌하지 않도록 헤더 높이, 상단 오프셋, z-index를 전역 레이아웃 컨텍스트에서 관리합니다.
- **고정 요소 관리:** 헤더뿐 아니라 화면 상단에 배치되는 다른 고정 요소가 생길 수 있으므로, 상단 고정 영역은 단일 관리 포인트에서 누적 높이와 노출 상태를 계산합니다.

### 11.3 헤더 구성

- **좌측 영역:** `뒤로가기 버튼` → `페이지 타이틀` → `좌측 확장 영역` 순서로 배치합니다.
- **우측 영역:** `우측 확장 영역` → `홈 버튼` 순서로 배치합니다.
- **전체메뉴 제외:** 전체메뉴는 별도 페이지에서 관리하므로 헤더에는 전체메뉴 버튼을 배치하지 않습니다.
- **요소 숨김 처리:** 뒤로가기 버튼, 페이지 타이틀, 홈 버튼, 좌우 확장 영역은 화면별 설정에 따라 숨김 처리할 수 있어야 합니다.
- **확장 영역:** 좌우 확장 영역은 텍스트, 아이콘 버튼, 상태 표시, 액션 버튼 등 화면별 추가 요소를 주입할 수 있는 슬롯으로 설계합니다.
- **뒤로가기 동작:** 기본 동작은 `history.back()`으로 처리하되, 화면별 설정에 따라 특정 경로 이동 또는 커스텀 핸들러를 사용할 수 있어야 합니다.

### 11.4 하단 플로팅 버튼 정책

- **기본 푸터 없음:** 모바일 UI에서는 전역 푸터를 기본 제공하지 않습니다.
- **주요 화면 한정:** 하단 플로팅 버튼은 모든 화면에 배치하지 않고, 홈 화면 등 주요 화면에서 선택적으로 제공합니다.
- **기본 메뉴 구성:** 하단 플로팅메뉴의 기본 항목은 `홈`, `전체메뉴`, `마이페이지`로 구성합니다.
- **로그인 전 메뉴 표시:** `마이페이지` 항목은 로그인 전에는 `로그인` 메뉴로 노출하고, 로그인 후에는 `마이페이지` 메뉴로 노출합니다.
- **보호 메뉴 진입:** `마이페이지`처럼 로그인이 필요한 메뉴는 페이지 진입 전에 반드시 인증 상태를 확인하고, 미로그인 상태라면 로그인 화면으로 이동시킵니다.
- **전체메뉴 진입:** 전체메뉴 버튼은 하단 플로팅 버튼 영역에 포함합니다.
- **스크롤 연동:** 플로팅 버튼도 헤더와 동일하게 아래로 스크롤하면 숨기고 위로 스크롤하면 다시 나타납니다.
- **인터랙션 적용:** 플로팅 버튼의 숨김/노출도 Framer Motion 또는 CSS Transition을 활용해 위치, 투명도, 터치 가능 상태가 부드럽게 전환되도록 설계합니다.
- **화면별 제어:** 화면별로 플로팅 버튼 노출 여부, 포함 액션, 고정/숨김 동작을 설정할 수 있어야 합니다.

### 11.5 상하단 고정 영역 통합 관리

- **중앙 관리 로직:** 상단 고정 영역과 하단 고정 영역은 별도 컴포넌트 내부에서 임의로 처리하지 않고, 전역 레이아웃 관리 로직에서 함께 관리합니다.
- **겹침 방지:** 하단 플로팅 버튼 외에도 콘텐츠 내부 하단 고정 영역이 있을 수 있으므로, 안전 영역(`safe-area-inset-*`), 높이, 간격, z-index를 계산하여 콘텐츠와 버튼이 겹치지 않게 합니다.
- **스크롤 상태 공유:** 헤더와 플로팅 버튼은 동일한 스크롤 방향 상태를 공유하되, 화면별 옵션에 따라 각각 독립적으로 고정 또는 숨김 처리할 수 있어야 합니다.
- **레이아웃 변수화:** 상단/하단 고정 영역의 현재 높이와 오프셋은 CSS 변수 또는 전역 레이아웃 상태로 노출하여 페이지와 `sticky` 콘텐츠가 일관되게 참조할 수 있게 합니다.
- **접근성 유지:** 고정 영역의 숨김/노출 애니메이션은 포커스 이동, 터치 타깃, 스크린 리더 탐색을 방해하지 않도록 설계합니다.

### 11.6 라우팅, 인증, 레이아웃 메타 관리

- **설정 파일 기반 관리:** 라우팅, 로그인 필요 여부, 헤더 사용 방식, 하단 플로팅 메뉴 노출 여부는 `src/routes/routeConfig.ts`에서 중앙 관리합니다.
- **JSON 대신 TypeScript 사용:** 라우트 설정은 타입 안정성, 자동완성, 주석 작성, lazy import 확장성을 위해 JSON이 아니라 TypeScript 설정 파일로 관리합니다.
- **라우트 메타 기본값:** `routeConfig`의 메타 정보는 각 화면의 기본 레이아웃 정책으로 사용하며, 화면 내부에서 필요한 경우 제한적으로 런타임 override를 허용합니다.
- **페이지 메타 관리:** 페이지의 `document.title`, description, robots 정책은 `routeConfig`의 `meta` 객체에서 함께 관리합니다.
- **타이틀 규칙:** 모든 페이지는 `meta.title`을 필수로 가지며, 최종 `document.title`은 `페이지명 | Anoju` 형식을 사용합니다. `meta.title`이 없으면 라우트의 `title`을 fallback으로 사용합니다.
- **검색 노출 규칙:** 로그인, 마이페이지, 관리자, 작성/수정 화면처럼 개인화되거나 보호된 화면은 `robots: 'noindex'`를 사용합니다.
- **공유 페이지 메타:** 게시글 상세처럼 공유 가능한 화면은 개별 description을 허용합니다.
- **메타 갱신 시점:** 페이지 이동 시 메타 정보는 즉시 갱신합니다.
- **인증 가드:** `requiresAuth: true`인 화면은 진입 전에 인증 상태를 확인하고, 미로그인 상태라면 로그인 화면으로 이동합니다.
- **복귀 경로 보존:** 인증이 필요한 화면에 미로그인 상태로 접근한 경우, 로그인 성공 후 원래 접근하려던 경로로 돌아갈 수 있도록 redirect 경로를 보존합니다.
- **레이아웃 매니저:** 전역 레이아웃은 현재 라우트의 `layout.header`, `layout.floatingMenu` 설정을 읽어 헤더, 뒤로가기, 홈 버튼, 확장 영역, 플로팅 메뉴 노출 상태를 결정합니다.

```ts
type BackButtonConfig =
  | { visible: false }
  | { visible: true; type: 'history' }
  | { visible: true; type: 'route'; to: string; replace?: boolean }
  | { visible: true; type: 'custom'; actionKey: string };
```

- **뒤로가기 기본값:** 뒤로가기 버튼의 기본 동작은 `type: 'history'`로 설정하고, 라우터의 이전 이동 기능을 사용합니다.
- **경로 이동형 뒤로가기:** 목록/상세처럼 돌아갈 경로가 명확한 화면은 `type: 'route'`와 `to` 경로를 사용합니다.
- **커스텀 뒤로가기:** 작성 취소 확인, 모달 닫기, 임시 저장 처리처럼 화면 상태가 필요한 경우 `type: 'custom'`과 `actionKey`를 사용합니다.
- **커스텀 액션 분리:** `routeConfig`에는 함수를 직접 넣지 않고 `actionKey`만 선언합니다. 실제 함수는 화면 컴포넌트 또는 레이아웃 액션 레지스트리에서 등록합니다.

```ts
export const routeConfig = [
  {
    id: 'home',
    path: '/home',
    title: '홈',
    meta: {
      title: '홈',
      description: 'Anoju의 주요 콘텐츠를 확인합니다.',
    },
    requiresAuth: false,
    layout: {
      header: {
        visible: true,
        title: '홈',
        backButton: { visible: false },
        showHomeButton: false,
        fixed: false,
        hideOnScroll: true,
      },
      floatingMenu: {
        visible: true,
      },
    },
  },
  {
    id: 'myPage',
    path: '/my-page',
    title: '마이페이지',
    meta: {
      title: '마이페이지',
      description: '내 정보와 활동 내역을 확인합니다.',
      robots: 'noindex',
    },
    requiresAuth: true,
    layout: {
      header: {
        visible: true,
        title: '마이페이지',
        backButton: { visible: true, type: 'history' },
        showHomeButton: true,
        fixed: true,
        hideOnScroll: false,
      },
      floatingMenu: {
        visible: true,
      },
    },
  },
];
```

### 11.7 전역 상태 관리 (Zustand)

- **상태 관리 도구:** 전역 상태 관리는 Zustand를 사용합니다.
- **스토어 분리:** 상태는 역할별로 `src/stores/authStore.ts`, `src/stores/themeStore.ts`, `src/stores/layoutStore.ts`, `src/stores/appStore.ts`처럼 분리합니다.
- **인증 상태:** `authStore`는 PocketBase `authStore`와 동기화하며, 로그인 여부, 사용자 정보, 인증 초기화 상태를 관리합니다.
- **테마 상태:** `themeStore`는 `data-theme`, `data-font-mode` 값을 관리하고 사용자 설정을 저장합니다.
- **레이아웃 상태:** `layoutStore`는 헤더 표시 상태, 스크롤 방향, 상단/하단 고정 영역 높이, 플로팅 메뉴 상태, 글자모드 변경 후 레이아웃 재계산 트리거를 관리합니다.
- **앱 상태:** `appStore`는 전역 로딩, 토스트, 앱 초기화 여부처럼 도메인에 속하지 않는 공통 상태를 관리합니다.
