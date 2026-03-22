# Content CRUD Local Checklist Wave 03

기준일: `2026-03-21`

## 진입 준비

1. 로컬 서버를 켭니다: `npm run dev:lan`
2. 가족 입구로 들어갑니다.
3. 테스트용 비밀값 예시:
   - `yoon` → `yoon1234`
   - `mini-river` → `river2026`
   - `mini-seoul` → `mini2026`

## 공지

1. 목록: `/app/yoon/announcements`
2. 작성: `/app/yoon/announcements/new`
3. 상세: 목록에서 첫 공지를 눌러 `/app/yoon/announcements/[slug]` 로 이동
4. 수정: 상세에서 수정 버튼
5. 삭제: 상세 또는 수정 화면에서 삭제 버튼
6. 확인:
   - `/app/yoon` 홈 카드 제목과 summary가 바뀌는지
   - 공지 카드 클릭 시 실제 상세로 이동하는지

## 글

1. 목록: `/app/yoon/posts`
2. 작성: `/app/yoon/posts/new`
3. 상세: 목록에서 첫 글을 눌러 `/app/yoon/posts/[slug]` 로 이동
4. 수정: 상세에서 수정 버튼
5. 삭제: 상세 또는 수정 화면에서 삭제 버튼
6. 확인:
   - 홈 recent 카드에 글 제목/요약이 반영되는지
   - featured 체크 시 recent 안에서 강조가 유지되는지

## 갤러리

1. 목록: `/app/yoon/gallery`
2. 작성: `/app/yoon/gallery/new`
3. 상세: 목록에서 첫 앨범을 눌러 `/app/yoon/gallery/[slug]` 로 이동
4. 수정: 상세에서 수정 버튼
5. 삭제: 상세 또는 수정 화면에서 삭제 버튼
6. 확인:
   - 홈 recent 카드 badge가 사진 수로 보이는지
   - 캡션과 메모 수 변경이 상세와 홈에서 함께 보이는지

## 일기

1. 목록: `/app/mini-river/diary`
2. 작성: `/app/mini-river/diary/new`
3. 상세: 목록에서 첫 일기를 눌러 `/app/mini-river/diary/[slug]` 로 이동
4. 수정: 상세에서 수정 버튼
5. 삭제: 상세 또는 수정 화면에서 삭제 버튼
6. 확인:
   - 홈 recent 카드가 diary 모듈 항목으로 보이는지
   - mood badge 또는 highlighted 설정이 recent 흐름에 반영되는지

## 저장 확인

1. 각 모듈에서 항목을 생성한 뒤 새로고침합니다.
2. 목록과 상세가 그대로 유지되는지 확인합니다.
3. `apps/web/data/content-modules.json` 에 변경이 기록되는지 확인합니다.

## 홈 링크 확인

1. `/app/yoon` 또는 `/app/mini-river` 로 돌아갑니다.
2. 콘텐츠 카드 하나를 클릭합니다.
3. 실제 상세 페이지로 이동하는지 확인합니다.
4. 수정 후 다시 홈으로 돌아오면 제목, 요약, badge가 바뀌었는지 확인합니다.
