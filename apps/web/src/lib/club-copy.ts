import type { ClubPublicPreview, RuntimeClubRecord } from "./club-sites-store";

const clubModuleCopy: Record<string, { label: string; description: string }> = {
  announcements: {
    label: "공지",
    description: "운영 공지와 중요한 안내를 모아보는 게시판",
  },
  events: {
    label: "일정",
    description: "정기 모임과 번개 일정을 한눈에 보는 게시판",
  },
  gallery: {
    label: "갤러리",
    description: "활동 사진과 기록을 모아보는 게시판",
  },
  leaderboard: {
    label: "리더보드",
    description: "기록과 참여 순위를 보는 공간",
  },
  faq: {
    label: "FAQ",
    description: "처음 들어오는 멤버가 자주 찾는 안내 모음",
  },
  resources: {
    label: "자료실",
    description: "운영 문서와 체크리스트를 모아두는 공간",
  },
};

const clubDisplayOverrides: Record<
  string,
  Partial<
    Pick<
      RuntimeClubRecord,
      | "name"
      | "tagline"
      | "description"
      | "sportLabel"
      | "category"
      | "location"
      | "currentFocus"
      | "nextEventLabel"
      | "ownerName"
      | "sampleModules"
      | "sections"
      | "highlights"
    >
  >
> = {
  "bpage-running-crew": {
    name: "B-page 러닝 크루",
    tagline: "주간 러닝 일정과 활동 기록을 가볍게 이어 보는 모임",
    description:
      "초보부터 기록 갱신을 노리는 멤버까지 함께 달리는 러닝 크루입니다. 공지, 일정, 활동 사진, 주간 챌린지 흐름을 한 보드에서 관리합니다.",
    sportLabel: "러닝",
    category: "러닝",
    location: "서울 사의",
    currentFocus: "4월 10km 완주 챌린지",
    nextEventLabel: "목요일 20:00 사의천 러닝 5km",
    ownerName: "민호 캡틴",
    sampleModules: ["공지", "일정", "갤러리", "리더보드", "FAQ"],
    sections: [
      {
        key: "announcement",
        title: "이번 주 공지",
        description: "집결 장소, 우천 시 대체 동선, 준비물을 먼저 확인합니다.",
        audience: "public",
      },
      {
        key: "event",
        title: "다음 러닝 일정",
        description: "이번 주 러닝 루트와 페이스 그룹 안내를 보여줍니다.",
        audience: "public",
      },
      {
        key: "leaderboard",
        title: "주간 챌린지",
        description: "활동 기록과 상위 멤버 순위를 멤버 전용으로 보여줍니다.",
        audience: "member",
      },
    ],
    highlights: [
      { label: "다음 모임", value: "목요일 20:00" },
      { label: "이번 달 누적", value: "624km" },
      { label: "가입 방식", value: "로그인 후 신청" },
    ],
  },
  "sunrise-swim-lab": {
    name: "선라이즈 스윔 랩",
    tagline: "훈련 노트와 출석 흐름을 차분하게 관리하는 수영 커뮤니티",
    description:
      "새벽 수영을 함께 이어가는 멤버를 위한 모임입니다. 훈련 노트, 출석, 활동 사진, 준비 체크를 한 화면에서 정리합니다.",
    sportLabel: "수영",
    category: "수영",
    location: "서울 사의",
    currentFocus: "자유형 기록 정복 주간",
    nextEventLabel: "수요일 08:00 인터벌 세션",
    ownerName: "서연 코치",
    sampleModules: ["공지", "일정", "자료실", "갤러리", "FAQ"],
    sections: [
      {
        key: "training",
        title: "이번 주 훈련 사인",
        description: "이번 주 훈련 목표와 체크 사인을 먼저 보여줍니다.",
        audience: "public",
      },
      {
        key: "attendance",
        title: "출석과 기록",
        description: "개인 기록과 출석 로그를 멤버에게만 보여줍니다.",
        audience: "member",
      },
    ],
    highlights: [
      { label: "이번 주 세션", value: "총 8회" },
      { label: "공유 자료", value: "훈련 노트 업데이트" },
      { label: "가입 방식", value: "로그인 후 신청" },
    ],
  },
  "night-photo-room": {
    name: "나이트 포토 룸",
    tagline: "출사 일정과 결과물을 차분하게 정리하는 사진 모임",
    description:
      "야간 출사를 중심으로 움직이는 사진 모임입니다. 비공개 운영이며, 승인된 멤버만 결과물 큐레이션과 일정 보드를 볼 수 있습니다.",
    sportLabel: "사진",
    category: "사진",
    location: "서울 을지로",
    currentFocus: "야간 골목 스트리트 컬렉션",
    nextEventLabel: "금요일 21:00 을지로 야간 출사",
    ownerName: "하늘 디렉터",
    sampleModules: ["공지", "일정", "갤러리", "FAQ"],
    sections: [
      {
        key: "curation",
        title: "이번 출사 큐레이션",
        description: "선별된 결과물과 멘트를 멤버 전용으로 관리합니다.",
        audience: "member",
      },
      {
        key: "schedule",
        title: "다음 출사 일정",
        description: "시간, 장소, 준비 장비를 일정표로 정리합니다.",
        audience: "public",
      },
    ],
    highlights: [
      { label: "공개 범위", value: "비공개 클럽" },
      { label: "입장 방식", value: "초대 우선" },
      { label: "운영 핵심", value: "결과물 큐레이션" },
    ],
  },
  hahahah: {
    name: "한강 저녁 러닝",
    tagline: "가볍게 모여 달리고 기록을 남기는 테스트용 클럽",
    description:
      "관리자 생성과 가입 승인 흐름을 점검하기 위해 만든 테스트 클럽입니다. 공지, 일정, 갤러리 흐름을 모두 실험할 수 있습니다.",
    sportLabel: "러닝",
    category: "러닝",
    location: "서울",
    currentFocus: "5km 함께 달리기",
    nextEventLabel: "가볍게 한 바퀴 돌기",
    ownerName: "운영자",
    sampleModules: ["공지", "일정", "갤러리", "리더보드", "자료실"],
    sections: [
      {
        key: "announcement",
        title: "운영 공지",
        description: "모임 공지와 준비 사항을 가장 먼저 보여줍니다.",
        audience: "public",
      },
      {
        key: "event",
        title: "다음 일정",
        description: "다가오는 모임과 신청 흐름을 정리합니다.",
        audience: "public",
      },
      {
        key: "member",
        title: "멤버 전용 보드",
        description: "승인된 멤버만 보는 기록과 운영 메모 공간입니다.",
        audience: "member",
      },
    ],
    highlights: [
      { label: "운영 초점", value: "5km 함께 달리기" },
      { label: "다음 일정", value: "가볍게 한 바퀴 돌기" },
      { label: "가입 방식", value: "로그인 후 신청" },
    ],
  },
};

export function getClubModuleCopy(moduleKey: string) {
  return clubModuleCopy[moduleKey] ?? { label: moduleKey, description: moduleKey };
}

export function getDisplayClub<T extends RuntimeClubRecord | ClubPublicPreview>(club: T): T {
  const override = clubDisplayOverrides[club.slug];

  if (!override) {
    return club;
  }

  return {
    ...club,
    ...override,
    sampleModules: override.sampleModules ?? club.sampleModules,
    sections: override.sections ?? club.sections,
    highlights: override.highlights ?? club.highlights,
  };
}
