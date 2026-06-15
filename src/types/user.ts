import type { Component } from 'vue'

export interface User {
  nickname: string
  email: string
  statusMessage: string
  profileImage: string | null
  level: number
  xp: number
  xpForNext: number
  stampCount: number
}

export interface Journal {
  date: string
  icon: Component
  title: string
  count: number
  bg: string
  iconColor: string
}

export interface MyCourse {
  id: number
  title: string
  rating: number
  badge: string
  badgeStyle: string
  placeCount: number
  duration: string
}

export interface LikedPlace {
  id: number
  name: string
  emoji: string
  category: string
}

export interface Character {
  id: number
  name: string
  emoji: string
  unlocked: boolean
  description: string
  poses: string[]
}

export interface MapPin {
  id: number
  location: string
  journalTitle: string
  visitDate: string
  url: string
}

export interface UserPhoto {
  id: number
  url: string
  location: string
}
