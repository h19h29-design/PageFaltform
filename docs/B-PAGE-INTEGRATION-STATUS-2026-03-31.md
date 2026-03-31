# B-page 통합 상태 정리

날짜: 2026-03-31
프로젝트 루트: `C:\gpt\01project\YSplan`
기준 저장소: `https://github.com/h19h29-design/PageFaltform.git`

## 이번 단계에서 정한 기준

- 서비스 메인 이름은 `B-page`
- Git 원격 기본 저장소는 `PageFaltform`
- 가족홈 생성 제한은 정회원 기준 `최대 1개`
- 클럽 생성 제한은 정회원 기준 `최대 3개`
- 로컬에서 충분히 테스트한 뒤 NAS와 도메인 연결은 마지막 단계에서 진행

## 지금까지 반영된 통합 방향

- 메인 공개 홈 `/` 에서 `가족홈` 과 `클럽` 두 갈래를 선택할 수 있게 구성
- 가족 영역은 기존 `homepage` 쪽 구조를 유지
- 클럽 영역은 `huhahuha` 쪽 아이디어를 `B-page` 공개 라우트로 흡수
- 공통 계정, 권한, 공개/비공개, 승인, 테마는 공유 가능하게 확장
- 가족 데이터와 클럽 데이터는 분리 유지

## 새로 동작하는 공개 라우트

- `/`
- `/family`
- `/club`
- `/clubs`
- `/clubs/[clubSlug]`
- `/clubs/[clubSlug]/join`

## 기존 라우트 중 계속 유지되는 영역

- `/f/[familySlug]`
- `/app/[familySlug]`
- `/console`
- `/console/families/new`
- `/console/families/[familySlug]`
- `/console/clubs/new`
- `/console/clubs/[clubSlug]`
- `/sign-in`
- `/sign-up`

## 핵심 구현 요약

### 공개 홈

- `B-page` 통합 랜딩 구성
- 가족과 클럽을 한 화면에서 분기
- 공개 미리보기 카드로 가족과 클럽을 바로 탐색 가능

### 클럽 스토어

- 파일 기반 클럽 저장소 추가
- 공개/비공개
- 가입 정책
- 소유자/멤버 정보
- 샘플 클럽 3종
- 정회원 클럽 생성 제한 3개

### 가족 제한

- 정회원 가족홈 생성 제한을 1개로 고정

### DB 게이트

- `DATABASE_URL` 이 있어도 `YSPLAN_ENABLE_DB_BASELINE=1` 이 없으면 DB source of truth 로 강제 진입하지 않도록 조정
- 로컬에서 Postgres 없이도 공개 흐름 테스트 가능

### 공개 클럽 흐름

- 클럽 목록
- 클럽 상세
- 클럽 가입 요청 화면

## 로컬 테스트 상태

아래 주소는 2026-03-31 기준 `200` 응답을 확인함

- `http://127.0.0.1:3001/`
- `http://127.0.0.1:3001/family`
- `http://127.0.0.1:3001/club`
- `http://127.0.0.1:3001/clubs`
- `http://127.0.0.1:3001/clubs/bpage-running-crew`
- `http://127.0.0.1:3001/clubs/bpage-running-crew/join`
- `http://127.0.0.1:3001/console/sign-in`
- `http://127.0.0.1:3001/f/yoon`

검증 결과

- `npm run typecheck --workspace @ysplan/web` 통과
- `npm run build` 통과

## 다음 우선 작업

1. 메인 공개 홈과 클럽 공개 화면의 실제 브라우저 QA
2. 가족/클럽 공통 테마 10종 완성 및 선택 UI 정리
3. 클럽 관리자 흐름을 실제 운영형으로 확장
4. 가족/클럽 공통 계정 정책과 승인 플로우 통합 정리
5. 로컬 테스트 매트릭스 문서화
6. 버전업 단위로 `PageFaltform` 에 푸시하고 옵시디언 기록 남기기

## 참고 메모

- 기존 `homepage` 원격은 `homepage-origin` 으로 보존
- 현재 기본 `origin` 은 `PageFaltform`
- 일부 PowerShell 출력에서는 한글이 깨져 보일 수 있으나, 빌드와 라우트 검증은 정상 통과
