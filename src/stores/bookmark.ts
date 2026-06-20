import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth'
import { addBookmark, removeBookmark, getBookmarks } from '@/api/bookmarks'

export const useBookmarkStore = defineStore('bookmark', () => {
  const bookmarkedIds = ref<Set<string>>(new Set())
  const bookmarked = computed(() => bookmarkedIds.value)
  const router = useRouter()

  async function fetchBookmarks(): Promise<void> {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return
    try {
      const list = await getBookmarks()
      bookmarkedIds.value = new Set(list.map((b) => b.placeId))
    } catch (e) {
      console.error('찜 목록 로딩 실패:', e)
    }
  }

  async function toggleBookmark(placeId: string): Promise<void> {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }
    try {
      if (bookmarkedIds.value.has(placeId)) {
        await removeBookmark(placeId)
        const next = new Set(bookmarkedIds.value)
        next.delete(placeId)
        bookmarkedIds.value = next
      } else {
        await addBookmark(placeId)
        bookmarkedIds.value = new Set([...bookmarkedIds.value, placeId])
      }
    } catch (e) {
      console.error('찜 토글 실패:', e)
    }
  }

  function isBookmarked(placeId: string): boolean {
    return bookmarked.value.has(placeId)
  }

  return { bookmarkedIds, bookmarked, fetchBookmarks, toggleBookmark, isBookmarked }
})
