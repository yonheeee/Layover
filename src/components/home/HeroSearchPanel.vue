<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Train, ChevronRight, CloudSun, Navigation } from "lucide-vue-next";
import type { Train as TrainType } from "@/types/train";
import { fetchTrains } from "@/api/trains";

const emit = defineEmits<{
  recommend: [filters: {
    station: string;
    trainId: string;
    searchMode: "train" | "stay";
    stayDuration: number | string;
    travelDate: string;
    selectedFilters: string[];
    useWeather: boolean;
  }];
}>();

const CATEGORY_FILTERS = [
  { key: "food",     label: "음식",  emoji: "🍜" },
  { key: "cafe",     label: "카페",  emoji: "☕" },
  { key: "culture",  label: "문화",  emoji: "🏛" },
  { key: "nature",   label: "자연",  emoji: "🌿" },
  { key: "shopping", label: "쇼핑",  emoji: "🛍" },
];

const STATION_OPTIONS = [
  { value: "daejeon",    label: "대전역"   },
  { value: "seo-daejeon", label: "서대전역" },
  { value: "sintanjin",  label: "신탄진역" },
];

const trainMap       = ref<Record<string, TrainType[]>>({});
const selectedStation = ref("daejeon");
const selectedTrain   = ref("");
const selectedFilters = ref<string[]>([]);
const isTrainModalOpen = ref(false);
const useWeather       = ref(false);
const searchMode       = ref<"train" | "stay">("train");
const stayDuration     = ref<number | string>("");
const travelDate       = ref<string>("");

function selectStation(value: string) {
  selectedStation.value = value;
  selectedTrain.value   = "";
}

function toggleFilter(key: string) {
  const idx = selectedFilters.value.indexOf(key);
  if (idx >= 0) selectedFilters.value.splice(idx, 1);
  else selectedFilters.value.push(key);
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
    station:   stationLabel,
    name:      train.name,
    depart:    train.depart,
    remaining: "2시간 15분",
  };
}

function handleRecommendCourse() {
  emit("recommend", {
    station:        selectedStation.value,
    trainId:        selectedTrain.value,
    searchMode:     searchMode.value,
    stayDuration:   stayDuration.value,
    travelDate:     travelDate.value,
    selectedFilters: selectedFilters.value,
    useWeather:     useWeather.value,
  });
}

onMounted(async () => {
  trainMap.value = await fetchTrains();
});
</script>

<template>
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
            <Train :size="16" color="#3db89e" class="mt-1 flex-shrink-0" />
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
                    STATION_OPTIONS.find((s) => s.value === selectedStation)
                      ?.label
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
                        selectedTrain === train.id ? '#E8F8F5' : 'transparent',
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
                          selectedTrain === train.id ? '#3db89e' : '#1a2e2b',
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
        <span style="font-weight: 400; color: #b2e4dc">(중복 선택 가능)</span>
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
            color: selectedFilters.includes(cat.key) ? '#3db89e' : '#6b8c87',
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
          <span style="font-size: 0.88rem; font-weight: 600; color: #1a2e2b"
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
</template>
