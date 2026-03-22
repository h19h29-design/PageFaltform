# packages/platform

플랫폼 운영 기능과 운영자가 직접 다루는 설정 계약을 담당합니다.

## 현재 책임

- 가족 생성과 빌더 프리셋 기준
- 운영자가 수정하는 설정 카탈로그
- 파일 저장 -> DB 저장 전환 체크리스트
- 내부망 운영 기준과 배포 준비 체크리스트

## 운영자 설정 묶음

- `identity`: 가족 홈 이름, 슬러그, 소개 문구, 가족 무드
- `access`: 입장 방식, 입장 비밀값
- `builder`: 홈 프리셋, 입장 프리셋, 활성 모듈, 모듈 순서, 테마 프리셋
- `domain`: 커스텀 도메인 연결 준비
- `storage`: 현재 저장 백엔드와 DB 연결 준비 상태
- `operations`: 타임존, 가족 인원 수, LAN 기본 주소
- `deployment`: 헬스체크와 배포 후 스모크 테스트 기준

코드에서는 `platformOperatorSettingCatalog`, `dbMigrationChecklist`,
`lanOperationsChecklist`, `deploymentReadinessChecklist`를 기준선으로 사용합니다.

## 다음 단계 메모

- 콘솔에서 실제로 노출할 설정 화면은 위 카탈로그를 그대로 UI 그룹으로 연결합니다.
- DB 전환 시에는 `workspace-draft`와 `tenant-record` 필드를 각각 테이블 단위로 분리합니다.
- 배포 환경이 생기면 파일 저장 여부를 환경설정으로 분기하고, 헬스체크와 스모크 테스트를 릴리스 절차에 붙입니다.
