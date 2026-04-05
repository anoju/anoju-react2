# 🛠 PocketBase 시놀로지 NAS 설치 가이드

PocketBase는 단일 파일로 구성된 초경량 백엔드 솔루션입니다. 리소스를 적게 차지하며, 관리자 페이지 UI가 직관적이라 초보자에게 가장 추천하는 방식입니다.

## 1. 사전 준비
1.  시놀로지 **패키지 센터**에서 `Container Manager`를 설치합니다.
2.  **File Station**을 실행하고 `docker/pocketbase` 폴더를 생성합니다.

## 2. 프로젝트 생성 (Container Manager)
1.  **Container Manager** 실행 → **프로젝트** → **생성** 버튼을 누릅니다.
2.  설정을 다음과 같이 입력합니다.
    *   **프로젝트 이름:** `pocketbase`
    *   **경로:** `/docker/pocketbase` 선택
    *   **소스:** `도커 컴포즈 파일 생성` 선택
3.  **코드 편집기**에 아래 내용을 복사해서 붙여넣습니다.

```yaml
version: '3.7'
services:
  pocketbase:
    image: muchobien/pocketbase:latest
    container_name: pocketbase
    restart: unless-stopped
    ports:
      - "8090:8080"  # 외부포트 8090 : 내부포트 8080
    volumes:
      - ./pb_data:/pb_data # 데이터와 설정이 저장될 위치
    healthcheck:
      test: wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1
      interval: 10s
      timeout: 5s
      retries: 5
```

## 3. 실행 및 관리자 설정
1.  **다음** → **다음** → **완료**를 클릭하여 프로젝트를 가동합니다.
2.  브라우저 주소창에 `http://[NAS_IP]:8090/_/`를 입력합니다.
3.  처음 접속 시 사용할 **관리자 이메일과 비밀번호**를 생성합니다.

## 4. 특징 및 주의사항
*   **메모리 점유율:** 약 30MB 수준으로 매우 낮음.
*   **데이터베이스:** SQLite 기반이며, `pb_data` 폴더만 잘 백업하면 나중에 다른 서버로 옮기기도 쉽습니다.
*   **외부 접속:** 외부 프로젝트(Vercel 등)에서 접근하려면 공유기 설정에서 `8090` 포트를 포트 포워딩하거나, 시놀로지의 **역방향 프록시** 기능을 사용하는 것을 권장합니다.
