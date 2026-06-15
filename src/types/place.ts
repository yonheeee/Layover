export interface NearbyPlace {
  id: number
  name: string
  category: string
  distance: string
}

export interface Place {
  id: number
  name: string
  category: string
  isOpen: boolean
  rating: number
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
  phone?: string
  liked?: boolean
  nearbyPlaces?: NearbyPlace[]
}
