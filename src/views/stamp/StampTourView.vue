<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, MapPin, CheckCircle, Loader2, Camera, X } from 'lucide-vue-next'

type Step = 'timeline' | 'verifying' | 'guide' | 'camera' | 'result'

interface TourPlace {
  id: number
  name: string
  description: string
  lat: number
  lng: number
  guideText: string
  guideEmoji: string
  visited: boolean
}

const router = useRouter()

const places = ref<TourPlace[]>([
  {
    id: 1,
    name: '성심당',
    description: '대전의 명물 빵집, 튀김소보로가 유명해요!',
    lat: 36.3276,
    lng: 127.4272,
    guideText: '성심당 간판 앞에서 정면으로 찍어보세요!',
    guideEmoji: '🍞',
    visited: false,
  },
  {
    id: 2,
    name: '대전 엑스포 과학공원',
    description: '1993 대전 엑스포의 상징, 한빛탑이 있어요.',
    lat: 36.3724,
    lng: 127.3874,
    guideText: '한빛탑을 배경으로 양팔을 벌려 찍어보세요!',
    guideEmoji: '🗼',
    visited: false,
  },
  {
    id: 3,
    name: '유성온천',
    description: '천연 온천수로 유명한 대전의 힐링 스팟.',
    lat: 36.3619,
    lng: 127.3444,
    guideText: '온천 표지판 옆에서 엄지를 올려 찍어보세요!',
    guideEmoji: '♨️',
    visited: false,
  },
  {
    id: 4,
    name: '계족산 황톳길',
    description: '맨발로 걷는 힐링의 명소!',
    lat: 36.4213,
    lng: 127.4872,
    guideText: '황톳길 입구 표지판 앞에서 찍어보세요!',
    guideEmoji: '🌿',
    visited: false,
  },
])

const currentStep = ref<Step>('timeline')
const currentPlaceIdx = ref<number | null>(null)
const errorMsg = ref('')
const guideCountdown = ref(2)
const resultImageUrl = ref('')
const stampAnimIdx = ref<number | null>(null)

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let stream: MediaStream | null = null
let guideTimer: ReturnType<typeof setInterval> | null = null

// ── Haversine ──────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const r = (d: number) => (d * Math.PI) / 180
  const dLat = r(lat2 - lat1)
  const dLng = r(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Step 1 → 2: 위치 인증 ──────────────────────────────────
function startVerify(idx: number) {
  currentPlaceIdx.value = idx
  errorMsg.value = ''
  currentStep.value = 'verifying'

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const place = places.value[idx]
      const dist = haversine(coords.latitude, coords.longitude, place.lat, place.lng)
      if (dist <= 100) {
        showGuide()
      } else {
        errorMsg.value = `거리가 너무 멉니다. (현재 약 ${Math.round(dist)}m 떨어져 있어요)`
        currentStep.value = 'timeline'
      }
    },
    () => {
      errorMsg.value = '위치를 가져올 수 없어요. 위치 권한을 확인해주세요.'
      currentStep.value = 'timeline'
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

// 개발용: 위치 검사 생략하고 바로 진행
function devVerify(idx: number) {
  currentPlaceIdx.value = idx
  errorMsg.value = ''
  showGuide()
}

// ── Step 2 → 3: 가이드 모달 (2초) ─────────────────────────
function showGuide() {
  guideCountdown.value = 2
  currentStep.value = 'guide'
  guideTimer = setInterval(() => {
    guideCountdown.value--
    if (guideCountdown.value <= 0) {
      clearInterval(guideTimer!)
      openCamera()
    }
  }, 1000)
}

// ── Step 3: 카메라 ─────────────────────────────────────────
async function openCamera() {
  currentStep.value = 'camera'
  await nextTick()
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      videoRef.value.play()
    }
  } catch {
    errorMsg.value = '카메라를 열 수 없어요. 카메라 권한을 확인해주세요.'
    currentStep.value = 'timeline'
  }
}

// ── Step 4: Canvas 합성 ────────────────────────────────────
function capturePhoto() {
  if (!videoRef.value || !canvasRef.value || currentPlaceIdx.value === null) return
  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')!
  const place = places.value[currentPlaceIdx.value]

  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 480

  // 비디오 프레임
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  // 꿈돌이 합성 (우측 하단)
  const size = Math.round(canvas.width * 0.14)
  const px = canvas.width - size * 0.3
  const py = canvas.height - size * 0.3

  // 반투명 원형 배경
  ctx.save()
  ctx.globalAlpha = 0.75
  ctx.beginPath()
  ctx.arc(px - size * 0.5, py - size * 0.5, size * 0.65, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fill()
  ctx.restore()

  // 꿈돌이 이모지
  ctx.font = `${size}px serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText('🌟', px, py)

  // 인증 텍스트 (상단 띠)
  const bandH = Math.round(canvas.height * 0.07)
  ctx.save()
  ctx.globalAlpha = 0.82
  ctx.fillStyle = '#3db89e'
  ctx.fillRect(0, 0, canvas.width, bandH)
  ctx.restore()
  ctx.font = `bold ${Math.round(bandH * 0.55)}px sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`✓ ${place.name} 꿈돌이 인증`, canvas.width / 2, bandH / 2)

  resultImageUrl.value = canvas.toDataURL('image/jpeg', 0.92)
  stopCamera()
  currentStep.value = 'result'
}

function stopCamera() {
  stream?.getTracks().forEach((t) => t.stop())
  stream = null
}

// ── Step 5: 완료 → 타임라인 ───────────────────────────────
function confirmResult() {
  if (currentPlaceIdx.value === null) return
  const idx = currentPlaceIdx.value
  stampAnimIdx.value = idx
  currentStep.value = 'timeline'
  currentPlaceIdx.value = null

  setTimeout(() => {
    places.value[idx].visited = true
    setTimeout(() => (stampAnimIdx.value = null), 800)
  }, 100)
}

function goBack() {
  stopCamera()
  if (guideTimer) clearInterval(guideTimer)
  if (currentStep.value === 'timeline') router.back()
  else currentStep.value = 'timeline'
}

const nextPlaceIdx = computed(() => places.value.findIndex((p) => !p.visited))
const completedCount = computed(() => places.value.filter((p) => p.visited).length)
const currentGuidePlace = computed(() =>
  currentPlaceIdx.value !== null ? places.value[currentPlaceIdx.value] : null,
)

onUnmounted(() => {
  stopCamera()
  if (guideTimer) clearInterval(guideTimer)
})
</script>

<template>
  <div style="background: linear-gradient(155deg, #E8F8F5 0%, #ffffff 50%, #f0faf8 100%); min-height: calc(100vh - 64px)">

    <!-- ── 타임라인 ──────────────────────────────────────── -->
    <div v-if="currentStep === 'timeline'" class="max-w-lg mx-auto px-4 py-6">

      <!-- 헤더 -->
      <button @click="goBack" class="flex items-center gap-2 mb-5 transition-opacity hover:opacity-70" style="color:#6b8c87;font-size:0.88rem;font-weight:600">
        <ArrowLeft :size="17" />
        뒤로
      </button>

      <div class="flex items-center gap-3 mb-1">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
          <span style="font-size:0.85rem">📮</span>
        </div>
        <h1 style="font-weight:800;font-size:1.2rem;color:#1a2e2b">꿈돌이 스탬프 투어</h1>
      </div>
      <p style="font-size:0.82rem;color:#6b8c87;margin-bottom:20px">장소에 도착해서 인증하면 꿈돌이 스탬프를 받아요!</p>

      <!-- 진행률 -->
      <div class="rounded-2xl p-4 mb-6 flex items-center gap-4" style="background:#fff;border:1.5px solid rgba(178,228,220,0.4);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
        <div class="text-3xl">🌟</div>
        <div class="flex-1">
          <div class="flex justify-between mb-1.5">
            <span style="font-weight:700;font-size:0.9rem;color:#1a2e2b">진행 현황</span>
            <span style="font-weight:800;font-size:0.9rem;color:#3db89e">{{ completedCount }} / {{ places.length }}</span>
          </div>
          <div class="w-full h-2.5 rounded-full overflow-hidden" style="background:rgba(178,228,220,0.3)">
            <div
              class="h-full rounded-full transition-all duration-700"
              :style="`width:${(completedCount / places.length) * 100}%;background:linear-gradient(90deg,#B2E4DC,#3db89e)`"
            />
          </div>
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMsg" class="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style="background:#fff0f0;color:#c0392b;border:1px solid #fecaca">
        {{ errorMsg }}
      </div>

      <!-- 타임라인 -->
      <div class="relative">
        <!-- 세로선 -->
        <div class="absolute left-6 top-8 bottom-8 w-0.5" style="background:linear-gradient(to bottom,#B2E4DC,rgba(178,228,220,0.2))" />

        <div v-for="(place, idx) in places" :key="place.id" class="relative flex gap-4 mb-4">
          <!-- 노드 -->
          <div class="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center">
            <!-- 스탬프 획득 애니메이션 -->
            <transition name="stamp-pop">
              <div
                v-if="place.visited"
                class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                :class="stampAnimIdx === idx ? 'stamp-entering' : ''"
                style="background:linear-gradient(135deg,#B2E4DC,#3db89e);box-shadow:0 2px 10px rgba(61,184,158,0.35)"
              >
                🌟
              </div>
              <div
                v-else
                class="w-12 h-12 rounded-full flex items-center justify-center"
                :style="idx === nextPlaceIdx
                  ? 'background:#fff;border:2.5px solid #3db89e;box-shadow:0 0 0 4px rgba(61,184,158,0.15)'
                  : 'background:#f3f4f6;border:2.5px dashed #d1d5db'"
              >
                <span v-if="idx === nextPlaceIdx" style="font-size:1.1rem">📍</span>
                <span v-else style="font-size:1rem;opacity:0.4">○</span>
              </div>
            </transition>
          </div>

          <!-- 장소 카드 -->
          <div
            class="flex-1 rounded-2xl p-4 mb-0"
            :style="place.visited
              ? 'background:#fff;border:1.5px solid rgba(178,228,220,0.5);opacity:0.75'
              : idx === nextPlaceIdx
                ? 'background:#fff;border:1.5px solid rgba(61,184,158,0.5);box-shadow:0 4px 16px rgba(61,184,158,0.12)'
                : 'background:#fafafa;border:1.5px solid rgba(220,220,220,0.5)'"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <span style="font-size:1rem">{{ place.guideEmoji }}</span>
                  <p :style="`font-weight:700;font-size:0.92rem;${place.visited ? 'color:#9ca3af' : 'color:#1a2e2b'}`">{{ place.name }}</p>
                  <span v-if="place.visited" class="text-xs font-bold px-1.5 py-0.5 rounded-full" style="background:#d1fae5;color:#065f46">완료</span>
                </div>
                <p style="font-size:0.78rem;color:#9ca3af;line-height:1.5">{{ place.description }}</p>
              </div>
              <CheckCircle v-if="place.visited" :size="18" style="color:#3db89e;flex-shrink:0;margin-top:2px" />
            </div>

            <!-- 인증 버튼 (현재 장소만) -->
            <div v-if="idx === nextPlaceIdx && !place.visited" class="flex gap-2 mt-3">
              <button
                @click="startVerify(idx)"
                class="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                style="background:linear-gradient(135deg,#3db89e,#2da08a)"
              >
                <MapPin :size="14" class="inline mr-1 -mt-0.5" />
                도착 인증하기
              </button>
              <button
                @click="devVerify(idx)"
                class="px-3 py-2.5 rounded-xl font-bold text-xs transition-all hover:opacity-90"
                style="background:#f0faf8;color:#3db89e;border:1px solid rgba(61,184,158,0.3)"
                title="개발용: 위치 검사 생략"
              >
                DEV
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 완료 메시지 -->
      <div v-if="completedCount === places.length" class="mt-6 p-6 rounded-2xl text-center" style="background:linear-gradient(135deg,#E8F8F5,#f0faf8);border:1.5px solid rgba(178,228,220,0.4)">
        <div class="text-4xl mb-2">🎉</div>
        <p style="font-weight:800;font-size:1.05rem;color:#1a2e2b;margin-bottom:4px">투어 완료!</p>
        <p style="font-size:0.82rem;color:#6b8c87">모든 장소를 인증했어요. 꿈돌이 캐릭터를 확인해보세요!</p>
        <button @click="router.push('/mypage/characters')" class="mt-4 px-6 py-2.5 rounded-xl font-bold text-sm text-white" style="background:linear-gradient(135deg,#3db89e,#2da08a)">
          꿈돌이 컬렉션 보기
        </button>
      </div>
    </div>

    <!-- ── 위치 인증 중 ────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="currentStep === 'verifying'" class="fixed inset-0 z-50 flex items-center justify-center px-6" style="background:rgba(0,0,0,0.5)">
        <div class="rounded-3xl p-8 text-center w-full max-w-xs" style="background:#fff">
          <Loader2 :size="40" class="animate-spin mx-auto mb-4" style="color:#3db89e" />
          <p style="font-weight:700;font-size:1rem;color:#1a2e2b;margin-bottom:6px">위치 확인 중...</p>
          <p style="font-size:0.82rem;color:#9ca3af">현재 위치를 가져오고 있어요.</p>
        </div>
      </div>
    </Teleport>

    <!-- ── 촬영 가이드 모달 (2초) ─────────────────────────── -->
    <Teleport to="body">
      <div v-if="currentStep === 'guide'" class="fixed inset-0 z-50 flex items-center justify-center px-6" style="background:rgba(0,0,0,0.6)">
        <div class="rounded-3xl overflow-hidden w-full max-w-sm" style="background:#fff;box-shadow:0 24px 80px rgba(26,46,43,0.2)">
          <div class="py-8 flex flex-col items-center" style="background:linear-gradient(135deg,#E8F8F5,#f0faf8)">
            <div class="text-6xl mb-3 animate-bounce">{{ currentGuidePlace?.guideEmoji }}</div>
            <span class="text-xs font-bold px-3 py-1 rounded-full" style="background:rgba(61,184,158,0.15);color:#3db89e">촬영 가이드</span>
          </div>
          <div class="p-6 text-center">
            <h3 style="font-weight:800;font-size:1.05rem;color:#1a2e2b;margin-bottom:8px">{{ currentGuidePlace?.name }}</h3>
            <p style="font-size:0.9rem;color:#6b8c87;line-height:1.65;margin-bottom:20px">{{ currentGuidePlace?.guideText }}</p>
            <div class="flex items-center justify-center gap-2">
              <div class="w-2 h-2 rounded-full" :style="guideCountdown >= 2 ? 'background:#3db89e' : 'background:#e5e7eb'" />
              <div class="w-2 h-2 rounded-full" :style="guideCountdown >= 1 ? 'background:#3db89e' : 'background:#e5e7eb'" />
            </div>
            <p style="font-size:0.78rem;color:#9ca3af;margin-top:8px">{{ guideCountdown }}초 후 카메라가 열려요</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── 카메라 뷰 ───────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="currentStep === 'camera'" class="fixed inset-0 z-50 flex flex-col" style="background:#000">
        <!-- 닫기 -->
        <button @click="goBack" class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center" style="background:rgba(0,0,0,0.5)">
          <X :size="20" color="#fff" />
        </button>

        <!-- 카메라 피드 -->
        <div class="relative flex-1 flex items-center justify-center overflow-hidden">
          <video
            ref="videoRef"
            autoplay
            playsinline
            muted
            class="w-full h-full object-cover"
          />

          <!-- 포즈 가이드라인 오버레이 -->
          <div class="absolute inset-0 pointer-events-none">
            <!-- 코너 가이드 -->
            <div class="absolute top-8 left-8 w-10 h-10 border-t-4 border-l-4 rounded-tl-xl" style="border-color:rgba(255,255,255,0.7)" />
            <div class="absolute top-8 right-8 w-10 h-10 border-t-4 border-r-4 rounded-tr-xl" style="border-color:rgba(255,255,255,0.7)" />
            <div class="absolute bottom-24 left-8 w-10 h-10 border-b-4 border-l-4 rounded-bl-xl" style="border-color:rgba(255,255,255,0.7)" />
            <div class="absolute bottom-24 right-8 w-10 h-10 border-b-4 border-r-4 rounded-br-xl" style="border-color:rgba(255,255,255,0.7)" />

            <!-- 중앙 십자선 -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-6 h-0.5 bg-white opacity-40" />
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-0.5 h-6 bg-white opacity-40" />
            </div>

            <!-- 꿈돌이 미리보기 위치 표시 (우측 하단) -->
            <div class="absolute bottom-28 right-5 text-3xl opacity-50">🌟</div>
          </div>

          <!-- 안내 텍스트 -->
          <div class="absolute top-4 left-0 right-0 text-center pointer-events-none">
            <span class="text-xs font-bold px-3 py-1.5 rounded-full" style="background:rgba(61,184,158,0.85);color:#fff">
              {{ currentGuidePlace?.guideText }}
            </span>
          </div>
        </div>

        <!-- 촬영 버튼 -->
        <div class="flex items-center justify-center pb-10 pt-4" style="background:#000">
          <button
            @click="capturePhoto"
            class="w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style="background:linear-gradient(135deg,#B2E4DC,#3db89e);box-shadow:0 0 0 4px rgba(178,228,220,0.4)"
          >
            <Camera :size="30" color="#fff" />
          </button>
        </div>

        <!-- 숨김 캔버스 -->
        <canvas ref="canvasRef" class="hidden" />
      </div>
    </Teleport>

    <!-- ── 결과 (합성 완료) ───────────────────────────────── -->
    <Teleport to="body">
      <div v-if="currentStep === 'result'" class="fixed inset-0 z-50 flex flex-col" style="background:#000">
        <div class="flex-1 relative overflow-hidden">
          <img :src="resultImageUrl" alt="인증 사진" class="w-full h-full object-contain" />

          <!-- 인증 완료 배지 -->
          <div class="absolute top-6 left-0 right-0 flex justify-center">
            <div class="flex items-center gap-2 px-5 py-2.5 rounded-full" style="background:rgba(61,184,158,0.92);backdrop-filter:blur(8px)">
              <span class="text-lg">🌟</span>
              <span class="font-bold text-sm text-white">인증 완료!</span>
            </div>
          </div>
        </div>

        <!-- 확인 버튼 -->
        <div class="px-6 py-8" style="background:#1a2e2b">
          <p class="text-center text-sm mb-4" style="color:#B2E4DC">
            꿈돌이와 함께한 <strong style="color:#fff">{{ currentGuidePlace?.name }}</strong> 인증 사진이에요!
          </p>
          <button
            @click="confirmResult"
            class="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
            style="background:linear-gradient(135deg,#3db89e,#2da08a)"
          >
            스탬프 받기 🎉
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes stamp-pop {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
  80%  { transform: scale(0.92) rotate(-2deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.stamp-entering {
  animation: stamp-pop 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.stamp-pop-enter-active {
  animation: stamp-pop 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
