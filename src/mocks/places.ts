import type { Place } from '@/types/place'

/** HomeView 인기 명소 카드 목록 */
export const mockSpots: Place[] = [
  {
    id: '1',
    name: '성심당',
    category: '맛집 · 베이커리',
    description: '1956년부터 이어온 대전의 대표 빵집. 튀김소보로와 부추빵으로 유명한 전국구 명소.',
    distance: '대전역에서 도보 10분',
    duration: '30~60분',
    rating: 4.9,
    reviews: 3240,
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlcnklMjBicmVhZCUyMHBhc3RyeSUyMHNob3B8ZW58MXx8fHwxNzgxMjM5Mjk2fDA&ixlib=rb-4.1.0&q=80&w=800',
    tag: '🍞 베이커리',
  },
  {
    id: '2',
    name: '한밭수목원',
    category: '자연 · 공원',
    description:
      '도심 속 녹색 쉼터. 국내 최대 규모의 도시 수목원으로 사계절 다양한 꽃과 나무를 만날 수 있습니다.',
    distance: '대전역에서 버스 20분',
    duration: '60~120분',
    rating: 4.7,
    reviews: 1850,
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1651422933132-d3e8822d8b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3RhbmljYWwlMjBnYXJkZW4lMjBuYXR1cmUlMjBwYXJrfGVufDF8fHx8MTc4MTIzOTI5N3ww&ixlib=rb-4.1.0&q=80&w=800',
    tag: '🌿 자연',
  },
  {
    id: '3',
    name: '테미오래',
    category: '문화 · 역사',
    description:
      '일제강점기 관사촌을 문화공간으로 재생한 곳. 갤러리, 카페, 공방이 어우러진 복합 문화 공간.',
    distance: '대전역에서 버스 15분',
    duration: '60~90분',
    rating: 4.6,
    reviews: 920,
    isOpen: false,
    image:
      'https://images.unsplash.com/photo-1734287096542-daa9300f1484?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjB0cmFkaXRpb25hbCUyMGFyY2hpdGVjdHVyZSUyMGdhcmRlbnxlbnwxfHx8fDE3ODEyMzkyOTV8MA&ixlib=rb-4.1.0&q=80&w=800',
    tag: '🏛 문화',
  },
  {
    id: '4',
    name: '중앙시장',
    category: '쇼핑 · 시장',
    description:
      '대전의 전통 재래시장. 다양한 먹거리와 생활용품, 기념품을 저렴하게 구입할 수 있어요.',
    distance: '대전역에서 도보 15분',
    duration: '30~60분',
    rating: 4.4,
    reviews: 670,
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    tag: '🛍 쇼핑',
  },
  {
    id: '5',
    name: '국립중앙과학관',
    category: '문화 · 과학',
    description: '과학과 기술의 역사를 한눈에. 아이들과 함께 오기 좋은 체험형 과학 전시관.',
    distance: '대전역에서 버스 25분',
    duration: '90~150분',
    rating: 4.5,
    reviews: 1120,
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1532094349884-543559059456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    tag: '🔬 과학',
  },
  {
    id: '6',
    name: '보문산',
    category: '자연 · 등산',
    description:
      '대전 도심에서 가장 가까운 산. 가볍게 산책하기 좋고 정상에서 대전 시내 전경이 한눈에.',
    distance: '대전역에서 버스 20분',
    duration: '60~120분',
    rating: 4.3,
    reviews: 540,
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    tag: '⛰ 자연',
  },
]

/** PlaceDetailContents 상세 정보 데이터베이스 */
export const allPlacesDatabase: Place[] = [
  {
    id: '1',
    name: '성심당 본점',
    category: '맛집/빵집',
    tags: ['베이커리', '대전 명물', '튀김소보로'],
    rating: 4.8,
    reviewCount: 2453,
    isOpen: true,
    hours: '08:00 ~ 22:00',
    address: '대전 중구 대종로480번길 15',
    phone: '042-256-4314',
    distance: '도보 10분 (450m)',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80',
    description:
      '1956년에 창업한 대전의 대표 빵집입니다. 대전을 방문하면 반드시 들러야 하는 명소로, 튀김소보로, 판타롱슈크림빵 등 다양한 명물 빵들이 가득합니다.',
    liked: false,
    nearbyPlaces: [
      { id: '3', name: '중앙시장', category: '맛집/빵집', distance: '도보 5분' },
      { id: '4', name: '소제동 카페거리', category: '카페', distance: '택시 7분' },
    ],
  },
  {
    id: '2',
    name: '한밭수목원',
    category: '관광명소',
    tags: ['자연', '힐링명소', '산책코스'],
    rating: 4.6,
    reviewCount: 892,
    isOpen: true,
    hours: '06:00 ~ 21:00',
    address: '대전 서구 만년동 396',
    phone: '042-270-8452',
    distance: '버스 20분',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
    description:
      '도심 속 녹색 쉼터이자 정부대전청사와 엑스포과학공원의 중앙에 위치한 대한민국 최대 규모의 도심 수목원입니다. 사계절 아름다운 인공수목원을 감상할 수 있습니다.',
    liked: false,
    nearbyPlaces: [{ id: '5', name: '이응노미술관', category: '문화/예술', distance: '도보 3분' }],
  },
  {
    id: '3',
    name: '중앙시장',
    category: '맛집/빵집',
    tags: ['전통시장', '먹거리', '대전역근처'],
    rating: 4.3,
    reviewCount: 412,
    isOpen: true,
    hours: '09:00 ~ 22:00',
    address: '대전 동구 중앙로 200-1',
    phone: '042-226-0319',
    distance: '도보 5분',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80',
    description:
      '대전역 바로 앞에 위치한 중부권 최대 규모의 전통 재래시장입니다. 다양한 로컬 주전부리와 먹자골목이 발달해 있어 가벼운 레이오버 여행에 제격입니다.',
    liked: false,
    nearbyPlaces: [
      { id: '1', name: '성심당 본점', category: '맛집/빵집', distance: '도보 5분' },
    ],
  },
]
