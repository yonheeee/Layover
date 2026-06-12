<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { X, Image as ImageIcon, ChevronRight, MapPin, Clock, Footprints, Car, RefreshCw, Loader } from 'lucide-vue-next'

const router = useRouter()

// 제목
const title = ref('')
const MAX_TITLE = 50

// 선택된 코스
interface Place { name: string; category: string; transport?: string; time?: string }
interface Course { id: number; station: string; duration: string; date: string; places: Place[] }

const selectedCourse = ref<Course | null>(null)

// 후기 텍스트
const reviewText = ref('')
const MIN_REVIEW = 10
const MAX_REVIEW = 500

// 이미지
const images = ref<{ url: string; file: File }[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

// 코스 불러오기 모달
const showCourseModal = ref(false)

const mockCourses: Course[] = [
  {
    id: 1,
    station: '대전역',
    duration: '3시간 30분',
    date: '2025.05.28',
    places: [
      { name: '성심당', category: '음식', transport: '도보', time: '5분' },
      { name: '테미오래', category: '문화', transport: '택시', time: '10분' },
      { name: '한밭수목원', category: '자연', transport: '도보', time: '15분' },
    ],
  },
  {
    id: 2,
    station: '대전역',
    duration: '2시간',
    date: '2025.05.15',
    places: [
      { name: '성심당', category: '음식', transport: '도보', time: '5분' },
      { name: '중앙시장', category: '음식', transport: '도보', time: '8분' },
    ],
  },
  {
    id: 3,
    station: '서대전역',
    duration: '4시간',
    date: '2025.04.20',
    places: [
      { name: '국립중앙과학관', category: '문화', transport: '택시', time: '12분' },
      { name: '엑스포과학공원', category: '투어', transport: '도보', time: '5분' },
      { name: '성심당', category: '음식', transport: '택시', time: '15분' },
    ],
  },
]

function selectCourse(course: Course) {
  selectedCourse.value = course
  showCourseModal.value = false
}

// 이미지 업로드
function onImageChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const file of Array.from(files)) {
    if (images.value.length >= 3) break
    const url = URL.createObjectURL(file)
    images.value.push({ url, file })
  }
  if (fileInput.value) fileInput.value.value = ''
}

function removeImage(i: number) {
  URL.revokeObjectURL(images.value[i].url)
  images.value.splice(i, 1)
}

// 제출 가능 여부
const canSubmit = computed(
  () => title.value.trim().length > 0 && selectedCourse.value !== null && reviewText.value.trim().length >= MIN_REVIEW
)

const submitting = ref(false)
async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  await new Promise(r => setTimeout(r, 1200))
  submitting.value = false
  router.push('/community')
}

// 취소 확인 다이얼로그
const showCancelDialog = ref(false)
function tryCancel() {
  const dirty = title.value || selectedCourse.value || reviewText.value || images.value.length > 0
  if (dirty) showCancelDialog.value = true
  else router.back()
}
function confirmCancel() {
  showCancelDialog.value = false
  router.back()
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

      <!-- 페이지 헤더 -->
      <div class="flex items-center gap-3 mb-7">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
          <span style="font-size:0.85rem">✍️</span>
        </div>
        <h1 style="font-weight:800;font-size:1.2rem;color:#1a2e2b">코스 후기 작성</h1>
      </div>

      <div class="flex flex-col gap-6">

        <!-- 1. 제목 -->
        <div class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
          <label style="font-size:0.8rem;font-weight:700;color:#6b8c87;letter-spacing:0.04em" class="block mb-2">제목</label>
          <input
            v-model="title"
            :maxlength="MAX_TITLE"
            placeholder="제목을 입력해주세요"
            style="width:100%;padding:12px 16px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.95rem;outline:none"
          />
          <p class="text-right mt-1" style="font-size:0.75rem;color:#9ca3af">{{ title.length }} / {{ MAX_TITLE }}</p>
        </div>

        <!-- 2. 코스 불러오기 -->
        <div class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
          <div class="flex items-center justify-between mb-3">
            <label style="font-size:0.8rem;font-weight:700;color:#6b8c87;letter-spacing:0.04em">코스 연결</label>
            <button
              @click="showCourseModal = true"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style="border:1.5px solid #3db89e;color:#3db89e;background:#fff"
            >
              <RefreshCw :size="13" />
              {{ selectedCourse ? '코스 변경' : '코스 불러오기' }}
            </button>
          </div>

          <!-- 미선택 상태 -->
          <div v-if="!selectedCourse" class="rounded-xl py-8 flex flex-col items-center gap-2" style="background:#f0faf8;border:1.5px dashed rgba(178,228,220,0.6)">
            <MapPin :size="24" color="#B2E4DC" />
            <p style="font-size:0.85rem;color:#9ca3af">코스를 선택해 후기에 연결하세요</p>
          </div>

          <!-- 선택된 코스 미리보기 -->
          <div v-else class="rounded-xl p-4" style="background:#f0faf8;border:1.5px solid rgba(178,228,220,0.5)">
            <div class="flex items-center gap-3 mb-3">
              <div class="flex items-center gap-1.5">
                <MapPin :size="13" color="#3db89e" />
                <span style="font-size:0.82rem;font-weight:600;color:#3db89e">{{ selectedCourse.station }}</span>
              </div>
              <span style="color:#B2E4DC;font-size:0.78rem">·</span>
              <div class="flex items-center gap-1.5">
                <Clock :size="13" color="#6b8c87" />
                <span style="font-size:0.82rem;color:#6b8c87">{{ selectedCourse.duration }}</span>
              </div>
              <span style="color:#B2E4DC;font-size:0.78rem">·</span>
              <span style="font-size:0.78rem;color:#9ca3af">{{ selectedCourse.date }}</span>
            </div>
            <!-- 스텝 목록 -->
            <div class="flex flex-col gap-0">
              <div v-for="(place, i) in selectedCourse.places" :key="i">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 flex items-center gap-2">
                    <span style="font-weight:600;font-size:0.88rem;color:#1a2e2b">{{ place.name }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full font-semibold" :style="categoryColor[place.category] || 'background:#f3f4f6;color:#374151'">{{ place.category }}</span>
                  </div>
                </div>
                <!-- 이동 수단 -->
                <div v-if="i < selectedCourse.places.length - 1" class="flex items-center gap-2 ml-3 my-1" style="padding-left:9px;border-left:1.5px dashed rgba(178,228,220,0.6)">
                  <component :is="place.transport === '도보' ? Footprints : Car" :size="12" color="#9ca3af" />
                  <span style="font-size:0.75rem;color:#9ca3af">{{ place.transport }} · {{ place.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 후기 텍스트 -->
        <div class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
          <label style="font-size:0.8rem;font-weight:700;color:#6b8c87;letter-spacing:0.04em" class="block mb-2">후기</label>
          <textarea
            v-model="reviewText"
            :maxlength="MAX_REVIEW"
            placeholder="이 코스 어떠셨나요? 다른 환승객들에게 후기를 남겨주세요 :)"
            rows="5"
            style="width:100%;padding:12px 16px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.92rem;outline:none;resize:vertical;line-height:1.65"
          />
          <div class="flex justify-between mt-1">
            <span style="font-size:0.75rem;color:#9ca3af">최소 {{ MIN_REVIEW }}자</span>
            <span style="font-size:0.75rem;color:#9ca3af">{{ reviewText.length }} / {{ MAX_REVIEW }}</span>
          </div>
        </div>

        <!-- 4. 사진 첨부 -->
        <div class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
          <div class="flex items-center justify-between mb-3">
            <label style="font-size:0.8rem;font-weight:700;color:#6b8c87;letter-spacing:0.04em">사진 첨부</label>
            <span style="font-size:0.75rem;color:#9ca3af">{{ images.length }} / 3</span>
          </div>
          <div class="flex gap-3 flex-wrap">
            <!-- 업로드된 이미지들 -->
            <div
              v-for="(img, i) in images"
              :key="i"
              class="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
              style="border:1.5px solid rgba(178,228,220,0.4)"
            >
              <img :src="img.url" class="w-full h-full object-cover" />
              <button
                @click="removeImage(i)"
                class="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style="background:rgba(26,46,43,0.6)"
              >
                <X :size="11" color="#fff" />
              </button>
            </div>

            <!-- 추가 버튼 -->
            <button
              v-if="images.length < 3"
              @click="fileInput?.click()"
              class="w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1.5 flex-shrink-0 transition-colors hover:border-[#3db89e]"
              style="border:1.5px dashed rgba(178,228,220,0.6);background:#f0faf8"
            >
              <ImageIcon :size="22" color="#B2E4DC" />
              <span style="font-size:0.72rem;color:#9ca3af;font-weight:600">사진 추가</span>
            </button>

            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onImageChange" />
          </div>
        </div>

        <!-- 5. 하단 버튼 -->
        <div class="flex gap-3">
          <button
            @click="tryCancel"
            class="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-70"
            style="border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#6b8c87"
          >
            취소
          </button>
          <button
            @click="submit"
            :disabled="!canSubmit || submitting"
            class="flex-[2] py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
            :style="`background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;box-shadow:0 4px 14px rgba(61,184,158,0.3);opacity:${canSubmit && !submitting ? 1 : 0.5};cursor:${canSubmit && !submitting ? 'pointer' : 'default'}`"
          >
            <Loader v-if="submitting" :size="16" class="animate-spin" />
            {{ submitting ? '등록 중...' : '등록' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 코스 선택 모달 -->
    <Teleport to="body">
      <div
        v-if="showCourseModal"
        class="fixed inset-0 flex items-end sm:items-center justify-center z-50 px-4 pb-0 sm:pb-4"
        style="background:rgba(0,0,0,0.45)"
        @click.self="showCourseModal = false"
      >
        <div
          class="w-full rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style="max-width:520px;background:#fff;max-height:80vh;display:flex;flex-direction:column"
        >
          <!-- 모달 헤더 -->
          <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid rgba(178,228,220,0.35)">
            <span style="font-weight:700;font-size:1rem;color:#1a2e2b">내 코스 목록</span>
            <button @click="showCourseModal = false" class="w-8 h-8 rounded-full flex items-center justify-center" style="background:#f0faf8">
              <X :size="16" color="#6b8c87" />
            </button>
          </div>

          <!-- 코스 목록 -->
          <div class="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
            <button
              v-for="course in mockCourses"
              :key="course.id"
              @click="selectCourse(course)"
              class="w-full text-left rounded-2xl p-4 transition-all hover:border-[#3db89e]"
              style="border:1.5px solid rgba(178,228,220,0.4);background:#f0faf8"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="flex items-center gap-1.5">
                  <MapPin :size="13" color="#3db89e" />
                  <span style="font-size:0.82rem;font-weight:600;color:#3db89e">{{ course.station }}</span>
                </div>
                <span style="color:#B2E4DC;font-size:0.78rem">·</span>
                <div class="flex items-center gap-1.5">
                  <Clock :size="13" color="#6b8c87" />
                  <span style="font-size:0.82rem;color:#6b8c87">{{ course.duration }}</span>
                </div>
                <span style="color:#B2E4DC;font-size:0.78rem">·</span>
                <span style="font-size:0.78rem;color:#9ca3af">{{ course.date }}</span>
                <ChevronRight :size="14" color="#9ca3af" class="ml-auto flex-shrink-0" />
              </div>
              <div class="flex items-center gap-1 flex-wrap">
                <template v-for="(place, i) in course.places" :key="i">
                  <span style="font-size:0.82rem;font-weight:600;color:#1a2e2b">{{ place.name }}</span>
                  <span v-if="i < course.places.length - 1" style="font-size:0.78rem;color:#B2E4DC">→</span>
                </template>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 취소 확인 다이얼로그 -->
    <Teleport to="body">
      <div
        v-if="showCancelDialog"
        class="fixed inset-0 flex items-center justify-center z-50 px-4"
        style="background:rgba(0,0,0,0.45)"
        @click.self="showCancelDialog = false"
      >
        <div class="rounded-2xl p-6 flex flex-col gap-4 w-full" style="max-width:340px;background:#fff;box-shadow:0 24px 80px rgba(26,46,43,0.15)">
          <p style="font-weight:700;font-size:1rem;color:#1a2e2b">작성을 취소할까요?</p>
          <p style="font-size:0.88rem;color:#6b8c87;line-height:1.6">작성 중인 내용이 모두 사라집니다.</p>
          <div class="flex gap-3">
            <button @click="showCancelDialog = false" class="flex-1 py-3 rounded-xl font-semibold text-sm" style="border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#6b8c87">계속 작성</button>
            <button @click="confirmCancel" class="flex-1 py-3 rounded-xl font-bold text-sm" style="background:#e07070;color:#fff">취소하기</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
