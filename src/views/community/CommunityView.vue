<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, ChevronUp, Plus, MapPin, Clock, Image as ImageIcon, Heart, MessageCircle } from 'lucide-vue-next'

const router = useRouter()
const activeTab = ref<'reviews' | 'notices'>('reviews')

// --- 공지사항 ---
const notices = ref([
  { id: 1, tag: '공지', title: '대전 환승 관광 서비스 오픈 안내', date: '2025.06.01', content: '안녕하세요! 대전 환승 관광 웹앱이 정식 오픈되었습니다. 이제 대전역에서 환승하는 시간 동안 알차게 대전을 즐길 수 있는 코스를 추천받아 보세요. 앞으로도 다양한 코스와 기능을 업데이트할 예정이니 많은 이용 부탁드립니다.', pinned: true, open: false },
  { id: 2, tag: '이벤트', title: '오픈 기념 코스 후기 이벤트 진행 중!', date: '2025.06.01', content: '오픈 기념으로 코스 후기를 작성해 주신 분들 중 추첨을 통해 소정의 상품을 드립니다. 6월 1일 ~ 6월 30일까지 후기를 작성해 주세요! 당첨자 발표는 7월 5일 공지사항을 통해 안내드릴 예정입니다.', pinned: false, open: false },
  { id: 3, tag: '업데이트', title: '코스 편집 기능 업데이트 안내', date: '2025.05.20', content: '이제 추천받은 코스를 직접 편집하실 수 있습니다. 장소를 추가하거나 삭제하고, 원하는 코스로 맞춤 설정해 보세요. 편집된 코스는 저장 후 커뮤니티에 공유하실 수 있습니다.', pinned: false, open: false },
  { id: 4, tag: '공지', title: '카카오맵 연동 지도 서비스 안내', date: '2025.05.10', content: '실시간 지도 서비스가 카카오맵과 연동되었습니다. 이제 더욱 정확한 위치 정보와 경로 안내를 받아보실 수 있습니다. 지도 화면에서 각 장소 마커를 클릭하면 상세 정보를 확인하실 수 있습니다.', pinned: false, open: false },
])

const pinnedNotice = computed(() => notices.value.find(n => n.pinned))
const regularNotices = computed(() => notices.value.filter(n => !n.pinned))

function toggleNotice(id: number) {
  const n = notices.value.find(n => n.id === id)
  if (n) n.open = !n.open
}

// --- 코스 후기 ---
const reviews = ref([
  {
    id: 1,
    author: '홍길동',
    avatar: '',
    initials: '홍',
    station: '대전역',
    duration: '3시간 30분',
    places: ['성심당', '테미오래', '한밭수목원'],
    preview: '성심당에서 맛있는 빵을 먹고 테미오래에서 감성 사진도 찍고, 한밭수목원에서 산책까지! 3시간이 정말 알차게 느껴졌어요. 대전 환승하시는 분들 꼭 이 코스 추천드려요 :)',
    images: ['', ''],
    date: '2025.06.02',
    likes: 24,
    comments: 8,
    liked: false,
  },
  {
    id: 2,
    author: '여행러버',
    avatar: '',
    initials: '여',
    station: '대전역',
    duration: '2시간',
    places: ['성심당', '중앙시장'],
    preview: '짧은 환승 시간에 성심당 빵 사고 중앙시장도 구경했어요! 시간이 빠듯했지만 정말 만족스러운 코스였습니다. 성심당 튀김소보로는 필수예요!!',
    images: [''],
    date: '2025.06.01',
    likes: 15,
    comments: 3,
    liked: false,
  },
  {
    id: 3,
    author: '대전탐험가',
    avatar: '',
    initials: '대',
    station: '대전역',
    duration: '5시간',
    places: ['국립중앙과학관', '엑스포과학공원', '한밭수목원', '성심당'],
    preview: '시간 여유가 있어서 긴 코스로 다녀왔어요. 국립중앙과학관은 아이들이랑 함께 오면 정말 좋을 것 같았고, 엑스포과학공원은 어른도 즐길 수 있는 곳이었어요. 마지막에 성심당에서 빵 잔뜩 사서 기차 탔습니다!',
    images: [],
    date: '2025.05.30',
    likes: 42,
    comments: 12,
    liked: false,
  },
  {
    id: 4,
    author: '솔로여행자',
    avatar: '',
    initials: '솔',
    station: '대전역',
    duration: '4시간',
    places: ['테미오래', '보문산', '성심당'],
    preview: '혼자 여행하기 딱 좋은 코스예요. 테미오래는 조용하고 사색적인 분위기라 혼자 걷기 좋았고, 보문산은 운동도 되고 뷰도 좋았어요. 내려와서 성심당으로 마무리!',
    images: [''],
    date: '2025.05.28',
    likes: 31,
    comments: 7,
    liked: false,
  },
])

const reviewPage = ref(1)
const loadingMore = ref(false)
const hasMore = ref(true)

function toggleLike(id: number) {
  const r = reviews.value.find(r => r.id === id)
  if (!r) return
  r.liked = !r.liked
  r.likes += r.liked ? 1 : -1
}

// 무한 스크롤
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  setTimeout(() => {
    if (reviewPage.value >= 3) {
      hasMore.value = false
    } else {
      reviewPage.value++
      reviews.value.push(
        {
          id: reviews.value.length + 1,
          author: `여행자${reviews.value.length + 1}`,
          avatar: '',
          initials: '여',
          station: '대전역',
          duration: '3시간',
          places: ['성심당', '한밭수목원'],
          preview: '대전 환승 코스 후기입니다. 정말 좋았어요!',
          images: [],
          date: '2025.05.20',
          likes: Math.floor(Math.random() * 30),
          comments: Math.floor(Math.random() * 10),
          liked: false,
        }
      )
    }
    loadingMore.value = false
  }, 1000)
}

onMounted(() => {
  if (sentinel.value) {
    observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { threshold: 0.1 })
    observer.observe(sentinel.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

const tagColors: Record<string, string> = {
  '공지': 'background:#dbeafe;color:#1e40af',
  '이벤트': 'background:#fce7f3;color:#9d174d',
  '업데이트': 'background:#d1fae5;color:#065f46',
}
</script>

<template>
  <div style="background: linear-gradient(155deg, #E8F8F5 0%, #ffffff 50%, #f0faf8 100%); min-height: calc(100vh - 64px)">
    <div class="max-w-3xl mx-auto px-4 py-8">

      <!-- 탭 헤더 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex gap-0 border-b border-gray-100 w-full">
          <button
            v-for="tab in [{ key: 'reviews', label: '코스 후기' }, { key: 'notices', label: '공지사항' }]"
            :key="tab.key"
            @click="activeTab = tab.key as any"
            class="relative px-6 py-3 font-semibold text-sm transition-colors"
            :style="activeTab === tab.key ? 'color:#1a2e2b' : 'color:#9ca3af'"
          >
            {{ tab.label }}
            <span
              v-if="activeTab === tab.key"
              class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style="background:#7ECFC0"
            />
          </button>

          <!-- 후기 작성 버튼 (코스 후기 탭일 때만) -->
          <div class="ml-auto flex items-center pb-1" v-if="activeTab === 'reviews'">
            <button
              @click="router.push('/community/write')"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff; box-shadow: 0 2px 8px rgba(61,184,158,0.25)"
            >
              <Plus :size="15" />
              후기 작성
            </button>
          </div>
        </div>
      </div>

      <!-- 공지사항 탭 -->
      <div v-if="activeTab === 'notices'" class="flex flex-col gap-3">

        <!-- 고정 배너 -->
        <div
          v-if="pinnedNotice"
          class="rounded-2xl p-5 flex items-start gap-4"
          style="background: linear-gradient(135deg, #E8F8F5, #f0faf8); border: 1.5px solid rgba(126,207,192,0.4)"
        >
          <div class="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
            <span style="color:#fff;font-size:0.7rem;font-weight:800">📌</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:#3db89e;color:#fff">고정</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :style="tagColors[pinnedNotice.tag]">{{ pinnedNotice.tag }}</span>
            </div>
            <p style="font-weight:700;color:#1a2e2b;font-size:0.95rem" class="mb-1">{{ pinnedNotice.title }}</p>
            <p style="font-size:0.82rem;color:#6b8c87">{{ pinnedNotice.content }}</p>
            <p style="font-size:0.75rem;color:#9ca3af" class="mt-2">{{ pinnedNotice.date }}</p>
          </div>
        </div>

        <!-- 공지 목록 (아코디언) -->
        <div
          v-for="notice in regularNotices"
          :key="notice.id"
          class="rounded-2xl overflow-hidden"
          style="background:#fff; border: 1.5px solid rgba(178,228,220,0.35); box-shadow: 0 2px 12px rgba(26,46,43,0.05)"
        >
          <button
            class="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
            @click="toggleNotice(notice.id)"
          >
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" :style="tagColors[notice.tag] || 'background:#f3f4f6;color:#374151'">{{ notice.tag }}</span>
            <span class="flex-1 font-semibold text-sm" style="color:#1a2e2b">{{ notice.title }}</span>
            <span style="font-size:0.78rem;color:#9ca3af" class="flex-shrink-0">{{ notice.date }}</span>
            <ChevronDown v-if="!notice.open" :size="16" color="#9ca3af" class="flex-shrink-0" />
            <ChevronUp v-else :size="16" color="#3db89e" class="flex-shrink-0" />
          </button>
          <div
            v-if="notice.open"
            class="px-5 pb-5"
            style="border-top: 1px solid rgba(178,228,220,0.3)"
          >
            <p style="font-size:0.88rem;color:#374151;line-height:1.7" class="pt-4">{{ notice.content }}</p>
          </div>
        </div>
      </div>

      <!-- 코스 후기 탭 -->
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="rounded-2xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
          style="background:#fff; border: 1.5px solid rgba(178,228,220,0.35); box-shadow: 0 2px 12px rgba(26,46,43,0.05)"
          @click="router.push(`/community/${review.id}`)"
        >
          <!-- 카드 헤더 (작성자) -->
          <div class="flex items-center gap-3 px-5 pt-4 pb-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm" style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff">
              {{ review.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p style="font-weight:700;font-size:0.9rem;color:#1a2e2b">{{ review.author }}</p>
              <p style="font-size:0.75rem;color:#9ca3af">{{ review.date }}</p>
            </div>
          </div>

          <!-- 코스 요약 -->
          <div class="mx-5 mb-3 px-4 py-3 rounded-xl" style="background:#f0faf8;border:1px solid rgba(178,228,220,0.4)">
            <div class="flex items-center gap-2 mb-2">
              <MapPin :size="13" color="#3db89e" />
              <span style="font-size:0.8rem;font-weight:600;color:#3db89e">{{ review.station }}</span>
              <span style="font-size:0.78rem;color:#9ca3af">·</span>
              <Clock :size="13" color="#6b8c87" />
              <span style="font-size:0.8rem;color:#6b8c87">{{ review.duration }}</span>
            </div>
            <div class="flex items-center gap-1 flex-wrap">
              <template v-for="(place, i) in review.places" :key="i">
                <span style="font-size:0.8rem;font-weight:600;color:#1a2e2b">{{ place }}</span>
                <span v-if="i < review.places.length - 1" style="font-size:0.75rem;color:#B2E4DC">→</span>
              </template>
            </div>
          </div>

          <!-- 후기 미리보기 -->
          <p class="px-5 pb-3" style="font-size:0.88rem;color:#374151;line-height:1.65;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">
            {{ review.preview }}
          </p>

          <!-- 이미지 썸네일 -->
          <div v-if="review.images.length > 0" class="px-5 pb-3 flex gap-2">
            <div
              v-for="(img, i) in review.images"
              :key="i"
              class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
              style="background:#f0faf8;border:1px solid rgba(178,228,220,0.4)"
            >
              <img v-if="img" :src="img" class="w-full h-full object-cover" />
              <ImageIcon v-else :size="24" color="#B2E4DC" />
            </div>
          </div>

          <!-- 액션 바 -->
          <div class="px-5 pb-4 flex items-center gap-4 border-t" style="border-color: rgba(178,228,220,0.3); padding-top: 12px" @click.stop>
            <button
              class="flex items-center gap-1.5 transition-colors"
              @click="toggleLike(review.id)"
              :style="review.liked ? 'color:#3db89e' : 'color:#9ca3af'"
            >
              <Heart :size="15" :fill="review.liked ? '#3db89e' : 'none'" />
              <span style="font-size:0.8rem;font-weight:600">{{ review.likes }}</span>
            </button>
            <button class="flex items-center gap-1.5" style="color:#9ca3af">
              <MessageCircle :size="15" />
              <span style="font-size:0.8rem;font-weight:600">{{ review.comments }}</span>
            </button>
          </div>
        </div>

        <!-- 무한 스크롤 sentinel -->
        <div ref="sentinel" class="h-4" />

        <!-- 로딩 인디케이터 -->
        <div v-if="loadingMore" class="flex justify-center py-4">
          <div class="w-6 h-6 rounded-full border-2 animate-spin" style="border-color: #B2E4DC; border-top-color: #3db89e" />
        </div>

        <!-- 끝 메시지 -->
        <p v-if="!hasMore && !loadingMore" class="text-center py-4" style="font-size:0.82rem;color:#9ca3af">
          모든 후기를 불러왔습니다.
        </p>
      </div>

    </div>
  </div>
</template>
