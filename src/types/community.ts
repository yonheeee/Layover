export interface Post {
  id: string
  userId: string
  username: string
  category: string
  title: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
}

export interface PostComment {
  id: string
  userId?: string
  username: string
  content: string
  createdAt: string
}

export interface PostDetail extends Post {
  content: string
  updatedAt: string
  comments: PostComment[]
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
  hasNext: boolean
}

export interface Notice {
  id: string
  title: string
  content?: string
  createdAt: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  createdAt: string
}

export interface InquiryItem {
  id: string
  title: string
  status: string
  createdAt: string
}

export interface InquiryDetail extends InquiryItem {
  content: string
  answer?: string
}
