# React 프로젝트 구성 계획 (Project Setup Plan)

## 1. 프로젝트 초기화 (Project Initialization)
가장 빠르고 모던한 개발 경험을 제공하는 빌드 툴을 사용합니다.
* **스택:** **Vite + React + TypeScript + SCSS**
* **장점:** 기존 Create React App(CRA) 대비 압도적으로 빠른 로컬 서버 구동 및 빌드 속도
* **패키지 매니저:** `npm` (또는 프로젝트에 맞는 패키지 매니저 사용)
* **모바일 최우선 (Mobile First):** 모바일 기기 사용자 경험을 최우선으로 설계하며, 반응형 디자인 반영.

## 2. 스타일링 및 UI 아키텍처 (Styling & UI Architecture)
프로젝트 규정 및 SCSS 활용을 통한 고도화된 스타일 환경을 만듭니다.
* **방식:** **SCSS** 기반. 전처리기를 활용한 믹스인, 변수 활용 및 **Source Map** 적용(개발 시 디버깅 용이).
* **클래스 네이밍 규칙:** **BEM (Block Element Modifier)** 방식을 엄격하게 적용 (예: `.header-container__nav-item--active`).
* **디자인 시스템:**
  * `styles/_variables.scss`, `styles/_mixins.scss` 등을 통해 디자인 토큰화.
  * **웹 폰트:** **Pretendard**를 기본 폰트로 설정하여 선명하고 현대적인 가독성 제공.
* **컴포넌트 설계:** **Atomic Design** 패턴 지향 (Atoms, Molecules, Organisms 등)으로 재사용성 극대화.

## 3. 코드 품질 및 컨벤션 (Code Quality & Convention)
안정적이고 최적화된 코드 작성을 위한 기반입니다.
* **ESLint & Prettier:**
  * **수정/추가된 파일에 대해서만** 린트 및 포맷팅 적용 (불필요한 전체 변경 방지).
* **변수 및 상호작용 식별자 네이밍:** **카멜 케이스(camelCase)** 적용.
* **웹 접근성(A11y):** 시맨틱 HTML, `alt` 속성, `aria-` 속성을 준수하여 보편적 설계 적용.

## 4. 주요 기능 정의 (Key Features)
### 4.1 회원 기능 (Membership)
* **회원가입:** 이메일 회원가입(이메일 인증 필수) 및 SNS 간편 회원가입 연동.
* **인증 관리:** 아이디 찾기, 비밀번호 찾기(재설정) 기능 제공.
* **마이페이지:** 회원 정보(닉네임, 성별, 생년월일 등) 추가 정보 입력 및 수정 기능.

### 4.2 게시판 및 갤러리 (Board & Gallery)
* **기본 구성:** 자유게시판 및 갤러리 게시판 개발.
* **에디터:** 게시글 작성을 위한 리치 텍스트 에디터 도입.
* **권한 제어:**
  * 목록 및 상세: 전체 공개 (비회원 가능).
  * 게시글/댓글 작성: 회원 전용.
  * 수정 및 삭제(숨김): 작성 본인만 가능.

### 4.3 콘텐츠 관리 (Content Management)
* 소개 페이지 등 단순 콘텐츠 화면 제공.
* 관리 용이성을 위해 콘텐츠 페이지들을 규칙적으로 분리 및 구조화(예: `/pages/content/` 폴더 내 관리).

## 5. 폴더 구조 설계 (Directory Structure - Atomic Design)
```text
/src
 ├── /assets       # 이미지, 폰트(Pretendard) 등 정적 리소스
 ├── /components   # Atomic Design 기반 컴포넌트
 │   ├── /atoms    # 최소 단위 요소 (Button, Input 등)
 │   ├── /molecules # 결합 단위 (FormField, SearchBar 등)
 │   ├── /organisms # 독립적 기능 단위 (Header, PostCard 등)
 │   └── /templates # 레이아웃 구성 템플릿
 ├── /pages        # 라운트별 페이지 컴포넌트
 │   └── /static   # 정적 콘텐츠 페이지 (소개 등)
 ├── /hooks        # 커스텀 훅 (메모리 해제 로직 필수)
 ├── /styles       # 전역 SCSS, variables, mixins (BEM 구조)
 ├── /utils        # 공통 함수 및 헬퍼
 ├── /types        # TypeScript 전역 및 공통 타입 정의
 ├── App.tsx       # 라우터 및 글로벌 레이아웃 설정
 └── main.tsx      # 리액트 렌더링 엔트리 포인트
```

## 6. 개발 원칙 및 최적화 전략 (Development Principles)
* **레이아웃 커스터마이징:** 페이지별로 타이틀, 메타 정보 등을 개별 설정할 수 있도록 Layout Wrapper 레이어 강화.
* **방어적 프로그래밍:** Optional Chaining(`?.`), Nullish Coalescing(`??`), `try-catch` 예외 처리 철저.
* **메모리 최적화:** 컴포넌트 언마운트 시 이벤트 리스너 및 타이머 클린업 필수.
