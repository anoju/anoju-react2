# 🛠 PocketBase 시놀로지 NAS 설치 가이드

PocketBase는 단일 파일로 구성된 초경량 백엔드 솔루션입니다. 리소스를 적게 차지하며, 관리자 페이지 UI가 직관적이라 초보자에게 가장 추천하는 방식입니다.

## 1. 사전 준비 (File Station)

1.  **File Station**을 실행하고 `docker/pocketbase` 폴더를 생성합니다.
2.  **중요:** `docker/pocketbase/pb_data` 폴더를 **미리 생성**해 두어야 에러가 나지 않습니다.

## 2. 프로젝트 생성 (Container Manager)

1.  **Container Manager** 실행 → **프로젝트** → **생성** 버튼을 누릅니다.
2.  **프로젝트 이름:** `pocketbase`
3.  **경로:** `/docker/pocketbase` 선택
4.  **소스:** `도커 컴포즈 파일 생성` 선택
5.  **코드 편집기**에 아래 내용을 복사해서 붙여넣습니다.

```yaml
version: "3.7"
services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest # GitHub 레지스트리 경로 사용
    container_name: pocketbase
    restart: unless-stopped
    command:
      - serve
      - --http=0.0.0.0:9080 # 내부 포트를 9080으로 지정
      - --dir=/pb_data      # 데이터 저장 위치 강제 지정
    environment:
      - TURNSTILE_SECRET_KEY=Cloudflare에서_발급받은_Turnstile_Secret_key
    ports:
      - "9090:9080" # 외부포트 9090 (NAS 접속용) : 내부포트 9080
    volumes:
      # 볼륨 권한 문제를 피하기 위해 전체(절대) 경로 사용을 권장합니다.
      - "/volume1/docker/pocketbase/pb_data:/pb_data"
      - "/volume1/docker/pocketbase/pb_hooks:/pb_hooks"
    healthcheck:
      test: wget --no-verbose --tries=1 --spider http://localhost:9080/api/health || exit 1
      interval: 10s
      timeout: 5s
      retries: 5
```

## 3. 실행 및 관리자 설정

1.  **다음 → 다음 → 완료**를 클릭하여 프로젝트를 가동합니다.
2.  **중요 (첫 로그인):** 처음 접속 시 보안을 위해 **설치 토큰**이 필요할 수 있습니다.
    - **Container Manager** → **컨테이너** → **pocketbase** 클릭 → **로그** 확인.
    - 로그 파일 하단에 `http://0.0.0.0:9080/_/#/pbinstal/...` 주소를 찾습니다.
    - `0.0.0.0` 부분을 본인의 NAS 주소로 바꿔서 브라우저에 입력하고 접속합니다. (예: `https://[NAS_IP]/_/#/pbinstal/...`)
3.  첫 접속 시 사용할 **관리자 이메일과 비밀번호**를 생성합니다.

## 3.1 Turnstile 환경 변수와 hook 적용

Cloudflare Turnstile Secret key는 PocketBase 관리자 화면이 아니라 PocketBase 컨테이너 실행 환경 변수에 등록합니다.

Container Manager에서 `pocketbase` 프로젝트를 사용하는 경우:

1. **Container Manager** → **프로젝트** → `pocketbase` 선택
2. 프로젝트를 중지합니다.
3. **편집** 또는 **설정**에서 compose YAML을 엽니다.
4. `pocketbase` 서비스 아래에 아래 값을 추가합니다.

```yaml
environment:
  - TURNSTILE_SECRET_KEY=Cloudflare에서_발급받은_Turnstile_Secret_key
```

5. `pb_hooks`를 사용하려면 볼륨도 함께 연결합니다.

```yaml
volumes:
  - "/volume1/docker/pocketbase/pb_data:/pb_data"
  - "/volume1/docker/pocketbase/pb_hooks:/pb_hooks"
```

6. `/volume1/docker/pocketbase/pb_hooks` 폴더에 프로젝트의 `pb_hooks/turnstile.pb.js` 파일을 복사합니다.
7. 프로젝트를 다시 시작합니다.

## 4. 특징 및 외부 접속 (역방향 프록시)

- **역방향 프록시 설정**: 제어판 → 로그인 포털 → 고급 → 역방향 프록시에서 설정하세요.
    - **프론트 운영 소스**: `https://anoju.synology.me` (Port 443)
    - **프론트 대상**: NAS에 배포된 Vite 정적 빌드 또는 웹 서버 경로
    - **소스**: `https://pocketbase.anoju.synology.me` (Port 443)
    - **대상**: `http://localhost:9090` (Port 9090)
- **메모리 점유율:** 약 30MB 수준으로 매우 낮음.
- **데이터베이스:** SQLite 기반이며, `pb_data` 폴더만 잘 백업하면 이동이 매우 쉽습니다.

---
**업데이트 날짜:** 2026-04-05
**관리 담당:** Antigravity (AI Coding Assistant)
