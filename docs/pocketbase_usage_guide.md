# 📦 PocketBase 사용 및 개발 가이드

이 문서는 **anoju-react** 프로젝트에서 PocketBase를 사용하여 백엔드 기능을 구현하는 방법과 규칙을 설명합니다.

## 1. 서버 정보

- **프론트 운영 URL:** `https://anoju.synology.me`
- **Admin UI:** `https://pocketbase.anoju.synology.me/_/`
- **API URL:** `https://pocketbase.anoju.synology.me`

## 2. SDK 설치 및 초기화

```bash
npm install pocketbase
```

`src/lib/pocketbase.ts` (또는 유사 경로)에 공통 인스턴스를 생성하여 사용합니다.

```typescript
import PocketBase from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_PB_URL)
export default pb
```

## 3. 주요 구현 규칙

### 🔐 인증 (Authentication)

- 계정 생성 및 로그인은 SDK의 `collection('users').authWithPassword()` 등을 사용합니다.
- 로그인 상태 유지는 `pb.authStore.isValid`로 확인합니다.

### 📁 데이터 읽기/쓰기 (CRUD)

- **목록 가져오기:** `pb.collection('컬렉션명').getList(page, perPage, { filter: '...' })`
- **단일 항목:** `pb.collection('컬렉션명').getOne('RECORD_ID')`
- **생성/수정:** `pb.collection('컬렉션명').create(formData)`

### ⚡ 실시간 업데이트 (Realtime)

- 데이터의 실시간 동기화가 필요한 경우 `subscribe`를 사용합니다.

```typescript
pb.collection('messages').subscribe('*', (e) => {
  console.log(e.action, e.record)
})
```

## 4. 보안 및 API 규칙

- PocketBase 관리자 페이지에서 각 컬렉션의 **API Rules**를 반드시 설정해야 합니다.
- 기본적으로 모든 권한은 `Locked` 상태이며, 필요한 경우에만 `Admin Only` 또는 `User (Verify ID)` 등으로 개방합니다.

## 5. 이미지 및 파일 처리

- 파일 업로드 시 `FormData`를 사용하며, 파일 URL은 `pb.files.getUrl(record, filename)` 함수를 사용해 생성합니다.
