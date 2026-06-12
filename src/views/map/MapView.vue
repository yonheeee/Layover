<script setup lang="ts">
import { ref } from 'vue'
import { MapPin, Clock, Train, ChevronRight, Share2, Navigation, Footprints, Car } from 'lucide-vue-next'

type CourseTab = 'relaxed' | 'fit' | 'fast'
const activeTab = ref<CourseTab>('fit')

interface Place {
  id: number
  name: string
  category: string
  isOpen: boolean
  image: string
}
interface Step {
  place: Place
  transport?: 'walk' | 'taxi'
  transportTime?: string
}
interface Course {
  tab: CourseTab
  label: string
  steps: Step[]
  totalTime: string
  estimatedCost: string
}

const COURSES: Course[] = [
  {
    tab: 'relaxed',
    label: '여유 코스',
    totalTime: '약 3시간',
    estimatedCost: '약 15,000원',
    steps: [
      { place: { id: 1, name: '성심당', category: '🍞 베이커리', isOpen: true, image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400' }, transport: 'walk', transportTime: '10분' },
      { place: { id: 2, name: '한밭수목원', category: '🌿 자연', isOpen: true, image: 'https://images.unsplash.com/photo-1651422933132-d3e8822d8b40?w=400' }, transport: 'taxi', transportTime: '15분' },
      { place: { id: 3, name: '테미오래', category: '🏛 문화', isOpen: false, image: 'https://images.unsplash.com/photo-1734287096542-daa9300f1484?w=400' } },
    ],
  },
  {
    tab: 'fit',
    label: '딱 맞는 코스',
    totalTime: '약 2시간',
    estimatedCost: '약 10,000원',
    steps: [
      { place: { id: 1, name: '성심당', category: '🍞 베이커리', isOpen: true, image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400' }, transport: 'walk', transportTime: '5분' },
      { place: { id: 4, name: '중앙시장', category: '🍜 음식', isOpen: true, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' }, transport: 'taxi', transportTime: '10분' },
      { place: { id: 2, name: '한밭수목원', category: '🌿 자연', isOpen: true, image: 'https://images.unsplash.com/photo-1651422933132-d3e8822d8b40?w=400' } },
    ],
  },
  {
    tab: 'fast',
    label: '빠른 코스',
    totalTime: '약 1시간',
    estimatedCost: '약 5,000원',
    steps: [
      { place: { id: 1, name: '성심당', category: '🍞 베이커리', isOpen: true, image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400' }, transport: 'walk', transportTime: '5분' },
      { place: { id: 5, name: '대전역 광장', category: '🏛 관광', isOpen: true, image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400' } },
    ],
  },
]

const currentCourse = () => COURSES.find(c => c.tab === activeTab.value)!

const activePopup = ref<number | null>(null)
const MOCK_MARKERS = [
  { id: 1, name: '성심당', x: 30, y: 40, hours: '매일 08:00 – 22:00', image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=300' },
  { id: 2, name: '한밭수목원', x: 55, y: 25, hours: '매일 05:00 – 21:00', image: 'https://images.unsplash.com/photo-1651422933132-d3e8822d8b40?w=300' },
  { id: 3, name: '테미오래', x: 70, y: 60, hours: '화~일 10:00 – 18:00', image: 'https://images.unsplash.com/photo-1734287096542-daa9300f1484?w=300' },
  { id: 4, name: '중앙시장', x: 40, y: 65, hours: '매일 09:00 – 20:00', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300' },
  { id: 5, name: '대전역 광장', x: 20, y: 70, hours: '상시 개방', image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=300' },
]

const TABS: { key: CourseTab; label: string }[] = [
  { key: 'relaxed', label: '여유 코스' },
  { key: 'fit', label: '딱 맞는 코스' },
  { key: 'fast', label: '빠른 코스' },
]
</script>

<template>
  <div class="flex" style="height: calc(100vh - 64px); font-family: 'Noto Sans KR', 'Nunito', sans-serif">
    <!-- ── 왼쪽 패널 (40%) ── -->
    <div class="flex flex-col overflow-hidden" style="width: 40%; min-width: 360px; border-right: 1px solid rgba(178,228,220,0.35); background: #fafffe">
      <!-- 패널 헤더 -->
      <div class="px-6 pt-6 pb-4" style="border-bottom: 1px solid rgba(178,228,220,0.3)">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
            <Navigation :size="13" color="#fff" />
          </div>
          <h2 style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b">추천 코스</h2>
        </div>
        <!-- 탭 -->
        <div class="flex gap-1">
          <button
            v-for="tab in TABS" :key="tab.key"
            class="flex-1 py-2 rounded-xl text-xs transition-all duration-200"
            :style="{
              background: activeTab === tab.key ? '#E8F8F5' : 'transparent',
              color: activeTab === tab.key ? '#3db89e' : '#6b8c87',
              fontWeight: activeTab === tab.key ? 700 : 400,
              border: `1.5px solid ${activeTab === tab.key ? '#3db89e' : 'rgba(178,228,220,0.4)'}`,
            }"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
        </div>
      </div>

      <!-- 코스 내용 -->
      <div class="flex-1 overflow-y-auto px-6 py-5">
        <div class="space-y-2">
          <template v-for="(step, idx) in currentCourse().steps" :key="step.place.id">
            <!-- 장소 카드 -->
            <div
              class="rounded-2xl overflow-hidden"
              style="border: 1.5px solid rgba(178,228,220,0.4); background: #ffffff; box-shadow: 0 2px 12px rgba(178,228,220,0.15)"
            >
              <div class="flex gap-3 p-4">
                <!-- 스텝 번호 -->
                <div class="flex flex-col items-center shrink-0" style="width: 28px">
                  <div
                    class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style="background: linear-gradient(135deg, #B2E4DC, #3db89e)"
                  >{{ idx + 1 }}</div>
                </div>
                <!-- 이미지 -->
                <img :src="step.place.image" :alt="step.place.name" class="rounded-xl object-cover shrink-0" style="width:64px;height:64px" />
                <!-- 정보 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-1">
                    <p style="font-weight: 700; font-size: 0.92rem; color: #1a2e2b; line-height: 1.3">{{ step.place.name }}</p>
                    <span
                      class="px-2 py-0.5 rounded-full text-xs shrink-0"
                      :style="{
                        background: step.place.isOpen ? 'rgba(61,184,158,0.12)' : 'rgba(150,150,150,0.12)',
                        color: step.place.isOpen ? '#3db89e' : '#6b8c87',
                        fontWeight: 600,
                      }"
                    >{{ step.place.isOpen ? '● 영업중' : '○ 마감' }}</span>
                  </div>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs mt-1"
                    style="background: #E8F8F5; color: #3db89e; font-weight: 600"
                  >{{ step.place.category }}</span>
                </div>
              </div>
            </div>

            <!-- 이동 수단 연결선 -->
            <div v-if="step.transport" class="flex items-center gap-3 px-4 py-1">
              <div class="w-0.5 h-4 mx-3 rounded" style="background: rgba(178,228,220,0.6)" />
              <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style="background: #f0faf8; border: 1px solid rgba(178,228,220,0.4)">
                <Footprints v-if="step.transport === 'walk'" :size="13" color="#3db89e" />
                <Car v-else :size="13" color="#3db89e" />
                <span style="font-size: 0.75rem; color: #6b8c87; font-weight: 600">{{ step.transport === 'walk' ? '도보' : '택시' }} {{ step.transportTime }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 하단 요약 + 공유 버튼 -->
      <div class="px-6 py-5" style="border-top: 1px solid rgba(178,228,220,0.3); background: #ffffff">
        <div class="flex gap-4 mb-4">
          <div class="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-1" style="background: #E8F8F5">
            <Clock :size="14" color="#3db89e" />
            <div>
              <p style="font-size: 0.7rem; color: #6b8c87">총 소요 시간</p>
              <p style="font-size: 0.88rem; font-weight: 700; color: #1a2e2b">{{ currentCourse().totalTime }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-1" style="background: #E8F8F5">
            <span style="font-size: 1rem">💰</span>
            <div>
              <p style="font-size: 0.7rem; color: #6b8c87">예상 비용</p>
              <p style="font-size: 0.88rem; font-weight: 700; color: #1a2e2b">{{ currentCourse().estimatedCost }}</p>
            </div>
          </div>
        </div>
        <button
          class="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
          style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color: #fff; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 14px rgba(61,184,158,0.3)"
        >
          <Share2 :size="16" />이 코스 공유하기
        </button>
      </div>
    </div>

    <!-- ── 오른쪽 패널 (60%) - 지도 ── -->
    <div class="flex-1 relative overflow-hidden" style="background: #e8f5f2">
      <!-- 지도 목업 (실제 카카오맵 연동 시 kakao.maps.Map 으로 교체) -->
      <div class="absolute inset-0 flex items-center justify-center" style="background: linear-gradient(135deg, #d4ede9 0%, #e8f5f2 50%, #c8e8e2 100%)">
        <!-- 격자 패턴 -->
        <svg class="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3db89e" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <!-- 도로 목업 -->
        <svg class="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#3db89e" stroke-width="8" />
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#3db89e" stroke-width="6" />
          <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#3db89e" stroke-width="6" />
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#3db89e" stroke-width="4" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#3db89e" stroke-width="4" />
        </svg>

        <!-- 경로 라인 (현재 코스 동선) -->
        <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <template v-for="(step, idx) in currentCourse().steps.slice(0, -1)" :key="step.place.id">
            <line
              :x1="`${MOCK_MARKERS.find(m => m.id === step.place.id)?.x ?? 0}%`"
              :y1="`${MOCK_MARKERS.find(m => m.id === step.place.id)?.y ?? 0}%`"
              :x2="`${MOCK_MARKERS.find(m => m.id === currentCourse().steps[idx + 1].place.id)?.x ?? 0}%`"
              :y2="`${MOCK_MARKERS.find(m => m.id === currentCourse().steps[idx + 1].place.id)?.y ?? 0}%`"
              stroke="#3db89e" stroke-width="3" stroke-dasharray="8,4" opacity="0.7"
            />
          </template>
        </svg>

        <!-- 마커들 -->
        <template v-for="marker in MOCK_MARKERS" :key="marker.id">
          <button
            class="absolute flex flex-col items-center gap-1 transition-transform hover:scale-110"
            :style="{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-50%, -100%)' }"
            @click="activePopup = activePopup === marker.id ? null : marker.id"
          >
            <!-- 현재 코스에 포함된 마커 강조 -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
              :style="{
                background: currentCourse().steps.some(s => s.place.id === marker.id)
                  ? 'linear-gradient(135deg, #B2E4DC, #3db89e)'
                  : 'rgba(255,255,255,0.9)',
                color: currentCourse().steps.some(s => s.place.id === marker.id) ? '#fff' : '#6b8c87',
                border: currentCourse().steps.some(s => s.place.id === marker.id) ? 'none' : '2px solid rgba(178,228,220,0.6)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }"
            >
              {{ currentCourse().steps.findIndex(s => s.place.id === marker.id) + 1 > 0
                ? currentCourse().steps.findIndex(s => s.place.id === marker.id) + 1
                : '·' }}
            </div>
            <div class="px-2 py-0.5 rounded-full text-xs whitespace-nowrap shadow" style="background: rgba(255,255,255,0.95); color: #1a2e2b; font-weight: 600">
              {{ marker.name }}
            </div>

            <!-- 팝업 -->
            <div
              v-if="activePopup === marker.id"
              class="absolute bottom-full mb-2 rounded-2xl overflow-hidden shadow-xl"
              style="width: 220px; background: #ffffff; border: 1px solid rgba(178,228,220,0.4); left: 50%; transform: translateX(-50%)"
              @click.stop
            >
              <img :src="marker.image" :alt="marker.name" class="w-full object-cover" style="height: 110px" />
              <div class="p-3">
                <p style="font-weight: 700; font-size: 0.9rem; color: #1a2e2b">{{ marker.name }}</p>
                <div class="flex items-center gap-1.5 mt-1.5">
                  <Clock :size="12" color="#3db89e" />
                  <span style="font-size: 0.75rem; color: #6b8c87">{{ marker.hours }}</span>
                </div>
              </div>
            </div>
          </button>
        </template>

        <!-- 지도 안내 텍스트 -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm" style="background: rgba(255,255,255,0.9); color: #6b8c87; box-shadow: 0 2px 12px rgba(0,0,0,0.1)">
          🗺️ 카카오맵 API 연동 예정 — 현재 목업 화면
        </div>
      </div>
    </div>
  </div>
</template>
