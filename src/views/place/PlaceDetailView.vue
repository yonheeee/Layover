<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, MapPin, Clock, Heart, Star, Phone, Globe, Image as ImageIcon, Footprints } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const place = ref({
  id: Number(route.params.id),
  name: '성심당',
  category: '음식',
  tags: ['베이커리', '대전 명물', '포토존'],
  rating: 4.8,
  reviewCount: 1203,
  isOpen: true,
  hours: '08:00 ~ 22:00',
  address: '대전 중구 대종로480번길 15',
  phone: '042-256-4314',
  website: 'https://www.sungsimdang.co.kr',
  distance: '도보 5분 (450m)',
  description: '1956년에 창업한 대전의 대표 빵집입니다. 대전을 방문하면 반드시 들러야 하는 명소로, 튀김소보로, 판타롱슈크림빵 등 다양한 빵이 유명합니다. 대전역에서 도보로 5분 거리에 위치해 있어 환승객들이 방문하기 좋습니다.',
  liked: false,
  images: ['', '', '', ''],
  nearbyPlaces: [
    { id: 2, name: '테미오래', category: '문화', distance: '택시 10분' },
    { id: 3, name: '중앙시장', category: '음식', distance: '도보 8분' },
  ],
})

function toggleLike() {
  place.value.liked = !place.value.liked
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
    <div class="max-w-2xl mx-auto px-4 py-6">

      <!-- 뒤로가기 -->
      <button @click="router.back()" class="flex items-center gap-2 mb-5 transition-opacity hover:opacity-70" style="color:#6b8c87;font-size:0.88rem;font-weight:600">
        <ArrowLeft :size="17" />
        뒤로가기
      </button>

      <!-- 이미지 그리드 -->
      <div class="grid grid-cols-4 gap-2 mb-4" style="height:200px">
        <div class="col-span-2 row-span-2 rounded-2xl overflow-hidden flex items-center justify-center" style="background:#f0faf8;border:1.5px solid rgba(178,228,220,0.35)">
          <ImageIcon :size="40" color="#B2E4DC" />
        </div>
        <div v-for="i in 3" :key="i" class="rounded-xl overflow-hidden flex items-center justify-center" style="background:#f0faf8;border:1.5px solid rgba(178,228,220,0.35)">
          <ImageIcon :size="20" color="#B2E4DC" />
        </div>
      </div>

      <!-- 장소 기본 정보 -->
      <div class="rounded-2xl p-6 mb-4" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 4px 24px rgba(26,46,43,0.08)">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :style="categoryColor[place.category] || 'background:#f3f4f6;color:#374151'">{{ place.category }}</span>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="place.isOpen ? 'background:#d1fae5;color:#065f46' : 'background:#fee2e2;color:#991b1b'"
              >{{ place.isOpen ? '영업중' : '영업종료' }}</span>
            </div>
            <h1 style="font-weight:800;font-size:1.3rem;color:#1a2e2b">{{ place.name }}</h1>
          </div>
          <button @click="toggleLike" class="flex flex-col items-center gap-1 flex-shrink-0" :style="place.liked ? 'color:#3db89e' : 'color:#9ca3af'">
            <Heart :size="22" :fill="place.liked ? '#3db89e' : 'none'" />
            <span style="font-size:0.7rem;font-weight:600">찜</span>
          </button>
        </div>

        <!-- 평점 -->
        <div class="flex items-center gap-2 mb-4">
          <Star :size="15" fill="#fbbf24" color="#fbbf24" />
          <span style="font-weight:700;font-size:0.95rem;color:#1a2e2b">{{ place.rating }}</span>
          <span style="font-size:0.82rem;color:#9ca3af">(리뷰 {{ place.reviewCount.toLocaleString() }}개)</span>
        </div>

        <!-- 태그 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="tag in place.tags" :key="tag" class="text-xs px-3 py-1 rounded-full" style="background:#E8F8F5;color:#3db89e;font-weight:600">
            # {{ tag }}
          </span>
        </div>

        <!-- 상세 정보 -->
        <div class="flex flex-col gap-2.5">
          <div class="flex items-center gap-3">
            <Clock :size="15" color="#B2E4DC" class="flex-shrink-0" />
            <span style="font-size:0.88rem;color:#374151">{{ place.hours }}</span>
          </div>
          <div class="flex items-center gap-3">
            <MapPin :size="15" color="#B2E4DC" class="flex-shrink-0" />
            <span style="font-size:0.88rem;color:#374151">{{ place.address }}</span>
          </div>
          <div class="flex items-center gap-3">
            <Phone :size="15" color="#B2E4DC" class="flex-shrink-0" />
            <span style="font-size:0.88rem;color:#374151">{{ place.phone }}</span>
          </div>
          <div class="flex items-center gap-3">
            <Footprints :size="15" color="#B2E4DC" class="flex-shrink-0" />
            <span style="font-size:0.88rem;color:#3db89e;font-weight:600">대전역에서 {{ place.distance }}</span>
          </div>
        </div>
      </div>

      <!-- 소개 -->
      <div class="rounded-2xl p-6 mb-4" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
        <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b;margin-bottom:12px">장소 소개</h2>
        <p style="font-size:0.9rem;color:#374151;line-height:1.75">{{ place.description }}</p>
      </div>

      <!-- 지도 (mock) -->
      <div class="rounded-2xl overflow-hidden mb-4" style="border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
        <div class="px-5 py-4" style="background:#fff;border-bottom:1px solid rgba(178,228,220,0.3)">
          <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b">위치</h2>
        </div>
        <div class="flex items-center justify-center" style="height:200px;background:#f0faf8">
          <div class="text-center">
            <MapPin :size="36" color="#3db89e" />
            <p style="font-size:0.85rem;color:#6b8c87;margin-top:8px">카카오맵 연동 예정</p>
          </div>
        </div>
      </div>

      <!-- 주변 장소 -->
      <div class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
        <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b;margin-bottom:12px">함께 가면 좋은 곳</h2>
        <div class="flex flex-col gap-2">
          <button
            v-for="nearby in place.nearbyPlaces"
            :key="nearby.id"
            @click="router.push(`/places/${nearby.id}`)"
            class="flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-gray-50"
            style="border:1.5px solid rgba(178,228,220,0.35)"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#E8F8F5">
              <MapPin :size="16" color="#3db89e" />
            </div>
            <div class="flex-1 min-w-0">
              <p style="font-weight:600;font-size:0.9rem;color:#1a2e2b">{{ nearby.name }}</p>
              <p style="font-size:0.78rem;color:#9ca3af">{{ nearby.distance }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0" :style="categoryColor[nearby.category] || 'background:#f3f4f6;color:#374151'">{{ nearby.category }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
