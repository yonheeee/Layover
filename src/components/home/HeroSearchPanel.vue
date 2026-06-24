<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { CloudSun, Navigation } from "lucide-vue-next";
import type { Train as TrainType } from "@/types/train";
import { fetchTrains } from "@/api/trains";

defineProps<{ isLoading?: boolean }>();

const emit = defineEmits<{
  recommend: [
    filters: {
      station: string;
      trainId: string;
      searchMode: "train" | "stay";
      stayDuration: number | string;
      travelDate: string;
      selectedFilters: string[];
      useWeather: boolean;
      remainingMinutes: number;
    },
  ];
}>();

const CATEGORY_FILTERS = [
  { key: "food", label: "음식" },
  { key: "cafe", label: "카페" },
  { key: "culture", label: "문화" },
  { key: "nature", label: "자연" },
  { key: "shopping", label: "쇼핑" },
];

const STATION_OPTIONS = [
  { value: "daejeon", label: "대전역" },
  { value: "seo-daejeon", label: "서대전역" },
];

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const trains = ref<TrainType[]>([]);
const isTrainsLoading = ref(false);
const selectedStation = ref("daejeon");
const selectedTrain = ref("");
const selectedFilters = ref<string[]>([]);
const useWeather = ref(false);
const searchMode = ref<"train" | "stay">("train");
const stayDuration = ref<number | string>("");
const today = new Date();
const travelDate = ref<string>(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
);

const todayLabel = computed(() => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const day = DAYS[d.getDay()];
  return `${yyyy}년 ${mm}월 ${dd}일 ${day}요일`;
});

const selectedTrainDetail = computed(() => {
  if (!selectedTrain.value) return null;
  const train = trains.value.find((t) => t.trainNo === selectedTrain.value);
  if (!train) return null;
  const stationLabel =
    STATION_OPTIONS.find((s) => s.value === selectedStation.value)?.label || "";
  const remaining = calcRemaining(travelDate.value, train.departTime);
  const remainingMinutes = calcRemainingMinutes(
    travelDate.value,
    train.departTime,
  );
  return {
    station: stationLabel,
    name: `${train.mrntNm} ${parseInt(train.trainNo)}`,
    depart: train.departTime,
    remaining,
    remainingMinutes,
  };
});

function selectStation(value: string) {
  selectedStation.value = value;
  selectedTrain.value = "";
  loadTrains();
}

onMounted(() => {
  loadTrains();
});

async function loadTrains() {
  if (!travelDate.value || !selectedStation.value) return;
  isTrainsLoading.value = true;
  try {
    const date = travelDate.value.replace(/-/g, "");
    const all = await fetchTrains(selectedStation.value, date);
    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    if (date === todayStr) {
      const nowHHMM = today.getHours() * 60 + today.getMinutes();
      trains.value = all.filter((t) => {
        if (!t.departTime) return false;
        const [hh, mm] = t.departTime.split(":").map(Number);
        return hh * 60 + mm > nowHHMM;
      });
    } else {
      trains.value = all;
    }
  } catch {
    trains.value = [];
  } finally {
    isTrainsLoading.value = false;
  }
}

function toggleFilter(key: string) {
  const idx = selectedFilters.value.indexOf(key);
  if (idx >= 0) selectedFilters.value.splice(idx, 1);
  else selectedFilters.value.push(key);
}

function calcRemaining(date: string, departHhmm: string): string {
  if (!date || !departHhmm) return "";
  const now = new Date();
  const [hh, mm] = departHhmm.split(":").map(Number);
  const [yyyy, mo, dd] = date.split("-").map(Number);
  const depart = new Date(yyyy, mo - 1, dd, hh, mm, 0, 0);
  const diffMs = depart.getTime() - now.getTime();
  if (diffMs <= 0) return "이미 출발";
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

function calcRemainingMinutes(date: string, departHhmm: string): number {
  if (!date || !departHhmm) return 0;
  const now = new Date();
  const [hh, mm] = departHhmm.split(":").map(Number);
  const [yyyy, mo, dd] = date.split("-").map(Number);
  const depart = new Date(yyyy, mo - 1, dd, hh, mm, 0, 0);
  const diffMs = depart.getTime() - now.getTime();
  return diffMs <= 0 ? 0 : Math.floor(diffMs / 60000);
}

function handleRecommendCourse() {
  const remaining = selectedTrainDetail.value?.remainingMinutes ?? 0;
  emit("recommend", {
    station: selectedStation.value,
    trainId: selectedTrain.value,
    searchMode: searchMode.value,
    stayDuration: stayDuration.value,
    travelDate: travelDate.value,
    selectedFilters: selectedFilters.value,
    useWeather: useWeather.value,
    remainingMinutes: remaining,
  });
}
</script>

<template>
  <div class="w-full max-w-[560px]">
    <h2
      style="
        font-size: 1.3rem;
        font-weight: 800;
        color: #1a2e2b;
        margin-bottom: 20px;
        letter-spacing: -0.02em;
      "
    >
      맞춤 코스 찾기
    </h2>

    <!-- 2컬럼 레이아웃 -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <!-- 왼쪽 컬럼 -->
      <div class="flex flex-col gap-4">
        <!-- 선택 정보 표시 -->
        <div
          style="
            background: #f6fbf9;
            border: 1.5px solid #e0f5f0;
            border-radius: 10px;
            padding: 12px;
            min-height: 80px;
          "
        >
          <template v-if="searchMode === 'train' && selectedTrainDetail">
            <p
              style="
                font-size: 0.75rem;
                color: #6b8c87;
                font-weight: 600;
                margin-bottom: 4px;
              "
            >
              {{ selectedTrainDetail.station }}
            </p>
            <p
              style="
                font-size: 0.82rem;
                color: #1a2e2b;
                font-weight: 700;
                margin-bottom: 2px;
              "
            >
              🚂 {{ selectedTrainDetail.name }}
            </p>
            <p
              style="
                font-size: 0.78rem;
                color: #1a2e2b;
                font-weight: 500;
                margin-bottom: 6px;
              "
            >
              출발 {{ selectedTrainDetail.depart }}
            </p>
            <p
              style="
                font-size: 0.72rem;
                color: #6b8c87;
                font-weight: 600;
                margin-bottom: 2px;
              "
            >
              대기 시간
            </p>
            <p
              style="
                font-size: 1.4rem;
                color: #3db89e;
                font-weight: 900;
                line-height: 1;
              "
            >
              {{ selectedTrainDetail.remaining }}
            </p>
          </template>
          <template v-else-if="searchMode === 'stay' && stayDuration">
            <p
              style="
                font-size: 0.75rem;
                color: #6b8c87;
                font-weight: 600;
                margin-bottom: 4px;
              "
            >
              {{
                STATION_OPTIONS.find((s) => s.value === selectedStation)?.label
              }}
            </p>
            <p style="font-size: 1.2rem; color: #3db89e; font-weight: 900">
              {{ stayDuration }}시간 체류
            </p>
          </template>
          <template v-else>
            <p
              style="
                font-size: 0.85rem;
                color: #9ca3af;
                font-weight: 600;
                margin-top: 16px;
                text-align: center;
              "
            >
              여행을 선택해주세요
            </p>
          </template>
        </div>

        <!-- 오늘 날짜 -->
        <div>
          <p
            style="
              font-size: 0.72rem;
              font-weight: 700;
              color: #6b8c87;
              margin-bottom: 6px;
            "
          >
            여행 날짜
          </p>
          <p style="font-size: 0.82rem; font-weight: 700; color: #3db89e">
            {{ todayLabel }}
          </p>
        </div>

        <!-- 출발역 선택 -->
        <div>
          <p
            style="
              font-size: 0.72rem;
              font-weight: 700;
              color: #6b8c87;
              margin-bottom: 6px;
            "
          >
            출발역
          </p>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              v-for="s in STATION_OPTIONS"
              :key="s.value"
              type="button"
              class="py-2 text-xs font-semibold transition-all duration-200"
              :style="{
                borderRadius: '6px',
                border:
                  selectedStation === s.value
                    ? '1.5px solid #3db89e'
                    : '1.5px solid rgba(178,228,220,0.5)',
                background: selectedStation === s.value ? '#E8F8F5' : '#ffffff',
                color: selectedStation === s.value ? '#3db89e' : '#6b8c87',
                fontWeight: selectedStation === s.value ? 700 : 500,
              }"
              @click="selectStation(s.value)"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- 관심 카테고리 -->
        <div>
          <p
            style="
              font-size: 0.72rem;
              font-weight: 700;
              color: #6b8c87;
              margin-bottom: 6px;
            "
          >
            관심 카테고리
            <span style="font-weight: 400; color: #b2e4dc">(복수선택)</span>
          </p>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="cat in CATEGORY_FILTERS"
              :key="cat.key"
              type="button"
              class="py-2 text-xs transition-all duration-200 relative"
              :style="{
                borderRadius: '6px',
                border: `1.5px solid ${selectedFilters.includes(cat.key) ? '#3db89e' : 'rgba(178,228,220,0.4)'}`,
                background: selectedFilters.includes(cat.key)
                  ? '#E8F8F5'
                  : '#ffffff',
                color: selectedFilters.includes(cat.key)
                  ? '#3db89e'
                  : '#6b8c87',
                fontWeight: selectedFilters.includes(cat.key) ? 700 : 500,
                cursor: 'pointer',
              }"
              @click="toggleFilter(cat.key)"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- 날씨 연동 토글 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <CloudSun :size="15" color="#6b8c87" />
            <span style="font-size: 0.78rem; font-weight: 600; color: #1a2e2b"
              >날씨 연동</span
            >
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="useWeather" class="sr-only peer" />
            <div
              class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3db89e]"
            ></div>
          </label>
        </div>
      </div>

      <!-- 오른쪽 컬럼 -->
      <div class="flex flex-col gap-3">
        <!-- 탭 -->
        <div class="flex items-end" style="border-bottom: 2px solid #eef7f5">
          <button
            type="button"
            class="flex-1 py-2 text-xs transition-all duration-200"
            :style="{
              background: searchMode === 'train' ? '#ffffff' : 'transparent',
              color: searchMode === 'train' ? '#3db89e' : '#8fa19e',
              fontWeight: searchMode === 'train' ? 700 : 500,
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              border:
                searchMode === 'train'
                  ? '2px solid #eef7f5'
                  : '2px solid transparent',
              borderBottom:
                searchMode === 'train'
                  ? '2px solid #ffffff'
                  : '2px solid transparent',
              marginBottom: '-2px',
            }"
            @click="searchMode = 'train'"
          >
            기차시간 기준
          </button>
          <button
            type="button"
            class="flex-1 py-2 text-xs transition-all duration-200"
            :style="{
              background: searchMode === 'stay' ? '#ffffff' : 'transparent',
              color: searchMode === 'stay' ? '#3db89e' : '#8fa19e',
              fontWeight: searchMode === 'stay' ? 700 : 500,
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              border:
                searchMode === 'stay'
                  ? '2px solid #eef7f5'
                  : '2px solid transparent',
              borderBottom:
                searchMode === 'stay'
                  ? '2px solid #ffffff'
                  : '2px solid transparent',
              marginBottom: '-2px',
            }"
            @click="searchMode = 'stay'"
          >
            직접 입력
          </button>
        </div>

        <!-- 기차시간 기준 탭 내용 -->
        <div v-if="searchMode === 'train'" style="flex: 1">
          <div
            style="
              border: 1px solid #eef7f5;
              border-radius: 6px;
              overflow: hidden;
            "
          >
            <!-- 헤더 -->
            <div
              class="grid px-2 py-1.5 text-xs"
              style="
                grid-template-columns: 1fr auto;
                background: #f6fbf9;
                color: #6b8c87;
                font-weight: 600;
              "
            >
              <span>열차</span><span>출발</span>
            </div>
            <!-- 로딩/빈값/목록 -->
            <div
              v-if="isTrainsLoading"
              class="py-6 text-center text-xs text-gray-400"
            >
              불러오는 중...
            </div>
            <div
              v-else-if="trains.length === 0"
              class="py-6 text-center text-xs text-gray-400"
            >
              열차 정보가 없습니다
            </div>
            <div v-else style="max-height: 200px; overflow-y: auto">
              <button
                v-for="train in trains"
                :key="train.trainNo"
                type="button"
                class="w-full grid px-2 py-2 text-xs transition-all duration-150"
                :style="{
                  gridTemplateColumns: '1fr auto',
                  background:
                    selectedTrain === train.trainNo ? '#E8F8F5' : 'transparent',
                  borderTop: '1px solid #f6fbf9',
                  color: '#1a2e2b',
                  textAlign: 'left',
                }"
                @click="selectedTrain = train.trainNo"
              >
                <span
                  :style="{
                    fontWeight: 700,
                    color:
                      selectedTrain === train.trainNo ? '#3db89e' : '#1a2e2b',
                  }"
                >
                  {{ train.mrntNm }} {{ parseInt(train.trainNo) }}
                </span>
                <span style="color: #6b8c87">{{ train.departTime }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 체류시간 직접 입력 탭 내용 -->
        <div v-if="searchMode === 'stay'" class="flex flex-col gap-2 pt-2">
          <p style="font-size: 0.75rem; color: #6b8c87; font-weight: 600">
            체류 예정 시간
          </p>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model="stayDuration"
              min="1"
              max="6"
              placeholder="0"
              class="w-16 px-2 py-2 text-center font-bold"
              style="
                border: 1.5px solid rgba(178, 228, 220, 0.6);
                border-radius: 6px;
                color: #1a2e2b;
                background: #ffffff;
                outline: none;
                font-size: 0.95rem;
              "
            />
            <span style="font-size: 0.9rem; color: #1a2e2b; font-weight: 600"
              >시간 (최대 6시간)</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <button
      @click="handleRecommendCourse"
      :disabled="isLoading"
      class="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      :style="{
        background: 'linear-gradient(135deg, #B2E4DC 0%, #3db89e 100%)',
        fontWeight: 700,
        fontSize: '0.95rem',
        boxShadow: '0 6px 20px rgba(61,184,158,0.35)',
        opacity: isLoading ? 0.7 : 1,
        cursor: isLoading ? 'not-allowed' : 'pointer',
      }"
    >
      <Navigation v-if="!isLoading" :size="16" />
      <span v-if="isLoading">코스 생성 중...</span>
      <span v-else>코스 추천받기</span>
    </button>
    <p class="text-center mt-2" style="font-size: 0.75rem; color: #6b8c87">
      ✨ AI가 환승 대기 시간에 맞는 최적 코스를 추천합니다
    </p>
  </div>
</template>
