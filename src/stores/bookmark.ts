import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./auth";
import { addBookmark, removeBookmark, getBookmarks } from "@/api/bookmarks";
import type { BookmarkPlace } from "@/api/bookmarks";
import type { Place } from "@/types/place";

export const useBookmarkStore = defineStore("bookmark", () => {
  const bookmarkedIds = ref<Set<string>>(new Set());
  const bookmarkedPlaces = ref<Place[]>([]);
  const bookmarked = computed(() => bookmarkedIds.value);
  const router = useRouter();

  async function fetchBookmarks(): Promise<void> {
    const auth = useAuthStore();
    if (!auth.isLoggedIn) return;
    try {
      const list = await getBookmarks();
      bookmarkedIds.value = new Set(list.map((b) => b.placeId));
      bookmarkedPlaces.value = list.map(toPlace);
    } catch (e) {
      console.error("찜 목록 로딩 실패:", e);
    }
  }

  async function toggleBookmark(placeId: string, placeData?: BookmarkPlace): Promise<void> {
    const auth = useAuthStore();
    if (!auth.isLoggedIn) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    try {
      if (bookmarkedIds.value.has(placeId)) {
        await removeBookmark(placeId);
        const next = new Set(bookmarkedIds.value);
        next.delete(placeId);
        bookmarkedIds.value = next;
        bookmarkedPlaces.value = bookmarkedPlaces.value.filter((p) => p.id !== placeId);
      } else {
        await addBookmark(placeId);
        bookmarkedIds.value = new Set([...bookmarkedIds.value, placeId]);
        if (placeData) {
          bookmarkedPlaces.value = [...bookmarkedPlaces.value, toPlace(placeData)];
        } else {
          await fetchBookmarks();
        }
      }
    } catch (e) {
      console.error("찜 토글 실패:", e);
    }
  }

  function toPlace(b: BookmarkPlace): Place {
    return {
      id: b.placeId,
      name: b.name,
      category: b.category,
      address: b.address,
      image: b.imageUrl,
      isOpen: false,
    };
  }

  function isBookmarked(placeId: string | null): boolean {
    if (!placeId) return false;
    return bookmarked.value.has(placeId);
  }

  function $reset() {
    bookmarkedIds.value = new Set();
    bookmarkedPlaces.value = [];
  }

  return {
    bookmarkedIds,
    bookmarkedPlaces,
    bookmarked,
    fetchBookmarks,
    toggleBookmark,
    isBookmarked,
    $reset,
  };
});
