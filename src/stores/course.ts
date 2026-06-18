import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCourseStore = defineStore('course', () => {
  const hasConfirmedCourse = ref(localStorage.getItem('course_confirmed') === 'true')

  function setConfirmed() {
    hasConfirmedCourse.value = true
    localStorage.setItem('course_confirmed', 'true')
  }

  function reset() {
    hasConfirmedCourse.value = false
    localStorage.removeItem('course_confirmed')
  }

  return { hasConfirmedCourse, setConfirmed, reset }
})
