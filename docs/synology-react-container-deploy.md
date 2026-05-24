# Synology NAS React 프론트 컨테이너 배포 가이드

이 문서는 `anoju-react2` React/Vite 프론트엔드를 **Synology NAS Container Manager의 Nginx 컨테이너**로 배포하는 절차를 정리합니다.

## 1. 현재 상태 정리

현재 확인된 상태는 다음과 같습니다.

- PocketBase는 이미 컨테이너로 실행 중입니다.
- PocketBase 운영 주소는 `https://pocketbase.anoju.synology.me`입니다.
- DSM 역방향 프록시에는 현재 `PocketBase`, `code-server` 규칙만 있습니다.
- Web Station에는 기본 포털 `80 / 443`과 사용자 정의 포털 `web 8011 / 8010`이 있습니다.
- React 프론트는 Web Station에 올리지 않고, 별도 컨테이너로 실행합니다.

중요한 기준은 다음 하나입니다.

```text
React 프론트는 Web Station이 아니라 Container Manager의 Nginx 컨테이너로 배포한다.
```

따라서 Web Station의 `web 8010` 설정은 이번 React 배포에서는 건드리지 않아도 됩니다.

## 2. 최종 목표 구조

최종 구조는 다음과 같습니다.

```text
사용자 브라우저
  ↓
https://anoju.synology.me
  ↓
Synology DSM 역방향 프록시
  ↓
http://localhost:8020
  ↓
React 프론트 Nginx 컨테이너
  ↓
컨테이너 내부 /usr/share/nginx/html
```

PocketBase는 기존처럼 별도 도메인을 사용합니다.

```text
https://pocketbase.anoju.synology.me
  ↓
기존 PocketBase 컨테이너
```

## 3. 포트 계획

React 프론트 컨테이너는 NAS의 `8020` 포트를 사용합니다.

```text
NAS 포트 8020 → React 컨테이너 내부 80 포트
```

포트를 `8020`으로 잡는 이유:

- Web Station이 이미 `80 / 443`을 사용 중입니다.
- Web Station 사용자 정의 포털이 이미 `8010 / 8011`을 사용 중입니다.
- PocketBase도 별도 포트를 사용 중입니다.
- 충돌을 피하기 위해 React 프론트는 새 포트 `8020`을 사용합니다.

## 4. 프로젝트 환경 변수 확인

프로젝트 루트의 `.env` 또는 운영 빌드용 환경 파일에 다음 값이 필요합니다.

```env
VITE_APP_URL=https://anoju.synology.me
VITE_PB_URL=https://pocketbase.anoju.synology.me
```

주의:

- `VITE_APP_URL`은 React 프론트 운영 주소입니다.
- `VITE_PB_URL`은 PocketBase API 주소입니다.
- PocketBase 주소를 React 코드에 직접 하드코딩하지 않습니다.

프로젝트에서는 `src/config/env.ts`에서 이 값을 읽습니다.

```text
VITE_APP_URL → appEnv.appUrl
VITE_PB_URL → appEnv.pocketBaseUrl
```

PocketBase SDK는 `src/lib/pocketBase.ts`에서 `appEnv.pocketBaseUrl`을 사용합니다.

운영 빌드에서는 `VITE_APP_URL`, `VITE_PB_URL`이 비어 있으면 앱 시작 시 오류가 발생하도록 구성되어 있습니다. 배포 전에 반드시 `.env` 값을 확인합니다.

## 5. React 빌드 확인

로컬 또는 NAS에서 다음 명령으로 빌드합니다.

```bash
pnpm.cmd build
```

빌드가 성공하면 프로젝트 루트에 `dist` 폴더가 생성됩니다.

```text
dist/
  index.html
  assets/
```

`dist` 폴더는 Nginx 컨테이너가 정적 파일로 서빙할 대상입니다.

## 6. Dockerfile 추가

프로젝트 루트에 `Dockerfile`을 만듭니다.

```dockerfile
FROM nginx:alpine

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

이 Dockerfile은 이미 빌드된 `dist` 폴더를 Nginx 이미지 안으로 복사합니다.

## 7. nginx.conf 추가

프로젝트 루트에 `nginx.conf`를 만듭니다.

```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ {
    try_files $uri =404;
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

`try_files $uri $uri/ /index.html;`가 중요합니다.

React Router를 사용하는 SPA에서는 `/settings`, `/my-page` 같은 주소로 직접 접속하거나 새로고침할 수 있습니다. 이때 실제 파일은 없지만 React 앱이 라우팅해야 하므로 Nginx가 `index.html`로 넘겨줘야 합니다.

## 8. .dockerignore 추가

프로젝트 루트에 `.dockerignore`를 만듭니다.

```gitignore
node_modules
.git
.vscode
dist/**/*.map
```

이미지 빌드에 불필요한 파일이 들어가지 않도록 합니다.

## 9. 로컬에서 이미지 빌드

`pnpm.cmd build`로 `dist`를 만든 뒤 Docker 이미지를 빌드합니다.

```bash
docker build -t anoju-front .
```

이미지 이름은 `anoju-front`로 사용합니다.

## 10. NAS에서 컨테이너 실행

NAS에서 터미널 SSH를 사용할 수 있다면 다음 명령으로 실행할 수 있습니다.

```bash
docker run -d \
  --name anoju-front \
  -p 8020:80 \
  --restart unless-stopped \
  anoju-front
```

Windows PowerShell에서 한 줄로 쓰면 다음과 같습니다.

```powershell
docker run -d --name anoju-front -p 8020:80 --restart unless-stopped anoju-front
```

의미:

```text
--name anoju-front
  컨테이너 이름

-p 8020:80
  NAS의 8020 포트를 컨테이너 내부 80 포트에 연결

--restart unless-stopped
  NAS 재시작 후에도 컨테이너 자동 실행
```

## 11. Container Manager UI에서 확인

DSM에서 다음 위치로 이동합니다.

```text
Container Manager → 컨테이너
```

`anoju-front` 컨테이너가 실행 중인지 확인합니다.

포트 설정은 다음처럼 보여야 합니다.

```text
로컬 포트: 8020
컨테이너 포트: 80
```

## 12. 내부 접속 테스트

브라우저에서 NAS 내부 주소로 접속합니다.

```text
http://NAS_IP:8020
```

예:

```text
http://192.168.0.10:8020
```

이 주소에서 React 화면이 보이면 컨테이너 실행은 성공입니다.

이 단계에서는 아직 `https://anoju.synology.me`로 접속되지 않아도 됩니다. 먼저 `8020` 포트로 React 컨테이너가 잘 뜨는지 확인합니다.

## 13. DSM 역방향 프록시 추가

DSM에서 다음 위치로 이동합니다.

```text
제어판 → 로그인 포털 → 고급 → 역방향 프록시
```

`생성` 버튼을 누르고 새 규칙을 추가합니다.

### 13.1 HTTPS 규칙

```text
설명:
Anoju Front

소스
  프로토콜: HTTPS
  호스트 이름: anoju.synology.me
  포트: 443

대상
  프로토콜: HTTP
  호스트 이름: localhost
  포트: 8020
```

이 설정은 다음 연결을 만듭니다.

```text
https://anoju.synology.me
  → http://localhost:8020
  → React 컨테이너
```

### 13.2 HTTP 규칙

HTTP도 열고 싶다면 추가 규칙을 만듭니다.

```text
설명:
Anoju Front HTTP

소스
  프로토콜: HTTP
  호스트 이름: anoju.synology.me
  포트: 80

대상
  프로토콜: HTTP
  호스트 이름: localhost
  포트: 8020
```

가능하면 최종 사용은 HTTPS를 기준으로 합니다.

## 14. 인증서 확인

DSM에서 다음 위치로 이동합니다.

```text
제어판 → 보안 → 인증서
```

`anoju.synology.me` 인증서가 있는지 확인합니다.

없다면 Let's Encrypt 인증서를 발급합니다.

```text
도메인 이름: anoju.synology.me
```

이미 `pocketbase.anoju.synology.me` 인증서가 있다면, 같은 인증서에 SAN으로 `anoju.synology.me`가 포함되어 있는지도 확인합니다.

## 15. PocketBase CORS 확인

PocketBase 관리자 화면에서 프론트 운영 도메인을 허용해야 합니다.

허용할 프론트 도메인:

```text
https://anoju.synology.me
```

PocketBase 원본 주소:

```text
https://pocketbase.anoju.synology.me
```

React 앱에서 PocketBase 요청이 실패하면 CORS 설정을 먼저 확인합니다.

## 16. 최종 접속 확인

다음 주소로 접속합니다.

```text
https://anoju.synology.me
```

확인할 항목:

- 홈 화면이 뜨는지
- `/settings`로 직접 접속되는지
- `/settings`에서 새로고침해도 404가 안 나는지
- PocketBase API 요청이 정상 동작하는지
- 브라우저 개발자 도구 Console에 CORS 오류가 없는지

## 17. 재배포 절차

코드를 수정한 뒤 다시 배포할 때는 다음 순서로 진행합니다.

```bash
pnpm.cmd build
docker build -t anoju-front .
docker stop anoju-front
docker rm anoju-front
docker run -d --name anoju-front -p 8020:80 --restart unless-stopped anoju-front
```

이미지 캐시가 꼬인 것 같으면 다음처럼 빌드합니다.

```bash
docker build --no-cache -t anoju-front .
```

## 18. Web Station과의 관계

현재 Web Station에는 다음 항목이 있습니다.

```text
기본 포털: 80 / 443
사용자 정의 포털 web: 8011 / 8010
```

이번 React 컨테이너 배포에서는 이 설정을 사용하지 않습니다.

React 프론트는 다음 경로로 연결합니다.

```text
DSM 역방향 프록시 → localhost:8020 → React 컨테이너
```

따라서 Web Station의 `web 8010` 포털은 기존 용도가 있다면 그대로 두면 됩니다.

## 19. 문제 해결

### 19.1 `http://NAS_IP:8020`이 안 열릴 때

확인할 것:

- `anoju-front` 컨테이너가 실행 중인지
- Container Manager 포트가 `8020 → 80`인지
- NAS 방화벽에서 8020이 막혀 있지 않은지

### 19.2 `https://anoju.synology.me`가 안 열릴 때

확인할 것:

- 역방향 프록시 규칙이 있는지
- 소스 호스트 이름이 `anoju.synology.me`인지
- 대상 포트가 `8020`인지
- 인증서가 `anoju.synology.me`에 연결되어 있는지

### 19.3 새로고침하면 404가 날 때

`nginx.conf`에 다음 설정이 있는지 확인합니다.

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 19.4 PocketBase 요청이 막힐 때

PocketBase CORS에 다음 도메인이 허용되어 있는지 확인합니다.

```text
https://anoju.synology.me
```

### 19.5 기존 80/443 Web Station과 충돌할 때

React 컨테이너는 NAS의 `8020`만 사용합니다.

외부 공개 도메인은 DSM 역방향 프록시가 처리합니다.

```text
외부 443 → DSM 역방향 프록시 → 내부 8020
```

따라서 React 컨테이너가 직접 `80`이나 `443`을 점유할 필요가 없습니다.
