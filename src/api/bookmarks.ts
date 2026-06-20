import { httpPost, httpDelete, httpGet } from './http'

export interface BookmarkPlace {
  placeId: string
  name: string
  category: string
  address: string
  imageUrl: string
  latitude: number
  longitude: number
}

export async function addBookmark(placeId: string): Promise<void> {
  await httpPost(`/api/bookmarks/${placeId}`)
}

export async function removeBookmark(placeId: string): Promise<void> {
  await httpDelete(`/api/bookmarks/${placeId}`)
}

export async function getBookmarks(): Promise<BookmarkPlace[]> {
  const res = await httpGet<BookmarkPlace[]>('/api/bookmarks')
  return res.data
}

export async function checkBookmarkStatus(placeId: string): Promise<boolean> {
  const res = await httpGet<boolean>(`/api/bookmarks/${placeId}/status`)
  return res.data
}
