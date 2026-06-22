<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Heart } from 'lucide-vue-next'
import type { Place } from '@/types/place'
import PlaceCard from '@/components/common/PlaceCard.vue'
import { fetchUserActivity } from '@/api/user'

const router = useRouter()

const bookmarks = ref<Place[]>([])
const likedSpotIds = ref<string[]>([])

async function loadBookmarks() {
  const { likedPlaces } = await fetchUserActivity()
  bookmarks.value = likedPlaces
  likedSpotIds.value = likedPlaces.map((p) => p.id)
}

loadBookmarks()

function toggleLike(id: string) {
  const idx = likedSpotIds.value.indexOf(id)
  if (idx >= 0) {
    likedSpotIds.value.splice(idx, 1)
    bookmarks.value = bookmarks.value.filter((p) => p.id !== id)
  } else {
    likedSpotIds.value.push(id)
  }
}
</script>

<template>
  <div
    style="
      background: linear-gradient(155deg, #e8f8f5 0%, #ffffff 50%, #f0faf8 100%);
      min-height: calc(100vh - 64px);
    "
  >
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- 헤더 -->
      <div class="flex items-center gap-3 mb-7">
        <div
          class="w-8 h-8 rounded-xl flex items-center justify-center"
          style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
        >
          <Heart :size="15" color="#fff" fill="#fff" />
        </div>
        <div>
          <h1 style="font-weight: 800; font-size: 1.2rem; color: #1a2e2b">
            찜 목록
          </h1>
          <p style="font-size: 0.8rem; color: #6b8c87">
            저장한 장소 {{ bookmarks.length }}개
          </p>
        </div>
      </div>

      <!-- 비어있을 때 -->
      <div
        v-if="bookmarks.length === 0"
        class="flex flex-col items-center justify-center py-20 gap-4"
      >
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center"
          style="background: #e8f8f5"
        >
          <Heart :size="28" color="#B2E4DC" />
        </div>
        <div class="text-center">
          <p style="font-weight: 700; font-size: 1rem; color: #1a2e2b">
            찜한 장소가 없어요
          </p>
          <p style="font-size: 0.85rem; color: #6b8c87; margin-top: 4px">
            마음에 드는 장소를 찜해보세요!
          </p>
        </div>
        <button
          @click="router.push('/map')"
          class="px-6 py-2.5 rounded-xl font-semibold text-sm"
          style="
            background: linear-gradient(135deg, #b2e4dc, #3db89e);
            color: #fff;
            box-shadow: 0 4px 14px rgba(61, 184, 158, 0.3);
          "
        >
          지도에서 탐색하기
        </button>
      </div>

      <!-- 3열 카드 그리드 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <PlaceCard
          v-for="place in bookmarks"
          :key="place.id"
          :spot="place"
          :liked="likedSpotIds.includes(place.id)"
          @click="router.push(`/place/${place.id}`)"
          @toggleLike="toggleLike"
        />
      </div>
    </div>
  </div>
</template>
