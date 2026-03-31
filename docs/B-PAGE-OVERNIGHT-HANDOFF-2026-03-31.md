# B-page Overnight Handoff

## 오늘 밤 마감 상태

- `B-page` 통합 메인, 가족홈, 클럽 흐름이 한 저장소 안에서 함께 동작합니다.
- 공개 화면, 멤버 공간, 관리자 콘솔의 톤을 분리했고 설명형 문구를 많이 걷어냈습니다.
- 클럽 쪽은 공개 소개, 가입 신청, 승인 대기, 멤버 앱 진입, 공지/일정/갤러리 CRUD까지 로컬에서 테스트 가능한 상태입니다.
- 새 클럽을 만들면 기본 공지, 일정, 갤러리 샘플이 깨지지 않은 한국어로 바로 들어가도록 seed를 정리했습니다.
- 콘솔 메인, 가족 설정, 클럽 생성, 클럽 관리 화면의 깨진 한글을 정리했습니다.

## 지금 바로 볼 주소

- 메인: `http://127.0.0.1:3001/`
- 가족 공개: `http://127.0.0.1:3001/family`
- 클럽 공개: `http://127.0.0.1:3001/club`
- 클럽 목록: `http://127.0.0.1:3001/clubs`
- 샘플 클럽 공개: `http://127.0.0.1:3001/clubs/bpage-running-crew`
- 샘플 클럽 가입: `http://127.0.0.1:3001/clubs/bpage-running-crew/join`
- 가족 입구: `http://127.0.0.1:3001/f/yoon`
- 회원가입: `http://127.0.0.1:3001/sign-up`
- 로그인: `http://127.0.0.1:3001/sign-in`
- 콘솔 로그인: `http://127.0.0.1:3001/console/sign-in`

## 테스트 계정

- 마스터: `owner@yoon.local / demo-owner`
- 가족 입장 비밀번호: `yoon1234`

## 내일 아침 추천 테스트 순서

1. 메인에서 `가족홈`과 `클럽` 진입이 자연스러운지 확인
2. `클럽 공개 -> 클럽 목록 -> B-page 러닝 크루 -> 가입 신청` 흐름 확인
3. 마스터로 콘솔 로그인
4. `클럽 만들기`로 새 클럽 1개 생성
5. 다른 브라우저 세션에서 일반 회원가입
6. 방금 만든 클럽에 가입 신청
7. 마스터 세션에서 `console/clubs/[slug]`에서 승인
8. 승인된 계정으로 `클럽 멤버 홈` 진입
9. 클럽 공지, 일정, 갤러리에서 생성/수정/삭제 테스트
10. 가족 쪽도 `f/yoon -> app/yoon` 흐름과 게시판 CRUD 확인

## 오늘 검증한 것

- `npm run typecheck --workspace @ysplan/web` 통과
- `npm run build` 통과
- `http://127.0.0.1:3001/` 200
- `http://127.0.0.1:3001/family` 200
- `http://127.0.0.1:3001/club` 200
- `http://127.0.0.1:3001/clubs` 200
- `http://127.0.0.1:3001/clubs/bpage-running-crew` 200
- `http://127.0.0.1:3001/clubs/bpage-running-crew/join` 200
- `http://127.0.0.1:3001/console/sign-in` 200
- `http://127.0.0.1:3001/f/yoon` 200
- 비로그인 상태에서 `http://127.0.0.1:3001/clubs/bpage-running-crew/app` 는 307 리다이렉트

## 이번에 크게 바뀐 영역

- 공개 클럽 화면
  - 소개, 목록, 상세, 가입 신청 화면 정리
- 클럽 멤버 화면
  - 멤버 홈
  - 공지 목록/상세/새로 만들기/수정
  - 일정 목록/상세/새로 만들기/수정
  - 갤러리 목록/상세/새로 만들기/수정
- 관리자 콘솔
  - 메인 콘솔 문구 정리
  - 가족 설정 화면 문구 정리
  - 클럽 생성 화면 문구 정리
  - 클럽 관리 화면 문구 정리
- 데이터
  - `club-sites.json` 정리
  - `club-content-modules.json` 정리
  - 새 클럽 seed 문구 정리

## 아직 남은 것

- 클럽의 `leaderboard / faq / resources` 는 아직 보조 공간입니다.
- 클럽 초대 링크/초대 토큰 흐름은 아직 없습니다.
- DB를 기본 source of truth로 쓰는 최종 전환은 아직 아닙니다.
- NAS 배포와 도메인 연결은 아직 시작하지 않았습니다.

## 다른 컴퓨터에서 이어서 작업하는 법

- Git 저장소: `https://github.com/h19h29-design/PageFaltform`

```powershell
git clone https://github.com/h19h29-design/PageFaltform.git
cd PageFaltform
npm install
npm run build
npm run start:lan
```

- 실행 후 `http://127.0.0.1:3001` 에서 바로 확인

## 다음 추천 작업

1. 새 클럽 생성부터 가입 신청/승인/CRUD까지 실제 체감 점검
2. 클럽 보조 모듈 실기능 붙이기
3. 가족/클럽 공통 테마 세부 다듬기
4. DB 기본 전환 시작
