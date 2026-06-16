import type { User, Journal, MyCourse, Character, MapPin, UserPhoto } from '@/types/user'
import type { Place } from '@/types/place'
import {
  mockUser,
  mockJournals,
  mockMyCourses,
  mockLikedPlaces,
  mockCharacters,
  mockMapPins,
  mockUserPhotos,
} from '@/mocks/user'
// import { httpGet } from './http'

export async function fetchUser(): Promise<User> {
  // TODO(백엔드 연동): return httpGet<User>('/api/user/me')
  return Promise.resolve({ ...mockUser })
}

export async function fetchJournals(): Promise<Journal[]> {
  // TODO(백엔드 연동): return httpGet<Journal[]>('/api/user/journals')
  return Promise.resolve(mockJournals)
}

export async function fetchUserActivity(): Promise<{
  myCourses: MyCourse[]
  likedPlaces: Place[]   // LikedPlace → Place 로 통일
}> {
  // TODO(백엔드 연동): return httpGet('/api/user/activity')
  // 백엔드 연동 시 likedPlaces는 관광지 API에서 id 기반으로 조회
  return Promise.resolve({ myCourses: mockMyCourses, likedPlaces: mockLikedPlaces })
}

export async function fetchCharacters(): Promise<Character[]> {
  // TODO(백엔드 연동): return httpGet<Character[]>('/api/user/characters')
  return Promise.resolve(mockCharacters)
}

export async function fetchPostcardData(): Promise<{ mapPins: MapPin[]; userPhotos: UserPhoto[] }> {
  // TODO(백엔드 연동): return httpGet('/api/user/postcard')
  return Promise.resolve({ mapPins: mockMapPins, userPhotos: mockUserPhotos })
}
