import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course } from '@/types/course'

export const useCourseStore = defineStore('course', () => {
  const hasConfirmedCourse = ref(localStorage.getItem('course_confirmed') === 'true')
  const generatedCourses = ref<Course[]>([])

  function setCourses(courses: Course[]) {
    generatedCourses.value = courses
  }

  function setConfirmed() {
    hasConfirmedCourse.value = true
    localStorage.setItem('course_confirmed', 'true')
  }

  function reset() {
    hasConfirmedCourse.value = false
    localStorage.removeItem('course_confirmed')
  }

  return { hasConfirmedCourse, generatedCourses, setCourses, setConfirmed, reset }
})
