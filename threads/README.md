# Threads

이 폴더는 앞으로 실제 운영에 쓸 `새 스레드 체계`입니다.

기존 `parallel-agents`는 참고용 아카이브로 두고, 앞으로는 이 폴더를 기준으로 스레드를 나눕니다.

## 운영 원칙

- 현재 대화 스레드는 `00-hq` 역할을 합니다.
- 나머지 스레드는 분야별 실행 스레드입니다.
- 공통 계약 변경은 먼저 `00-hq`에서 판단합니다.
- 각 스레드는 자기 범위 안에서 끝까지 구현하고 결과만 다시 올립니다.

## 시작 순서

1. [CURRENT-STATE](./CURRENT-STATE.md) 를 읽습니다.
2. [COMMON-RULES](./COMMON-RULES.md) 를 읽습니다.
3. 열려는 스레드의 `README.md` 와 `PROMPT.md` 를 읽습니다.
4. 새 스레드 첫 메시지에는 해당 `PROMPT.md` 내용을 그대로 넣습니다.
5. 진행 메모와 결과는 각 스레드의 `work/` 폴더를 사용합니다.

## 스레드 목록

- [00 HQ](./00-hq/README.md)
- [01 Home Contract](./01-home-contract/README.md)
- [02 Content Modules](./02-content-modules/README.md)
- [03 Schedule Modules](./03-schedule-modules/README.md)
- [04 Auth and Data](./04-auth-data/README.md)
- [05 Platform Builder and Deploy](./05-platform-builder-deploy/README.md)
- [06 Tracker Modules](./06-tracker-modules/README.md)

## 지금 추천 가동 순서

1. `02 Content Modules`
2. `03 Schedule Modules`
3. `06 Tracker Modules`
4. `05 Platform Builder and Deploy`
5. `04 Auth and Data`

## 총괄 스레드에서 쓰는 지시 예시

- `01 스레드 열어`
- `01에 홈 카드 계약부터 시켜`
- `02와 03 병렬 패킷 줘`
- `02, 03, 06 병렬 wave 열어`
- `04는 DB 전환 중심으로 잘라`
- `05는 내부망 운영과 저장 구조만 먼저`
- `현황판 업데이트해`

## 바로 쓸 프롬프트 모음

- [Starter Prompts](./STARTER-PROMPTS.md)

## work 폴더 사용법

각 스레드 폴더 아래 `work/`는 실행 중 메모와 결과를 남기는 공간입니다.

- `work/README.md`: 이 폴더를 어떻게 쓰는지
- `work/STATUS.md`: 지금 상태와 다음 액션
- `work/REPORT.md`: 끝났을 때 HQ로 가져올 결과 요약
