<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  MapPin,
  Train,
  ChevronRight,
  Navigation,
  Users,
  CloudSun,
} from "lucide-vue-next";
import PlaceDetailContent from "../place/PlaceDetailContents.vue";
import StampEventSection from "@/components/home/StampEventSection.vue";
import CtaBannerSection from "@/components/home/CtaBannerSection.vue";
import RecommendedSpotsSection from "@/components/home/RecommendedSpotsSection.vue";
import PopularCoursesSection from "@/components/home/PopularCoursesSection.vue";
import type { Place } from "@/types/place";
import type { Train as TrainType } from "@/types/train";
import { fetchPlaces } from "@/api/places";
import { fetchTrains } from "@/api/trains";

const router = useRouter();
const auth = useAuthStore();

function checkLogin(): boolean {
  if (!auth.isLoggedIn) {
    alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
    router.push("/login");
    return false;
  }
  return true;
}

const trainMap = ref<Record<string, TrainType[]>>({});

const CATEGORY_FILTERS = [
  { key: "food", label: "음식", emoji: "🍜" },
  { key: "cafe", label: "카페", emoji: "☕" },
  { key: "culture", label: "문화", emoji: "🏛" },
  { key: "nature", label: "자연", emoji: "🌿" },
  { key: "shopping", label: "쇼핑", emoji: "🛍" },
];

const STATION_OPTIONS = [
  { value: "daejeon", label: "대전역" },
  { value: "seo-daejeon", label: "서대전역" },
  { value: "sintanjin", label: "신탄진역" },
];

const spots = ref<Place[]>([]);

const selectedStation = ref("daejeon");
const selectedTrain = ref("");
const selectedFilters = ref<string[]>([]);
const likedSpots = ref<number[]>([]);
const isTrainModalOpen = ref(false);
const useWeather = ref(false);
const searchMode = ref<"train" | "stay">("train");
const stayDuration = ref<number | string>("");
const travelDate = ref<string>("");
function selectStation(value: string) {
  selectedStation.value = value;
  selectedTrain.value = "";
}

function toggleFilter(key: string) {
  const idx = selectedFilters.value.indexOf(key);
  if (idx >= 0) selectedFilters.value.splice(idx, 1);
  else selectedFilters.value.push(key);
}

// 🌟 [수정] 2. 명소 찜하기(하트) 비로그인 가로채기 적용
function toggleLike(id: number) {
  if (!checkLogin()) return; // 비로그인이면 아래 로직 안 타고 리턴
  const idx = likedSpots.value.indexOf(id);
  if (idx >= 0) likedSpots.value.splice(idx, 1);
  else likedSpots.value.push(id);
}

// 🌟 [추가] 1. 히어로 섹션 '코스 추천받기' 핸들러
function handleRecommendCourse() {
  if (!checkLogin()) return;
  alert("맞춤 환승 코스를 생성합니다!");
  // 기존 코스 추천 프로세스 로직 실행 영역
}

function toggleAccordion() {
  isTrainModalOpen.value = !isTrainModalOpen.value;
}

function getSelectedTrainDetails() {
  if (!selectedTrain.value) return null;
  const trainList = trainMap.value[selectedStation.value] || [];
  const train = trainList.find((t) => t.id === selectedTrain.value);
  if (!train) return null;
  const stationLabel =
    STATION_OPTIONS.find((s) => s.value === selectedStation.value)?.label || "";
  return {
    station: stationLabel,
    name: train.name,
    depart: train.depart,
    remaining: "2시간 15분",
  };
}

onMounted(async () => {
  [spots.value, trainMap.value] = await Promise.all([
    fetchPlaces(),
    fetchTrains(),
  ]);
});

const selectedSpotForModal = ref<Place | null>(null);

function openSpotModal(spot: Place) {
  selectedSpotForModal.value = spot;
}

function closeSpotModal() {
  selectedSpotForModal.value = null;
}
</script>

<template>
  <section
    class="hero-section flex items-start md:items-center justify-center relative"
  >
    <div
      class="absolute pointer-events-none"
      style="
        z-index: 0;
        top: -100px;
        right: -100px;
        width: 450px;
        height: 450px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(178, 228, 220, 0.35),
          transparent 70%
        );
      "
    />
    <div
      class="absolute pointer-events-none"
      style="
        z-index: 0;
        bottom: -80px;
        left: -80px;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(61, 184, 158, 0.15),
          transparent 70%
        );
      "
    />

    <div
      class="mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 items-center gap-12"
      style="max-width: 1440px; z-index: 1"
    >
      <div class="space-y-6 w-full">
        <div
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style="background: #e8f8f5; color: #3db89e; font-weight: 600"
        >
          <Train :size="14" /> KTX 환승 여행 가이드
        </div>
        <h1
          :style="{
            fontFamily: '\'Noto Sans KR\', sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
            color: '#1a2e2b',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }"
        >
          대기 시간을<br /><span style="color: #3db89e">여행으로</span> 채우세요
        </h1>
        <p
          style="
            font-size: 1.05rem;
            color: #6b8c87;
            line-height: 1.8;
            max-width: 480px;
          "
        >
          KTX 환승 대기 시간, 그냥 역에서 기다리지 마세요.<br />
          대전의 숨은 명소를 시간에 맞게 똑똑하게 즐겨보세요.
        </p>
        <div class="flex gap-8 pt-2">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <MapPin :size="15" color="#3db89e" /><span
                style="font-weight: 700; font-size: 1.2rem; color: #1a2e2b"
                >50+</span
              >
            </div>
            <span style="font-size: 0.78rem; color: #6b8c87">대전 관광지</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <Users :size="15" color="#3db89e" /><span
                style="font-weight: 700; font-size: 1.2rem; color: #1a2e2b"
                >12,000+</span
              >
            </div>
            <span style="font-size: 0.78rem; color: #6b8c87">여행자 후기</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <Navigation :size="15" color="#3db89e" /><span
                style="font-weight: 700; font-size: 1.2rem; color: #1a2e2b"
                >3분</span
              >
            </div>
            <span style="font-size: 0.78rem; color: #6b8c87">코스 생성</span>
          </div>
        </div>
      </div>

      <div class="w-full flex justify-center md:justify-center">
        <div class="w-full max-w-[460px] transition-all duration-300">
          <h2
            style="
              font-size: 1.4rem;
              font-weight: 800;
              color: #1a2e2b;
              margin-bottom: 24px;
              letter-spacing: -0.02em;
            "
          >
            맞춤 코스 찾기
          </h2>
          <div class="mb-6">
            <p
              style="
                font-size: 0.82rem;
                font-weight: 700;
                color: #6b8c87;
                letter-spacing: 0.04em;
                margin-bottom: 10px;
              "
            >
              일정 정보
            </p>
            <div
              class="overflow-hidden transition-all duration-300"
              style="background: transparent"
            >
              <button
                type="button"
                class="w-full flex items-center justify-between py-3 transition-all duration-200 text-left"
                style="background: transparent; border: none"
                @click="toggleAccordion"
              >
                <div class="flex items-start gap-2.5 flex-1 min-w-0 pr-4">
                  <Train
                    :size="16"
                    color="#3db89e"
                    class="mt-1 flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <template
                      v-if="
                        searchMode === 'train' &&
                        selectedTrain &&
                        getSelectedTrainDetails()
                      "
                    >
                      <div class="w-full flex items-center justify-between">
                        <div class="flex flex-col gap-1.5 flex-shrink-0">
                          <span
                            style="
                              font-weight: 500;
                              color: #6b8c87;
                              font-size: 0.85rem;
                              line-height: 1.2;
                            "
                          >
                            🚂 {{ getSelectedTrainDetails()?.station }} —
                            {{ getSelectedTrainDetails()?.name }}
                          </span>
                          <span
                            style="
                              font-size: 0.85rem;
                              color: #1a2e2b;
                              font-weight: 500;
                              line-height: 1.2;
                            "
                          >
                            🛫 출발:
                            <span style="font-weight: 700">{{
                              getSelectedTrainDetails()?.depart
                            }}</span>
                          </span>
                        </div>
                        <div
                          class="flex flex-col items-end justify-center pl-4"
                          style="border-left: 1px solid #eef7f5; height: 34px"
                        >
                          <span
                            style="
                              font-size: 0.75rem;
                              color: #6b8c87;
                              font-weight: 600;
                              margin-bottom: 1px;
                              white-space: nowrap;
                            "
                            >대기 시간</span
                          >
                          <span
                            style="
                              font-size: 1.15rem;
                              color: #3db89e;
                              font-weight: 800;
                              line-height: 1;
                              white-space: nowrap;
                            "
                          >
                            {{ getSelectedTrainDetails()?.remaining }}
                          </span>
                        </div>
                      </div>
                    </template>
                    <template v-else-if="searchMode === 'stay' && stayDuration">
                      <span
                        style="
                          font-weight: 700;
                          color: #3db89e;
                          font-size: 0.95rem;
                        "
                      >
                        {{
                          STATION_OPTIONS.find(
                            (s) => s.value === selectedStation,
                          )?.label
                        }}
                        — {{ stayDuration }}시간 체류 선택됨
                      </span>
                    </template>
                    <template v-else>
                      <span
                        style="
                          color: #9ca3af;
                          font-weight: 600;
                          font-size: 0.95rem;
                        "
                        >일정을 등록해주세요</span
                      >
                    </template>
                  </div>
                </div>
                <ChevronRight
                  :size="16"
                  :style="{
                    transform: isTrainModalOpen
                      ? 'rotate(270deg)'
                      : 'rotate(90deg)',
                    color: '#6b8c87',
                    transition: 'transform 0.2s ease',
                  }"
                  class="flex-shrink-0"
                />
              </button>

              <div
                v-if="isTrainModalOpen"
                class="pt-2 pb-4"
                style="background: transparent"
              >
                <div class="mb-6">
                  <p
                    style="
                      font-size: 0.78rem;
                      font-weight: 600;
                      color: #6b8c87;
                      margin-bottom: 8px;
                    "
                  >
                    여행 날짜
                  </p>
                  <input
                    type="date"
                    v-model="travelDate"
                    class="w-full px-3 py-2.5"
                    style="
                      border: 1.5px solid rgba(178, 228, 220, 0.6);
                      border-radius: 6px;
                      color: #1a2e2b;
                      background: #ffffff;
                      outline: none;
                      font-size: 0.85rem;
                      font-weight: 500;
                    "
                  />
                </div>
                <div class="mb-6">
                  <p
                    style="
                      font-size: 0.78rem;
                      font-weight: 600;
                      color: #6b8c87;
                      margin-bottom: 8px;
                    "
                  >
                    출발역 선택
                  </p>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="s in STATION_OPTIONS"
                      :key="s.value"
                      type="button"
                      class="flex items-center justify-center py-2.5 transition-all duration-200"
                      :style="{
                        borderRadius: '6px',
                        border:
                          selectedStation === s.value
                            ? '1.5px solid #3db89e'
                            : '1.5px solid rgba(178,228,220,0.5)',
                        background:
                          selectedStation === s.value ? '#E8F8F5' : '#ffffff',
                        color:
                          selectedStation === s.value ? '#3db89e' : '#6b8c87',
                        fontWeight: selectedStation === s.value ? 700 : 500,
                        fontSize: '0.85rem',
                      }"
                      @click="selectStation(s.value)"
                    >
                      {{ s.label }}
                    </button>
                  </div>
                </div>
                <div
                  class="flex items-end px-1"
                  style="border-bottom: 2px solid #eef7f5"
                >
                  <button
                    type="button"
                    class="px-4 py-2 text-xs transition-all duration-200"
                    :style="{
                      background:
                        searchMode === 'train' ? '#ffffff' : 'transparent',
                      color: searchMode === 'train' ? '#3db89e' : '#8fa19e',
                      fontWeight: searchMode === 'train' ? 700 : 500,
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      border:
                        searchMode === 'train'
                          ? '2px solid #eef7f5'
                          : '2px solid transparent',
                      borderBottom:
                        searchMode === 'train'
                          ? '2px solid #ffffff'
                          : '2px solid transparent',
                      marginBottom: '-2px',
                      zIndex: searchMode === 'train' ? 2 : 1,
                    }"
                    @click="searchMode = 'train'"
                  >
                    기차시간 기준 입력
                  </button>
                  <button
                    type="button"
                    class="px-4 py-2 text-xs transition-all duration-200"
                    :style="{
                      background:
                        searchMode === 'stay' ? '#ffffff' : 'transparent',
                      color: searchMode === 'stay' ? '#3db89e' : '#8fa19e',
                      fontWeight: searchMode === 'stay' ? 700 : 500,
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      border:
                        searchMode === 'stay'
                          ? '2px solid #eef7f5'
                          : '2px solid transparent',
                      borderBottom:
                        searchMode === 'stay'
                          ? '2px solid #ffffff'
                          : '2px solid transparent',
                      marginBottom: '-2px',
                      zIndex: searchMode === 'stay' ? 2 : 1,
                    }"
                    @click="searchMode = 'stay'"
                  >
                    체류시간 직접 입력
                  </button>
                </div>
                <div class="pt-4" style="background: transparent">
                  <div v-if="searchMode === 'train'">
                    <div
                      style="
                        background: #ffffff;
                        border: 1px solid #eef7f5;
                        border-radius: 0px;
                      "
                    >
                      <div
                        class="grid px-3 py-2 text-xs"
                        :style="{
                          gridTemplateColumns: '1fr 1fr 1fr 60px',
                          background: '#f6fbf9',
                          color: '#6b8c87',
                          fontWeight: 600,
                          borderRadius: '0px',
                        }"
                      >
                        <span>열차</span><span>출발</span><span>도착</span
                        ><span class="text-right">잔여</span>
                      </div>
                      <div style="max-height: 140px; overflow-y: auto">
                        <button
                          v-for="train in trainMap[selectedStation] || []"
                          :key="train.id"
                          type="button"
                          class="w-full grid px-3 py-2.5 text-xs transition-all duration-150"
                          :style="{
                            gridTemplateColumns: '1fr 1fr 1fr 60px',
                            background:
                              selectedTrain === train.id
                                ? '#E8F8F5'
                                : 'transparent',
                            borderTop: '1px solid #f6fbf9',
                            color: '#1a2e2b',
                            textAlign: 'left',
                            borderRadius: '0px',
                          }"
                          @click="
                            selectedTrain = train.id;
                            isTrainModalOpen = false;
                          "
                        >
                          <span
                            :style="{
                              fontWeight: 700,
                              color:
                                selectedTrain === train.id
                                  ? '#3db89e'
                                  : '#1a2e2b',
                            }"
                            >{{ train.name }}</span
                          >
                          <span>{{ train.depart }}</span>
                          <span style="color: #6b8c87">{{ train.arrive }}</span>
                          <span
                            class="text-right"
                            :style="{
                              fontWeight: 600,
                              color: train.seats > 10 ? '#3db89e' : '#e05555',
                            }"
                            >{{ train.seats }}석</span
                          >
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-if="searchMode === 'stay'">
                    <div class="flex items-center gap-2 py-2">
                      <span
                        style="
                          font-size: 0.9rem;
                          color: #1a2e2b;
                          font-weight: 600;
                        "
                        >체류 예정 시간 :</span
                      >
                      <input
                        type="number"
                        v-model="stayDuration"
                        min="1"
                        max="24"
                        placeholder="0"
                        class="w-20 px-3 py-2 text-center font-bold"
                        style="
                          border: 1.5px solid rgba(178, 228, 220, 0.6);
                          border-radius: 6px;
                          color: #1a2e2b;
                          background: #ffffff;
                          outline: none;
                          font-size: 0.95rem;
                        "
                        @keyup.enter="isTrainModalOpen = false"
                      />
                      <span
                        style="
                          font-size: 0.9rem;
                          color: #1a2e2b;
                          font-weight: 600;
                        "
                        >시간</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-7">
            <p
              style="
                font-size: 0.82rem;
                font-weight: 600;
                color: #6b8c87;
                letter-spacing: 0.04em;
                margin-bottom: 10px;
              "
            >
              관심 카테고리
              <span style="font-weight: 400; color: #b2e4dc"
                >(중복 선택 가능)</span
              >
            </p>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="cat in CATEGORY_FILTERS"
                :key="cat.key"
                class="flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all duration-200 relative"
                :style="{
                  border: `2px solid ${selectedFilters.includes(cat.key) ? '#3db89e' : 'rgba(178,228,220,0.4)'}`,
                  background: selectedFilters.includes(cat.key)
                    ? '#E8F8F5'
                    : '#ffffff',
                  color: selectedFilters.includes(cat.key)
                    ? '#3db89e'
                    : '#6b8c87',
                  fontWeight: selectedFilters.includes(cat.key) ? 600 : 400,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                }"
                @click="toggleFilter(cat.key)"
              >
                <span
                  v-if="selectedFilters.includes(cat.key)"
                  class="absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center"
                  style="background: #3db89e; font-size: 0.55rem; color: #fff"
                  >✓</span
                >
                <span style="font-size: 1.1rem">{{ cat.emoji }}</span>
                {{ cat.label }}
              </button>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between py-2">
              <div class="flex items-center gap-2">
                <CloudSun :size="18" color="#6b8c87" />
                <span
                  style="font-size: 0.88rem; font-weight: 600; color: #1a2e2b"
                  >☀️ 날씨 연동하기</span
                >
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="useWeather"
                  class="sr-only peer"
                />
                <div
                  class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3db89e]"
                ></div>
              </label>
            </div>
            <p
              v-if="useWeather"
              class="mt-1.5 pl-1 transition-all duration-200"
              style="font-size: 0.78rem; color: #6b8c87; line-height: 1.4"
            >
              🌧️ 실시간 혹은 기상청에서 예보한 대전 날씨(맑음/비)에 맞는 코스를
              매칭합니다.
            </p>
          </div>

          <button
            @click="handleRecommendCourse"
            class="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            :style="{
              background: 'linear-gradient(135deg, #B2E4DC 0%, #3db89e 100%)',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 6px 20px rgba(61,184,158,0.35)',
              opacity: selectedTrain ? 1 : 0.7,
            }"
          >
            <Navigation :size="17" />코스 추천받기<ChevronRight :size="17" />
          </button>
          <p
            class="text-center mt-3"
            style="font-size: 0.78rem; color: #6b8c87"
          >
            ✨ AI가 환승 대기 시간에 맞는 최적 코스를 추천합니다
          </p>
        </div>
      </div>
    </div>
  </section>

  <RecommendedSpotsSection
    :spots="spots"
    :likedSpots="likedSpots"
    @openSpotModal="openSpotModal"
    @toggleLike="toggleLike"
  />

  <CtaBannerSection />

  <PopularCoursesSection />

  <StampEventSection />


  <Transition name="fade-modal">
    <div
      v-if="selectedSpotForModal"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="closeSpotModal"
    >
      <div
        class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-popup-up p-6 flex flex-col"
        @click.stop
      >
        <div
          class="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 flex-shrink-0"
        >
          <h3 class="text-base font-bold text-gray-800">장소 상세 정보</h3>
          <button
            @click="closeSpotModal"
            class="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>
        <div class="overflow-y-auto pr-1" style="max-height: calc(85vh - 80px)">
          <PlaceDetailContent :initialData="selectedSpotForModal" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.hero-section {
  background: #ffffff;
  min-height: calc(100vh - 64px);
  min-height: calc(100dvh - 64px);
  padding: 2rem 0;
}
@media (max-width: 767px) {
  .hero-section {
    background: linear-gradient(155deg, #e8f8f5 0%, #ffffff 45%, #f0faf8 100%);
    min-height: calc(100dvh - 64px);
    height: auto;
    padding: 3rem 0;
  }
}
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.25s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
@keyframes popupUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-popup-up {
  animation: popupUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
