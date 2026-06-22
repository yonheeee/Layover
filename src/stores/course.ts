import { httpGet } from '@/api/http'
import type { Course, CourseGenerateRequest } from '@/types/course'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCourseStore = defineStore('course', () => {
  const hasConfirmedCourse = ref(false)
  const generatedCourses = ref<Course[]>(
    JSON.parse(localStorage.getItem('generated_courses') ?? '[]')
  )
  const lastRequest = ref<CourseGenerateRequest | null>(null)

  // 서버에서 코스 확정 여부 확인
  async function checkConfirmedCourse() {
    try {
      const res = await httpGet<any[]>('/api/courses/my')
      hasConfirmedCourse.value = res.data.length > 0
    } catch {
      hasConfirmedCourse.value = false
    }
  }
  
  function setCourses(courses: Course[], req?: CourseGenerateRequest) {
    generatedCourses.value = courses
    localStorage.setItem('generated_courses', JSON.stringify(courses))
    if (req) lastRequest.value = req
  }

  function setConfirmed() {
    hasConfirmedCourse.value = true
  }

  function reset() {
    hasConfirmedCourse.value = false
    generatedCourses.value = []
    localStorage.removeItem('generated_courses')
  }

  return { hasConfirmedCourse, generatedCourses, lastRequest, checkConfirmedCourse, setCourses, setConfirmed, reset }
})
