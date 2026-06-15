import type { Place } from '@/types/place'
import { mockSpots, allPlacesDatabase } from '@/mocks/places'
// import { httpGet } from './http'

export async function fetchPlaces(): Promise<Place[]> {
  // TODO(백엔드 연동): return httpGet<Place[]>('/api/places')
  return Promise.resolve(mockSpots)
}

export async function fetchAllPlacesDatabase(): Promise<Place[]> {
  // TODO(백엔드 연동): return httpGet<Place[]>('/api/places/all')
  return Promise.resolve(allPlacesDatabase)
}

export async function fetchPlaceById(id: number): Promise<Place | undefined> {
  // TODO(백엔드 연동): return httpGet<Place>(`/api/places/${id}`)
  return Promise.resolve(allPlacesDatabase.find((p) => p.id === id))
}
