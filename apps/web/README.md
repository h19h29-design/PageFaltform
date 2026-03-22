# apps/web

Next.js App Router 기반의 실제 가족 홈 애플리케이션입니다.

## 주요 화면

- `/`: 공개 랜딩. 서버에 저장된 가족 홈 목록이 노출됩니다.
- `/f/[familySlug]`: 가족 입구. 비밀번호나 코드로 들어갑니다.
- `/app/[familySlug]`: 가족 홈.
- `/console`: 관리자 콘솔.
- `/console/families/new`: 새 미니 가족 홈 생성.
- `/console/families/[familySlug]`: 가족별 빌더.

## 저장 방식

- 가족 홈 정의와 모듈 구성은 `apps/web/data/family-sites.json` 에 서버 파일로 저장됩니다.
- 그래서 같은 서버를 보는 내부망 기기들은 같은 가족 홈 목록과 같은 모듈 구성을 보게 됩니다.
- 가족 입장 세션과 관리자 세션만 쿠키로 유지됩니다.

## 인증 경계

- `/f/[familySlug]`
  - 가족 공유 비밀값으로 들어가는 가족 입장 흐름입니다.
  - 가족 홈 읽기/이용 세션만 발급하고, 콘솔 권한은 주지 않습니다.
- `/console/sign-in`
  - owner/admin 운영자 전용 로그인입니다.
  - 가족 공유 비밀값과 분리된 별도 세션으로 콘솔과 빌더를 보호합니다.
- 두 흐름은 서로 대체되지 않습니다.

## 내부망 실행

1. 루트에서 `npm install`
2. 루트에서 `npm run dev:lan`
3. 같은 네트워크 기기에서 `http://<서버IP>:3001`

프로덕션 빌드 후 내부망에서 띄우려면:

1. 루트에서 `npm run build`
2. 루트에서 `npm run start:lan`

## 빠른 테스트

관리자 로그인:

- `owner@yoon.local / demo-owner`
- `admin@park.local / demo-admin`

추천 흐름:

1. `/console` 로그인
2. `/console/families/new` 에서 새 미니 가족 홈 생성
3. `/console/families/[familySlug]` 에서 모듈 순서와 프리셋 조정
4. `/f/[familySlug]`, `/app/[familySlug]` 로 바로 확인
