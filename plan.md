# React 프로젝트 구성 계획 (Project Setup Plan)

## 1. 프로젝트 초기화 (Project Initialization)
가장 빠르고 모던한 개발 경험을 제공하는 빌드 툴을 사용합니다.
* **스택:** **Vite + React + TypeScript + SCSS**
* **장점:** 기존 Create React App(CRA) 대비 압도적으로 빠른 로컬 서버 구동 및 빌드 속도
* **패키지 매니저:** `npm` (또는 프로젝트에 맞는 패키지 매니저 사용)
* **모바일 최우선 (Mobile First):** 모바일 기기 사용자 경험을 최우선으로 설계하며, 반응형 디자인 반영.

## 2. 언어 및 주석 규칙 (Language & Commenting)
* **기본 언어:** 프로젝트 내의 모든 설명, README, 코드 내 주석은 반드시 **한글(Korean)**로 작성합니다.
* **문태:** 명확하고 일관된 한글 가이드를 제공합니다.

## 3. 파일 및 폴더 구조화 (File & Folder Organization)
모든 시스템은 파일 증가에 대비하여 체계적으로 폴더화하여 관리합니다.

### 3.1 스타일링 (SCSS)
* **구조화:** `src/styles` 아래 기능별 서브 폴더를 생성하여 관리합니다.
  * `/base`: 리셋, 전역 변수, 믹스인
  * `/layout`: 헤더, 푸터, 레이아웃 관련 스타일
  * `/components`: 개별 컴포넌트용 SCSS
* **방식:** **SCSS** 기반 및 **Source Map** 적용.
* **네이밍:** **BEM (Block Element Modifier)** 방식 엄격 준수.
* **최신 문법 준수 (Sass Modules & Modernization):**
  * `@import` 대신 **`@use`** 및 **`@forward`** 사용을 필수화합니다.
  * 나눗셈 연산 시 `/` 연산자 대신 **`math.div()`** 사용을 권장합니다. (이를 위해 `@use "sass:math"` 필요)
  * 내장 함수 사용 시 관련 모듈(`sass:color`, `sass:map` 등)을 명시적으로 불러와 사용하며, 레거시 함수(`lighten()`, `darken()` 등) 대신 최신 함수(`color.adjust()`, `color.scale()` 등)를 지향합니다.
  * 변수 및 믹스인 참조 시 네임스페이스를 명시하여 전역 오염을 방지합니다.

### 3.2 에셋 (Assets)
* **이미지 관리:** `src/assets/images` 폴더를 생성하고 용도별로 하위 폴더를 두어 관리합니다.
  * `/icons`: 아이콘 이미지
  * `/logos`: 로고 및 브랜드 이미지
  * `/contents`: 게시글 및 페이지 콘텐츠용 이미지
* **기타 에셋:** 폰트(`assets/fonts`), 데이터 파일 등도 각각 폴더별로 구분합니다.

### 3.3 컴포넌트 아키텍처
* **Atomic Design:** `Atoms`, `Molecules`, `Organisms`, `Templates` 폴더 구조를 유지하며, 각 컴포넌트는 전용 폴더 내에 `index.tsx`와 `*.scss`를 함께 두어 캡슐화합니다.

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

## 5. 상세 폴더 구조 기초 (Detailed Directory Structure)
```text
/src
 ├── /assets       # 이미지 및 에셋 관리
 │   ├── /images   # 이미지 전용 (icons, logos, contents 하부 폴더)
 │   └── /fonts    # Pretendard 등 폰트
 ├── /components   # Atomic Design 기반 컴포넌트 폴더화
 │   ├── /atoms    # /Button/index.tsx, /Button/Button.scss 등
 │   ├── /molecules
 │   ├── /organisms
 │   └── /templates
 ├── /pages        # 페이지 컴포넌트
 │   └── /static   # 정적 콘텐츠 (소개 등)
 ├── /hooks        # 커스텀 훅 (추후 폴더별 분리 가능)
 ├── /styles       # SCSS 체계화 폴더 (/base, /layout, /components)
 ├── /utils        # 공통 함수 및 헬퍼
 ├── /types        # TypeScript 전역 및 공통 타입 정의
 ├── App.tsx       # 라우터 설정
 └── main.tsx      # 엔트리 포인트
```

## 6. 개발 원칙 및 최적화 전략 (Development Principles)
* **방어적 프로그래밍:** Optional Chaining, Nullish Coalescing, `try-catch` 필수 적용.
* **메모리 최적화:** `useEffect` 클린업(이벤트/타이머 해제) 필수.
* **웹 접근성:** 시맨틱 HTML5 및 `aria-` 속성 준수.
* **린트(Lint):** 작성/수정한 파일에 대해서만 선별적으로 적용.
* **타입 안전성:** TypeScript 사용 시 **`any` 타입 사용을 금지**하거나 최소화합니다. 불가피한 경우에만 사용하며, 가급적 구체적인 모델링이나 제네릭을 활용합니다.
