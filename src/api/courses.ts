import type { DiPlace, CourseStop } from '@/types/course'
import type { CourseGenerateRequest, CourseResponse } from '@/types/course'
import { httpGet, httpPost } from './http'

export async function fetchDiPlaces(): Promise<DiPlace[]> {
  const res = await httpGet<DiPlace[]>('/api/places/map-search')
  return res.data
}

export async function searchPlaces(keyword: string): Promise<Omit<CourseStop, 'stayTime' | 'isLocked'>[]> {
  const res = await httpGet<Omit<CourseStop, 'stayTime' | 'isLocked'>[]>(`/api/places/search?keyword=${encodeURIComponent(keyword)}`)
  return res.data
}

export async function generateCourses(req: CourseGenerateRequest): Promise<CourseResponse[]> {
  const res = await httpPost<CourseResponse[]>('/api/courses/generate', req)
  return res.data
}
