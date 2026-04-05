# 🚀 Supabase 시놀로지 NAS 설치 가이드 (Self-Hosting)

Supabase는 PostgreSQL 기반의 오픈소스 백엔드 플랫폼입니다. 클라우드 모델과 동일한 기능을 내 NAS에서 무료로 사용할 수 있습니다.

> [!IMPORTANT]
> **사양 요구 사항:** 컨테이너가 10개 이상 실행되므로 **최소 4GB RAM**이 필요합니다. (8GB 이상 강력 권장)
> 메모리가 부족할 경우 특정 컨테이너(특히 Studio나 Kong)가 무한 재부팅될 수 있습니다.

## 1. 사전 준비 (File Station)

1.  **File Station**을 실행하고 `docker/supabase` 폴더를 생성합니다.
2.  [Supabase 공식 GitHub](https://github.com/supabase/supabase/tree/master/docker)에서 다음 파일들을 다운로드하여 `docker/supabase` 폴더에 업로드합니다.
    - `docker-compose.yml`
    - `volumes` 폴더 (통째로 업로드)
    - `.env.example` (업로드 후 이름을 `.env`로 변경)

## 2. 환경 설정 (.env 수정)

텍스트 편집기로 `.env` 파일을 열고 아래 항목을 **반드시** 수정하세요. 아무 값이나 넣기보다 [JWT 생성기](https://generate-secret.now.sh/32) 등을 사용해 보안성을 높이는 것이 좋습니다.

- **`POSTGRES_PASSWORD`**: 데이터베이스 관리자 비밀번호
- **`JWT_SECRET`**: 인증 보안 키 (최소 32자 이상의 랜덤 문자열)
- **`ANON_KEY`**: 클라이언트가 사용할 공개 API 키
- **`SERVICE_ROLE_KEY`**: 서버 측 관리용 키 (절대 외부에 노출 금지)
- **`SITE_URL`**: `http://[NAS_IP]:8000` (나중에 역방향 프록시 주소로 변경 가능)

## 3. 프로젝트 생성 (Container Manager)

1.  **Container Manager** → **프로젝트** → **생성**.
2.  **프로젝트 이름:** `supabase`
3.  **경로:** `/docker/supabase` 선택.
4.  **소스:** `기존 docker-compose.yml 사용` 선택 (자동으로 불러와짐).
5.  **다음 → 완료**를 눌러 실행합니다. (이미지가 많아 다운로드에 5분 이상 소요됩니다.)

## 4. 접속 및 외부 연결

### 🏠 내부 접속
- **Supabase Studio (관리 페이지):** `http://[NAS_IP]:8000`
- **로그인 정보:** 기본값은 이메일: `supabase@example.com` / 비밀번호: `this-is-a-temporary-password` (나중에 `.env`에서 수정 가능)

### 🌐 외부 접속 (역방향 프록시 설정 권장)
PocketBase와 마찬가지로 **제어판 → 로그인 포털 → 역방향 프록시**에서 다음과 같이 설정하세요.

- **소스**: `https://supabase.anoju.synology.me` (Port 443)
- **대상**: `http://localhost:8000` (Port 8000)

## 5. 트러블슈팅 (자주 발생하는 에러)

- **볼륨 권한 에러**: 설치 후 데이터베이스가 `Starting`에서 멈춘다면, `docker/supabase/volumes` 폴더에 `Everyone` 읽기/쓰기 권한을 명시적으로 부여해 보세요.
- **포트 충돌**: 만약 `8000`번 포트를 다른 서비스가 쓰고 있다면, `.env` 파일 상단의 `STUDIO_PORT`를 다른 번호(예: 8001)로 바꾼 후 다시 시작하세요.

---
**업데이트 날짜:** 2026-04-05
**관리 담당:** Antigravity (AI Coding Assistant)
