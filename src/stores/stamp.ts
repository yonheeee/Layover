import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

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

export interface StampPhoto {
  id: string
  url: string
  placeName: string
  placeEmoji: string
  courseId?: string
  courseTitle?: string
  characterId?: string
  characterName?: string
  characterRole?: string
  characterDescription?: string
  characterImageUrl?: string
  characterImageAlt?: string
  takenAt: string
  lat: number
  lng: number
}

const PHOTOS_KEY = 'stamp_photos'
const ACTIVE_COURSE_KEY = 'stamp_active_course'

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') as T
  } catch {
    return fallback
  }
}

export const useStampStore = defineStore('stamp', () => {
  const photos = ref<StampPhoto[]>(readJson<StampPhoto[]>(PHOTOS_KEY, []))
  const activeCourse = ref<StampCourse | null>(readJson<StampCourse | null>(ACTIVE_COURSE_KEY, null))

  const activeCourseId = computed(() => activeCourse.value?.id ?? null)
  const activeCourseTitle = computed(() => activeCourse.value?.subTitle ?? activeCourse.value?.title ?? '선택한 코스')
  const activeCoursePhotos = computed(() =>
    activeCourseId.value
      ? photos.value.filter((photo) => photo.courseId === activeCourseId.value)
      : photos.value,
  )

  function persistPhotos() {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos.value))
  }

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

  function photosForCourse(courseId: string) {
    return photos.value.filter((photo) => photo.courseId === String(courseId))
  }

  function isPlaceStamped(placeId: string, courseId = activeCourseId.value) {
    return photos.value.some(
      (photo) => photo.courseId === courseId && photo.id.startsWith(placeId + '_'),
    )
  }

  function addPhoto(photo: StampPhoto) {
    const courseId = photo.courseId ?? activeCourseId.value ?? undefined
    const courseTitle = photo.courseTitle ?? activeCourseTitle.value
    const nextPhoto = { ...photo, courseId, courseTitle }
    const placeId = photo.id.split('_')[0]

    photos.value = photos.value.filter(
      (saved) => !(saved.courseId === courseId && saved.id.split('_')[0] === placeId),
    )
    photos.value.unshift(nextPhoto)
    persistPhotos()
  }

  function clearPhotos() {
    photos.value = []
    localStorage.removeItem(PHOTOS_KEY)
    clearActiveCourse()
  }

  return {
    photos,
    activeCourse,
    activeCourseId,
    activeCourseTitle,
    activeCoursePhotos,
    setActiveCourse,
    clearActiveCourse,
    photosForCourse,
    isPlaceStamped,
    addPhoto,
    clearPhotos,
  }
})
