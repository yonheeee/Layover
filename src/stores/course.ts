import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course, CourseGenerateRequest } from '@/types/course'

export const useCourseStore = defineStore('course', () => {
  const hasConfirmedCourse = ref(localStorage.getItem('course_confirmed') === 'true')
  const generatedCourses = ref<Course[]>(
    JSON.parse(localStorage.getItem('generated_courses') ?? '[]')
  )

  function setCourses(courses: Course[], req?: CourseGenerateRequest) {
    generatedCourses.value = courses
    localStorage.setItem('generated_courses', JSON.stringify(courses))
  }

  function setConfirmed() {
    hasConfirmedCourse.value = true
    localStorage.setItem('course_confirmed', 'true')
  }

  function reset() {
    hasConfirmedCourse.value = false
    generatedCourses.value = []
    localStorage.removeItem('course_confirmed')
    localStorage.removeItem('generated_courses')
  }

  return { hasConfirmedCourse, generatedCourses, lastRequest, setCourses, setConfirmed, reset }
})
