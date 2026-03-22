# Board

기준일: `2026-03-21`

| Thread | 상태 | 비고 |
| --- | --- | --- |
| `00-hq` | active | 현재 대화 스레드 |
| `01-home-contract` | next-support | 계약 감리 + 페이지 일관성 + 최종 QA 기준 정리 |
| `02-content-modules` | next-critical | 콘텐츠 게시판 실제 페이지와 CRUD 폼 구현 |
| `03-schedule-modules` | next-critical | 일정/할 일 계열 실제 페이지와 CRUD 폼 구현 |
| `04-auth-data` | next-critical | 가입/로그인/세션/DB source of truth 연결 |
| `05-platform-builder-deploy` | next-critical | 전체 페이지 라우팅, 모듈 메뉴, 통합 쉘, 운영 동선 정리 |
| `06-tracker-modules` | next-critical | progress / habits 실제 페이지와 CRUD 폼 구현 |

## 현재 기준선

- 여러 미니 가족 홈 생성 가능
- 내부망 접속 가능
- `npm run check` 통과
- `/` 응답 `200`
- 홈 카드 계약과 direct builder 합성까지는 완료됨
- 콘텐츠/일정/트래커 모듈 builder는 준비됨
- DB 전환용 schema / repository / bootstrap CLI가 준비됨
- 하지만 실제 가입, 게시판 CRUD, 모듈별 상세 페이지는 아직 비어 있는 구간이 많음
- 다음 핵심은 `실제 페이지 + 가입 + 수정 가능한 CRUD + 로컬 완성품 테스트` 단계

## 지금 바로 열면 좋은 병렬 wave

- `04-auth-data`
- `05-platform-builder-deploy`
- `02-content-modules`
- `03-schedule-modules`
- `06-tracker-modules`
- `01-home-contract`

이유:

- `04`와 `05`가 가입/세션/페이지 라우팅의 기반을 먼저 열어야 합니다.
- `02`, `03`, `06`은 그 기반 위에 실제 읽기/쓰기 가능한 모듈 페이지를 병렬로 채워야 합니다.
- `01`은 마지막에 계약 감리와 QA 기준 정리를 맡으면 됩니다.
