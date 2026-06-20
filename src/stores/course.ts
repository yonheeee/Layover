import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course, CourseGenerateRequest } from '@/types/course'

export const useCourseStore = defineStore('course', () => {
  const hasConfirmedCourse = ref(localStorage.getItem('course_confirmed') === 'true')
  const generatedCourses = ref<Course[]>([])
  const lastRequest = ref<CourseGenerateRequest | null>(null)

  function setCourses(courses: Course[], req?: CourseGenerateRequest) {
    generatedCourses.value = courses
    if (req) lastRequest.value = req
  }

  function setConfirmed() {
    hasConfirmedCourse.value = true
    localStorage.setItem('course_confirmed', 'true')
  }

  function reset() {
    hasConfirmedCourse.value = false
    localStorage.removeItem('course_confirmed')
  }

  return { hasConfirmedCourse, generatedCourses, lastRequest, setCourses, setConfirmed, reset }
})
