# 🚀 Supabase 시놀로지 NAS 설치 가이드 (Self-Hosting)

Supabase는 PostgreSQL 기반의 오픈소스 백엔드 플랫폼입니다. 클라우드 모델과 동일한 기능을 내 NAS에서 무료로 사용할 수 있습니다.

> [!IMPORTANT]
> **사양 요구 사항:** 컨테이너가 10개 이상 실행되므로 **최소 4GB RAM**이 필요합니다. 8GB 이상을 강력히 추천합니다.

## 1. 파일 업로드
1.  [Supabase 공식 레포지토리](https://github.com/supabase/supabase/archive/refs/heads/master.zip)에서 소스 코드를 다운로드합니다.
2.  압축을 푼 폴더 내부의 `docker` 폴더 전체를 시놀로지 `/docker/supabase` 폴더로 업로드합니다.
3.  File Station에서 `/docker/supabase/.env.example` 파일을 복사하여 `.env`로 이름을 바꿉니다.

## 2. 권한 및 환경 설정
1.  텍스트 편집기로 `.env` 파일을 열고 아래 항목을 **반드시** 고유한 값으로 변경하세요.
    *   `POSTGRES_PASSWORD`: DB 관리자 비밀번호
    *   `JWT_SECRET`: 인증용 보안 토큰
    *   `ANON_KEY`: 클라이언트 공개 API 키
    *   `SERVICE_ROLE_KEY`: 서버용 관리자 키
2.  파일을 저장합니다.

## 3. 프로젝트 생성 (Container Manager)
1.  **Container Manager** 실행 → **프로젝트** → **생성**.
2.  설정을 다음과 같이 입력합니다.
    *   **프로젝트 이름:** `supabase`
    *   **경로:** `/docker/supabase` 선택
    *   **소스:** `기존 docker-compose.yml 사용` (자동 로드됨)
3.  **다음** → **다음** → **완료**.
    *   이 과정에서 여러 이미지를 다운로드하므로 수 분이 소요됩니다.

## 4. 접속 방법
*   **대시보드 (Studio):** `http://[NAS_IP]:8000` (클라우드 대시보드와 동일한 화면)
*   **API 엔드포인트:** `http://[NAS_IP]:8000` (React 프로젝트에서 URL로 사용)

## 5. 관리 팁
*   초기 구동 시 각 컨테이너가 정상적으로 `Running` 상태가 되었는지 확인하세요.
*   보안을 위해 외부 접속 시에는 반드시 시놀로지 **역방향 프록시**를 통해 `HTTPS` 인증서를 적용하는 것을 권장합니다.
*   데이터는 `/docker/supabase/volumes/db` 폴더에 물리적으로 저장됩니다.
