# anoju-react2

모바일 최우선(Mobile-First) 반응형 웹 애플리케이션 프로젝트인 **anoju-react2**입니다.

## 🚀 프로젝트 개요
이 프로젝트는 React와 Vite를 기반으로 하며, 사용성 높은 SNS/이메일 인증 및 자유게시판/갤러리 기능을 제공합니다. 모든 디자인과 로직은 모바일 기기에서의 최적화된 경험을 최우선으로 합니다.

## 🛠 기술 스택
- **프레임워크:** React (v19)
- **빌드 도구:** Vite
- **언어:** TypeScript
- **스타일링:** SCSS (Vanilla SCSS, BEM 방법론 적용)
- **상태 관리:** React Query (TanStack Query)
- **라우팅:** React Router DOM
- **SEO/메타:** React Helmet Async

## 📁 주요 폴더 구조
- `/src/assets/images`: 이미지 관리 (icons, logos, contents 등으로 세분화)
- `/src/components`: 아토믹 디자인(Atoms, Molecules, Organisms, Templates) 적용 및 각 컴포넌트 전용 폴더화
- `/src/styles`: SCSS 관리 (base, layout, components 계층 구조)
- `/src/pages`: 서비스 각 페이지 및 정적 콘텐츠(/static) 관리
- `/src/hooks`: 재사용 가능한 비즈니스 로직 및 이벤트 해제 관리

## 📝 개발 원칙 및 규칙
1. **언어 정책:** 코드 내 주석, 설명, README 등은 반드시 **한글**로 작성합니다.
2. **스타일 네이밍:** CSS 클래스명은 **BEM(kebab-case)** 방식을 따릅니다.
3. **방어적 코딩:** Optional Chaining(`?.`), Nullish Coalescing(`??`)을 생활화합니다.
4. **접근성 준수:** 시맨틱 HTML5 태그를 사용하여 웹 접근성을 강화합니다.
5. **체계적 관리:** 모든 파일은 용도별 폴더로 분류하여 관리 효율성을 높입니다.

## 💻 실행 방법
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```
