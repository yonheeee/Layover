export interface User {
  username: string;
  realName: string;
  email: string;
  birthDate: string;
  phone: string;
  profileImage: string | null;
  stampCount: number;
  role: string;
  kakao: boolean;
}

export interface MyCourse {
  id: string
  title: string
  rating: number
  badge: string
  badgeStyle: string
  placeCount: number
  duration: string
}

export interface Character {
  id: string
  name: string
  emoji: string
  unlocked: boolean
  description: string
  poses: string[]
}

export interface MapPin {
  id: string
  location: string
  journalTitle: string
  visitDate: string
  url: string
}

export interface UserPhoto {
  id: string
  url: string
  location: string
}
