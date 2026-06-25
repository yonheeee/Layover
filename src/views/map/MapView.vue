<script setup lang="ts">
import { fetchDiPlaces, recalculateCourse, saveCourse } from "@/api/courses";
import { useCourseStore } from "@/stores/course";
import { useStampStore } from "@/stores/stamp";
import type { Course, CourseStop, DiPlace } from "@/types/course";
import {
  ArrowLeft,
  Bus,
  Car,
  Check,
  ChevronRight,
  Clock,
  Edit2,
  Footprints,
  GripVertical,
  Lock,
  Plus,
  Search,
  Train,
  X,
} from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

// 카카오 지도 객체 타입 정의
declare global {
  interface window {
    kakao: any;
  }
}

const courseStore = useCourseStore();
const stampStore = useStampStore();
const router = useRouter();
const courses = ref<Course[]>([]);

const STATION_STOPS: Record<string, CourseStop> = {
  DAEJEON: {
    id: "STATION_DAEJEON",
    name: "대전역",
    category: "STATION",
    isOpen: true,
    stayTime: "0분",
    isLocked: true,
    lat: 36.3325,
    lng: 127.4348,
  },
  SEODDAEJEON: {
    id: "STATION_SEODAEJEON",
    name: "서대전역",
    category: "STATION",
    isOpen: true,
    stayTime: "0분",
    isLocked: true,
    lat: 36.3226,
    lng: 127.4039,
  },
  SINTANJIN: {
    id: "STATION_SINTANJIN",
    name: "신탄진역",
    category: "STATION",
    isOpen: true,
    stayTime: "0분",
    isLocked: true,
    lat: 36.4518,
    lng: 127.4297,
  },
};

function selectedStationStop(): CourseStop {
  const station = courseStore.lastRequest?.departureStation ?? "DAEJEON";
  return { ...(STATION_STOPS[station] ?? STATION_STOPS.DAEJEON) };
}

function withFixedStationStops(course: Course): Course {
  if (course.places.some((p) => p.category === "STATION")) {
    return course;
  }
  const station = selectedStationStop();
  const realPlaces = course.places.filter((p) => p.category !== "STATION");
  return {
    ...course,
    places: [{ ...station }, ...realPlaces, { ...station }],
  };
}

function realCoursePlaces() {
  return currentPlaces.value.filter(
    (p) =>
      p.category !== "STATION" &&
      !p.id.startsWith("__STATION") &&
      !p.id.startsWith("STATION_"),
  );
}

async function recalculateCurrentCourse() {
  if (!courseStore.lastRequest || !currentCourse.value) return;

  const placeIds = realCoursePlaces().map((place) => place.id);
  if (placeIds.length === 0) return;

  isRecalculating.value = true;
  try {
    const recalculated = await recalculateCourse({
      ...courseStore.lastRequest,
      title: currentCourse.value.title,
      placeIds,
    });
    courses.value[activeTab.value] = withFixedStationStops(recalculated);
    courseStore.setCourses(courses.value, courseStore.lastRequest);
    setTimeout(renderCourseElementsOnMap, 50);
  } catch (error) {
    console.error("코스 이동시간 재계산 실패:", error);
    alert("이동시간 재계산에 실패했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    isRecalculating.value = false;
  }
}

const activeTab = ref(0);
const currentCourse = computed(() => courses.value[activeTab.value]);
const currentPlaces = computed(() => currentCourse.value?.places ?? []);

const calculatedCost = computed(() => {
  if (currentCourse.value?.estimatedCost)
    return currentCourse.value.estimatedCost;
  let basePrice = 0;
  currentPlaces.value.forEach((p) => {
    if (p.category.includes("맛집")) basePrice += 10000;
    if (p.category.includes("카페")) basePrice += 5000;
    if (p.nextTransport) basePrice += p.nextTransport.taxiFare;
  });
  return `약 ${basePrice.toLocaleString()}원`;
});

const calculatedTime = computed(() => {
  if (currentCourse.value?.totalTime) return currentCourse.value.totalTime;
  let totalMinutes = 0;
  currentPlaces.value.forEach((p) => {
    const stay = parseInt(p.stayTime) || 0;
    const wait = p.waitingTime ? parseInt(p.waitingTime) || 0 : 0;
    const trans = p.nextTransport ? parseInt(p.nextTransport.taxiTime) || 0 : 0;
    totalMinutes += stay + wait + trans;
  });
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return hours > 0 ? `약 ${hours}시간 ${mins}분` : `약 ${mins}분`;
});

const isEditing = ref(false);
const isSaving = ref(false);
const isRecalculating = ref(false);
const isRegenerating = ref(false);
const panelMode = ref<"main" | "search">("main");
const searchKeyword = ref("");
const selectedCategory = ref("");
const categories = [
  { key: "", label: "전체" },
  { key: "FOOD", label: "맛집/빵집" },
  { key: "TOUR", label: "관광명소" },
  { key: "CULTURE", label: "문화/예술" },
  { key: "SHOPPING", label: "쇼핑" },
];

const allDiPlaces = ref<DiPlace[]>([]);

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const filteredSearchResults = computed(() => {
  const real = realCoursePlaces().filter((p) => p.lat && p.lng);
  const centroid =
    real.length > 0
      ? {
          lat: real.reduce((s, p) => s + (p.lat ?? 0), 0) / real.length,
          lng: real.reduce((s, p) => s + (p.lng ?? 0), 0) / real.length,
        }
      : null;

  // 홈에서 선택했던 카테고리 태그 (전체 보기 시 우선 정렬에 사용)
  const preferredCategories = new Set(
    (courseStore.lastRequest?.themeTags ?? []).map((t) => t.toUpperCase()),
  );

  return allDiPlaces.value
    .filter((p) => {
      const matchesKeyword =
        !searchKeyword.value || p.name.includes(searchKeyword.value);
      const matchesCategory =
        !selectedCategory.value || p.category === selectedCategory.value;
      return matchesKeyword && matchesCategory;
    })
    .sort((a, b) => {
      // 1) 거리순 (현재 코스 중심 기준, 가까운 순)
      if (centroid && a.lat && a.lng && b.lat && b.lng) {
        const da = haversineKm(centroid.lat, centroid.lng, a.lat, a.lng);
        const db = haversineKm(centroid.lat, centroid.lng, b.lat, b.lng);
        if (Math.abs(da - db) > 0.05) return da - db;
      }
      // 2) 홈에서 선택한 카테고리 일치 우선 (전체 보기 시에만 적용)
      if (!selectedCategory.value && preferredCategories.size > 0) {
        const aMatch = preferredCategories.has(a.category.toUpperCase())
          ? 0
          : 1;
        const bMatch = preferredCategories.has(b.category.toUpperCase())
          ? 0
          : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;
      }
      // 3) 이름 가나다순 (ㄱ-ㅎ → a-z → 0-9)
      return a.name.localeCompare(b.name, "ko");
    });
});

// [카카오 지도 엔진 인터랙션 데이터]
let mapObject: any = null;
let markers: any[] = [];
let polylineObjects: any[] = [];
let previewMarker: any = null;

function clearPreviewMarker() {
  if (previewMarker) {
    previewMarker.setMap(null);
    previewMarker = null;
  }
}

function showPreviewMarker(lat: number, lng: number) {
  if (!mapObject) return;
  clearPreviewMarker();
  const position = new (window as any).kakao.maps.LatLng(lat, lng);
  const content = `
    <div style="
      width:28px;height:28px;border-radius:50%;
      background:#ef4444;border:2.5px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>
    </div>
  `;
  previewMarker = new (window as any).kakao.maps.CustomOverlay({
    position,
    content,
    yAnchor: 0.5,
    xAnchor: 0.5,
  });
  previewMarker.setMap(mapObject);
  mapObject.panTo(position);
}

function initKakaoMap() {
  const container = document.getElementById("kakao-render-map");
  if (!container) return;
  if (
    typeof (window as any).kakao !== "undefined" &&
    (window as any).kakao.maps
  ) {
    const options = {
      center: new (window as any).kakao.maps.LatLng(36.3316, 127.4342),
      level: 5,
    };
    mapObject = new (window as any).kakao.maps.Map(container, options);
    renderCourseElementsOnMap();
  }
}

function renderCourseElementsOnMap() {
  if (!mapObject) return;
  markers.forEach((m) => m.setMap(null));
  markers = [];
  polylineObjects.forEach((p) => p.setMap(null));
  polylineObjects = [];

  const bounds = new (window as any).kakao.maps.LatLngBounds();
  const places = currentPlaces.value.filter(
    (p) => p.lat && p.lng && p.lat !== 0 && p.lng !== 0,
  );
  let placeIndex = 1;

  places.forEach((place) => {
    const position = new (window as any).kakao.maps.LatLng(
      place.lat,
      place.lng,
    );
    const isStation = place.category === "STATION";
    const label = isStation ? "🚉" : String(placeIndex);
    if (!isStation) placeIndex++;

    const markerContent = `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${isStation ? "#1a2e2b" : "linear-gradient(135deg, #3db89e, #2fa38a)"};
        border: 2.5px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isStation ? "14px" : "13px"};
        font-weight: 900;
        color: #fff;
        font-family: sans-serif;
      ">${label}</div>
    `;

    const customOverlay = new (window as any).kakao.maps.CustomOverlay({
      position,
      content: markerContent,
      yAnchor: 0.5,
      xAnchor: 0.5,
    });
    customOverlay.setMap(mapObject);
    markers.push(customOverlay);
    bounds.extend(position);
  });

  // 각 장소 간 구간별 폴리라인 렌더링
  for (let i = 0; i < places.length - 1; i++) {
    const cur = places[i];
    const routePath = cur.nextTransport?.routePath;

    let segmentPath: any[];
    if (routePath && routePath.length > 1) {
      segmentPath = routePath.map(
        ([lat, lng]) => new (window as any).kakao.maps.LatLng(lat, lng),
      );
    } else {
      segmentPath = [
        new (window as any).kakao.maps.LatLng(cur.lat, cur.lng),
        new (window as any).kakao.maps.LatLng(
          places[i + 1].lat,
          places[i + 1].lng,
        ),
      ];
    }

    const polyline = new (window as any).kakao.maps.Polyline({
      path: segmentPath,
      strokeWeight: 5,
      strokeColor: "#2fa38a",
      strokeOpacity: 0.85,
      strokeStyle: "solid",
    });
    polyline.setMap(mapObject);
    polylineObjects.push(polyline);
  }

  if (places.length > 0) {
    mapObject.setBounds(bounds);
  }
}

watch(
  [activeTab, currentPlaces],
  () => {
    setTimeout(() => {
      renderCourseElementsOnMap();
    }, 100);
  },
  { deep: true },
);

onMounted(async () => {
  courses.value = courseStore.generatedCourses.map(withFixedStationStops);
  courseStore.setCourses(courses.value, courseStore.lastRequest ?? undefined);

  if (courses.value.length === 0) {
    router.push("/");
  }

  allDiPlaces.value = await fetchDiPlaces();
  if (!document.getElementById("kakao-map-script")) {
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_KEY}&autoload=false`;
    document.head.appendChild(script);
    script.onload = () => {
      (window as any).kakao.maps.load(() => {
        initKakaoMap();
      });
    };
  } else {
    initKakaoMap();
  }
});

function toggleLock(idx: number) {
  if (idx === 0 || idx === currentPlaces.value.length - 1) return;
  currentPlaces.value[idx].isLocked = !currentPlaces.value[idx].isLocked;
}

const draggingIndex = ref(-1);
const dragOverIndex = ref(-1);

function onDragStart(idx: number) {
  draggingIndex.value = idx;
}

function onDragOver(idx: number) {
  if (idx === 0 || idx === currentPlaces.value.length - 1) return;
  if (draggingIndex.value === idx) return;
  dragOverIndex.value = idx;
}

async function onDrop(idx: number) {
  const from = draggingIndex.value;
  draggingIndex.value = -1;
  dragOverIndex.value = -1;
  if (
    from < 1 ||
    from === idx ||
    idx === 0 ||
    idx === currentPlaces.value.length - 1
  )
    return;
  const places = currentPlaces.value;
  const moved = places.splice(from, 1)[0];
  places.splice(idx, 0, moved);
  await recalculateCurrentCourse();
}

function onDragEnd() {
  draggingIndex.value = -1;
  dragOverIndex.value = -1;
}

function openSearchMode() {
  searchKeyword.value = "";
  selectedCategory.value = "";
  panelMode.value = "search";
}

async function addPlaceToCourse(scannedPlace: any) {
  if (currentPlaces.value.some((p) => p.id === scannedPlace.id)) {
    alert("이미 코스에 추가된 장소입니다.");
    return;
  }

  const insertIndex = Math.max(1, currentPlaces.value.length - 1);
  currentPlaces.value.splice(insertIndex, 0, {
    ...scannedPlace,
    stayTime: "45분",
    isLocked: false,
  });
  panelMode.value = "main";
  clearPreviewMarker();
  await recalculateCurrentCourse();
}

async function removePlace(idx: number) {
  if (idx === 0 || idx === currentPlaces.value.length - 1) return;
  currentPlaces.value.splice(idx, 1);
  await recalculateCurrentCourse();
}

async function finishEdit() {
  isSaving.value = true;
  await recalculateCurrentCourse();
  isSaving.value = false;
  isEditing.value = false;
}

async function confirmCourse() {
  if (!courseStore.lastRequest) {
    alert("코스 정보가 없습니다. 다시 생성해주세요.");
    return;
  }
  isSaving.value = true;
  try {
    const places = currentPlaces.value
      .filter(
        (p) =>
          p.category !== "STATION" &&
          !p.id.startsWith("__STATION") &&
          !p.id.startsWith("STATION_") &&
          p.lat &&
          p.lng,
      )
      .map((p, idx) => ({
        placeId: p.id,
        orderIndex: idx,
        travelTimeMin: p.nextTransport
          ? parseInt(p.nextTransport.taxiTime) || undefined
          : undefined,
      }));
    await saveCourse(courseStore.lastRequest, places);
    courseStore.setConfirmed();
    stampStore.clearActiveCourse();
    router.push("/stamp-tour");
  } catch {
    alert("저장에 실패했습니다. 로그인 상태를 확인해주세요.");
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div
    class="w-full h-[calc(100vh-64px)] flex overflow-hidden font-sans bg-[#fbfefe]"
  >
    <div
      class="w-[450px] h-full flex flex-col shrink-0 bg-white border-r border-teal-100 shadow-xl z-10 relative"
    >
      <template v-if="panelMode === 'main'">
        <div class="bg-white">
          <div class="p-6 pb-2 flex items-center justify-between">
            <div>
              <p
                class="text-[0.68rem] text-teal-600 font-extrabold tracking-wide uppercase mb-0.5"
              >
                레이오버 AI가 추천하는
              </p>
              <h1 class="text-xl font-black text-[#1a2e2b] tracking-tight">
                추천 대전 환승 여행
              </h1>
            </div>
            <button
              class="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
              :style="{
                background: isEditing ? '#2fa38a' : '#E8F8F5',
                color: isEditing ? '#fff' : '#2fa38a',
                borderColor: isEditing ? '#2fa38a' : '#d1ebe6',
              }"
              :disabled="isRecalculating"
              @click="isEditing ? finishEdit() : (isEditing = true)"
            >
              <Check v-if="isEditing" :size="13" />
              <Edit2 v-else :size="13" />
              {{ isRecalculating ? "계산 중..." : isEditing ? "완료" : "편집" }}
            </button>
          </div>

          <div class="px-6 flex border-b border-gray-200">
            <button
              v-for="(course, idx) in courses"
              :key="course.id"
              @click="activeTab = idx"
              class="flex-1 py-3 text-center relative group transition-opacity"
              :class="
                activeTab === idx
                  ? 'opacity-100'
                  : 'opacity-40 hover:opacity-70'
              "
              :disabled="isEditing"
            >
              <div
                class="text-xs font-black transition-colors"
                :class="activeTab === idx ? 'text-teal-600' : 'text-gray-500'"
              >
                {{ course.title }}
              </div>
              <div
                class="text-[0.62rem] font-medium mt-0.5 transition-colors line-clamp-1"
                :class="
                  activeTab === idx ? 'text-teal-500/80' : 'text-gray-400'
                "
              >
                {{ course.subTitle }}
              </div>
              <div
                class="absolute bottom-0 left-0 right-0 h-[3px] transition-all"
                :class="
                  activeTab === idx
                    ? 'bg-teal-500 scale-x-100'
                    : 'bg-transparent scale-x-0'
                "
              />
            </button>
          </div>
        </div>

        <div
          class="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin bg-white"
        >
          <!-- 코스 3 홍보 배너 -->
          <div
            v-if="activeTab === 2"
            class="rounded-2xl overflow-hidden shadow-sm"
          >
            <div
              class="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-400 px-5 py-4"
            >
              <p
                class="text-white font-black text-sm tracking-tight drop-shadow-sm"
              >
                ⏱ 1시간만 더 있다면?
              </p>
              <p
                class="text-teal-50 text-xs font-medium mt-1 leading-relaxed opacity-90"
              >
                잔여시간을 1시간 늘리면 더 많은 곳을 즐길 수 있어요
              </p>
            </div>
          </div>

          <div
            class="flex items-center justify-between pb-4 border-b border-gray-100/80 px-1"
          >
            <div class="flex items-center gap-2">
              <Clock :size="18" class="text-teal-600 shrink-0" />
              <div>
                <p
                  class="text-[0.62rem] text-gray-400 font-bold uppercase tracking-wider"
                >
                  총 예상 소요 시간
                </p>
                <p class="text-base font-black text-teal-700 tracking-tight">
                  {{ calculatedTime }}
                </p>
              </div>
            </div>
            <div class="h-8 w-[1px] bg-gray-200" />
            <div class="flex items-center gap-2 text-right">
              <div class="text-right">
                <p
                  class="text-[0.62rem] text-gray-400 font-bold uppercase tracking-wider"
                >
                  예상 총 지출
                </p>
                <p class="text-base font-black text-teal-700 tracking-tight">
                  {{ calculatedCost }}
                </p>
              </div>
              <span
                class="text-base shrink-0 bg-teal-50 w-7 h-7 rounded-lg flex items-center justify-center border border-teal-100"
                >💰</span
              >
            </div>
          </div>

          <div class="relative pl-1 space-y-1">
            <template
              v-for="(place, idx) in currentPlaces"
              :key="
                idx === 0 || idx === currentPlaces.length - 1
                  ? `${place.id}_${idx}`
                  : place.id
              "
            >
              <div
                class="relative flex items-center gap-4 py-4 px-4 rounded-2xl border-2 bg-white transition-all shadow-2xs"
                :class="[
                  idx === 0 || idx === currentPlaces.length - 1
                    ? 'bg-teal-50/20 border-teal-300/80'
                    : 'border-[#e6f4f1]',
                  draggingIndex === idx ? 'opacity-40' : '',
                  dragOverIndex === idx
                    ? 'ring-2 ring-teal-400 ring-offset-1'
                    : '',
                  isEditing && idx !== 0 && idx !== currentPlaces.length - 1
                    ? 'cursor-grab active:cursor-grabbing'
                    : '',
                ]"
                :style="
                  place.isLocked &&
                  isEditing &&
                  idx !== 0 &&
                  idx !== currentPlaces.length - 1
                    ? { borderColor: '#2fa38a' }
                    : {}
                "
                :draggable="
                  isEditing && idx !== 0 && idx !== currentPlaces.length - 1
                "
                @dragstart="
                  isEditing &&
                  idx !== 0 &&
                  idx !== currentPlaces.length - 1 &&
                  onDragStart(idx)
                "
                @dragover.prevent="onDragOver(idx)"
                @drop.prevent="onDrop(idx)"
                @dragend="onDragEnd"
              >
                <div
                  v-if="idx === 0 || idx === currentPlaces.length - 1"
                  class="w-6 h-6 rounded-full flex items-center justify-center bg-teal-700 text-white shrink-0 ring-4 ring-teal-50 shadow-sm"
                >
                  <Train :size="11" />
                </div>
                <div
                  v-else
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ring-4 ring-teal-50"
                  style="background: linear-gradient(135deg, #a4dbd1, #2fa38a)"
                >
                  {{ idx }}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <p
                      class="font-black text-sm text-[#1a2e2b] truncate"
                      :class="{
                        'text-teal-800 font-black':
                          idx === 0 || idx === currentPlaces.length - 1,
                      }"
                    >
                      {{ place.name }}
                    </p>
                    <span
                      v-if="idx === 0 || idx === currentPlaces.length - 1"
                      class="text-[0.65rem] text-teal-600 font-black px-1.5 py-0.5 rounded-md border border-teal-200 bg-teal-50/50"
                      >환승 게이트</span
                    >
                  </div>

                  <div
                    class="flex items-center gap-1.5 mt-2"
                    v-if="idx !== 0 && idx !== currentPlaces.length - 1"
                  >
                    <span
                      class="px-2 py-0.5 rounded-md text-[0.65rem] bg-gray-100 text-gray-600 font-bold border border-gray-200/60"
                      >{{ place.category }}</span
                    >
                    <span
                      v-if="place.waitingTime"
                      class="px-2 py-0.5 rounded-md text-[0.65rem] bg-amber-50 text-amber-700 font-black border border-amber-200"
                      >⏳ 대기 {{ place.waitingTime }}</span
                    >
                  </div>
                </div>

                <div
                  v-if="
                    !isEditing &&
                    place.isLocked &&
                    idx !== 0 &&
                    idx !== currentPlaces.length - 1
                  "
                  class="text-teal-600 p-1.5 bg-teal-50 rounded-lg border border-teal-100 shrink-0 animate-fade-in"
                >
                  <Lock :size="13" />
                </div>

                <template
                  v-if="
                    isEditing && idx !== 0 && idx !== currentPlaces.length - 1
                  "
                >
                  <button
                    class="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-500 border border-red-100 shrink-0"
                    @click="removePlace(idx)"
                  >
                    <X :size="12" />
                  </button>
                  <div
                    class="p-1 text-gray-300 hover:text-teal-500 shrink-0 cursor-grab active:cursor-grabbing"
                    title="드래그하여 순서 변경"
                  >
                    <GripVertical :size="16" />
                  </div>
                </template>
              </div>

              <div
                v-if="place.nextTransport && idx < currentPlaces.length - 1"
                class="flex items-center gap-4 py-2.5 pl-[12px]"
              >
                <div class="w-[2px] h-10 bg-teal-200/70" />
                <div
                  class="flex-1 flex items-center justify-between pr-4 pl-1 text-[0.7rem] font-bold"
                >
                  <div class="flex items-center gap-1 text-gray-500">
                    <Footprints :size="12" class="text-gray-400" />
                    <span
                      >도보
                      <span class="text-gray-700 font-extrabold">{{
                        place.nextTransport.walkTime
                      }}</span></span
                    >
                  </div>
                  <div class="flex items-center gap-1 text-blue-600">
                    <Bus :size="12" class="text-blue-400" />
                    <span
                      >버스
                      <span class="text-blue-800 font-extrabold">{{
                        place.nextTransport.busTime
                      }}</span></span
                    >
                  </div>
                  <div class="flex items-center gap-1 text-teal-600">
                    <Car :size="12" class="text-teal-500" />
                    <span
                      >택시
                      <span class="text-teal-800 font-black">{{
                        place.nextTransport.taxiTime
                      }}</span></span
                    >
                    <span class="text-[0.65rem] text-teal-600/80 font-medium"
                      >({{
                        place.nextTransport.taxiFare.toLocaleString()
                      }}원)</span
                    >
                  </div>
                </div>
              </div>
            </template>

            <button
              v-if="isEditing"
              class="w-full py-3 rounded-2xl flex items-center justify-center gap-1.5 mt-4 border-2 border-dashed border-teal-300 text-teal-700 font-black text-xs bg-transparent hover:bg-teal-50/20"
              :disabled="isRecalculating"
              @click="openSearchMode"
            >
              <Plus :size="14" /> 코스 사이에 장소 끼워넣기 (지도 연동)
            </button>
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 bg-white">
          <button
            class="w-full py-3.5 rounded-xl flex items-center justify-center gap-1 font-black text-xs text-white shadow-md"
            style="background: linear-gradient(135deg, #b2e4dc, #2fa38a)"
            @click="confirmCourse"
            :disabled="isSaving"
          >
            {{ isSaving ? "저장 중..." : "코스 최종 확정하기" }}
            <ChevronRight :size="14" />
          </button>
        </div>
      </template>

      <template v-else-if="panelMode === 'search'">
        <div
          class="p-6 pb-4 border-b border-teal-200 bg-gradient-to-br from-[#E8F8F5]/30 to-white"
        >
          <button
            @click="
              panelMode = 'main';
              clearPreviewMarker();
            "
            class="flex items-center gap-1 text-xs font-black text-gray-400 hover:text-gray-600 mb-3"
          >
            <ArrowLeft :size="14" /> 타임라인으로 돌아가기
          </button>
          <h2 class="text-base font-black text-[#1a2e2b]">
            지도에서 장소 검색
          </h2>
          <div class="relative mt-3">
            <Search
              :size="14"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-500"
            />
            <input
              v-model="searchKeyword"
              class="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-teal-100 text-xs text-[#1a2e2b] outline-none bg-gray-50/50 focus:bg-white focus:border-teal-400 font-bold"
              placeholder="추가할 대전 명소 검색..."
            />
          </div>
          <div class="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
            <button
              v-for="cat in categories"
              :key="cat.key"
              @click="selectedCategory = cat.key"
              class="px-2.5 py-1 rounded-lg text-[0.68rem] font-black border transition-all"
              :class="
                selectedCategory === cat.key
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-400 border-gray-200'
              "
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div
          class="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin bg-gray-50/20"
        >
          <div
            v-for="item in filteredSearchResults"
            :key="item.id"
            class="p-4 rounded-2xl bg-white border border-teal-200 hover:border-teal-500 transition-all flex flex-col shadow-3xs cursor-pointer"
            @click="showPreviewMarker(item.lat, item.lng)"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="flex-1 min-w-0">
                <h4 class="font-black text-sm text-[#1a2e2b]">
                  {{ item.name }}
                </h4>
                <p
                  class="text-[0.72rem] text-gray-400 font-medium leading-relaxed mt-1.5"
                >
                  {{ item.desc }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-1.5 shrink-0">
                <span
                  class="text-[0.62rem] font-black text-teal-700 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-100"
                  >{{ item.category }}</span
                >
                <button
                  @click.stop="addPlaceToCourse(item)"
                  class="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-black text-xs transition-all flex items-center gap-0.5"
                >
                  <Plus :size="12" /> 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="flex-1 h-full relative bg-[#e5e9f0]">
      <div id="kakao-render-map" class="w-full h-full"></div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(178, 228, 220, 0.5);
  border-radius: 10px;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateX(5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}
</style>
