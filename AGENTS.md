# AI Agent Instructions for anoju-react2

이 문서는 **anoju-react2** 프로젝트에서 코드를 작성하고 수정할 때 반드시 준수해야 하는 지침을 담고 있습니다. 모든 AI 에이전트는 작업 시 아래 규칙을 철저히 따라야 합니다.

## 1. 프로젝트 개요 (Project Summary)
* **목적:** 모바일 최우선(Mobile-First) 반응형 웹 애플리케이션 개발.
* **기술 스택:** React, Vite, TypeScript, SCSS (Vanilla SCSS 사용).
* **주요 기능:** SNS/이메일 회원가입(인증 포함), 자유게시판/갤러리(에디터 적용), 정적 콘텐츠 페이지 관리.

## 2. 언어 정책 (Language Policy)
* **기본 언어:** 사용자 환경 및 코드 내 모든 설명, 주석, README는 반드시 **한글(Korean)**을 사용합니다.
* **표현 방식:** 간결하고 명확한 한글 문장으로 지침과 정보를 전달합니다.

## 3. 파일 및 폴더 체계화 (File & Folder Organization)
모든 개발 작업 시 파일의 증가에 대비하여 체계적으로 폴더를 구성하고 분류합니다.

* **이미지 에셋:** `src/assets/images` 폴더를 기본으로 하며, 하위에 `icons`, `logos`, `contents` 등 용도별 폴더를 생성하여 관리합니다.
* **SCSS 스타일:** `src/styles` 아래 전역/기본 스타일(`base`), 레이아웃 스타일(`layout`), 개별 컴포넌트 스타일(`components`) 폴더를 두어 계층 구조를 유지합니다.
* **컴포넌트:** 아토믹 디자인 패턴에 따라 `atoms`, `molecules`, `organisms`, `templates` 폴더 내에 각 컴포넌트별 전용 폴더(index.tsx, *.scss)를 생성하여 캡슐화합니다.

## 4. 스타일링 컨벤션 (Styling Convention)
* **SCSS & BEM:** 모든 스타일은 SCSS로 작성하며, BEM(Block Element Modifier) 네이밍 방식을 엄격히 준수합니다.
* **소스맵:** 개발 시 디버깅을 위해 소스맵 생성을 옵션으로 포함합니다.
* **중복 제거:** 공통 변수 및 믹스인은 `styles/base/_variables.scss`, `styles/base/_mixins.scss`에 정의하여 재사용합니다.
* **Sass 현대화 (Dart Sass 표준):**
  * `@import` 대신 **`@use`** 및 **`@forward`** 사용을 필수화합니다.
  * `/` 나눗셈 연산 대신 **`math.div()`**를 사용하고, 컬러 함수 등 내장 함수는 **`sass:math`, `sass:color`** 모듈을 명시적으로 호출하여 사용합니다.
  * 레거시 함수(`lighten`, `darken`) 대신 최신 API(`color.adjust`, `color.scale`)를 권장합니다.

## 5. 개발 원칙 및 방어적 코딩 (Development Principles)
* **방어적 프로그래밍:** Optional Chaining(`?.`), Nullish Coalescing(`??`), API 호출 시 `try-catch` 등을 필수 적용합니다.
* **메모리 최적화:** 컴포넌트 언마운트 시 이벤트 리스너 및 타이머를 반드시 해제(Clean-up)합니다.
* **웹 접근성(A11y):** 시맨틱 HTML5 태그를 최우선으로 사용하며, 적절한 `aria-` 속성과 `alt` 텍스트를 제공합니다.

## 6. 기타 운영 수칙 (Operations)
* **Linting:** 린트 및 포맷팅 적용 시 **수정한 파일**에 대해서만 적용하여 불필요한 전체 프로젝트 변경을 방지합니다.
* **타이틀 설정:** 페이지별로 고유한 타이틀(`document.title`) 및 개별 메타 정보를 설정해야 합니다.

---
**주의:** 모든 코드는 위 규칙에 어긋날 경우 승인되지 않습니다. 특히 한글 주석과 폴더 체계화 원칙을 철저히 지켜주십시오.
