import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface StampPhoto {
  id: string
  url: string
  placeName: string
  placeEmoji: string
  takenAt: string
  lat: number
  lng: number
}

export const useStampStore = defineStore('stamp', () => {
  const photos = ref<StampPhoto[]>(
    JSON.parse(localStorage.getItem('stamp_photos') ?? '[]')
  )

  function addPhoto(photo: StampPhoto) {
    photos.value.unshift(photo)
    localStorage.setItem('stamp_photos', JSON.stringify(photos.value))
  }

  function clearPhotos() {
    photos.value = []
    localStorage.removeItem('stamp_photos')
  }

  return { photos, addPhoto, clearPhotos }
})
