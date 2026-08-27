<script setup lang="ts">
import { toast } from "@/composables/useToast";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Camera, Loader2, MapPin, X } from 'lucide-vue-next'
import { fetchDiPlaces } from '@/api/courses'
import { httpGet } from '@/api/http'
import { getTodayStampedPlaceIds, saveStamp, verifyStampLocation, type StampCoords } from '@/api/stamps'
import { drawCharacter, type CharacterResponse } from '@/api/characters'
import { dataUrlToFile, uploadStampPhoto } from '@/api/upload'
import { resolveCharacterImage } from '@/data/characterImages'
import { useCourseStore } from '@/stores/course'
import { useStampStore } from '@/stores/stamp'
import { useBookmarkStore } from '@/stores/bookmark'
import { useXp } from '@/composables/useXp'
import GuidedTour from '@/components/tutorial/GuidedTour.vue'
import SilentImage from '@/components/common/SilentImage.vue'
import { loadKakaoMaps } from '@/utils/kakaoMaps'

const courseStore = useCourseStore()
const stampStore = useStampStore()
const bookmarkStore = useBookmarkStore()

const savedCoursesCount = ref(0)
const savedPostsCount = ref(0)
const { totalXp, currentLevel, nextLevel, xpProgress, levelUpModal } = useXp(savedCoursesCount, savedPostsCount)

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
const route = useRoute()
const forceStampTour = computed(() =>
  route.query.tour === 'stamp' ? String(route.query.run ?? 'stamp') : false,
)

const places = ref<TourPlace[]>([])

const stampTourSteps = [
  {
    selector: '[data-tour="stamp-next-place"]',
    title: "다음으로 방문할 장소를 확인해요",
    description: "강조된 장소가 지금 인증할 목적지예요. 장소 카드를 클릭해 보세요.",
  },
  {
    selector: '[data-tour="stamp-verify"]',
    title: "도착했다면 인증을 시작해요",
    description: "인증하기를 누르면 위치 확인과 사진 촬영이 시작돼요. 지금은 실제 실행 없이 안내만 끝나요.",
  },
]

function toTourPlaces(coursePlaces: any[], courseId: string | null) {
  return coursePlaces
    .filter((p: any) => p.lat && p.lng)
    .map((p: any) => ({
      id: String(p.id),
      name: p.name,
      description: p.category ?? p.desc ?? '',
      lat: p.lat,
      lng: p.lng,
      guideText: guideTextFor(p.category ?? p.desc),
      guideEmoji: emojiFor(p.category ?? p.desc),
      // 서버가 하루 1회로 제한하므로 코스 단위 로컬 기록이 아니라 오늘 기록으로 판정한다
      visited: todayStamped.value.has(String(p.id)),
    }))
}

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
    case 'FOOD':    return '식당 간판이 잘 보이도록 앞에서 찍어주세요!'
    case 'CAFE':    return '카페 입구나 간판이 보이도록 찍어주세요!'
    case 'NATURE':  return '자연 명소를 배경으로 함께 찍어주세요!'
    case 'CULTURE': return '관광지 입구나 대표 조형물이 보이도록 찍어주세요!'
    default:        return '방문 장소가 잘 보이도록 앞에서 찍어주세요!'
  }
}

const currentStep = ref<Step>('timeline')
const currentPlaceIdx = ref<number | null>(null)
const errorMsg = ref('')
const guideCountdown = ref(2)
const resultImageUrl = ref('')
const stampAnimIdx = ref<number | null>(null)
/** 촬영할 때마다 서버에서 뽑은 캐릭터. 저장을 눌러야 도감에 반영된다. */
const drawnCharacter = ref<CharacterResponse | null>(null)
/** 캐릭터를 합성하기 전의 원본 프레임. 다시 찍기와 재합성에 쓴다. */
const rawFrameUrl = ref('')
const isDrawing = ref(false)
const newCharacterPopup = ref<CharacterResponse | null>(null)
/** 오늘 이미 스탬프를 찍은 장소. 서버 기록이 기준이다. */
const todayStamped = ref<Set<string>>(new Set())
const isSavingStamp = ref(false)
/** 위치 인증에 성공한 좌표. 스탬프 저장 시 서버 검증용으로 함께 보낸다. */
const verifiedCoords = ref<StampCoords | null>(null)
// 캐릭터는 서버가 뽑는다. 예전에는 코스 내 방문 순번으로 로컬 배열에서 골랐는데,
// 랜덤도 아니고 유저별로 다르지도 않았으며 서버가 준 캐릭터와도 어긋났다.
function characterImage(character: CharacterResponse | null): string | null {
  return character ? resolveCharacterImage(character.code) : null
}

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let stream: MediaStream | null = null
let guideTimer: ReturnType<typeof setInterval> | null = null

// ── 카카오 지도 ───────────────────────────────────────────
let mapObject: any = null
let overlays: any[] = []
let polylineObject: any = null
let mapResizeObserver: ResizeObserver | null = null

function relayoutKakaoMap() {
  mapObject?.relayout()
}

function relayoutKakaoMapSoon() {
  nextTick(() => {
    requestAnimationFrame(() => {
      relayoutKakaoMap()
      renderStampMap()
    })
  })
}

function returnToTimeline() {
  currentStep.value = 'timeline'
  relayoutKakaoMapSoon()
}

function initKakaoMap() {
  const container = document.getElementById('stamp-tour-map')
  if (!container) return
  const kakao = (window as any).kakao
  if (!kakao?.maps) return

  const center = new kakao.maps.LatLng(36.3619, 127.4100)
  mapObject = new kakao.maps.Map(container, { center, level: 8 })
  renderStampMap()

  mapResizeObserver?.disconnect()
  mapResizeObserver = new ResizeObserver(relayoutKakaoMap)
  mapResizeObserver.observe(container)
  requestAnimationFrame(relayoutKakaoMap)
  window.addEventListener('resize', relayoutKakaoMap)
}

function makeWavyPath(kakao: any, points: any[]) {
  if (points.length < 2) return points

  const path: any[] = []
  const waveCount = 2
  const samplesPerWave = 18

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]
    const end = points[i + 1]
    const startLat = start.getLat()
    const startLng = start.getLng()
    const endLat = end.getLat()
    const endLng = end.getLng()
    const dLat = endLat - startLat
    const dLng = endLng - startLng
    const distance = Math.sqrt(dLat * dLat + dLng * dLng)
    const amplitude = Math.min(distance * 0.045, 0.0018)
    const normalLat = distance ? -dLng / distance : 0
    const normalLng = distance ? dLat / distance : 0
    const totalSamples = waveCount * samplesPerWave

    for (let step = 0; step <= totalSamples; step++) {
      if (i > 0 && step === 0) continue
      const t = step / totalSamples
      const offset = Math.sin(t * Math.PI * 2 * waveCount) * amplitude
      path.push(
        new kakao.maps.LatLng(
          startLat + dLat * t + normalLat * offset,
          startLng + dLng * t + normalLng * offset,
        ),
      )
    }
  }

  return path
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

    const markerButton = document.createElement('button')
    markerButton.type = 'button'
    markerButton.innerHTML = content
    markerButton.style.cssText = 'display:block;padding:0;border:0;background:transparent;'

    if (!place.visited) {
      markerButton.style.cursor = 'pointer'
      markerButton.title = `${place.name} 인증하기`
      markerButton.setAttribute('aria-label', `${place.name} 인증하기`)
      markerButton.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        startVerify(idx)
      })
    } else {
      markerButton.disabled = true
      markerButton.title = `${place.name} 인증 완료`
    }

    const overlay = new kakao.maps.CustomOverlay({
      position: pos,
      content: markerButton,
      yAnchor: isNext ? 1 : 0.5,
    })
    overlay.setMap(mapObject)
    overlays.push(overlay)
  })

  // 구불구불 점선 루트
  polylineObject = new kakao.maps.Polyline({
    path: makeWavyPath(kakao, linePath),
    strokeWeight: 5,
    strokeColor: '#3db89e',
    strokeOpacity: 1,
    strokeStyle: 'shortdot',
  })
  polylineObject.setMap(mapObject)

  if (places.value.length > 0) mapObject.setBounds(bounds)
}

onMounted(async () => {
  // 방문 여부 판정 기준이라 코스를 구성하기 전에 먼저 받아둔다.
  // 실패하면 전부 미방문으로 보이고, 저장 단계에서 서버가 409로 걸러낸다.
  try {
    todayStamped.value = await getTodayStampedPlaceIds()
  } catch {
    todayStamped.value = new Set()
  }

  if (!courseStore.hasConfirmedCourse) {
    await courseStore.checkConfirmedCourse()
  }

  bookmarkStore.fetchBookmarks().catch(() => {})

  const selectedCourse = stampStore.activeCourse
  if (selectedCourse?.places?.length) {
    courseStore.hasConfirmedCourse = true
    places.value = toTourPlaces(selectedCourse.places, selectedCourse.id)
  } else if (courseStore.hasConfirmedCourse) {
    try {
      const res = await httpGet<any[]>('/api/courses/my')
      savedCoursesCount.value = res.data?.length ?? 0
      const latestCourse = res.data[0]
      if (latestCourse?.places?.length > 0) {
        stampStore.setActiveCourse(latestCourse)
        places.value = toTourPlaces(latestCourse.places, String(latestCourse.id))
      }
    } catch (err) {
      console.error('코스 로딩 실패:', err)
    }
  } else {
    const diPlaces = await fetchDiPlaces()
    places.value = toTourPlaces(diPlaces.slice(0, 4), null)
  }

  try {
    await loadKakaoMaps()
    initKakaoMap()
  } catch (error) {
    console.error('Kakao Maps SDK load failed:', error)
  }
})

watch(
  () => places.value.map((p) => p.visited),
  () => nextTick(() => renderStampMap()),
  { deep: true },
)

watch(
  () => currentStep.value,
  (step) => {
    if (step === 'timeline') relayoutKakaoMapSoon()
  },
)


// ── Step 1 → 2: 위치 인증 ─────────────────────────────────
/** getCurrentPosition 을 async/await 로 쓰기 위한 래퍼 */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    }),
  )
}

/**
 * 사진을 찍기 전 위치를 확인한다.
 *
 * 거리 판정은 서버가 한다. 프론트에서 반경을 따로 계산하면 서버 설정과
 * 어긋나고, 개발 모드 우회 스위치를 화면 코드에 남기게 된다. 로컬에서
 * 위치를 무시하려면 서버의 stamp.verification.enabled 를 끄면 된다.
 */
async function startVerify(idx: number) {
  currentPlaceIdx.value = idx
  errorMsg.value = ''
  currentStep.value = 'verifying'

  let position: GeolocationPosition
  try {
    position = await getCurrentPosition()
  } catch {
    errorMsg.value = '위치를 가져올 수 없어요. 위치 권한을 확인해주세요.'
    returnToTimeline()
    return
  }

  const coords: StampCoords = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    // 측위 오차 반경. 서버가 이 값으로 좌표를 믿을지, 반경을 얼마나 넓힐지 정한다.
    accuracy: position.coords.accuracy,
  }

  try {
    await verifyStampLocation(places.value[idx].id, coords)
  } catch (err: any) {
    errorMsg.value =
      err?.response?.data?.message ?? '위치를 확인할 수 없어요. 잠시 후 다시 시도해주세요.'
    returnToTimeline()
    return
  }

  verifiedCoords.value = coords
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
    returnToTimeline()
  }
}

// ── Step 4: 촬영 → 뽑기 → 엽서 합성 ─────────────────────
async function capturePhoto() {
  if (!videoRef.value || !canvasRef.value || currentPlaceIdx.value === null) return
  const place = places.value[currentPlaceIdx.value]
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')!

  // 1) 원본 프레임만 먼저 확보한다. 다시 찍을 때 이 값을 버리고 새로 찍는다.
  canvas.width = videoRef.value.videoWidth || 640
  canvas.height = videoRef.value.videoHeight || 480
  ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)
  rawFrameUrl.value = canvas.toDataURL('image/jpeg', 0.92)
  stopCamera()

  // 2) 서버에서 캐릭터를 뽑는다. 저장하지 않으므로 다시 찍으면 다시 뽑힌다.
  isDrawing.value = true
  try {
    drawnCharacter.value = await drawCharacter(place.id)
  } catch (err) {
    console.error('캐릭터 뽑기 실패:', err)
    toast.error('캐릭터를 불러오지 못했어요. 다시 시도해주세요.')
    drawnCharacter.value = null
  } finally {
    isDrawing.value = false
  }

  // 3) 뽑은 캐릭터를 얹어 엽서를 만든다.
  resultImageUrl.value = await composePostcard(rawFrameUrl.value, place, drawnCharacter.value)
  currentStep.value = 'result'
}

/** 원본 프레임에 캐릭터 배지와 인증 밴드를 얹는다. */
async function composePostcard(
  frameUrl: string,
  place: TourPlace,
  character: CharacterResponse | null,
): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const frame = await loadCanvasImage(frameUrl)

  canvas.width = frame.width
  canvas.height = frame.height
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height)

  const size = Math.round(canvas.width * 0.18)
  const padding = Math.round(size * 0.18)
  const badgeX = canvas.width - size - padding
  const badgeY = canvas.height - size - padding

  // 캐릭터 이미지를 얹지 못하면 배지 없이 사진만 남긴다.
  // 예전에는 여기서 '꿈' 글자를 그렸는데, alt와 달리 저장된 엽서에 영구히 박힌다.
  const badgeUrl = character ? resolveCharacterImage(character.code) : null
  if (badgeUrl) {
    ctx.save()
    try {
      // 캐릭터 이미지는 프론트 번들에 있어 same-origin이다.
      // 외부 도메인에서 불러오면 canvas가 오염돼 toDataURL이 실패한다.
      const badge = await loadCanvasImage(badgeUrl)
      const nw = badge.naturalWidth
      const nh = badge.naturalHeight
      // 0×0이면 NaN이 drawImage에 들어가 배지가 조용히 사라진다 → 그냥 건너뛴다.
      if (nw > 0 && nh > 0) {
        const scale = Math.min(size / nw, size / nh)
        const drawW = nw * scale
        const drawH = nh * scale
        // 가로: 중앙, 세로: 하단 기준 — 솔로/듀오 혼재 시 발 위치 기준선 일치
        ctx.drawImage(badge, badgeX + (size - drawW) / 2, badgeY + (size - drawH), drawW, drawH)
      }
    } catch {
      // 배지 생략. 아무것도 그리지 않는다.
    }
    ctx.restore()
  }

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
  const label = character ? `${place.name} ${character.name}` : place.name
  ctx.fillText(`✓ ${label} 인증`, canvas.width / 2, bandH / 2)

  return canvas.toDataURL('image/jpeg', 0.85)
}

/** 다시 찍기. 저장 전이므로 도감에는 아무 영향이 없고 캐릭터도 새로 뽑힌다. */
function retake() {
  rawFrameUrl.value = ''
  resultImageUrl.value = ''
  drawnCharacter.value = null
  openCamera()
}

function stopCamera() {
  stream?.getTracks().forEach((t) => t.stop())
  stream = null
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

// ── Step 5: 저장 → 도감 해금 → 타임라인 ─────────────────
async function confirmResult() {
  if (currentPlaceIdx.value === null || isSavingStamp.value) return
  const idx = currentPlaceIdx.value
  const place = places.value[idx]

  isSavingStamp.value = true
  let res
  try {
    // 사진을 먼저 올린다. 파일 저장은 트랜잭션 롤백에 참여하지 못하므로
    // 순서를 뒤집으면 사진 없는 도감 항목이 생긴다.
    const photoUrl = await uploadStampPhoto(dataUrlToFile(resultImageUrl.value))
    res = await saveStamp(place.id, verifiedCoords.value, drawnCharacter.value?.id, photoUrl)
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 409) {
      toast.info(err.response?.data?.message ?? '오늘 이미 방문한 장소입니다.')
    } else if (status === 400) {
      toast.error(err.response?.data?.message ?? '위치를 확인할 수 없습니다. 장소 근처에서 다시 시도해주세요.')
    } else if (status !== 401) {
      console.error('스탬프 저장 실패:', err)
      toast.error('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
    }
    // 예전에는 네트워크 오류일 때 아래로 흘러가 저장되지도 않은 스탬프를
    // "인증 완료"로 표시하고 로컬에만 사진을 남겼다. 어떤 실패든 여기서 끝낸다.
    return
  } finally {
    isSavingStamp.value = false
  }

  // 서버가 확정한 캐릭터를 최종으로 삼는다. 자정을 넘겨 테마가 바뀐 경우처럼
  // 미리보기와 달라졌다면 엽서를 다시 합성한다.
  const finalCharacter = res.newCharacter ?? drawnCharacter.value
  if (finalCharacter && finalCharacter.id !== drawnCharacter.value?.id) {
    resultImageUrl.value = await composePostcard(rawFrameUrl.value, place, finalCharacter)
  }

  stampStore.addPhoto({
    id: `${place.id}_${Date.now()}`,
    url: res.photoUrl || resultImageUrl.value,
    placeName: place.name,
    placeEmoji: place.guideEmoji,
    courseId: stampStore.activeCourseId ?? undefined,
    courseTitle: stampStore.activeCourseTitle,
    characterId: finalCharacter?.id,
    characterName: finalCharacter?.name,
    characterCode: finalCharacter?.code,
    characterDescription: finalCharacter?.description,
    characterImageUrl: characterImage(finalCharacter) ?? undefined,
    characterImageAlt: finalCharacter?.name,
    takenAt: new Date().toISOString(),
    lat: place.lat,
    lng: place.lng,
  })

  todayStamped.value.add(String(place.id))
  stampAnimIdx.value = idx
  returnToTimeline()
  currentPlaceIdx.value = null
  newCharacterPopup.value = finalCharacter
  setTimeout(() => {
    places.value[idx].visited = true
    setTimeout(() => (stampAnimIdx.value = null), 800)
  }, 100)
}

function goBack() {
  stopCamera()
  if (guideTimer) clearInterval(guideTimer)
  if (currentStep.value === 'timeline') router.back()
  else returnToTimeline()
}

const nextPlaceIdx = computed(() => places.value.findIndex((p) => !p.visited))
const completedCount = computed(() => places.value.filter((p) => p.visited).length)
const currentGuidePlace = computed(() =>
  currentPlaceIdx.value !== null ? places.value[currentPlaceIdx.value] : null,
)


onUnmounted(() => {
  stopCamera()
  if (guideTimer) clearInterval(guideTimer)
  mapResizeObserver?.disconnect()
  window.removeEventListener('resize', relayoutKakaoMap)
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
        <button @click="router.push('/')"
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
    <div v-show="currentStep === 'timeline' || currentStep === 'verifying'" class="stamp-tour-timeline flex flex-col overflow-hidden">

      <!-- ░░ 게이미피케이션 히어로 (컴팩트) ░░ -->
      <div class="relative overflow-hidden px-4 pt-2.5 pb-2.5 flex-shrink-0"
        style="background:linear-gradient(145deg,#1a2e2b 0%,#163028 60%,#0e2320 100%)">

        <!-- 1행: 뒤로 + 레벨 + 타이틀 + 스탯 칩 + 이모지 -->
        <div class="stamp-tour-header-row flex items-center gap-2 relative z-10">
          <button @click="goBack" class="flex items-center transition-opacity hover:opacity-70 flex-shrink-0"
            style="color:rgba(178,228,220,0.7)">
            <ArrowLeft :size="14" />
          </button>
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
            style="background:rgba(61,184,158,0.2);border:1px solid rgba(61,184,158,0.35)">
            <span style="font-size:0.6rem;font-weight:800;color:#3db89e">LV.{{ currentLevel.level }}</span>
            <span style="font-size:0.6rem;color:rgba(178,228,220,0.5)">•</span>
            <span style="font-size:0.6rem;font-weight:700;color:#B2E4DC">{{ currentLevel.name }}</span>
          </div>
          <span class="stamp-tour-header-title" style="font-weight:800;font-size:0.92rem;color:#fff">꿈돌이 스탬프 투어</span>
          <div class="stamp-tour-header-stats ml-auto flex items-center gap-1.5 flex-shrink-0">
            <span class="px-2 py-0.5 rounded-full font-bold"
              style="font-size:0.65rem;background:rgba(61,184,158,0.2);color:#3db89e">🌟 {{ completedCount }}</span>
            <span class="px-2 py-0.5 rounded-full font-bold"
              style="font-size:0.65rem;background:rgba(255,255,255,0.08);color:#B2E4DC">📍 {{ completedCount }}/{{ places.length }}</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style="background:rgba(255,255,255,0.07);border:1px solid rgba(178,228,220,0.2)">
              {{ currentLevel.emoji }}
            </div>
          </div>
        </div>

        <!-- 2행: XP 바 -->
        <div class="mt-1.5 relative z-10">
          <div class="w-full h-1.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.1)">
            <div class="h-full rounded-full transition-all duration-700"
              :style="`width:${xpProgress}%;background:linear-gradient(90deg,#3db89e,#B2E4DC)`" />
          </div>
        </div>
      </div>

      <!-- ░░ 지도 + 스탬프 오버레이 ░░ -->
      <div class="relative flex-1 min-h-0" style="background:#e5e9f0">
        <div id="stamp-tour-map" style="position:absolute;inset:0;width:100%;height:100%" />

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
              :data-tour="idx === nextPlaceIdx ? 'stamp-next-place' : undefined"
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
              data-tour="stamp-verify"
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
          <SilentImage :src="resultImageUrl" class="w-full h-full object-contain" />
          <div v-if="drawnCharacter" class="absolute top-6 left-0 right-0 flex justify-center">
            <div class="flex items-center gap-2 px-5 py-2.5 rounded-full"
              style="background:rgba(61,184,158,0.92);backdrop-filter:blur(8px)">
              <SilentImage :src="characterImage(drawnCharacter)"
                class="w-7 h-7 object-contain" />
              <span class="font-bold text-sm text-white">{{ drawnCharacter.name }}</span>
            </div>
          </div>
        </div>
        <div class="px-6 py-8" style="background:#1a2e2b">
          <p class="text-center text-sm mb-4" style="color:#B2E4DC">
            <template v-if="drawnCharacter">
              {{ drawnCharacter.name }}와 함께한 <strong style="color:#fff">{{ currentGuidePlace?.name }}</strong> 사진이에요!
            </template>
            <template v-else>
              <strong style="color:#fff">{{ currentGuidePlace?.name }}</strong> 인증 사진이에요!
            </template>
          </p>
          <p class="text-center mb-4" style="font-size:0.72rem;color:rgba(178,228,220,0.65)">
            마음에 들지 않으면 다시 찍을 수 있어요. 저장해야 도감에 담겨요.
          </p>
          <div class="flex gap-3">
            <button @click="retake" :disabled="isSavingStamp"
              class="flex-1 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 disabled:opacity-50"
              style="background:rgba(255,255,255,0.1);color:#B2E4DC">
              다시 찍기
            </button>
            <button @click="confirmResult" :disabled="isSavingStamp"
              class="py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-60"
              style="flex:2;background:linear-gradient(135deg,#3db89e,#2da08a)">
              {{ isSavingStamp ? '저장 중…' : '스탬프 받기 🎉' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    </template>

    <GuidedTour
      v-if="courseStore.hasConfirmedCourse"
      storage-key="layover-tour-stamp-v1"
      :steps="stampTourSteps"
      :force="forceStampTour"
    />

    <!-- ── 레벨업 축하 팝업 ────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="levelup">
        <div v-if="levelUpModal"
          class="fixed inset-0 flex items-center justify-center z-[60]"
          style="background:rgba(0,0,0,0.55)"
          @click.self="levelUpModal = null">
          <div class="rounded-3xl p-8 text-center shadow-2xl mx-6" style="background:#fff;max-width:300px;width:100%">
            <div style="font-size:3.5rem;margin-bottom:10px">{{ levelUpModal.emoji }}</div>
            <p style="font-size:0.72rem;font-weight:800;color:#3db89e;letter-spacing:0.12em">LEVEL UP!</p>
            <h2 style="font-size:1.5rem;font-weight:900;color:#1a2e2b;margin:6px 0 2px">LV.{{ levelUpModal.level }}</h2>
            <p style="font-size:1.05rem;font-weight:700;color:#3db89e">{{ levelUpModal.name }}</p>
            <p style="font-size:0.8rem;color:#9ca3af;margin-top:8px">축하해요! 새 레벨을 달성했어요 🎉</p>
            <button @click="levelUpModal = null"
              class="mt-5 w-full py-3 rounded-2xl font-bold text-white"
              style="background:linear-gradient(90deg,#3db89e,#2a9d8f)">확인</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── 캐릭터 획득 팝업 ────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="newCharacterPopup"
        class="fixed inset-0 flex items-center justify-center z-50"
        style="background:rgba(0,0,0,0.6)"
        @click.self="newCharacterPopup = null">
        <div class="rounded-3xl p-8 text-center shadow-2xl mx-6"
          style="background:#fff;max-width:320px;width:100%">
          <SilentImage :src="characterImage(newCharacterPopup)"
            class="w-28 h-28 mx-auto mb-3 object-contain" />
          <p style="font-size:0.8rem;color:#3db89e;font-weight:700;margin-bottom:4px">
            {{ newCharacterPopup.theme ? '특별한 캐릭터를 만났어요!' : '캐릭터를 만났어요!' }}
          </p>
          <h3 style="font-size:1.2rem;font-weight:800;color:#1a2e2b;margin-bottom:8px">
            {{ newCharacterPopup.name }}
          </h3>
          <p v-if="newCharacterPopup.description"
            style="font-size:0.82rem;color:#9ca3af;line-height:1.55;margin-bottom:16px">
            {{ newCharacterPopup.description }}
          </p>
          <p style="font-size:0.82rem;color:#9ca3af;margin-bottom:24px">
            도감에 담았어요. 마이페이지에서 확인할 수 있어요!
          </p>
          <button @click="newCharacterPopup = null"
            class="w-full py-3 rounded-2xl font-bold text-white text-sm"
            style="background:linear-gradient(135deg,#3db89e,#2da08a)">
            확인
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
.stamp-tour-timeline {
  height: calc(100dvh - 64px);
  min-height: 560px;
}
.stamp-tour-header-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.levelup-enter-active { animation: levelupIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.levelup-leave-active { animation: levelupOut 0.2s ease-in; }
@keyframes levelupIn {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes levelupOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.85); }
}

@media (max-width: 767px) {
  .stamp-tour-timeline {
    height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
    min-height: 480px;
  }

  .stamp-tour-header-row {
    gap: 6px;
  }

  .stamp-tour-header-title {
    flex: 1 1 auto;
    font-size: 0.84rem !important;
  }

  .stamp-tour-header-stats {
    gap: 4px !important;
  }

  .stamp-tour-header-stats > span {
    padding-right: 6px !important;
    padding-left: 6px !important;
  }
}

@media (max-width: 420px) {
  .stamp-tour-timeline {
    height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
    min-height: 440px;
  }

  .stamp-tour-header-title {
    font-size: 0.78rem !important;
  }

  .stamp-tour-header-stats > span:nth-child(2) {
    display: none;
  }

  .stamp-tour-header-stats > div {
    width: 1.75rem !important;
    height: 1.75rem !important;
    font-size: 1rem !important;
  }
}
</style>
