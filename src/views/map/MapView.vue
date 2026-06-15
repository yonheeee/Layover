<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  MapPin,
  Clock,
  ChevronRight,
  Edit2,
  Check,
  X,
  Plus,
  Search,
  Footprints,
  Bus,
  Car,
  Share2,
  RefreshCw,
  ArrowLeft,
  Train,
  Lock,
  Unlock,
} from "lucide-vue-next";
import type { Course, DiPlace } from "@/types/course";
import { fetchMapCourses, fetchDiPlaces } from "@/api/courses";

// 카카오 지도 객체 타입 정의
declare global {
  interface window {
    kakao: any;
  }
}

const courses = ref<Course[]>([]);

const activeTab = ref(0);
const currentCourse = computed(() => courses.value[activeTab.value]);
const currentPlaces = computed(() => currentCourse.value.places);

const calculatedCost = computed(() => {
  let basePrice = 0;
  currentPlaces.value.forEach((p) => {
    if (p.category.includes("맛집")) basePrice += 10000;
    if (p.category.includes("카페")) basePrice += 5000;
    if (p.nextTransport) basePrice += p.nextTransport.taxiFare;
  });
  return `약 ${basePrice.toLocaleString()}원`;
});

const calculatedTime = computed(() => {
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
const isRegenerating = ref(false);
const panelMode = ref<"main" | "search">("main");
const searchKeyword = ref("");
const selectedCategory = ref("전체");
const categories = [
  "전체",
  "🍞 맛집/빵집",
  "☕ 카페",
  "🌿 관광명소",
  "🏛 문화/예술",
];

const allDiPlaces = ref<DiPlace[]>([]);

const filteredSearchResults = computed(() => {
  return allDiPlaces.value.filter((p) => {
    const matchesKeyword = p.name.includes(searchKeyword.value);
    const matchesCategory =
      selectedCategory.value === "전체" ||
      p.category === selectedCategory.value;
    return matchesKeyword && matchesCategory;
  });
});

// [카카오 지도 엔진 인터랙션 데이터]
let mapObject: any = null;
let markers: any[] = [];
let polylineObject: any = null;

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
  if (polylineObject) polylineObject.setMap(null);

  const linePath: any[] = [];
  const bounds = new (window as any).kakao.maps.LatLngBounds();

  currentPlaces.value.forEach((place) => {
    const position = new (window as any).kakao.maps.LatLng(
      place.lat,
      place.lng,
    );
    linePath.push(position);

    const marker = new (window as any).kakao.maps.Marker({
      position: position,
      clickable: true,
    });
    marker.setMap(mapObject);
    markers.push(marker);
    bounds.extend(position);
  });

  polylineObject = new (window as any).kakao.maps.Polyline({
    path: linePath,
    strokeWeight: 5,
    strokeColor: "#2fa38a",
    strokeOpacity: 0.85,
    strokeStyle: "solid",
  });
  polylineObject.setMap(mapObject);

  if (currentPlaces.value.length > 0) {
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
  [courses.value, allDiPlaces.value] = await Promise.all([
    fetchMapCourses(),
    fetchDiPlaces(),
  ]);
  if (!document.getElementById("kakao-map-script")) {
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&autoload=false";
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

function openSearchMode() {
  searchKeyword.value = "";
  selectedCategory.value = "전체";
  panelMode.value = "search";
}

function addPlaceToCourse(scannedPlace: any) {
  const insertIndex = currentPlaces.value.length - 1;
  currentPlaces.value[insertIndex - 1].nextTransport = {
    walkTime: "12분",
    busTime: "7분",
    taxiTime: "4분",
    taxiFare: 4200,
  };
  currentPlaces.value.splice(insertIndex, 0, {
    ...scannedPlace,
    stayTime: "45분",
    isLocked: false,
    nextTransport: {
      walkTime: "10분",
      busTime: "6분",
      taxiTime: "3분",
      taxiFare: 3800,
    },
  });
  panelMode.value = "main";
}

function removePlace(idx: number) {
  if (idx === 0 || idx === currentPlaces.value.length - 1) return;
  currentPlaces.value.splice(idx, 1);
}

async function finishEdit() {
  isSaving.value = true;
  await new Promise((r) => setTimeout(r, 400));
  isSaving.value = false;
  isEditing.value = false;
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
                AI 레이오버 추천 결과
              </p>
              <h1 class="text-xl font-black text-[#1a2e2b] tracking-tight">
                나의 대전 환승 코스
              </h1>
            </div>
            <button
              class="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
              :style="{
                background: isEditing ? '#2fa38a' : '#E8F8F5',
                color: isEditing ? '#fff' : '#2fa38a',
                borderColor: isEditing ? '#2fa38a' : '#d1ebe6',
              }"
              @click="isEditing ? finishEdit() : (isEditing = true)"
            >
              <Check v-if="isEditing" :size="13" />
              <Edit2 v-else :size="13" />
              {{ isEditing ? "완료" : "편집" }}
            </button>
          </div>

          <div class="px-6 flex border-b border-gray-200">
            <button
              v-for="(course, idx) in courses"
              :key="course.id"
              @click="activeTab = idx"
              class="flex-1 py-3 text-center relative group"
              :disabled="isEditing"
            >
              <div
                class="text-xs font-black transition-colors"
                :class="
                  activeTab === idx
                    ? 'text-teal-600'
                    : 'text-gray-400 group-hover:text-gray-600'
                "
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
          <div
            class="flex items-center justify-between pb-4 border-b border-gray-100/80 px-1"
          >
            <div class="flex items-center gap-2">
              <Clock :size="18" class="text-teal-600 shrink-0" />
              <div>
                <p
                  class="text-[0.62rem] text-gray-400 font-bold uppercase tracking-wider"
                >
                  총 소요 시간
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
            <template v-for="(place, idx) in currentPlaces" :key="place.id">
              <div
                class="relative flex items-center gap-4 py-4 px-4 rounded-2xl border-2 bg-white transition-all shadow-2xs"
                :class="
                  idx === 0 || idx === currentPlaces.length - 1
                    ? 'bg-teal-50/20 border-teal-300/80'
                    : 'border-[#e6f4f1]'
                "
                :style="
                  place.isLocked &&
                  isEditing &&
                  idx !== 0 &&
                  idx !== currentPlaces.length - 1
                    ? { borderColor: '#2fa38a' }
                    : {}
                "
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
                      v-if="idx !== 0 && idx !== currentPlaces.length - 1"
                      class="text-[0.68rem] text-teal-700 font-extrabold bg-teal-50 px-1.5 py-0.5 rounded-md shrink-0"
                      >⏱ {{ place.stayTime }}</span
                    >
                    <span
                      v-else
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
                    class="p-2 rounded-xl border transition-all shadow-3xs"
                    :class="
                      place.isLocked
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    "
                    @click="toggleLock(idx)"
                  >
                    <Lock v-if="place.isLocked" :size="13" />
                    <Unlock v-else :size="13" />
                  </button>
                  <button
                    class="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-500 border border-red-100"
                    @click="removePlace(idx)"
                  >
                    <X :size="12" />
                  </button>
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
              @click="openSearchMode"
            >
              <Plus :size="14" /> 코스 사이에 장소 끼워넣기 (지도 연동)
            </button>
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 bg-white flex gap-3">
          <button
            class="px-4 py-3.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs bg-gray-50 border border-gray-200 text-gray-500"
          >
            <Share2 :size="14" /> 공유
          </button>
          <button
            class="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-1 font-black text-xs text-white shadow-md"
            style="background: linear-gradient(135deg, #b2e4dc, #2fa38a)"
          >
            코스 최종 확정하기 <ChevronRight :size="14" />
          </button>
        </div>
      </template>

      <template v-else-if="panelMode === 'search'">
        <div
          class="p-6 pb-4 border-b border-teal-200 bg-gradient-to-br from-[#E8F8F5]/30 to-white"
        >
          <button
            @click="panelMode = 'main'"
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
              :key="cat"
              @click="selectedCategory = cat"
              class="px-2.5 py-1 rounded-lg text-[0.68rem] font-black border transition-all"
              :class="
                selectedCategory === cat
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-400 border-gray-200'
              "
            >
              {{ cat.split(" ")[1] || cat }}
            </button>
          </div>
        </div>

        <div
          class="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin bg-gray-50/20"
        >
          <div
            v-for="item in filteredSearchResults"
            :key="item.id"
            class="p-4 rounded-2xl bg-white border border-teal-200 hover:border-teal-500 transition-all flex flex-col shadow-3xs"
          >
            <div class="flex justify-between items-start gap-1">
              <h4 class="font-black text-sm text-[#1a2e2b]">{{ item.name }}</h4>
              <span
                class="text-[0.62rem] font-black text-teal-700 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-100"
                >{{ item.category }}</span
              >
            </div>
            <p
              class="text-[0.72rem] text-gray-400 font-medium leading-relaxed mt-1.5"
            >
              {{ item.desc }}
            </p>
            <div
              class="flex items-center justify-between pt-3 mt-3 border-t border-dashed border-gray-100"
            >
              <span
                class="text-[0.68rem] text-gray-500 font-bold flex items-center gap-0.5"
                ><MapPin :size="11" class="text-teal-400" />
                {{ item.latLng }}</span
              >
              <button
                @click="addPlaceToCourse(item)"
                class="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-black text-xs transition-all flex items-center gap-0.5"
              >
                <Plus :size="12" /> 추가
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="flex-1 h-full relative bg-[#e5e9f0]">
      <div id="kakao-render-map" class="w-full h-full"></div>

      <div
        class="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-teal-200 shadow-md text-[0.68rem] font-bold text-teal-800 z-20 flex items-center gap-1.5"
      >
        <span
          class="inline-block w-2 h-2 rounded-full bg-teal-500 animate-ping"
        ></span>
        <span>실시간 카카오 지도 동선 트래커 가동 중</span>
      </div>
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
