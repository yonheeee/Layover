<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, MapPin, CheckCircle, Loader2, Camera, X, Route } from 'lucide-vue-next'
import { useCourseStore } from '@/stores/course'
import { useStampStore } from '@/stores/stamp'
import { fetchDiPlaces } from '@/api/courses'

const courseStore = useCourseStore()
const stampStore = useStampStore()

type Step = 'timeline' | 'verifying' | 'guide' | 'camera' | 'result'

interface TourPlace {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  guideText: string
  guideEmoji: string
  visited: boolean
}

const router = useRouter()

const places = ref<TourPlace[]>([])

function emojiFor(category: string) {
  switch (category) {
    case 'FOOD':    return '🍽️'
    case 'CAFE':    return '☕'
    case 'NATURE':  return '🌿'
    case 'CULTURE': return '🏛️'
    default:        return '📍'
  }
}
function guideTextFor(category: string) {
  switch (category) {
    case 'FOOD':    return '식당 간판 앞에서 정면으로 찍어보세요!'
    case 'CAFE':    return '카페 입구 앞에서 찍어보세요!'
    case 'NATURE':  return '자연 경관을 배경으로 찍어보세요!'
    case 'CULTURE': return '문화시설 앞에서 찍어보세요!'
    default:        return '장소 앞에서 찍어보세요!'
  }
}

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

// ── 카카오 지도 ───────────────────────────────────────────
let mapObject: any = null
let overlays: any[] = []
let polylineObject: any = null

function initKakaoMap() {
  const container = document.getElementById('stamp-tour-map')
  if (!container) return
  const kakao = (window as any).kakao
  if (!kakao?.maps) return

  const center = new kakao.maps.LatLng(36.3619, 127.4100)
  mapObject = new kakao.maps.Map(container, { center, level: 8 })
  renderStampMap()
}

function renderStampMap() {
  if (!mapObject) return
  const kakao = (window as any).kakao

  // 기존 오버레이 제거
  overlays.forEach((o) => o.setMap(null))
  overlays = []
  if (polylineObject) polylineObject.setMap(null)

  const linePath: any[] = []
  const bounds = new kakao.maps.LatLngBounds()

  places.value.forEach((place, idx) => {
    const pos = new kakao.maps.LatLng(place.lat, place.lng)
    linePath.push(pos)
    bounds.extend(pos)

    const isNext = idx === nextPlaceIdx.value && !place.visited
    const num = idx + 1
    const content = place.visited
      ? `<div style="
          width:36px;height:36px;border-radius:50%;
          background:linear-gradient(135deg,#3db89e,#2da08a);
          border:3px solid #fff;
          box-shadow:0 3px 12px rgba(61,184,158,0.45);
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:13px;font-weight:800;font-family:sans-serif;
        ">${num}</div>`
      : isNext
        ? `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <div style="
              width:36px;height:36px;border-radius:50%;
              background:#fff;
              border:3px solid #3db89e;
              box-shadow:0 0 0 5px rgba(61,184,158,0.2),0 3px 10px rgba(0,0,0,0.1);
              display:flex;align-items:center;justify-content:center;
              color:#3db89e;font-size:13px;font-weight:800;font-family:sans-serif;
            ">${num}</div>
            <div style="
              background:#3db89e;color:#fff;
              font-size:9px;font-weight:700;font-family:sans-serif;
              padding:2px 7px;border-radius:8px;white-space:nowrap;
            ">다음 목적지</div>
          </div>`
        : `<div style="
            width:32px;height:32px;border-radius:50%;
            background:#fff;
            border:2.5px solid #d1d5db;
            display:flex;align-items:center;justify-content:center;
            color:#9ca3af;font-size:12px;font-weight:700;font-family:sans-serif;
            opacity:0.75;
          ">${num}</div>`

    const overlay = new kakao.maps.CustomOverlay({
      position: pos,
      content,
      yAnchor: isNext ? 1 : 0.5,
    })
    overlay.setMap(mapObject)
    overlays.push(overlay)
  })

  // 루트 폴리라인
  polylineObject = new kakao.maps.Polyline({
    path: linePath,
    strokeWeight: 3,
    strokeColor: '#3db89e',
    strokeOpacity: 0.8,
    strokeStyle: 'dot',
  })
  polylineObject.setMap(mapObject)

  if (places.value.length > 0) mapObject.setBounds(bounds)
}

onMounted(async () => {
  // 코스 확정된 경우 해당 코스 장소 사용, 아니면 API에서 가져옴
  const coursePlaces = courseStore.generatedCourses[0]?.places ?? []
  if (coursePlaces.length > 0) {
    places.value = coursePlaces
      .filter((p) => p.lat && p.lng)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.category,
        lat: p.lat!,
        lng: p.lng!,
        guideText: guideTextFor(p.category),
        guideEmoji: emojiFor(p.category),
        visited: false,
      }))
  } else {
    const diPlaces = await fetchDiPlaces()
    places.value = diPlaces.slice(0, 4).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.desc,
      lat: p.lat,
      lng: p.lng,
      guideText: guideTextFor(p.category),
      guideEmoji: emojiFor(p.category),
      visited: false,
    }))
  }

  if (!document.getElementById('kakao-map-script')) {
    const script = document.createElement('script')
    script.id = 'kakao-map-script'
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_KEY}&autoload=false`
    document.head.appendChild(script)
    script.onload = () => {
      ;(window as any).kakao.maps.load(() => initKakaoMap())
    }
  } else {
    initKakaoMap()
  }
})

watch(
  () => places.value.map((p) => p.visited),
  () => nextTick(() => renderStampMap()),
  { deep: true },
)

// ── Haversine ─────────────────────────────────────────────
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

// ── Step 1 → 2: 위치 인증 ─────────────────────────────────
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

function devVerify(idx: number) {
  currentPlaceIdx.value = idx
  errorMsg.value = ''
  showGuide()
}

// ── Step 2 → 3: 가이드 모달 ──────────────────────────────
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

// ── Step 3: 카메라 ────────────────────────────────────────
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

// ── Step 4: Canvas 합성 ───────────────────────────────────
function capturePhoto() {
  if (!videoRef.value || !canvasRef.value || currentPlaceIdx.value === null) return
  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')!
  const place = places.value[currentPlaceIdx.value]

  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 480
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const size = Math.round(canvas.width * 0.14)
  const px = canvas.width - size * 0.3
  const py = canvas.height - size * 0.3
  ctx.save()
  ctx.globalAlpha = 0.75
  ctx.beginPath()
  ctx.arc(px - size * 0.5, py - size * 0.5, size * 0.65, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fill()
  ctx.restore()
  ctx.font = `${size}px serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText('🌟', px, py)

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

// ── Step 5: 완료 → 타임라인 ──────────────────────────────
function confirmResult() {
  if (currentPlaceIdx.value === null) return
  const idx = currentPlaceIdx.value
  const place = places.value[idx]

  stampStore.addPhoto({
    id: `${place.id}_${Date.now()}`,
    url: resultImageUrl.value,
    placeName: place.name,
    placeEmoji: place.guideEmoji,
    takenAt: new Date().toISOString(),
    lat: place.lat,
    lng: place.lng,
  })

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

// ── 게이미피케이션 데이터 ─────────────────────────────────
const levels = [
  { level: 1, name: '대전 입문자', emoji: '🌱', minStamps: 0 },
  { level: 2, name: '대전 나그네', emoji: '👟', minStamps: 1 },
  { level: 3, name: '대전 탐험가', emoji: '🗺️', minStamps: 2 },
  { level: 4, name: '대전 마스터', emoji: '🏆', minStamps: 3 },
  { level: 5, name: '꿈돌이 왕',   emoji: '👑', minStamps: 4 },
]

const nextCharacters = [
  { requiredStamps: 1,  name: '꿈돌이 베이직', emoji: '🌟' },
  { requiredStamps: 3,  name: '꿈돌이 탐험가', emoji: '🗺️' },
  { requiredStamps: 5,  name: '꿈돌이 미식가', emoji: '🍞' },
  { requiredStamps: 8,  name: '꿈돌이 문화인', emoji: '🎭' },
  { requiredStamps: 10, name: '꿈돌이 자연인', emoji: '🌿' },
  { requiredStamps: 20, name: '꿈돌이 대전왕', emoji: '👑' },
]

const currentLevel = computed(() => {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (completedCount.value >= levels[i].minStamps) return levels[i]
  }
  return levels[0]
})

const nextLevel = computed(() =>
  levels.find((l) => l.minStamps > completedCount.value) ?? null,
)

const xpProgress = computed(() => {
  if (!nextLevel.value) return 100
  const cur = currentLevel.value.minStamps
  const nxt = nextLevel.value.minStamps
  return Math.round(((completedCount.value - cur) / (nxt - cur)) * 100)
})

const nextCharacter = computed(() =>
  nextCharacters.find((c) => c.requiredStamps > completedCount.value) ?? null,
)

onUnmounted(() => {
  stopCamera()
  if (guideTimer) clearInterval(guideTimer)
  overlays.forEach((o) => o.setMap(null))
  if (polylineObject) polylineObject.setMap(null)
})
</script>

<template>
  <div style="background:#f0faf8;min-height:calc(100vh - 64px)">

    <!-- ── 코스 미확정 게이트 ──────────────────────────────── -->
    <div v-if="!courseStore.hasConfirmedCourse"
      class="flex flex-col items-center justify-center px-6 text-center"
      style="min-height:calc(100vh - 64px)">
      <div class="w-full max-w-sm">
        <div class="text-6xl mb-6">🗺️</div>
        <h2 style="font-weight:800;font-size:1.25rem;color:#1a2e2b;margin-bottom:10px;line-height:1.45">
          코스를 완성하고<br />스탬프를 채워보세요
        </h2>
        <p style="font-size:0.85rem;color:#9ca3af;line-height:1.7;margin-bottom:32px">
          대전 환승 코스를 확정하면<br />스탬프 투어를 시작할 수 있어요
        </p>
        <button @click="router.push('/map')"
          class="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 hover:opacity-90"
          style="background:linear-gradient(135deg,#3db89e,#2da08a);box-shadow:0 4px 16px rgba(61,184,158,0.3)">
          코스 추천 받으러 가기
        </button>
        <button @click="router.back()"
          class="w-full py-3 mt-2 rounded-2xl font-semibold text-sm transition-all hover:opacity-70"
          style="color:#9ca3af">
          돌아가기
        </button>
      </div>
    </div>

    <!-- ── 스탬프 투어 본편 (코스 확정 후) ───────────────── -->
    <template v-else>

    <!-- ── 타임라인 뷰 ─────────────────────────────────────── -->
    <div v-if="currentStep === 'timeline'" class="flex flex-col" style="min-height:calc(100vh - 64px)">

      <!-- ░░ 게이미피케이션 히어로 ░░ -->
      <div class="relative overflow-hidden px-5 pt-5 pb-6"
        style="background:linear-gradient(145deg,#1a2e2b 0%,#163028 60%,#0e2320 100%)">
        <div class="absolute pointer-events-none rounded-full"
          style="right:-40px;top:-40px;width:200px;height:200px;background:rgba(61,184,158,0.12)" />
        <div class="absolute pointer-events-none rounded-full"
          style="left:-20px;bottom:-30px;width:140px;height:140px;background:rgba(178,228,220,0.07)" />

        <button @click="goBack" class="flex items-center gap-1.5 mb-5 transition-opacity hover:opacity-70"
          style="color:rgba(178,228,220,0.7);font-size:0.82rem;font-weight:600">
          <ArrowLeft :size="15" /> 뒤로
        </button>

        <div class="flex items-center justify-between relative z-10">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2"
              style="background:rgba(61,184,158,0.2);border:1px solid rgba(61,184,158,0.35)">
              <span style="font-size:0.68rem;font-weight:800;color:#3db89e">LV.{{ currentLevel.level }}</span>
              <span style="font-size:0.68rem;color:rgba(178,228,220,0.5)">•</span>
              <span style="font-size:0.7rem;font-weight:700;color:#B2E4DC">{{ currentLevel.name }}</span>
            </div>
            <h1 style="font-weight:800;font-size:1.35rem;color:#fff;line-height:1.25;margin-bottom:4px">
              꿈돌이<br />스탬프 투어
            </h1>
            <p style="font-size:0.78rem;color:rgba(178,228,220,0.65)">장소 인증으로 꿈돌이를 모아보세요</p>
          </div>
          <div class="relative flex-shrink-0">
            <div class="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl"
              style="background:rgba(255,255,255,0.07);border:1.5px solid rgba(178,228,220,0.2);box-shadow:0 8px 24px rgba(0,0,0,0.3)">
              {{ currentLevel.emoji }}
            </div>
            <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style="background:linear-gradient(135deg,#B2E4DC,#3db89e);border:2px solid #1a2e2b">
              {{ completedCount }}
            </div>
          </div>
        </div>

        <!-- XP 바 -->
        <div class="mt-5 relative z-10">
          <div class="flex justify-between mb-1.5">
            <span style="font-size:0.72rem;font-weight:600;color:rgba(178,228,220,0.7)">
              {{ nextLevel ? `다음 레벨까지 (${nextLevel.name})` : '최고 레벨 달성! 🎉' }}
            </span>
            <span style="font-size:0.72rem;font-weight:700;color:#3db89e">{{ xpProgress }}%</span>
          </div>
          <div class="w-full h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.1)">
            <div class="h-full rounded-full transition-all duration-700"
              :style="`width:${xpProgress}%;background:linear-gradient(90deg,#3db89e,#B2E4DC)`" />
          </div>
        </div>

        <!-- 스탯 카드 -->
        <div class="grid grid-cols-3 gap-2 mt-4 relative z-10">
          <div class="rounded-2xl p-3 text-center"
            style="background:rgba(255,255,255,0.06);border:1px solid rgba(178,228,220,0.12)">
            <div class="text-xl mb-0.5">🌟</div>
            <div style="font-weight:800;font-size:1.1rem;color:#fff">{{ completedCount }}</div>
            <div style="font-size:0.65rem;color:rgba(178,228,220,0.6)">획득 스탬프</div>
          </div>
          <div class="rounded-2xl p-3 text-center"
            style="background:rgba(255,255,255,0.06);border:1px solid rgba(178,228,220,0.12)">
            <div class="text-xl mb-0.5">📍</div>
            <div style="font-weight:800;font-size:1.1rem;color:#fff">{{ completedCount }}/{{ places.length }}</div>
            <div style="font-size:0.65rem;color:rgba(178,228,220,0.6)">방문 장소</div>
          </div>
          <div class="rounded-2xl p-3 text-center"
            style="background:rgba(255,255,255,0.06);border:1px solid rgba(178,228,220,0.12)">
            <div class="text-xl mb-0.5">{{ nextCharacter?.emoji ?? '🎉' }}</div>
            <div style="font-weight:800;font-size:1.1rem;color:#fff">
              {{ nextCharacter ? nextCharacter.requiredStamps - completedCount : 0 }}
            </div>
            <div style="font-size:0.65rem;color:rgba(178,228,220,0.6)">다음 캐릭터</div>
          </div>
        </div>

        <!-- 다음 캐릭터 프리뷰 -->
        <div v-if="nextCharacter" class="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl relative z-10"
          style="background:rgba(61,184,158,0.12);border:1px solid rgba(61,184,158,0.25)">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style="background:rgba(255,255,255,0.08)">{{ nextCharacter.emoji }}</div>
          <div class="flex-1 min-w-0">
            <p style="font-size:0.72rem;color:rgba(178,228,220,0.65);margin-bottom:1px">다음 획득 캐릭터</p>
            <p style="font-size:0.82rem;font-weight:700;color:#fff">{{ nextCharacter.name }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p style="font-size:0.68rem;color:rgba(178,228,220,0.55)">스탬프</p>
            <p style="font-size:0.88rem;font-weight:800;color:#3db89e">
              {{ nextCharacter.requiredStamps - completedCount }}개 남음
            </p>
          </div>
        </div>
        <div v-else class="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-2xl relative z-10"
          style="background:rgba(61,184,158,0.15);border:1px solid rgba(61,184,158,0.3)">
          <span class="text-lg">🎊</span>
          <p style="font-size:0.82rem;font-weight:700;color:#B2E4DC">모든 꿈돌이를 획득했어요!</p>
        </div>
      </div>

      <!-- ░░ 지도 + 스탬프 오버레이 ░░ -->
      <div class="relative flex-1" style="min-height:320px;background:#e5e9f0">
        <div id="stamp-tour-map" style="width:100%;height:100%" />

        <!-- ── 스탬프 목록 패널 (지도 위 왼쪽) ── -->
        <div class="absolute top-3 left-3 z-10 flex flex-col overflow-y-auto"
          style="width:196px;max-height:calc(100% - 24px);
                 background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);
                 border-radius:18px;border:1px solid rgba(178,228,220,0.45);
                 box-shadow:0 4px 20px rgba(0,0,0,0.1);padding:12px 10px">

          <!-- 패널 헤더 -->
          <div class="flex items-center justify-between pb-2 mb-1"
            style="border-bottom:1px solid rgba(178,228,220,0.35)">
            <span style="font-size:0.75rem;font-weight:800;color:#1a2e2b">투어 코스</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold"
              style="background:linear-gradient(135deg,#3db89e,#2da08a);color:#fff">
              {{ completedCount }}/{{ places.length }}
            </span>
          </div>

          <!-- 에러 -->
          <div v-if="errorMsg" class="px-2 py-1.5 rounded-lg text-xs mb-2"
            style="background:#fff0f0;color:#c0392b;border:1px solid #fecaca">
            {{ errorMsg }}
          </div>

          <!-- 장소 목록 -->
          <div class="flex flex-col gap-1.5">
            <div v-for="(place, idx) in places" :key="place.id"
              class="flex items-center gap-2 px-2 py-2 rounded-xl transition-all"
              :style="place.visited
                ? 'opacity:0.55'
                : idx === nextPlaceIdx
                  ? 'background:rgba(61,184,158,0.08);border:1px solid rgba(61,184,158,0.25)'
                  : 'border:1px solid transparent'">

              <!-- 스탬프 아이콘 -->
              <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                :class="stampAnimIdx === idx ? 'stamp-entering' : ''"
                :style="place.visited
                  ? 'background:linear-gradient(135deg,#B2E4DC,#3db89e);box-shadow:0 2px 6px rgba(61,184,158,0.3)'
                  : idx === nextPlaceIdx
                    ? 'background:#fff;border:2px solid #3db89e;box-shadow:0 0 0 3px rgba(61,184,158,0.12)'
                    : 'background:#f3f4f6;border:2px dashed #d1d5db'">
                <transition name="stamp-pop">
                  <span v-if="place.visited" style="font-size:0.9rem">🌟</span>
                  <span v-else-if="idx === nextPlaceIdx" style="font-size:0.85rem">📍</span>
                  <span v-else style="font-size:0.7rem;opacity:0.35">○</span>
                </transition>
              </div>

              <!-- 장소 정보 -->
              <div class="flex-1 min-w-0">
                <p class="truncate" style="font-size:0.78rem;font-weight:700;color:#1a2e2b;line-height:1.3">
                  {{ place.guideEmoji }} {{ place.name }}
                </p>
                <p v-if="idx === nextPlaceIdx && !place.visited"
                  style="font-size:0.65rem;color:#3db89e;font-weight:600">다음 목적지</p>
                <span v-else-if="place.visited"
                  style="font-size:0.62rem;font-weight:700;color:#065f46;background:#d1fae5;padding:1px 5px;border-radius:6px">완료</span>
              </div>
            </div>
          </div>

          <!-- 인증 버튼 -->
          <div v-if="nextPlaceIdx !== -1" class="mt-3 pt-2"
            style="border-top:1px solid rgba(178,228,220,0.3)">
            <button @click="startVerify(nextPlaceIdx)"
              class="w-full py-2 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90 active:scale-95"
              style="background:linear-gradient(135deg,#3db89e,#2da08a)">
              <MapPin :size="11" class="inline mr-0.5 -mt-0.5" />
              인증하기
            </button>
          </div>

          <!-- 투어 완료 -->
          <div v-if="completedCount === places.length" class="mt-2 p-3 rounded-xl text-center"
            style="background:linear-gradient(135deg,#E8F8F5,#f0faf8);border:1px solid rgba(178,228,220,0.4)">
            <div class="text-2xl mb-1">🎉</div>
            <p style="font-weight:800;font-size:0.8rem;color:#1a2e2b;margin-bottom:2px">투어 완료!</p>
            <p style="font-size:0.68rem;color:#6b8c87;line-height:1.5;margin-bottom:6px">모든 장소를 인증했어요!</p>
            <button @click="router.push('/mypage/characters')"
              class="w-full py-1.5 rounded-lg font-bold text-xs text-white"
              style="background:linear-gradient(135deg,#3db89e,#2da08a)">
              꿈돌이 컬렉션 보기
            </button>
          </div>
        </div>

        <!-- 진행률 뱃지 (오른쪽 위) -->
        <div class="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl flex items-center gap-1"
          style="background:linear-gradient(135deg,#3db89e,#2da08a);box-shadow:0 2px 8px rgba(61,184,158,0.35)">
          <span style="font-size:0.72rem;font-weight:800;color:#fff">{{ completedCount }}/{{ places.length }} 완료</span>
        </div>

        <!-- 범례 (왼쪽 아래) -->
        <div class="absolute bottom-3 right-3 z-10 flex items-center gap-3 px-3 py-1.5 rounded-xl"
          style="background:rgba(255,255,255,0.88);backdrop-filter:blur(6px);border:1px solid rgba(178,228,220,0.4)">
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 rounded-full flex items-center justify-center text-xs"
              style="background:linear-gradient(135deg,#B2E4DC,#3db89e)">🌟</div>
            <span style="font-size:0.65rem;color:#6b8c87;font-weight:600">완료</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 rounded-full" style="background:#fff;border:2px solid #3db89e" />
            <span style="font-size:0.65rem;color:#6b8c87;font-weight:600">다음</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 rounded-full" style="background:#f3f4f6;border:2px dashed #d1d5db" />
            <span style="font-size:0.65rem;color:#9ca3af;font-weight:600">미방문</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 위치 인증 중 ──────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="currentStep === 'verifying'" class="fixed inset-0 z-50 flex items-center justify-center px-6"
        style="background:rgba(0,0,0,0.5)">
        <div class="rounded-3xl p-8 text-center w-full max-w-xs" style="background:#fff">
          <Loader2 :size="40" class="animate-spin mx-auto mb-4" style="color:#3db89e" />
          <p style="font-weight:700;font-size:1rem;color:#1a2e2b;margin-bottom:6px">위치 확인 중...</p>
          <p style="font-size:0.82rem;color:#9ca3af">현재 위치를 가져오고 있어요.</p>
        </div>
      </div>
    </Teleport>

    <!-- ── 촬영 가이드 모달 ─────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="currentStep === 'guide'" class="fixed inset-0 z-50 flex items-center justify-center px-6"
        style="background:rgba(0,0,0,0.6)">
        <div class="rounded-3xl overflow-hidden w-full max-w-sm" style="background:#fff;box-shadow:0 24px 80px rgba(26,46,43,0.2)">
          <div class="py-8 flex flex-col items-center" style="background:linear-gradient(135deg,#E8F8F5,#f0faf8)">
            <div class="text-6xl mb-3 animate-bounce">{{ currentGuidePlace?.guideEmoji }}</div>
            <span class="text-xs font-bold px-3 py-1 rounded-full"
              style="background:rgba(61,184,158,0.15);color:#3db89e">촬영 가이드</span>
          </div>
          <div class="p-6 text-center">
            <h3 style="font-weight:800;font-size:1.05rem;color:#1a2e2b;margin-bottom:8px">
              {{ currentGuidePlace?.name }}
            </h3>
            <p style="font-size:0.9rem;color:#6b8c87;line-height:1.65;margin-bottom:20px">
              {{ currentGuidePlace?.guideText }}
            </p>
            <div class="flex items-center justify-center gap-2">
              <div class="w-2 h-2 rounded-full" :style="guideCountdown >= 2 ? 'background:#3db89e' : 'background:#e5e7eb'" />
              <div class="w-2 h-2 rounded-full" :style="guideCountdown >= 1 ? 'background:#3db89e' : 'background:#e5e7eb'" />
            </div>
            <p style="font-size:0.78rem;color:#9ca3af;margin-top:8px">{{ guideCountdown }}초 후 카메라가 열려요</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── 카메라 ────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="currentStep === 'camera'" class="fixed inset-0 z-50 flex flex-col" style="background:#000">
        <button @click="goBack"
          class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center"
          style="background:rgba(0,0,0,0.5)">
          <X :size="20" color="#fff" />
        </button>

        <div class="relative flex-1 flex items-center justify-center overflow-hidden">
          <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover" />

          <!-- 포즈 오버레이 -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-8 left-8 w-10 h-10 border-t-4 border-l-4 rounded-tl-xl"
              style="border-color:rgba(255,255,255,0.7)" />
            <div class="absolute top-8 right-8 w-10 h-10 border-t-4 border-r-4 rounded-tr-xl"
              style="border-color:rgba(255,255,255,0.7)" />
            <div class="absolute bottom-24 left-8 w-10 h-10 border-b-4 border-l-4 rounded-bl-xl"
              style="border-color:rgba(255,255,255,0.7)" />
            <div class="absolute bottom-24 right-8 w-10 h-10 border-b-4 border-r-4 rounded-br-xl"
              style="border-color:rgba(255,255,255,0.7)" />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-6 h-0.5 bg-white opacity-40" />
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-0.5 h-6 bg-white opacity-40" />
            </div>
            <div class="absolute bottom-28 right-5 text-3xl opacity-50">🌟</div>
          </div>

          <div class="absolute top-4 left-0 right-0 text-center pointer-events-none">
            <span class="text-xs font-bold px-3 py-1.5 rounded-full"
              style="background:rgba(61,184,158,0.85);color:#fff">
              {{ currentGuidePlace?.guideText }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-center pb-10 pt-4" style="background:#000">
          <button @click="capturePhoto"
            class="w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style="background:linear-gradient(135deg,#B2E4DC,#3db89e);box-shadow:0 0 0 4px rgba(178,228,220,0.4)">
            <Camera :size="30" color="#fff" />
          </button>
        </div>
        <canvas ref="canvasRef" class="hidden" />
      </div>
    </Teleport>

    <!-- ── 결과 ────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="currentStep === 'result'" class="fixed inset-0 z-50 flex flex-col" style="background:#000">
        <div class="flex-1 relative overflow-hidden">
          <img :src="resultImageUrl" alt="인증 사진" class="w-full h-full object-contain" />
          <div class="absolute top-6 left-0 right-0 flex justify-center">
            <div class="flex items-center gap-2 px-5 py-2.5 rounded-full"
              style="background:rgba(61,184,158,0.92);backdrop-filter:blur(8px)">
              <span class="text-lg">🌟</span>
              <span class="font-bold text-sm text-white">인증 완료!</span>
            </div>
          </div>
        </div>
        <div class="px-6 py-8" style="background:#1a2e2b">
          <p class="text-center text-sm mb-4" style="color:#B2E4DC">
            꿈돌이와 함께한 <strong style="color:#fff">{{ currentGuidePlace?.name }}</strong> 인증 사진이에요!
          </p>
          <button @click="confirmResult"
            class="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
            style="background:linear-gradient(135deg,#3db89e,#2da08a)">
            스탬프 받기 🎉
          </button>
        </div>
      </div>
    </Teleport>

    </template>
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
