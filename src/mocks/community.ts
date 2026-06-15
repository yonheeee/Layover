import type { Review, Notice, FaqItem, Inquiry } from '@/types/community'

export const mockReviews: Review[] = [
  {
    id: 1,
    category: '공유해요',
    author: '홍길동',
    initials: '홍',
    station: '대전역',
    duration: '3시간 30분',
    places: ['성심당', '테미오래', '한밭수목원'],
    preview:
      '성심당에서 맛있는 빵을 먹고 테미오래에서 감성 사진도 찍고, 한밭수목원에서 산책까지! 3시간이 정말 알차게 느껴졌어요.',
    images: ['', '', ''],
    date: '2026.06.15',
    likes: 24,
    comments: 8,
    liked: false,
    isMine: true,
  },
  {
    id: 2,
    category: '궁금해요',
    author: '기차러버',
    initials: '기',
    station: '대전역',
    duration: '1시간',
    places: ['대전역 근처'],
    preview:
      '환승 시간이 1시간인데 어디 갈 수 있을까요? 걸어서 갈 수 있는 카페 추천해주세요!',
    images: [],
    date: '2026.06.14',
    likes: 5,
    comments: 8,
    liked: false,
    isMine: false,
  },
]

export const mockNotices: Notice[] = [
  {
    id: 1,
    type: '공지/이벤트',
    tag: '공지',
    title: '대전 환승 관광 서비스 오픈 안내',
    date: '2026.06.15',
    content:
      '안녕하세요! 대전 환승 관광 웹앱이 정식 오픈되었습니다. 이제 대전역에서 환승하는 시간 동안 알차게 대전을 즐길 수 있는 코스를 추천받아 보세요.',
    pinned: true,
    open: false,
  },
  {
    id: 2,
    type: '공지/이벤트',
    tag: '이벤트',
    title: '오픈 기념 코스 후기 이벤트 진행 중!',
    date: '2026.06.14',
    content: '추첨을 통해 소정의 상품을 드립니다. 후기를 많이 남겨주세요!',
    pinned: true,
    open: false,
  },
  {
    id: 3,
    type: '공지/이벤트',
    tag: '업데이트',
    title: '코스 편집 기능 업데이트 안내',
    date: '2026.06.10',
    content:
      '이제 추천받은 코스를 직접 편집하실 수 있습니다. 장소를 추가하거나 삭제하고, 원하는 코스로 맞춤 설정해 보세요.',
    pinned: false,
    open: false,
  },
]

export const mockFaqData: FaqItem[] = [
  {
    id: 1,
    question: '비회원도 코스를 추천받을 수 있나요?',
    answer:
      '네, 비회원분들도 메인 화면에서 환승 잔여 시간만 입력하시면 맞춤형 대전 추천 코스를 무료로 조회하실 수 있습니다.',
    open: false,
  },
  {
    id: 2,
    question: '추천된 코스의 소요 시간은 정확한가요?',
    answer:
      '본 서비스는 카카오맵 API 도보 및 대중교통 실시간 데이터를 기반으로 계산됩니다.',
    open: false,
  },
]

export const mockMyInquiries: Inquiry[] = [
  {
    id: 1,
    title: '기차 연착으로 인한 코스 재계산 문의',
    date: '2026.06.12',
    status: '답변완료',
    content:
      '기차가 20분 연착되었을 때 앱에서 실시간으로 코스를 줄여주는 기능이 구현되어 있나요?',
    answer:
      '안녕하세요 유저님, 현재 버전에서는 상단 편집 기능을 통해 수동 장소 삭제를 권장해 드립니다. 추후 자동 리스케줄링 기능을 업데이트할 예정입니다.',
  },
  {
    id: 2,
    title: '회원 탈퇴 및 개인정보 보관 기간 관련',
    date: '2026.06.14',
    status: '접수대기',
    content:
      '회원 탈퇴를 하면 작성했던 커뮤니티 후기 글들도 전부 한 번에 자동 삭제 처리되나요?',
    answer: '',
  },
]
