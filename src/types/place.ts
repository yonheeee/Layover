export interface NearbyPlace {
  id: string
  name: string
  category: string
  distance: string
}

export interface Place {
  id: string
  name: string
  category: string
  isOpen: boolean
  /** OPEN / CLOSED / UNKNOWN. UNKNOWN이면 화면에서 "정보 확인 필요"로 안내한다. */
  openStatus?: 'OPEN' | 'CLOSED' | 'UNKNOWN'
  rating?: number
  description?: string
  distance?: string
  image?: string
  tag?: string
  tags?: string[]
  reviews?: number
  reviewCount?: number
  duration?: string
  hours?: string
  restDate?: string
  infoCenter?: string
  parking?: string
  useFee?: string
  reservation?: string
  address?: string
  roadAddress?: string
  lat?: number
  lng?: number
  phone?: string
  kakaoPlaceUrl?: string
  kakaoPhone?: string
  liked?: boolean
  nearbyPlaces?: NearbyPlace[]
}
