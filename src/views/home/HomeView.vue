<script setup lang="ts">
import { ref } from 'vue'
import {
  MapPin, Clock, Train, ChevronRight, Star,
  Navigation, Users, Heart,
} from 'lucide-vue-next'

const MOCK_TRAINS: Record<string, { id: string; name: string; depart: string; arrive: string; seats: number }[]> = {
  daejeon: [
    { id: 'ktx-101', name: 'KTX 101', depart: '10:32', arrive: '12:18', seats: 24 },
    { id: 'ktx-103', name: 'KTX 103', depart: '12:05', arrive: '13:51', seats: 7 },
    { id: 'ktx-107', name: 'KTX 107', depart: '14:20', arrive: '16:06', seats: 31 },
    { id: 'sts-201', name: 'SRT 201', depart: '15:48', arrive: '17:34', seats: 3 },
  ],
  'seo-daejeon': [
    { id: 'ktx-201', name: 'KTX 201', depart: '09:15', arrive: '11:02', seats: 18 },
    { id: 'ktx-205', name: 'KTX 205', depart: '11:40', arrive: '13:28', seats: 12 },
    { id: 'sts-301', name: 'SRT 301', depart: '13:55', arrive: '15:43', seats: 5 },
  ],
}

const CATEGORY_FILTERS = [
  { key: 'bread', label: '빵·베이커리', emoji: '🍞' },
  { key: 'nature', label: '자연·공원', emoji: '🌿' },
  { key: 'tour', label: '관광지', emoji: '🏛' },
  { key: 'food', label: '음식·맛집', emoji: '🍜' },
]

const STATION_OPTIONS = [
  { value: 'daejeon', label: '대전역' },
  { value: 'seo-daejeon', label: '서대전역' },
]

const SPOTS = [
  {
    id: 1,
    name: '성심당',
    category: '맛집 · 베이커리',
    description: '1956년부터 이어온 대전의 대표 빵집. 튀김소보로와 부추빵으로 유명한 전국구 명소.',
    distance: '대전역에서 도보 10분',
    duration: '30~60분',
    rating: 4.9,
    reviews: 3240,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlcnklMjBicmVhZCUyMHBhc3RyeSUyMHNob3B8ZW58MXx8fHwxNzgxMjM5Mjk2fDA&ixlib=rb-4.1.0&q=80&w=800',
    tag: '🍞 베이커리',
  },
  {
    id: 2,
    name: '한밭수목원',
    category: '자연 · 공원',
    description: '도심 속 녹색 쉼터. 국내 최대 규모의 도시 수목원으로 사계절 다양한 꽃과 나무를 만날 수 있습니다.',
    distance: '대전역에서 버스 20분',
    duration: '60~120분',
    rating: 4.7,
    reviews: 1850,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1651422933132-d3e8822d8b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3RhbmljYWwlMjBnYXJkZW4lMjBuYXR1cmUlMjBwYXJrfGVufDF8fHx8MTc4MTIzOTI5N3ww&ixlib=rb-4.1.0&q=80&w=800',
    tag: '🌿 자연',
  },
  {
    id: 3,
    name: '테미오래',
    category: '문화 · 역사',
    description: '일제강점기 관사촌을 문화공간으로 재생한 곳. 갤러리, 카페, 공방이 어우러진 복합 문화 공간.',
    distance: '대전역에서 버스 15분',
    duration: '60~90분',
    rating: 4.6,
    reviews: 920,
    isOpen: false,
    image: 'https://images.unsplash.com/photo-1734287096542-daa9300f1484?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjB0cmFkaXRpb25hbCUyMGFyY2hpdGVjdHVyZSUyMGdhcmRlbnxlbnwxfHx8fDE3ODEyMzkyOTV8MA&ixlib=rb-4.1.0&q=80&w=800',
    tag: '🏛 문화',
  },
]

const selectedStation = ref('daejeon')
const selectedTrain = ref('')
const selectedFilters = ref<string[]>([])
const likedSpots = ref<number[]>([])

function selectStation(value: string) {
  selectedStation.value = value
  selectedTrain.value = ''
}

function toggleFilter(key: string) {
  const idx = selectedFilters.value.indexOf(key)
  if (idx >= 0) selectedFilters.value.splice(idx, 1)
  else selectedFilters.value.push(key)
}

function toggleLike(id: number) {
  const idx = likedSpots.value.indexOf(id)
  if (idx >= 0) likedSpots.value.splice(idx, 1)
  else likedSpots.value.push(id)
}

function getSelectedTrainName() {
  return MOCK_TRAINS[selectedStation.value].find(t => t.id === selectedTrain.value)?.name
}

function onCardMouseEnter(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  el.style.transform = 'translateY(-6px)'
  el.style.boxShadow = '0 16px 48px rgba(178,228,220,0.45), 0 4px 12px rgba(0,0,0,0.07)'
}

function onCardMouseLeave(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  el.style.transform = 'translateY(0)'
  el.style.boxShadow = '0 4px 24px rgba(178,228,220,0.2), 0 1px 4px rgba(0,0,0,0.04)'
}
</script>

<template>
  <!-- ── Hero Section ── -->
  <section
    class="relative overflow-hidden"
    :style="{
      background: 'linear-gradient(155deg, #E8F8F5 0%, #ffffff 45%, #f0faf8 100%)',
      minHeight: '600px',
    }"
  >
    <div class="absolute pointer-events-none" style="top:-100px;right:-100px;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(178,228,220,0.35),transparent 70%)" />
    <div class="absolute pointer-events-none" style="bottom:-80px;left:-80px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(61,184,158,0.15),transparent 70%)" />

    <div class="mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" style="max-width: 1440px">
      <!-- Text -->
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style="background: #E8F8F5; color: #3db89e; font-weight: 600">
          <Train :size="14" /> KTX 환승 여행 가이드
        </div>
        <h1 :style="{ fontFamily: '\'Noto Sans KR\', sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', color: '#1a2e2b', lineHeight: 1.25, letterSpacing: '-0.02em' }">
          대기 시간을<br /><span style="color: #3db89e">여행으로</span> 채우세요
        </h1>
        <p style="font-size: 1.05rem; color: #6b8c87; line-height: 1.8; max-width: 480px">
          KTX 환승 대기 시간, 그냥 역에서 기다리지 마세요.<br />
          대전의 숨은 명소를 시간에 맞게 똑똑하게 즐겨보세요.
        </p>
        <!-- Stats -->
        <div class="flex gap-8 pt-2">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5"><MapPin :size="15" color="#3db89e" /><span style="font-weight:700;font-size:1.2rem;color:#1a2e2b">50+</span></div>
            <span style="font-size:0.78rem;color:#6b8c87">대전 관광지</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5"><Users :size="15" color="#3db89e" /><span style="font-weight:700;font-size:1.2rem;color:#1a2e2b">12,000+</span></div>
            <span style="font-size:0.78rem;color:#6b8c87">여행자 후기</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5"><Navigation :size="15" color="#3db89e" /><span style="font-weight:700;font-size:1.2rem;color:#1a2e2b">3분</span></div>
            <span style="font-size:0.78rem;color:#6b8c87">코스 생성</span>
          </div>
        </div>
      </div>

      <!-- Search card -->
      <div class="rounded-3xl p-8" :style="{ background: '#ffffff', boxShadow: '0 8px 48px rgba(178,228,220,0.4), 0 2px 8px rgba(0,0,0,0.05)', border: '1px solid rgba(178,228,220,0.5)' }">
        <h2 style="font-weight:700;font-size:1.25rem;color:#1a2e2b;margin-bottom:1.5rem">맞춤 코스 찾기</h2>

        <!-- 출발역 -->
        <div class="mb-5">
          <p style="font-size:0.82rem;font-weight:600;color:#6b8c87;letter-spacing:0.04em;margin-bottom:10px">출발역 선택</p>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="s in STATION_OPTIONS" :key="s.value"
              class="flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all duration-200"
              :style="{ border: `2px solid ${selectedStation === s.value ? '#3db89e' : 'rgba(178,228,220,0.4)'}`, background: selectedStation === s.value ? '#E8F8F5' : '#ffffff', color: selectedStation === s.value ? '#3db89e' : '#6b8c87', fontWeight: selectedStation === s.value ? 600 : 400, fontSize: '0.95rem' }"
              @click="selectStation(s.value)"
            >
              <Train :size="15" />{{ s.label }}
            </button>
          </div>
        </div>

        <!-- 기차표 -->
        <div class="mb-5">
          <div class="flex items-center justify-between mb-2.5">
            <p style="font-size:0.82rem;font-weight:600;color:#6b8c87;letter-spacing:0.04em">기차표 선택</p>
            <span class="px-2.5 py-0.5 rounded-full text-xs" style="background:#E8F8F5;color:#3db89e;font-weight:600">API 연동 예정</span>
          </div>
          <div class="rounded-2xl overflow-hidden" style="border:1.5px solid rgba(178,228,220,0.45)">
            <div class="grid px-4 py-2.5 text-xs" :style="{ gridTemplateColumns: '1fr 1fr 1fr 80px', background: '#f0faf8', color: '#6b8c87', fontWeight: 600 }">
              <span>열차</span><span>출발</span><span>도착</span><span class="text-right">잔여석</span>
            </div>
            <button
              v-for="train in MOCK_TRAINS[selectedStation]" :key="train.id"
              class="w-full grid px-4 py-3 text-sm transition-all duration-150"
              :style="{ gridTemplateColumns: '1fr 1fr 1fr 80px', background: selectedTrain === train.id ? '#E8F8F5' : '#ffffff', borderTop: '1px solid rgba(178,228,220,0.3)', color: '#1a2e2b', textAlign: 'left', cursor: 'pointer' }"
              @click="selectedTrain = train.id"
            >
              <span :style="{ fontWeight: 600, color: selectedTrain === train.id ? '#3db89e' : '#1a2e2b' }">{{ train.name }}</span>
              <span>{{ train.depart }}</span>
              <span style="color:#6b8c87">{{ train.arrive }}</span>
              <span class="text-right" :style="{ fontWeight: 600, color: train.seats > 10 ? '#3db89e' : '#e05555' }">{{ train.seats }}석</span>
            </button>
          </div>
          <p v-if="selectedTrain" class="mt-2 text-xs" style="color:#3db89e;font-weight:500">
            ✓ {{ getSelectedTrainName() }} 선택됨 — 환승 대기 시간에 맞는 코스를 추천합니다
          </p>
        </div>

        <!-- 카테고리 -->
        <div class="mb-7">
          <p style="font-size:0.82rem;font-weight:600;color:#6b8c87;letter-spacing:0.04em;margin-bottom:10px">
            관심 카테고리 <span style="font-weight:400;color:#B2E4DC">(중복 선택 가능)</span>
          </p>
          <div class="grid grid-cols-4 gap-2.5">
            <button
              v-for="cat in CATEGORY_FILTERS" :key="cat.key"
              class="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200"
              :style="{ border: `2px solid ${selectedFilters.includes(cat.key) ? '#3db89e' : 'rgba(178,228,220,0.4)'}`, background: selectedFilters.includes(cat.key) ? '#E8F8F5' : '#ffffff', color: selectedFilters.includes(cat.key) ? '#3db89e' : '#6b8c87', fontWeight: selectedFilters.includes(cat.key) ? 600 : 400, fontSize: '0.78rem', cursor: 'pointer', position: 'relative' }"
              @click="toggleFilter(cat.key)"
            >
              <span v-if="selectedFilters.includes(cat.key)" class="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style="background:#3db89e;font-size:0.6rem;color:#fff;line-height:1">✓</span>
              <span style="font-size:1.3rem">{{ cat.emoji }}</span>
              {{ cat.label }}
            </button>
          </div>
          <div v-if="selectedFilters.length > 0" class="flex flex-wrap gap-1.5 mt-2.5">
            <span v-for="key in selectedFilters" :key="key" class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style="background:#E8F8F5;color:#3db89e;font-weight:600">
              {{ CATEGORY_FILTERS.find(c => c.key === key)?.emoji }}
              {{ CATEGORY_FILTERS.find(c => c.key === key)?.label }}
              <button style="background:none;border:none;cursor:pointer;color:#3db89e;line-height:1;padding:0" @click="toggleFilter(key)">×</button>
            </span>
          </div>
        </div>

        <!-- Submit -->
        <button
          class="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          :style="{ background: 'linear-gradient(135deg, #B2E4DC 0%, #3db89e 100%)', fontWeight: 700, fontSize: '1rem', boxShadow: '0 6px 20px rgba(61,184,158,0.35)', opacity: selectedTrain ? 1 : 0.7 }"
        >
          <Navigation :size="17" />코스 추천받기<ChevronRight :size="17" />
        </button>
        <p class="text-center mt-3" style="font-size:0.78rem;color:#6b8c87">✨ AI가 환승 대기 시간에 맞는 최적 코스를 추천합니다</p>
      </div>
    </div>
  </section>

  <!-- ── Spots Section ── -->
  <section style="max-width:1440px;margin:0 auto;padding:5rem 2rem">
    <div class="flex items-end justify-between mb-10">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm" style="background:#E8F8F5;color:#3db89e;font-weight:600">
          <MapPin :size="13" />대전 인기 명소
        </div>
        <h2 :style="{ fontWeight: 700, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#1a2e2b', letterSpacing: '-0.02em' }">환승 시간에 딱 맞는 코스</h2>
      </div>
      <a href="#" class="hidden md:flex items-center gap-1 text-sm transition-all duration-200 hover:gap-2" style="color:#3db89e;font-weight:600;text-decoration:none">전체 보기 <ChevronRight :size="16" /></a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="spot in SPOTS" :key="spot.id"
        class="group rounded-3xl overflow-hidden transition-all duration-300"
        :style="{ background: '#ffffff', boxShadow: '0 4px 24px rgba(178,228,220,0.2), 0 1px 4px rgba(0,0,0,0.04)', border: '1px solid rgba(178,228,220,0.35)', cursor: 'pointer' }"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="relative overflow-hidden" style="height:210px;background:#f0faf8">
          <img :src="spot.image" :alt="spot.name" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div class="absolute top-4 left-4">
            <span class="px-3 py-1.5 rounded-full text-xs" style="background:rgba(255,255,255,0.93);color:#1a2e2b;font-weight:600;backdrop-filter:blur(6px)">{{ spot.tag }}</span>
          </div>
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1.5 rounded-full text-xs" :style="{ background: spot.isOpen ? 'rgba(61,184,158,0.92)' : 'rgba(150,150,150,0.85)', color: '#ffffff', fontWeight: 600, backdropFilter: 'blur(6px)' }">{{ spot.isOpen ? '● 영업중' : '○ 영업종료' }}</span>
          </div>
          <button class="absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110" style="background:rgba(255,255,255,0.92);backdrop-filter:blur(6px)" @click.stop="toggleLike(spot.id)">
            <Heart :size="15" :fill="likedSpots.includes(spot.id) ? '#f87171' : 'none'" :color="likedSpots.includes(spot.id) ? '#f87171' : '#9ca3af'" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <div class="flex items-start justify-between gap-2">
              <h3 style="font-weight:700;font-size:1.1rem;color:#1a2e2b;line-height:1.3">{{ spot.name }}</h3>
              <div class="flex items-center gap-1 shrink-0 pt-0.5">
                <Star :size="13" fill="#fbbf24" color="#fbbf24" />
                <span style="font-size:0.83rem;font-weight:600;color:#1a2e2b">{{ spot.rating }}</span>
                <span style="font-size:0.78rem;color:#6b8c87">({{ spot.reviews.toLocaleString() }})</span>
              </div>
            </div>
            <p style="font-size:0.78rem;color:#3db89e;font-weight:500;margin-top:3px">{{ spot.category }}</p>
          </div>
          <p style="font-size:0.875rem;color:#6b8c87;line-height:1.7">{{ spot.description }}</p>
          <div class="rounded-2xl p-3.5 flex items-center justify-between" style="background:#f0faf8">
            <div class="flex items-center gap-1.5"><MapPin :size="12" color="#3db89e" /><span style="font-size:0.78rem;color:#6b8c87">{{ spot.distance }}</span></div>
            <div class="flex items-center gap-1.5"><Clock :size="12" color="#3db89e" /><span style="font-size:0.78rem;color:#6b8c87">{{ spot.duration }}</span></div>
          </div>
          <button class="w-full py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-80 active:scale-[0.98]" style="background:linear-gradient(135deg,#E8F8F5,#B2E4DC);color:#1a2e2b;font-weight:600">
            코스에 추가하기<ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- ── CTA Banner ── -->
  <section style="padding:0 2rem 5rem;max-width:1440px;margin:0 auto">
    <div class="relative rounded-3xl overflow-hidden px-12 py-14 flex flex-col md:flex-row items-center justify-between gap-8" style="background:linear-gradient(135deg,#B2E4DC 0%,#3db89e 55%,#2aa88e 100%)">
      <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(ellipse at 80% 50%,rgba(255,255,255,0.12),transparent 60%)" />
      <div class="space-y-3 relative z-10">
        <h2 :style="{ fontWeight: 700, fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', color: '#ffffff', lineHeight: 1.35, letterSpacing: '-0.02em' }">
          지금 바로 나만의 대전<br />환승 코스를 만들어보세요!
        </h2>
        <p style="color:rgba(255,255,255,0.85);font-size:0.95rem">무료로 시작하고, 수천 명의 여행자와 후기를 나눠보세요.</p>
      </div>
      <router-link to="/signup" class="relative z-10 shrink-0 px-8 py-4 rounded-2xl flex items-center gap-2 transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5" style="background:#ffffff;color:#3db89e;font-weight:700;font-size:1rem;box-shadow:0 6px 20px rgba(0,0,0,0.12);text-decoration:none">
        <Train :size="17" />무료로 코스 만들기<ChevronRight :size="15" />
      </router-link>
    </div>
  </section>
</template>
