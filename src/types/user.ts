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

