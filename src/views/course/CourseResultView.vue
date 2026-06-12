<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, Clock, ChevronRight, Edit2, Check, X, Plus, Search, Footprints, Car, Share2, ExternalLink } from 'lucide-vue-next'

interface Place {
  id: number
  name: string
  category: string
  isOpen: boolean
  transport?: 'walk' | 'taxi'
  transportTime?: string
}

const courseId = 1
const places = ref<Place[]>([
  { id: 1, name: '성심당', category: '🍞 베이커리', isOpen: true, transport: 'walk', transportTime: '5분' },
  { id: 2, name: '중앙시장', category: '🍜 음식', isOpen: true, transport: 'taxi', transportTime: '10분' },
  { id: 3, name: '한밭수목원', category: '🌿 자연', isOpen: true },
])
const totalTime = '약 2시간'
const estimatedCost = '약 10,000원'

const isEditing = ref(false)
const isSaving = ref(false)

// 장소 추가 모달
const showAddModal = ref(false)
const searchKeyword = ref('')
const searchResults = ref<Place[]>([])
const MOCK_SEARCH: Place[] = [
  { id: 4, name: '테미오래', category: '🏛 문화', isOpen: false },
  { id: 5, name: '대전역 광장', category: '🏛 관광', isOpen: true },
  { id: 6, name: '보문산공원', category: '🌿 자연', isOpen: true },
  { id: 7, name: '이응노 미술관', category: '🏛 문화', isOpen: true },
  { id: 8, name: '으능정이 거리', category: '🍜 음식', isOpen: true },
]

function handleSearch() {
  searchResults.value = MOCK_SEARCH.filter(p =>
    p.name.includes(searchKeyword.value) || searchKeyword.value === ''
  )
}
function openAddModal() {
  searchKeyword.value = ''
  searchResults.value = MOCK_SEARCH
  showAddModal.value = true
}
function addPlace(place: Place) {
  places.value.push({ ...place })
  showAddModal.value = false
}
function removePlace(idx: number) {
  places.value.splice(idx, 1)
}

async function finishEdit() {
  isSaving.value = true
  await new Promise(r => setTimeout(r, 800))
  isSaving.value = false
  isEditing.value = false
}

// 코스 확정 모달
const showConfirmModal = ref(false)
const showShareToast = ref(false)

const EXTRA_PLACES_30 = [
  { id: 5, name: '대전역 광장', category: '🏛 관광', isOpen: true, fromLast: '도보 5분', image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=300' },
  { id: 6, name: '보문산공원', category: '🌿 자연', isOpen: true, fromLast: '택시 12분', image: 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=300' },
]
const EXTRA_PLACES_60 = [
  { id: 4, name: '테미오래', category: '🏛 문화', isOpen: false, fromLast: '택시 15분', image: 'https://images.unsplash.com/photo-1734287096542-daa9300f1484?w=300' },
  { id: 7, name: '이응노 미술관', category: '🏛 문화', isOpen: true, fromLast: '택시 20분', image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=300' },
]

function confirmCourse() {
  showConfirmModal.value = false
  showShareToast.value = true
  setTimeout(() => { showShareToast.value = false }, 6000)
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] py-10 px-4" style="background: linear-gradient(155deg, #E8F8F5 0%, #ffffff 50%, #f0faf8 100%); font-family: 'Noto Sans KR', 'Nunito', sans-serif">
    <div class="mx-auto" style="max-width: 680px">

      <!-- 헤더 -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <p style="font-size:0.82rem;color:#3db89e;font-weight:600">추천 코스 결과</p>
          <h1 style="font-size:1.5rem;font-weight:700;color:#1a2e2b;letter-spacing:-0.02em">나의 대전 환승 코스</h1>
        </div>
        <button
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200"
          :style="{
            background: isEditing ? 'linear-gradient(135deg, #B2E4DC, #3db89e)' : '#E8F8F5',
            color: isEditing ? '#fff' : '#3db89e',
            fontWeight: 600,
            fontSize: '0.88rem',
          }"
          :disabled="isSaving"
          @click="isEditing ? finishEdit() : isEditing = true"
        >
          <span v-if="isSaving">저장 중...</span>
          <template v-else>
            <Check v-if="isEditing" :size="15" />
            <Edit2 v-else :size="15" />
            {{ isEditing ? '완료' : '편집' }}
          </template>
        </button>
      </div>

      <!-- 코스 카드 -->
      <div class="rounded-3xl overflow-hidden mb-6" style="background:#ffffff;box-shadow:0 8px 40px rgba(178,228,220,0.3),0 2px 8px rgba(0,0,0,0.04);border:1px solid rgba(178,228,220,0.4)">
        <div class="px-6 pt-6 pb-4" style="border-bottom:1px solid rgba(178,228,220,0.25)">
          <div class="flex gap-4">
            <div class="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-1" style="background:#E8F8F5">
              <Clock :size="14" color="#3db89e" />
              <div><p style="font-size:0.68rem;color:#6b8c87">총 소요 시간</p><p style="font-size:0.88rem;font-weight:700;color:#1a2e2b">{{ totalTime }}</p></div>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-1" style="background:#E8F8F5">
              <span>💰</span>
              <div><p style="font-size:0.68rem;color:#6b8c87">예상 비용</p><p style="font-size:0.88rem;font-weight:700;color:#1a2e2b">{{ estimatedCost }}</p></div>
            </div>
          </div>
        </div>

        <div class="px-6 py-5 space-y-1">
          <template v-for="(place, idx) in places" :key="place.id">
            <!-- 장소 카드 -->
            <div class="relative flex items-center gap-4 py-3 px-4 rounded-2xl transition-all" style="background:#f9fefe;border:1px solid rgba(178,228,220,0.3)">
              <!-- 번호 -->
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style="background:linear-gradient(135deg,#B2E4DC,#3db89e)">{{ idx + 1 }}</div>
              <!-- 내용 -->
              <div class="flex-1">
                <p style="font-weight:700;font-size:0.92rem;color:#1a2e2b">{{ place.name }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="px-2 py-0.5 rounded-full text-xs" style="background:#E8F8F5;color:#3db89e;font-weight:600">{{ place.category }}</span>
                  <span class="px-2 py-0.5 rounded-full text-xs" :style="{ background: place.isOpen ? 'rgba(61,184,158,0.1)' : 'rgba(150,150,150,0.1)', color: place.isOpen ? '#3db89e' : '#6b8c87', fontWeight: 600 }">{{ place.isOpen ? '● 영업중' : '○ 마감' }}</span>
                </div>
              </div>
              <!-- 편집모드 삭제 버튼 -->
              <button
                v-if="isEditing"
                class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style="background:rgba(224,85,85,0.1);color:#e05555;border:none;cursor:pointer;flex-shrink:0"
                @click="removePlace(idx)"
              >
                <X :size="14" />
              </button>
            </div>

            <!-- 이동 수단 -->
            <div v-if="place.transport && idx < places.length - 1" class="flex items-center gap-2 px-6 py-1">
              <div class="w-0.5 h-3 mx-3 rounded" style="background:rgba(178,228,220,0.5)" />
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-full" style="background:#f0faf8;border:1px solid rgba(178,228,220,0.4)">
                <Footprints v-if="place.transport === 'walk'" :size="12" color="#3db89e" />
                <Car v-else :size="12" color="#3db89e" />
                <span style="font-size:0.72rem;color:#6b8c87;font-weight:600">{{ place.transport === 'walk' ? '도보' : '택시' }} {{ place.transportTime }}</span>
              </div>
            </div>
          </template>

          <!-- 편집모드 장소 추가 버튼 -->
          <button
            v-if="isEditing"
            class="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-80 mt-3"
            style="border:2px dashed rgba(178,228,220,0.6);background:transparent;color:#3db89e;font-weight:600;font-size:0.9rem;cursor:pointer"
            @click="openAddModal"
          >
            <Plus :size="16" />장소 추가
          </button>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="flex gap-3">
        <button
          class="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-80"
          style="background:#E8F8F5;color:#3db89e;font-weight:600;font-size:0.95rem"
        >
          <Share2 :size="16" />코스 공유
        </button>
        <button
          class="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
          style="background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;box-shadow:0 4px 14px rgba(61,184,158,0.3)"
          @click="showConfirmModal = true"
        >
          코스 확정하기<ChevronRight :size="16" />
        </button>
      </div>
    </div>

    <!-- ── 장소 추가 모달 ── -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(26,46,43,0.4);backdrop-filter:blur(6px)" @click.self="showAddModal = false">
      <div class="w-full rounded-3xl overflow-hidden" style="max-width:440px;background:#fff;box-shadow:0 24px 80px rgba(26,46,43,0.15)">
        <!-- 헤더 -->
        <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid rgba(178,228,220,0.3);background:linear-gradient(135deg,#E8F8F5,#f0faf8)">
          <span style="font-weight:700;font-size:1rem;color:#1a2e2b">장소 추가</span>
          <button style="background:none;border:none;cursor:pointer;color:#6b8c87" @click="showAddModal = false"><X :size="18" /></button>
        </div>
        <!-- 검색 -->
        <div class="px-6 py-4">
          <div class="relative">
            <Search :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
            <input
              v-model="searchKeyword"
              style="width:100%;padding:11px 16px 11px 40px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.9rem;outline:none;box-sizing:border-box"
              placeholder="장소명을 입력하세요"
              @input="handleSearch"
            />
          </div>
        </div>
        <!-- 결과 목록 -->
        <div class="overflow-y-auto px-6 pb-6 space-y-2" style="max-height:300px">
          <button
            v-for="result in searchResults"
            :key="result.id"
            class="w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-150 hover:bg-[#E8F8F5]"
            style="border:1.5px solid rgba(178,228,220,0.3);background:#fafffe;text-align:left;cursor:pointer"
            @click="addPlace(result)"
          >
            <div class="flex-1">
              <p style="font-weight:700;font-size:0.9rem;color:#1a2e2b">{{ result.name }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="px-2 py-0.5 rounded-full text-xs" style="background:#E8F8F5;color:#3db89e;font-weight:600">{{ result.category }}</span>
                <span class="px-2 py-0.5 rounded-full text-xs" :style="{ color: result.isOpen ? '#3db89e' : '#6b8c87', fontWeight: 600 }">{{ result.isOpen ? '● 영업중' : '○ 마감' }}</span>
              </div>
            </div>
            <Plus :size="16" color="#3db89e" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── 코스 확정 모달 (추가 관광지 추천) ── -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(26,46,43,0.45);backdrop-filter:blur(6px)" @click.self="showConfirmModal = false">
      <div class="w-full rounded-3xl overflow-hidden" style="max-width:520px;background:#fff;box-shadow:0 24px 80px rgba(26,46,43,0.18);max-height:90vh;overflow-y:auto">
        <!-- 헤더 -->
        <div class="sticky top-0 flex items-center justify-between px-7 py-5 z-10" style="background:linear-gradient(135deg,#E8F8F5,#f0faf8);border-bottom:1px solid rgba(178,228,220,0.4)">
          <div>
            <p style="font-size:0.78rem;color:#3db89e;font-weight:600">코스 확정 전 확인해보세요!</p>
            <p style="font-size:1rem;font-weight:700;color:#1a2e2b">기차 시간을 조금만 늘리면 더 즐길 수 있어요!</p>
          </div>
          <button style="background:rgba(255,255,255,0.6);border:none;cursor:pointer;color:#6b8c87;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center" @click="showConfirmModal = false">
            <X :size="16" />
          </button>
        </div>

        <div class="px-7 py-6 space-y-6">
          <!-- +30분 섹션 -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="px-3 py-1 rounded-full text-sm font-bold" style="background:rgba(61,184,158,0.12);color:#3db89e">+ 30분</span>
              <p style="font-size:0.85rem;color:#6b8c87">30분만 더 있으면 갈 수 있어요</p>
            </div>
            <div class="space-y-2">
              <div v-for="place in EXTRA_PLACES_30" :key="place.id" class="flex gap-3 p-4 rounded-2xl" style="border:1.5px solid rgba(178,228,220,0.35);background:#fafffe">
                <img :src="place.image" :alt="place.name" class="rounded-xl object-cover shrink-0" style="width:64px;height:64px" />
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <p style="font-weight:700;font-size:0.9rem;color:#1a2e2b">{{ place.name }}</p>
                    <span class="px-2 py-0.5 rounded-full text-xs" :style="{ background: place.isOpen ? 'rgba(61,184,158,0.1)' : 'rgba(150,150,150,0.1)', color: place.isOpen ? '#3db89e' : '#6b8c87', fontWeight: 600 }">{{ place.isOpen ? '영업중' : '마감' }}</span>
                  </div>
                  <span class="inline-block px-2 py-0.5 rounded-full text-xs mt-1" style="background:#E8F8F5;color:#3db89e;font-weight:600">{{ place.category }}</span>
                  <div class="flex items-center gap-1 mt-1.5">
                    <MapPin :size="11" color="#B2E4DC" />
                    <span style="font-size:0.72rem;color:#6b8c87">마지막 장소에서 {{ place.fromLast }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- +1시간 섹션 -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="px-3 py-1 rounded-full text-sm font-bold" style="background:rgba(244,215,164,0.3);color:#c8920a">+ 1시간</span>
              <p style="font-size:0.85rem;color:#6b8c87">1시간 더 있으면 갈 수 있어요</p>
            </div>
            <div class="space-y-2">
              <div v-for="place in EXTRA_PLACES_60" :key="place.id" class="flex gap-3 p-4 rounded-2xl" style="border:1.5px solid rgba(178,228,220,0.35);background:#fafffe">
                <img :src="place.image" :alt="place.name" class="rounded-xl object-cover shrink-0" style="width:64px;height:64px" />
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <p style="font-weight:700;font-size:0.9rem;color:#1a2e2b">{{ place.name }}</p>
                    <span class="px-2 py-0.5 rounded-full text-xs" :style="{ background: place.isOpen ? 'rgba(61,184,158,0.1)' : 'rgba(150,150,150,0.1)', color: place.isOpen ? '#3db89e' : '#6b8c87', fontWeight: 600 }">{{ place.isOpen ? '영업중' : '마감' }}</span>
                  </div>
                  <span class="inline-block px-2 py-0.5 rounded-full text-xs mt-1" style="background:#E8F8F5;color:#3db89e;font-weight:600">{{ place.category }}</span>
                  <div class="flex items-center gap-1 mt-1.5">
                    <MapPin :size="11" color="#B2E4DC" />
                    <span style="font-size:0.72rem;color:#6b8c87">마지막 장소에서 {{ place.fromLast }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 버튼 -->
          <div class="flex flex-col gap-3 pt-2">
            <a
              href="https://www.letskorail.com"
              target="_blank"
              rel="noopener"
              class="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
              style="background:#E8F8F5;color:#3db89e;font-weight:700;font-size:0.95rem;text-decoration:none"
            >
              <ExternalLink :size="16" />기차 시간 변경하러 가기
            </a>
            <button
              class="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
              style="background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;box-shadow:0 4px 14px rgba(61,184,158,0.3)"
              @click="confirmCourse"
            >
              이대로 확정하기<ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 공유 토스트 ── -->
    <Transition name="toast">
      <div
        v-if="showShareToast"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 rounded-2xl z-50"
        style="background:#1a2e2b;color:#fff;box-shadow:0 8px 32px rgba(0,0,0,0.25);min-width:320px"
      >
        <span style="font-size:0.9rem;font-weight:500">이 코스를 커뮤니티에 공유할까요?</span>
        <div class="flex gap-2 shrink-0">
          <router-link to="/community/write" class="px-3 py-1.5 rounded-xl text-sm font-bold" style="background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;text-decoration:none">공유하기</router-link>
          <button class="px-3 py-1.5 rounded-xl text-sm" style="background:rgba(255,255,255,0.15);color:#fff;border:none;cursor:pointer" @click="showShareToast = false">닫기</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
