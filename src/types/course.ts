export interface CourseGenerateRequest {
  departureStation?: string
  durationMinutes: number
  travelMode: 'WALK' | 'TAXI'
  weatherCondition?: string
  themeTags?: string[]
}

export type CourseResponse = Course

export interface CourseRegenerateRequest extends CourseGenerateRequest {
  currentPlaces: {
    id: string
    locked: boolean
  }[]
}

export interface CourseRecalculateRequest extends CourseGenerateRequest {
  title?: string
  placeIds: string[]
}

export interface TransportInfo {
  walkTime: string
  busTime: string
  taxiTime: string
  taxiFare: number
}

/** 코스 경유지. MapView·CourseResultView 양쪽 필드를 모두 포함한 superset. */
export interface CourseStop {
  id: string
  name: string
  category: string
  isOpen: boolean
  stayTime: string
  waitingTime?: string
  isLocked: boolean
  // MapView 전용
  lat?: number
  lng?: number
  nextTransport?: TransportInfo
  // CourseResultView 전용
  transport?: 'walk' | 'taxi' | 'bus'
  transportTime?: string
  taxiFare?: string
}

export interface Course {
  id: string
  title: string
  subTitle: string
  totalTime?: string
  estimatedCost?: string
  places: CourseStop[]
}

/** 지도 검색 패널에서 코스에 추가할 수 있는 장소 (MapView 전용). */
export interface DiPlace {
  id: string
  name: string
  category: string
  isOpen: boolean
  desc: string
  latLng: string
  lat: number
  lng: number
}
