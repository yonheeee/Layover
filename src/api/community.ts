import type { Review, Notice, FaqItem, Inquiry } from '@/types/community'
import { mockReviews, mockNotices, mockFaqData, mockMyInquiries } from '@/mocks/community'
// import { httpGet } from './http'

export async function fetchReviews(): Promise<Review[]> {
  // TODO(백엔드 연동): return httpGet<Review[]>('/api/community/reviews')
  return Promise.resolve(mockReviews)
}

export async function fetchNotices(): Promise<Notice[]> {
  // TODO(백엔드 연동): return httpGet<Notice[]>('/api/community/notices')
  return Promise.resolve(mockNotices)
}

export async function fetchFaqData(): Promise<FaqItem[]> {
  // TODO(백엔드 연동): return httpGet<FaqItem[]>('/api/community/faq')
  return Promise.resolve(mockFaqData)
}

export async function fetchMyInquiries(): Promise<Inquiry[]> {
  // TODO(백엔드 연동): return httpGet<Inquiry[]>('/api/community/inquiries/mine')
  return Promise.resolve(mockMyInquiries)
}
