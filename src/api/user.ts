import type { User, Journal, MyCourse, LikedPlace, Character, MapPin, UserPhoto } from '@/types/user'
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
  likedPlaces: LikedPlace[]
}> {
  // TODO(백엔드 연동): return httpGet('/api/user/activity')
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
