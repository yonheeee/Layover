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
  subTitle: string
  travelMode: string
  durationMinutes: number
  createdAt: string
  places: {
    id: string
    name: string
    category: string
    lat: number
    lng: number
  }[]
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
