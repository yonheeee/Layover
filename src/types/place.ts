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
  address?: string
  lat?: number
  lng?: number
  phone?: string
  liked?: boolean
  nearbyPlaces?: NearbyPlace[]
}
