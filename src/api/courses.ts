import type { Course, DiPlace, CourseStop } from '@/types/course'
import { mockMapCourses, mockResultCourses, allDiPlaces, mockSearchPlaces } from '@/mocks/courses'
// import { httpGet } from './http'

export async function fetchMapCourses(): Promise<Course[]> {
  // TODO(백엔드 연동): return httpGet<Course[]>('/api/courses/map')
  return Promise.resolve(mockMapCourses)
}

export async function fetchResultCourses(): Promise<Course[]> {
  // TODO(백엔드 연동): return httpGet<Course[]>('/api/courses/result')
  return Promise.resolve(mockResultCourses)
}

export async function fetchDiPlaces(): Promise<DiPlace[]> {
  // TODO(백엔드 연동): return httpGet<DiPlace[]>('/api/places/map-search')
  return Promise.resolve(allDiPlaces)
}

export async function fetchMockSearch(): Promise<Omit<CourseStop, 'stayTime' | 'isLocked'>[]> {
  // TODO(백엔드 연동): return httpGet('/api/places/search')
  return Promise.resolve(mockSearchPlaces)
}
