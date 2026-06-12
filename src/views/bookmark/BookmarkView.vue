<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, MapPin, Clock, Trash2, Image as ImageIcon } from 'lucide-vue-next'

const router = useRouter()

const bookmarks = ref([
  { id: 1, name: '성심당', category: '음식', isOpen: true, hours: '08:00~22:00', distance: '도보 5분' },
  { id: 2, name: '테미오래', category: '문화', isOpen: true, hours: '09:00~18:00', distance: '택시 10분' },
  { id: 3, name: '한밭수목원', category: '자연', isOpen: true, hours: '상시개방', distance: '택시 15분' },
  { id: 4, name: '국립중앙과학관', category: '문화', isOpen: false, hours: '09:30~17:30', distance: '택시 12분' },
  { id: 5, name: '보문산', category: '자연', isOpen: true, hours: '상시개방', distance: '버스 25분' },
])

function removeBookmark(id: number) {
  const idx = bookmarks.value.findIndex(b => b.id === id)
  if (idx >= 0) bookmarks.value.splice(idx, 1)
}

const categoryColor: Record<string, string> = {
  '음식': 'background:#FEF3C7;color:#92400E',
  '카페': 'background:#E0E7FF;color:#3730A3',
  '자연': 'background:#D1FAE5;color:#065F46',
  '문화': 'background:#FCE7F3;color:#9D174D',
  '투어': 'background:#DBEAFE;color:#1E40AF',
}
</script>

<template>
  <div style="background: linear-gradient(155deg, #E8F8F5 0%, #ffffff 50%, #f0faf8 100%); min-height: calc(100vh - 64px)">
    <div class="max-w-2xl mx-auto px-4 py-8">

      <!-- 헤더 -->
      <div class="flex items-center gap-3 mb-7">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
          <Heart :size="15" color="#fff" fill="#fff" />
        </div>
        <div>
          <h1 style="font-weight:800;font-size:1.2rem;color:#1a2e2b">찜 목록</h1>
          <p style="font-size:0.8rem;color:#6b8c87">저장한 장소 {{ bookmarks.length }}개</p>
        </div>
      </div>

      <!-- 비어있을 때 -->
      <div v-if="bookmarks.length === 0" class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background:#E8F8F5">
          <Heart :size="28" color="#B2E4DC" />
        </div>
        <div class="text-center">
          <p style="font-weight:700;font-size:1rem;color:#1a2e2b">찜한 장소가 없어요</p>
          <p style="font-size:0.85rem;color:#6b8c87;margin-top:4px">마음에 드는 장소를 찜해보세요!</p>
        </div>
        <button
          @click="router.push('/map')"
          class="px-6 py-2.5 rounded-xl font-semibold text-sm"
          style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff; box-shadow: 0 4px 14px rgba(61,184,158,0.3)"
        >
          지도에서 탐색하기
        </button>
      </div>

      <!-- 찜 목록 -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="place in bookmarks"
          :key="place.id"
          class="rounded-2xl overflow-hidden flex items-stretch transition-shadow hover:shadow-md"
          style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)"
        >
          <!-- 이미지 플레이스홀더 -->
          <div class="w-24 flex-shrink-0 flex items-center justify-center" style="background:#f0faf8;border-right:1px solid rgba(178,228,220,0.3)">
            <ImageIcon :size="24" color="#B2E4DC" />
          </div>

          <!-- 정보 -->
          <button class="flex-1 min-w-0 p-4 text-left" @click="router.push(`/places/${place.id}`)">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :style="categoryColor[place.category] || 'background:#f3f4f6;color:#374151'">{{ place.category }}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :style="place.isOpen ? 'background:#d1fae5;color:#065f46' : 'background:#fee2e2;color:#991b1b'">
                {{ place.isOpen ? '영업중' : '영업종료' }}
              </span>
            </div>
            <p style="font-weight:700;font-size:0.95rem;color:#1a2e2b" class="mb-1">{{ place.name }}</p>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <Clock :size="12" color="#9ca3af" />
                <span style="font-size:0.78rem;color:#9ca3af">{{ place.hours }}</span>
              </div>
              <div class="flex items-center gap-1">
                <MapPin :size="12" color="#9ca3af" />
                <span style="font-size:0.78rem;color:#9ca3af">{{ place.distance }}</span>
              </div>
            </div>
          </button>

          <!-- 삭제 버튼 -->
          <button
            @click="removeBookmark(place.id)"
            class="px-4 flex items-center justify-center transition-colors hover:bg-red-50"
            style="border-left:1px solid rgba(178,228,220,0.3)"
          >
            <Trash2 :size="16" color="#e07070" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
