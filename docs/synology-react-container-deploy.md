# Synology NAS React 컨테이너 배포 가이드

이 문서는 `anoju-react2` React/Vite 프론트엔드를 **Windows PC에서 Docker 이미지로 빌드**한 뒤, **Synology NAS Container Manager**에 올려서 실행하는 절차를 정리합니다.

현재 기준 배포 흐름은 다음과 같습니다.

```text
Windows PC의 React 프로젝트
  -> pnpm build
  -> docker build
  -> docker save로 anoju-front.tar 생성
  -> NAS Container Manager에서 이미지 가져오기
  -> 컨테이너 실행
  -> http://NAS_IP:8080 확인
  -> DSM 역방향 프록시로 https://anoju.synology.me 연결
```

## 1. 핵심 개념

프론트엔드는 서버에서 Node.js로 계속 실행되는 앱이 아니라, Vite 빌드 후 정적 파일로 만들어지는 SPA입니다. 이 프로젝트는 그 정적 파일을 Nginx 컨테이너 안에 넣어서 배포합니다.

중요한 구분은 다음과 같습니다.

```text
docker build
  Docker 이미지를 만드는 단계입니다.
  프로젝트 폴더와 Docker Desktop이 있는 PC에서 실행합니다.

docker save
  만든 이미지를 NAS에 옮길 수 있는 tar 파일로 저장하는 단계입니다.

Container Manager 이미지 가져오기
  anoju-front.tar를 NAS에 등록하는 단계입니다.
  이 단계만으로는 아직 사이트가 실행되지 않습니다.

컨테이너 생성 및 실행
  등록된 이미지를 실제 서비스로 실행하는 단계입니다.
  포트 매핑을 해야 브라우저에서 접속할 수 있습니다.
```

## 2. 필요한 준비물

Windows PC에는 다음이 필요합니다.

- Node.js
- pnpm
- Docker Desktop for Windows
- 프로젝트 폴더: `D:\git-workspace\anoju-react2`

NAS에는 다음이 필요합니다.

- DSM
- Container Manager 패키지
- 역방향 프록시 설정 권한
- `anoju.synology.me` 도메인과 인증서

NAS에서 직접 `pnpm i`를 할 필요는 없습니다. 이 방식은 **PC에서 빌드한 이미지를 NAS에 올리는 방식**입니다.

## 3. 운영 환경 변수 확인

프로젝트 루트의 `.env` 또는 운영 빌드에 사용되는 환경 변수에 다음 값이 있어야 합니다.

```env
VITE_APP_URL=https://anoju.synology.me
VITE_PB_URL=https://pocketbase.anoju.synology.me
```

주의할 점:

- Vite의 `VITE_` 환경 변수는 빌드 시점에 결과물에 포함됩니다.
- `.env`를 바꾸면 반드시 다시 `pnpm build`와 `docker build`를 해야 합니다.
- PocketBase 주소를 코드에 직접 하드코딩하지 않습니다.

## 4. Docker Desktop 상태 확인

Windows에서 Docker 명령을 쓰려면 Docker Desktop이 실행 중이어야 합니다.

PowerShell에서 확인합니다.

```powershell
docker version
```

정상이라면 `Client`와 `Server` 정보가 모두 나옵니다.

다음 오류가 나오면 Docker Desktop 엔진이 실행되지 않은 상태입니다.

```text
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

해결 순서:

1. 시작 메뉴에서 Docker Desktop 실행
2. Docker Desktop이 Running 상태가 될 때까지 대기
3. PowerShell을 새로 열기
4. `docker version` 다시 확인

## 5. 로컬 빌드

Windows PowerShell에서 프로젝트 루트로 이동합니다.

```powershell
cd D:\git-workspace\anoju-react2
```

의존성이 없다면 먼저 설치합니다.

```powershell
pnpm i
```

React/Vite 빌드를 실행합니다.

```powershell
pnpm build
```

성공하면 `dist` 폴더가 생성됩니다.

```text
dist/
  index.html
  assets/
```

## 6. Dockerfile과 Nginx 설정

프로젝트 루트의 `Dockerfile`은 다음 구조입니다.

```dockerfile
FROM nginx:alpine

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

프로젝트 루트의 `nginx.conf`에는 React Router 새로고침 대응 설정이 들어 있습니다.

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

여기서 가장 중요한 줄은 다음입니다.

```nginx
try_files $uri $uri/ /index.html;
```

이 설정이 있어야 `/my-page`, `/playground/free-board` 같은 React Router 경로에서 새로고침해도 404가 나지 않습니다.

## 7. Docker 이미지 빌드

`docker build`는 **NAS가 아니라 Windows PC의 프로젝트 루트**에서 실행합니다.

```powershell
cd D:\git-workspace\anoju-react2
docker build -t anoju-front .
```

마지막의 `.`은 현재 폴더를 Docker 빌드 컨텍스트로 사용한다는 뜻입니다. 따라서 이 명령은 `Dockerfile`, `dist`, `nginx.conf`가 있는 프로젝트 루트에서 실행해야 합니다.

이미지 생성 여부를 확인합니다.

```powershell
docker images anoju-front
```

## 8. NAS로 옮길 tar 파일 생성

Docker 이미지를 NAS Container Manager에서 가져올 수 있도록 tar 파일로 저장합니다.

```powershell
docker save -o anoju-front.tar anoju-front
```

생성 위치:

```text
D:\git-workspace\anoju-react2\anoju-front.tar
```

이 파일을 NAS에 업로드합니다.

## 9. NAS Container Manager에 이미지 가져오기

DSM에서 다음 순서로 진행합니다.

```text
Container Manager
  -> 이미지
  -> 추가 또는 가져오기
  -> 파일에서 추가
  -> anoju-front.tar 선택
```

가져오기가 끝나면 이미지 목록에 다음처럼 표시되어야 합니다.

```text
이름: anoju-front
태그: latest
```

여기까지는 **이미지를 등록한 것**입니다. 아직 사이트가 실행된 것은 아닙니다.

## 10. 컨테이너 생성

이미지 목록에서 `anoju-front:latest`를 선택하고 컨테이너 생성을 진행합니다.

일반 설정:

```text
이미지: anoju-front:latest
컨테이너 이름: anoju-front
자동 재시작 활성화: 체크
```

처음 테스트할 때는 `Web Station을 통해 웹 포털 설정`을 체크하지 않아도 됩니다. 대신 포트 매핑을 직접 설정합니다.

포트 설정:

```text
로컬 포트 또는 NAS 포트: 8080
컨테이너 포트: 80
프로토콜: TCP
```

의미:

```text
http://NAS_IP:8080
  -> NAS의 8080 포트
  -> anoju-front 컨테이너의 80 포트
  -> Nginx가 React 정적 파일 제공
```

## 11. 내부망 접속 확인

컨테이너가 실행 중인지 확인합니다.

```text
Container Manager
  -> 컨테이너
  -> anoju-front
  -> 상태: 실행 중
```

브라우저에서 다음 주소로 접속합니다.

```text
http://192.168.0.36:8080
```

React 화면이 보이면 컨테이너 실행은 성공입니다.

이 단계에서는 아직 `https://anoju.synology.me`로 연결되지 않아도 정상입니다. 먼저 내부 IP와 포트로 확인하는 것이 순서입니다.

## 12. DSM 역방향 프록시 설정

내부망 주소가 정상이라면 DSM 역방향 프록시로 운영 도메인을 연결합니다.

DSM에서 다음 메뉴로 이동합니다.

```text
제어판
  -> 로그인 포털
  -> 고급
  -> 역방향 프록시
```

새 규칙을 추가합니다.

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
  포트: 8080
```

대상 호스트 이름은 `localhost` 대신 `127.0.0.1`을 사용해도 됩니다.

이 설정의 의미:

```text
https://anoju.synology.me
  -> DSM 역방향 프록시
  -> http://localhost:8080
  -> anoju-front 컨테이너
```

## 13. 인증서 확인

DSM에서 인증서를 확인합니다.

```text
제어판
  -> 보안
  -> 인증서
```

`anoju.synology.me`에 사용할 인증서가 있어야 합니다. 없다면 Let's Encrypt 인증서를 발급합니다.

인증서 대상 도메인:

```text
anoju.synology.me
```

`pocketbase.anoju.synology.me`와 같은 인증서에 SAN으로 함께 포함해도 됩니다.

## 14. PocketBase CORS 확인

프론트 운영 도메인에서 PocketBase API를 호출할 수 있어야 합니다.

PocketBase에서 허용해야 하는 프론트 도메인:

```text
https://anoju.synology.me
```

PocketBase API 도메인:

```text
https://pocketbase.anoju.synology.me
```

브라우저 개발자 도구 Console 또는 Network에서 CORS 오류가 보이면 PocketBase CORS 설정을 먼저 확인합니다.

## 15. 최종 확인 항목

다음 순서로 확인합니다.

```text
1. http://192.168.0.36:8080 접속
2. https://anoju.synology.me 접속
3. 앱 안에서 다른 페이지로 이동
4. 이동한 페이지에서 새로고침
5. 브라우저 개발자 도구 Console 오류 확인
6. PocketBase API 요청 정상 여부 확인
```

React Router 확인 예시:

```text
https://anoju.synology.me/my-page
https://anoju.synology.me/playground/free-board
```

이 주소에서 새로고침해도 화면이 유지되어야 합니다.

## 16. 프로젝트 업데이트 후 재배포

코드를 수정한 뒤 다시 배포할 때는 PC에서 이미지를 다시 만들고 NAS 컨테이너를 새 이미지로 교체합니다.

### 16.1 PC에서 새 이미지 만들기

Windows PowerShell:

```powershell
cd D:\git-workspace\anoju-react2
pnpm build
docker build -t anoju-front .
docker save -o anoju-front.tar anoju-front
```

캐시 문제를 의심할 때는 다음처럼 빌드합니다.

```powershell
docker build --no-cache -t anoju-front .
docker save -o anoju-front.tar anoju-front
```

### 16.2 NAS에 새 tar 업로드

새로 생성된 파일을 NAS에 다시 업로드합니다.

```text
D:\git-workspace\anoju-react2\anoju-front.tar
```

### 16.3 기존 컨테이너 중지 및 삭제

DSM Container Manager에서 진행합니다.

```text
Container Manager
  -> 컨테이너
  -> anoju-front 선택
  -> 중지
  -> 삭제
```

주의:

- 삭제하는 것은 컨테이너입니다.
- 이미지 삭제와 컨테이너 삭제는 다릅니다.
- 이 프론트 컨테이너는 별도 데이터 볼륨을 쓰지 않으므로 컨테이너를 삭제해도 게시글이나 회원 데이터가 삭제되지 않습니다.
- 게시글과 회원 데이터는 PocketBase 쪽 데이터입니다.

### 16.4 기존 이미지 교체

이미지 목록에서 기존 `anoju-front:latest`가 남아 있으면 삭제한 뒤, 새 `anoju-front.tar`를 다시 가져옵니다.

```text
Container Manager
  -> 이미지
  -> anoju-front:latest 선택
  -> 삭제
  -> 추가 또는 가져오기
  -> 새 anoju-front.tar 선택
```

그 다음 10번과 동일하게 컨테이너를 다시 생성합니다.

포트 설정은 기존과 동일하게 사용합니다.

```text
로컬 포트 또는 NAS 포트: 8080
컨테이너 포트: 80
프로토콜: TCP
```

역방향 프록시 설정은 이미 되어 있다면 다시 만들 필요가 없습니다.

## 17. 재배포 빠른 요약

업데이트 배포 때마다 반복할 작업:

```text
PC:
  pnpm build
  docker build -t anoju-front .
  docker save -o anoju-front.tar anoju-front

NAS:
  기존 anoju-front 컨테이너 중지 및 삭제
  기존 anoju-front 이미지 삭제
  새 anoju-front.tar 가져오기
  anoju-front 컨테이너 재생성
  8080 -> 80 포트 매핑 확인
```

확인 주소:

```text
http://192.168.0.36:8080
https://anoju.synology.me
```

## 18. 자주 헷갈리는 부분

### 18.1 `docker build -t anoju-front .`는 어디서 실행하나요?

Windows PC의 프로젝트 루트에서 실행합니다.

```powershell
cd D:\git-workspace\anoju-react2
docker build -t anoju-front .
```

NAS에서 실행하는 명령이 아닙니다. 현재 방식은 PC에서 이미지를 만들어 NAS에 올리는 방식입니다.

### 18.2 NAS에서 `pnpm i`를 해야 하나요?

아니요. 이 배포 방식에서는 NAS에서 `pnpm i`를 하지 않습니다.

NAS는 이미 만들어진 Docker 이미지를 실행만 합니다. 빌드는 PC에서 합니다.

### 18.3 `anoju-front.tar`를 가져왔는데 접속이 안 됩니다.

이미지 가져오기만으로는 컨테이너가 실행되지 않습니다.

다음을 확인합니다.

```text
1. 이미지 목록에 anoju-front:latest가 있는지
2. 그 이미지로 컨테이너를 생성했는지
3. 컨테이너 상태가 실행 중인지
4. 포트 매핑이 8080 -> 80인지
5. http://NAS_IP:8080으로 접속했는지
```

### 18.4 `Web Station을 통해 웹 포털 설정`을 체크해야 하나요?

처음 테스트할 때는 체크하지 않아도 됩니다.

이 문서의 기준은 Container Manager에서 직접 포트 매핑을 설정하는 방식입니다.

```text
NAS 포트 8080 -> 컨테이너 포트 80
```

그 뒤 DSM 역방향 프록시에서 `https://anoju.synology.me`를 `http://localhost:8080`으로 연결합니다.

### 18.5 새로고침하면 404가 날 수 있나요?

현재 컨테이너 방식에서는 `nginx.conf`의 다음 설정 때문에 정상 동작해야 합니다.

```nginx
try_files $uri $uri/ /index.html;
```

새로고침 시 404가 난다면 새 이미지에 `nginx.conf`가 제대로 포함되었는지 확인합니다.

### 18.6 `latest`로 계속 올려도 되나요?

가능합니다. 다만 Container Manager가 기존 이미지를 계속 붙잡고 있으면 새 이미지 반영이 헷갈릴 수 있습니다.

가장 단순한 방식:

```text
기존 컨테이너 삭제
기존 anoju-front:latest 이미지 삭제
새 anoju-front.tar 가져오기
컨테이너 재생성
```

배포 이력을 명확히 남기고 싶다면 태그를 날짜로 붙일 수 있습니다.

```powershell
docker build -t anoju-front:20260525-0730 .
docker save -o anoju-front-20260525-0730.tar anoju-front:20260525-0730
```

이 경우 NAS에서도 해당 태그 이미지를 선택해 컨테이너를 만들면 됩니다.

## 19. 문제 해결

### 19.1 Docker 명령은 있는데 엔진 연결 오류가 납니다.

오류 예:

```text
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

확인:

- Docker Desktop 실행 여부
- Docker Desktop Running 상태 여부
- PowerShell을 새로 열었는지
- WSL2 기반 엔진 사용 여부

### 19.2 `http://192.168.0.36:8080`이 열리지 않습니다.

확인:

- `anoju-front` 컨테이너가 실행 중인지
- 포트 매핑이 `8080 -> 80`인지
- NAS 방화벽에서 8080 포트가 허용되어 있는지
- 같은 내부망에서 접속 중인지
- 컨테이너 로그에 Nginx 오류가 없는지

### 19.3 `https://anoju.synology.me`만 열리지 않습니다.

확인:

- 역방향 프록시 소스가 `HTTPS / anoju.synology.me / 443`인지
- 역방향 프록시 대상이 `HTTP / localhost / 8080`인지
- `anoju.synology.me` 인증서가 연결되어 있는지
- 공유기 포트포워딩 또는 외부 접속 설정이 올바른지

### 19.4 PocketBase 요청이 막힙니다.

확인:

- `.env`의 `VITE_PB_URL`이 `https://pocketbase.anoju.synology.me`인지
- PocketBase CORS에 `https://anoju.synology.me`가 허용되어 있는지
- 브라우저 Console에 CORS 오류가 있는지

### 19.5 수정한 내용이 반영되지 않습니다.

확인:

- `pnpm build`를 다시 했는지
- `docker build`를 다시 했는지
- `docker save`로 새 tar를 만들었는지
- NAS에서 기존 컨테이너와 기존 이미지를 삭제했는지
- 브라우저 캐시를 비우거나 새로고침했는지

필요하면 캐시 없이 이미지를 다시 만듭니다.

```powershell
docker build --no-cache -t anoju-front .
docker save -o anoju-front.tar anoju-front
```
