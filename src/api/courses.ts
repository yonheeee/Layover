import type { DiPlace, CourseStop } from '@/types/course'
import type { CourseGenerateRequest, CourseResponse } from '@/types/course'
import { http, httpGet, httpPost } from './http'

export async function fetchDiPlaces(): Promise<DiPlace[]> {
  const res = await http.get<DiPlace[]>('/api/places/map-search')
  return res.data
}

export async function searchPlaces(keyword: string): Promise<Omit<CourseStop, 'stayTime' | 'isLocked'>[]> {
  const res = await http.get<Omit<CourseStop, 'stayTime' | 'isLocked'>[]>(`/api/places/search?keyword=${encodeURIComponent(keyword)}`)
  return res.data
}

export async function generateCourses(req: CourseGenerateRequest): Promise<CourseResponse[]> {
  const res = await http.post<CourseResponse[]>('/api/courses/generate', req)
  return res.data
}

export async function saveCourse(req: CourseGenerateRequest, places: { placeId: string; orderIndex: number; travelTimeMin?: number }[]): Promise<string> {
  const res = await httpPost<string>('/api/courses/save', { ...req, places })
  return res.data
}

export async function deleteCourse(courseId: string): Promise<void> {
  await http.delete(`/api/courses/${courseId}`)
}
