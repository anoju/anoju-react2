# AI Agent Instructions for anoju-react2

이 문서는 **anoju-react2** 프로젝트에서 코드를 작성하고 수정할 때 반드시 준수해야 하는 지침을 담고 있습니다. 모든 AI 에이전트는 작업 시 아래 규칙을 철저히 따라야 합니다.

## 1. 프로젝트 개요 (Project Summary)
* **목적:** 모바일 최우선(Mobile-First) 반응형 웹 애플리케이션 개발.
* **기술 스택:** React, Vite, TypeScript, SCSS (Vanilla SCSS 사용).
* **주요 기능:** SNS/이메일 회원가입(인증 포함), 자유게시판/갤러리(에디터 적용), 정적 콘텐츠 페이지 관리.

## 2. 디자인 및 에스테틱 (Design & Aesthetics)
* **프리미엄 지자인:** 단순한 MVP를 넘어선, 세련된 색상(HSL 등), 다이내믹한 애니메이션, 호버 효과 등을 적용합니다.
* **타이포그래피:** **Pretendard** 폰트를 기본으로 사용하며 가독성과 세련미를 동시에 확보합니다.
* **동적 디자인:** 마이크로 인터랙션과 부드러운 전환 효과를 통해 살아있는 듯한 UI를 구현합니다.

## 3. 스타일링 컨벤션 (Styling Convention)
* **SCSS & BEM:**
  * 모든 스타일은 **SCSS**로 작성하며, **BEM(Block Element Modifier)** 네이밍 방식을 엄격히 준수합니다.
  * 예: `.post-card`, `.post-card__header`, `.post-card__header--active`.
* **소스맵:** 개발 시 디버깅을 위해 소스맵이 올바르게 생성되도록 설정합니다.
* **중복 제거:** 공통 스타일은 `styles/_variables.scss`, `styles/_mixins.scss`에 정의하여 재사용합니다.

## 4. 컴포넌트 아키텍처 (Component Architecture)
* **아토믹 디자인(Atomic Design):** 재사용성을 극대화하기 위해 아래 구조로 컴포넌트를 분리합니다.
  * `/src/components/atoms`: 최소 단위 (버튼, 인풋 등)
  * `/src/components/molecules`: 2개 이상의 아톰 결합 (폼 필드 등)
  * `/src/components/organisms`: 복합적 기능 단위 (헤더, 뉴스피드 등)
  * `/src/components/templates`: 레이아웃의 틀
* **이벤트 핸들링:** 컴포넌트 언마운트 시 반드시 이벤트 리스너와 타이머를 해제(Clean-up)하여 메모리 누수를 방지합니다.

## 5. 명명 규칙 (Naming Conventions)
* **CSS Class Name:** **케밥 케이스(kebab-case)** + BEM 방식.
* **ID 및 변수명:** **카멜 케이스(camelCase)**. (예: `userId`, `mainContent`).

## 6. 개발 원칙 및 방어적 코딩 (Development Principles)
* **방어적 프로그래밍:**
  * Optional Chaining(`?.`) 및 Nullish Coalescing(`??`)을 통한 안정적 데이터 참조.
  * 외부 API 연동 및 데이터 파싱 시 `try-catch` 필수 적용.
* **웹 접근성(A11y):** 시맨틱 HTML5 태그를 최우선으로 사용하며(div 남용 금지), 적절한 `aria-` 속성과 `alt` 텍스트를 제공합니다.
* **레이아웃 설정:** 페이지별로 타이틀(`document.title`) 및 개별 메타 정보를 설정할 수 있어야 합니다.

## 7. 기타 운영 수칙 (Operations)
* **Linting:** 린트 및 포맷팅 적용 시 **수정한 파일**에 대해서만 적용(`lint:fix` 등)하여 불필요한 전체 프로젝트 변경을 방지합니다.
* **파일 구조:** `plan.md`에 명시된 폴더 구조를 유지하며, 새로운 콘텐츠는 `/src/pages/static` 및 적절한 콘텐츠 폴더 내에 규칙적으로 관리합니다.

---
**주의:** 모든 코드는 위 규칙에 어긋날 경우 승인되지 않습니다. 코드를 작성하기 전 이 문서를 다시 한 번 숙지하십시오.
