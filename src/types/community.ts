export interface Review {
  id: number
  category: string
  author: string
  initials: string
  station: string
  duration: string
  places: string[]
  preview: string
  images: string[]
  date: string
  likes: number
  comments: number
  liked: boolean
  isMine: boolean
}

export interface Notice {
  id: number
  type: string
  tag: string
  title: string
  date: string
  content: string
  pinned: boolean
  open: boolean
}

export interface FaqItem {
  id: number
  question: string
  answer: string
  open: boolean
}

export interface Inquiry {
  id: number
  title: string
  date: string
  status: string
  content: string
  answer: string
}
