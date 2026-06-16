import { Coffee, Trees, Utensils } from 'lucide-vue-next'
import type { User, Journal, MyCourse, Character, MapPin, UserPhoto } from '@/types/user'
import type { Place } from '@/types/place'

export const mockUser: User = {
  nickname: '홍길동',
  email: 'hong@example.com',
  statusMessage: '대전 환승 여행 중! 🥖',
  profileImage: null,
  level: 13,
  xp: 750,
  xpForNext: 1000,
  stampCount: 7,
}

export const mockJournals: Journal[] = [
  { date: '12월 03일', icon: Coffee, title: '성심당 투어', count: 3, bg: '#FEF3C7', iconColor: '#D97706' },
  { date: '1월 21일', icon: Trees, title: '산책 코스', count: 2, bg: '#D1FAE5', iconColor: '#059669' },
  { date: '1월 08일', icon: Utensils, title: '시장 맛집', count: 4, bg: '#FCE7F3', iconColor: '#DB2777' },
]

export const mockMyCourses: MyCourse[] = [
  {
    id: 1,
    title: '성심당 → 한밭수목원',
    rating: 4.5,
    badge: '방문완료',
    badgeStyle: 'background:#D1FAE5;color:#065F46',
    placeCount: 2,
    duration: '3시간',
  },
  {
    id: 2,
    title: '중앙시장 → 지림미술관',
    rating: 4.0,
    badge: '분류미정',
    badgeStyle: 'background:#F3F4F6;color:#6B7280',
    placeCount: 2,
    duration: '2시간 30분',
  },
]

// LikedPlace → Place 타입으로 통일
// TODO(백엔드 연동): 실제 좋아요 장소는 관광지 API에서 id 기반으로 조회
export const mockLikedPlaces: Place[] = [
  {
    id: 1,
    name: '성심당 본점',
    category: '음식 · 베이커리',
    isOpen: true,
    rating: 4.8,
    description: '대전의 명물 빵집. 튀김소보로와 판타롱부추빵이 유명해요.',
    distance: '대전역에서 도보 10분',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
    duration: '40분',
    reviewCount: 3240,
  },
  {
    id: 2,
    name: '한밭수목원',
    category: '자연 · 공원',
    isOpen: true,
    rating: 4.6,
    description: '도심 속 대형 수목원. 힐링 산책과 포토존으로 유명해요.',
    distance: '대전역에서 버스 20분',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    duration: '80분',
    reviewCount: 1820,
  },
  {
    id: 3,
    name: '중앙시장',
    category: '쇼핑 · 시장',
    isOpen: false,
    rating: 4.3,
    description: '대전의 전통 재래시장. 다양한 먹거리와 기념품을 만나보세요.',
    distance: '대전역에서 도보 15분',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    duration: '60분',
    reviewCount: 980,
  },
]

export const mockCharacters: Character[] = [
  {
    id: 1,
    name: '꿈돌이 베이직',
    emoji: '🌟',
    unlocked: true,
    description: '가장 기본적이고 귀여운 대전의 마스코트 꿈돌이입니다.',
    poses: ['🌟', '✨', '🎵'],
  },
  {
    id: 2,
    name: '꿈돌이 탐험가',
    emoji: '🗺️',
    unlocked: true,
    description: '대전 방방곳곳을 탐험하며 기록을 남기는 탐험가 꿈돌이입니다.',
    poses: ['🗺️', '🧭', '🎒'],
  },
  {
    id: 3,
    name: '꿈돌이 미식가',
    emoji: '🍞',
    unlocked: true,
    description: '빵과 맛있는 음식을 사랑하는 대전 최고의 미식가 꿈돌이입니다.',
    poses: ['🍞', '🍕', '🍰'],
  },
  {
    id: 4,
    name: '꿈돌이 문화인',
    emoji: '🎭',
    unlocked: false,
    description: '미술관과 전시회를 즐겨 찾는 감성 가득한 문화인 꿈돌이입니다.',
    poses: ['🎭'],
  },
  {
    id: 5,
    name: '꿈돌이 자연인',
    emoji: '🌿',
    unlocked: false,
    description: '수목원과 대청호의 맑은 공기를 좋아하는 자연인 꿈돌이입니다.',
    poses: ['🌿'],
  },
  {
    id: 6,
    name: '꿈돌이 대전왕',
    emoji: '👑',
    unlocked: false,
    description: '모든 코스를 섭렵한 진정한 대전의 끝판왕 꿈돌이입니다.',
    poses: ['👑'],
  },
]

export const mockMapPins: MapPin[] = [
  {
    id: 1,
    location: '성심당 본점',
    journalTitle: '성심당 빵지순례 투어',
    visitDate: '2026년 12월 03일',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  },
  {
    id: 2,
    location: '한밭수목원',
    journalTitle: '주말 힐링 산책 코스',
    visitDate: '2026년 01월 21일',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  },
]

export const mockUserPhotos: UserPhoto[] = [
  { id: 1, url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', location: '성심당 본점' },
  { id: 2, url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', location: '한밭수목원' },
  { id: 3, url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', location: '중앙시장' },
  { id: 4, url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', location: '대흥동 카페거리' },
  { id: 5, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', location: '식장산 야경' },
  { id: 6, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', location: '대청호 오백리길' },
]
