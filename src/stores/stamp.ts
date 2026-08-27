import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * 스탬프 투어 진행 상태.
 *
 * 여기 남는 건 "지금 어느 코스를 돌고 있는가" 하나뿐이다. 이건 기기마다 달라도
 * 되는 값이라 localStorage 가 맞는 자리다.
 *
 * 찍은 사진 목록은 더 이상 두지 않는다. 예전에는 `stamp_photos` 키에 사진
 * 목록을 쌓아 두고 마이페이지가 그걸 읽었는데, 사진 파일은 서버에 있고 목록만
 * 브라우저에 있는 구조라 기기를 바꾸면 도감은 차 있는데 사진 그리드와 지도는
 * 텅 비었다. 목록의 출처는 이제 서버(`GET /api/stamps/my`) 하나다.
 *
 * 예전 사용자의 브라우저에 남은 `stamp_photos` 는 로그아웃 시
 * `clearUserScopedStorage()` 가 지운다.
 */

type StampCoursePlace = {
  id: string
  name: string
  category?: string
  lat?: number
  lng?: number
}

export type StampCourse = {
  id: string
  subTitle?: string
  title?: string
  places: StampCoursePlace[]
}

const ACTIVE_COURSE_KEY = 'stamp_active_course'

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') as T
  } catch {
    return fallback
  }
}

export const useStampStore = defineStore('stamp', () => {
  const activeCourse = ref<StampCourse | null>(readJson<StampCourse | null>(ACTIVE_COURSE_KEY, null))

  const activeCourseId = computed(() => activeCourse.value?.id ?? null)
  const activeCourseTitle = computed(
    () => activeCourse.value?.subTitle ?? activeCourse.value?.title ?? '선택한 코스',
  )

  function persistActiveCourse() {
    if (activeCourse.value) {
      localStorage.setItem(ACTIVE_COURSE_KEY, JSON.stringify(activeCourse.value))
    } else {
      localStorage.removeItem(ACTIVE_COURSE_KEY)
    }
  }

  function setActiveCourse(course: StampCourse) {
    activeCourse.value = {
      id: String(course.id),
      subTitle: course.subTitle,
      title: course.title,
      places: course.places ?? [],
    }
    persistActiveCourse()
  }

  function clearActiveCourse() {
    activeCourse.value = null
    persistActiveCourse()
  }

  return {
    activeCourse,
    activeCourseId,
    activeCourseTitle,
    setActiveCourse,
    clearActiveCourse,
  }
})
