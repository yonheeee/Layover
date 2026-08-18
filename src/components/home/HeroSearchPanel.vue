<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  Car,
  ChevronDown,
  Footprints,
  Landmark,
  Navigation,
  ShoppingBag,
  Trees,
  Utensils,
} from "lucide-vue-next";
import { fetchTrains } from "@/api/trains";
import type { Train as TrainType } from "@/types/train";

defineProps<{ isLoading?: boolean }>();

const emit = defineEmits<{
  recommend: [
    filters: {
      station: string;
      destination: string;
      trainId: string;
      searchMode: "train" | "stay";
      stayDuration: number | string;
      travelDate: string;
      selectedFilters: string[];
      travelMode: "WALK" | "TAXI";
      useWeather: boolean;
      remainingMinutes: number;
    },
  ];
}>();

const text = {
  title: "\ub9de\ucda4 \ucf54\uc2a4 \ucc3e\uae30",
  courseConditions: "\ucf54\uc2a4 \uc870\uac74",
  emptySelection: "\uc5ec\ud589\uc744 \uc120\ud0dd\ud574\uc8fc\uc138\uc694",
  travelDate: "\uc5ec\ud589 \ub0a0\uc9dc",
  station: "\ucd9c\ubc1c\uc5ed",
  destination: "\ub3c4\ucc29\uc5ed",
  category: "\uad00\uc2ec \uce74\ud14c\uace0\ub9ac",
  multiSelect: "\ubcf5\uc218 \uc120\ud0dd",
  timeSelect: "\uc2dc\uac04 \uc120\ud0dd",
  trainMode: "\uae30\ucc28\uc2dc\uac04 \uae30\uc900",
  stayMode: "\uc9c1\uc811 \uc785\ub825",
  train: "\uc5f4\ucc28",
  depart: "\ucd9c\ubc1c",
  loading: "\ubd88\ub7ec\uc624\ub294 \uc911...",
  noTrains: "\uc5f4\ucc28 \uc815\ubcf4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4",
  trainFallback:
    "\ud604\uc7ac \uc5f4\ucc28 \uc815\ubcf4\ub97c \ubd88\ub7ec\uc62c \uc218 \uc5c6\uc5b4\uc694. \uc9c1\uc811 \uc785\ub825\uc73c\ub85c \uccb4\ub958 \uc2dc\uac04\uc744 \uc124\uc815\ud560 \uc218 \uc788\uc5b4\uc694.",
  useStayMode: "\uc9c1\uc811 \uc785\ub825\ud558\uae30",
  stayTime: "\uccb4\ub958 \uc608\uc815 \uc2dc\uac04",
  hour: "\uc2dc\uac04",
  stayHint: "\ucd5c\ub300 6\uc2dc\uac04\uae4c\uc9c0 \ucd94\ucc9c\ud560 \uc218 \uc788\uc5b4\uc694.",
  generating: "\ucf54\uc2a4 \uc0dd\uc131 \uc911...",
  recommend: "\ucf54\uc2a4 \ucd94\ucc9c\ubc1b\uae30",
  note: "AI\uac00 \ud658\uc2b9 \ub300\uae30\uc2dc\uac04\uc5d0 \ub9de\ub294 \ucd5c\uc801 \ucf54\uc2a4\ub97c \ucd94\ucc9c\ud569\ub2c8\ub2e4.",
  alreadyDeparted: "\uc774\ubbf8 \ucd9c\ubc1c",
  minute: "\ubd84",
  safetyBuffer: "\ucd9c\ubc1c 30\ubd84 \uc804 \uc5ed \ubcf5\uadc0 \ubc84\ud37c \ubc18\uc601",
  travelMode: "\uc774\ub3d9 \uc218\ub2e8",
  walk: "\ub3c4\ubcf4",
  taxi: "\ud0dd\uc2dc",
  availableTravelTime: "\ucd94\ucc9c \uac00\ub2a5",
};

const TRAVEL_MODES = [
  { key: "WALK", labelKey: "walk", icon: Footprints },
  { key: "TAXI", labelKey: "taxi", icon: Car },
] as const;

const CATEGORY_FILTERS = [
  { key: "food", label: "\uc74c\uc2dd", icon: Utensils },
  { key: "culture", label: "\ubb38\ud654", icon: Landmark },
  { key: "nature", label: "\uc790\uc5f0", icon: Trees },
  { key: "shopping", label: "\uc1fc\ud551", icon: ShoppingBag },
];

const STATION_OPTIONS = [
  { value: "daejeon", label: "\ub300\uc804\uc5ed" },
  { value: "seo-daejeon", label: "\uc11c\ub300\uc804\uc5ed" },
  { value: "sintanjin", label: "\uc2e0\ud0c4\uc9c4\uc5ed" },
];

const DESTINATION_OPTIONS = [
  { value: "seoul", label: "\uc11c\uc6b8\uc5ed" },
  { value: "yongsan", label: "\uc6a9\uc0b0\uc5ed" },
  { value: "busan", label: "\ubd80\uc0b0\uc5ed" },
  { value: "dongdaegu", label: "\ub3d9\ub300\uad6c\uc5ed" },
  { value: "gwangju-songjeong", label: "\uad11\uc8fc\uc1a1\uc815\uc5ed" },
  { value: "iksan", label: "\uc775\uc0b0\uc5ed" },
  { value: "mokpo", label: "\ubaa9\ud3ec\uc5ed" },
];

const DAYS = [
  "\uc77c",
  "\uc6d4",
  "\ud654",
  "\uc218",
  "\ubaa9",
  "\uae08",
  "\ud1a0",
];

const trains = ref<TrainType[]>([]);
const isTrainsLoading = ref(false);
const trainLoadFailed = ref(false);
const selectedStation = ref("daejeon");
const selectedDestination = ref("busan");
const selectedTrain = ref("");
const selectedFilters = ref<string[]>([]);
const travelMode = ref<"WALK" | "TAXI">("TAXI");
const searchMode = ref<"train" | "stay">("train");
const stayDuration = ref<number | string>("");
const today = new Date();
const travelDate = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
);
/**
 * 화면에 "추천 가능 시간"을 보여줄 때만 쓰는 값이다.
 * 실제 코스 편성에 반영되는 버퍼는 백엔드(course.return-buffer-minutes)가 관리하므로
 * 서버에는 버퍼를 빼지 않은 잔여 시간을 그대로 보낸다. 양쪽에서 빼면 이중으로 차감된다.
 */
const DISPLAY_BUFFER_MINUTES = 30;

const todayLabel = computed(() => {
  const d = new Date(`${travelDate.value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}\ub144 ${mm}\uc6d4 ${dd}\uc77c ${DAYS[d.getDay()]}\uc694\uc77c`;
});

const selectedStationLabel = computed(
  () =>
    STATION_OPTIONS.find((station) => station.value === selectedStation.value)
      ?.label ?? "",
);

const selectedDestinationLabel = computed(
  () =>
    DESTINATION_OPTIONS.find(
      (destination) => destination.value === selectedDestination.value,
    )?.label ?? "",
);

const selectedTrainDetail = computed(() => {
  if (!selectedTrain.value) return null;
  const train = trains.value.find((item) => item.trainNo === selectedTrain.value);
  if (!train) return null;

  return {
    station: selectedStationLabel.value,
    name: formatTrainName(train),
    depart: train.departTime,
    remaining: calcRemaining(travelDate.value, train.departTime),
    remainingMinutes: calcRemainingMinutes(travelDate.value, train.departTime),
    travelMinutes: Math.max(
      0,
      calcRemainingMinutes(travelDate.value, train.departTime) -
        DISPLAY_BUFFER_MINUTES,
    ),
  };
});

const selectedTravelTimeLabel = computed(() => {
  const minutes = selectedTrainDetail.value?.travelMinutes ?? 0;
  return formatDuration(minutes);
});

function formatTrainName(train: TrainType) {
  const trainName =
    train.mrntNm ??
    train.trainName ??
    train.trainGrade ??
    train.trainKind ??
    train.kndNm ??
    "KTX";
  const trainNo = Number.parseInt(train.trainNo, 10);
  return `${trainName} ${Number.isNaN(trainNo) ? train.trainNo : trainNo}`;
}

onMounted(() => {
  loadTrains();
});

watch(travelDate, () => {
  selectedTrain.value = "";
  loadTrains();
});

watch(selectedDestination, () => {
  selectedTrain.value = "";
  loadTrains();
});

function selectStation(value: string) {
  selectedStation.value = value;
  selectedTrain.value = "";
  loadTrains();
}

async function loadTrains() {
  if (!travelDate.value || !selectedStation.value || !selectedDestination.value) return;
  isTrainsLoading.value = true;
  trainLoadFailed.value = false;

  try {
    const date = travelDate.value.replace(/-/g, "");
    const all = await fetchTrains(selectedStation.value, selectedDestination.value, date);
    const now = new Date();
    const todayStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    if (date === todayStr) {
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      trains.value = all.filter((train) => {
        if (!train.departTime) return false;
        const [hh, mm] = train.departTime.split(":").map(Number);
        return hh * 60 + mm > nowMinutes;
      });
      return;
    }

    trains.value = all;
  } catch {
    trainLoadFailed.value = true;
    trains.value = [];
  } finally {
    isTrainsLoading.value = false;
  }
}

function toggleFilter(key: string) {
  const index = selectedFilters.value.indexOf(key);
  if (index >= 0) {
    selectedFilters.value.splice(index, 1);
    return;
  }
  selectedFilters.value.push(key);
}

function calcRemaining(date: string, departHhmm: string) {
  if (!date || !departHhmm) return "";
  const now = new Date();
  const [hh, mm] = departHhmm.split(":").map(Number);
  const [yyyy, mo, dd] = date.split("-").map(Number);
  const depart = new Date(yyyy, mo - 1, dd, hh, mm, 0, 0);
  const diffMs = depart.getTime() - now.getTime();

  if (diffMs <= 0) return text.alreadyDeparted;

  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}${text.minute}`;
  if (m === 0) return `${h}${text.hour}`;
  return `${h}${text.hour} ${m}${text.minute}`;
}

function calcRemainingMinutes(date: string, departHhmm: string) {
  if (!date || !departHhmm) return 0;
  const now = new Date();
  const [hh, mm] = departHhmm.split(":").map(Number);
  const [yyyy, mo, dd] = date.split("-").map(Number);
  const depart = new Date(yyyy, mo - 1, dd, hh, mm, 0, 0);
  const diffMs = depart.getTime() - now.getTime();
  return diffMs <= 0 ? 0 : Math.floor(diffMs / 60000);
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return `0${text.minute}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}${text.minute}`;
  if (m === 0) return `${h}${text.hour}`;
  return `${h}${text.hour} ${m}${text.minute}`;
}

function handleRecommendCourse() {
  // 버퍼를 빼지 않은 잔여 시간. 차감은 백엔드가 한다.
  const remaining = selectedTrainDetail.value?.remainingMinutes ?? 0;
  emit("recommend", {
    station: selectedStation.value,
    destination: selectedDestination.value,
    trainId: selectedTrain.value,
    searchMode: searchMode.value,
    stayDuration: stayDuration.value,
    travelDate: travelDate.value,
    selectedFilters: selectedFilters.value,
    travelMode: travelMode.value,
    useWeather: false,
    remainingMinutes: remaining,
  });
}
</script>

<template>
  <div class="course-finder">
    <div
      v-if="
        (searchMode === 'train' && selectedTrainDetail) ||
        (searchMode === 'stay' && stayDuration)
      "
      class="selected-summary"
    >
      <template v-if="searchMode === 'train' && selectedTrainDetail">
        <div class="selected-summary__cell selected-summary__route">
          <strong>{{ selectedTrainDetail.station }}</strong>
          <span>-></span>
          <strong>{{ selectedDestinationLabel }}행</strong>
        </div>
        <div class="selected-summary__cell">
          <span>{{ text.depart }} {{ selectedTrainDetail.depart }}</span>
          <strong>{{ selectedTrainDetail.name }}</strong>
        </div>
        <div class="selected-summary__cell selected-summary__time">
          <span>잔여시간</span>
          <strong>{{ selectedTrainDetail.remaining }}</strong>
        </div>
      </template>
      <template v-else-if="searchMode === 'stay' && stayDuration">
        <div class="selected-summary__cell selected-summary__route">
          <strong>{{ selectedStationLabel }}</strong>
          <span>기준</span>
        </div>
        <div class="selected-summary__cell">
          <span>직접 입력</span>
          <strong>{{ stayDuration }}{{ text.hour }}</strong>
        </div>
        <div class="selected-summary__cell selected-summary__time">
          <span>체류시간</span>
          <strong>{{ stayDuration }}{{ text.hour }}</strong>
        </div>
      </template>
    </div>

    <div class="course-finder__grid">
      <section class="course-finder__left" :aria-label="text.courseConditions">
        <div class="field-block">
          <span class="field-label">{{ text.travelDate }}</span>
          <input
            v-model="travelDate"
            class="date-input"
            type="date"
            :aria-label="text.travelDate"
          />
          <strong class="date-label">{{ todayLabel }}</strong>
        </div>

        <div class="route-row">
          <div class="field-block">
            <span class="field-label">{{ text.station }}</span>
            <label class="select-field" data-tour="home-station">
              <select
                v-model="selectedStation"
                :aria-label="text.station"
                @change="selectStation(selectedStation)"
              >
                <option
                  v-for="station in STATION_OPTIONS"
                  :key="station.value"
                  :value="station.value"
                >
                  {{ station.label }}
                </option>
              </select>
              <ChevronDown :size="14" stroke-width="2.2" />
            </label>
          </div>

          <div class="field-block">
            <span class="field-label">{{ text.destination }}</span>
            <label class="select-field">
              <select
                v-model="selectedDestination"
                :aria-label="text.destination"
              >
                <option
                  v-for="destination in DESTINATION_OPTIONS"
                  :key="destination.value"
                  :value="destination.value"
                >
                  {{ destination.label }}
                </option>
              </select>
              <ChevronDown :size="14" stroke-width="2.2" />
            </label>
          </div>
        </div>

        <div class="field-block">
          <span class="field-label">
            {{ text.category }}
            <small>({{ text.multiSelect }})</small>
          </span>
          <div class="category-grid" data-tour="home-category">
            <button
              v-for="category in CATEGORY_FILTERS"
              :key="category.key"
              type="button"
              :class="{ active: selectedFilters.includes(category.key) }"
              @click="toggleFilter(category.key)"
            >
              <component :is="category.icon" :size="13" stroke-width="2" />
              {{ category.label }}
            </button>
          </div>
        </div>

        <div class="field-block">
          <span class="field-label">{{ text.travelMode }}</span>
          <div class="travel-mode-grid" data-tour="home-travel-mode">
            <button
              v-for="mode in TRAVEL_MODES"
              :key="mode.key"
              type="button"
              :class="{ active: travelMode === mode.key }"
              :aria-pressed="travelMode === mode.key"
              @click="travelMode = mode.key"
            >
              <component :is="mode.icon" :size="14" stroke-width="2" />
              {{ text[mode.labelKey] }}
            </button>
          </div>
        </div>

      </section>

      <section class="course-finder__right" :aria-label="text.timeSelect">
        <div class="mode-tabs" data-tour="home-time">
          <button
            type="button"
            :class="{ active: searchMode === 'train' }"
            @click="searchMode = 'train'"
          >
            {{ text.trainMode }}
          </button>
          <button
            type="button"
            :class="{ active: searchMode === 'stay' }"
            @click="searchMode = 'stay'"
          >
            {{ text.stayMode }}
          </button>
        </div>

        <div v-if="searchMode === 'train'" class="train-list">
          <div class="train-list__head">
            <span>열차이름</span>
            <span>시간</span>
            <span>목적지</span>
          </div>

          <div v-if="isTrainsLoading" class="train-list__message">
            {{ text.loading }}
          </div>
          <div v-else-if="trains.length === 0" class="train-list__message">
            <p>{{ trainLoadFailed ? text.trainFallback : text.noTrains }}</p>
            <button type="button" @click="searchMode = 'stay'">
              {{ text.useStayMode }}
            </button>
          </div>
          <div v-else class="train-list__body">
            <button
              v-for="train in trains"
              :key="train.trainNo"
              type="button"
              :class="{ active: selectedTrain === train.trainNo }"
              @click="selectedTrain = train.trainNo"
            >
              <strong>{{ formatTrainName(train) }}</strong>
              <span>{{ train.departTime }}</span>
              <em>{{ train.destination }}</em>
            </button>
          </div>
        </div>

        <div v-else class="stay-input">
          <span class="field-label">{{ text.stayTime }}</span>
          <label>
            <input
              v-model="stayDuration"
              type="number"
              min="1"
              max="6"
              placeholder="0"
            />
            <span>{{ text.hour }}</span>
          </label>
          <small>{{ text.stayHint }}</small>
        </div>
      </section>
    </div>

    <button
      class="recommend-button"
      data-tour="home-recommend"
      type="button"
      :disabled="isLoading"
      @click="handleRecommendCourse"
    >
      <Navigation v-if="!isLoading" :size="16" stroke-width="2.2" />
      <span>{{ isLoading ? text.generating : text.recommend }}</span>
    </button>

    <p class="course-finder__note">
      {{ text.note }}
    </p>
  </div>
</template>

<style scoped>
.course-finder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-finder__title {
  margin: 0 0 12px;
  color: #1b332f;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0;
}

.course-finder__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 20px;
  align-items: start;
  flex: 1;
}

.course-finder__left,
.course-finder__right {
  min-width: 0;
}

.selected-summary {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(76px, 0.48fr);
  align-items: center;
  column-gap: 20px;
  margin-bottom: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.selected-summary__cell {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.selected-summary__cell span {
  color: #667c79;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.2;
}

.selected-summary__cell strong {
  min-width: 0;
  overflow: hidden;
  color: #14302c;
  font-size: 0.88rem;
  font-weight: 900;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-summary__route {
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.selected-summary__route span {
  color: #23796f;
  text-align: center;
}

.selected-summary__time {
  border-left: 1px solid rgba(35, 121, 111, 0.24);
  padding-left: 20px;
  text-align: right;
}

.selected-summary__time strong {
  color: #23796f;
  font-size: 1.08rem;
}

.field-block {
  margin-bottom: 16px;
}

.route-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #5d7470;
  font-size: 0.76rem;
  font-weight: 900;
}

.field-label small {
  color: #91a7a3;
  font-size: 0.68rem;
  font-weight: 700;
}

.date-label {
  display: block;
  margin-top: 8px;
  color: #23796f;
  font-size: 0.82rem;
  font-weight: 900;
}

.date-input,
.select-field select {
  width: 100%;
  min-height: 40px;
  border: 1px solid #dcece9;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.66);
  color: #14302c;
  padding: 0 12px;
  font-size: 0.8rem;
  font-weight: 800;
}

.select-field {
  position: relative;
  display: block;
}

.select-field select {
  appearance: none;
  padding-right: 34px;
  cursor: pointer;
}

.select-field svg {
  position: absolute;
  right: 13px;
  top: 50%;
  color: #23796f;
  pointer-events: none;
  transform: translateY(-50%);
}

.category-grid button,
.mode-tabs button {
  min-width: 0;
  border: 1px solid #dcece9;
  background: rgba(255, 255, 255, 0.56);
  color: #506864;
  cursor: pointer;
  font-weight: 800;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.category-grid button.active {
  border-color: #2f877c;
  background: #e9f8f5;
  color: #226d64;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.category-grid button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 8px;
  font-size: 0.76rem;
  white-space: nowrap;
}

.travel-mode-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.travel-mode-grid button {
  display: inline-flex;
  min-height: 36px;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #dcece9;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.56);
  color: #506864;
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.travel-mode-grid button.active {
  border-color: #2f877c;
  background: #e9f8f5;
  color: #226d64;
}

.mode-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 12px;
  border-bottom: 2px solid #edf5f3;
}

.mode-tabs button {
  min-height: 40px;
  border-color: transparent;
  border-radius: 7px 7px 0 0;
  background: transparent;
  color: #748884;
  font-size: 0.78rem;
  white-space: nowrap;
}

.mode-tabs button.active {
  border-color: #e0efec;
  border-bottom-color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.68);
  color: #226d64;
}

.train-list {
  border: 1px solid #e5f0ed;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
}

.train-list__head,
.train-list__body button {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(58px, 0.52fr) minmax(60px, 0.62fr);
  align-items: center;
  column-gap: 8px;
}

.train-list__head {
  padding: 11px 12px;
  background: #f5fbfa;
  color: #6a807c;
  font-size: 0.72rem;
  font-weight: 900;
}

.train-list__head span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.train-list__body {
  max-height: min(260px, 32vh);
  overflow-y: auto;
}

.train-list__body button {
  width: 100%;
  min-height: 42px;
  border: 0;
  border-top: 1px solid #f0f6f5;
  background: rgba(255, 255, 255, 0.08);
  color: #14302c;
  cursor: pointer;
  padding: 8px 12px;
  text-align: left;
}

.train-list__body button.active {
  background: #e9f8f5;
}

.train-list__body strong,
.train-list__body span,
.train-list__body em {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
}

.train-list__body strong {
  color: #14302c;
  font-weight: 900;
}

.train-list__body button.active strong {
  color: #226d64;
}

.train-list__body span {
  color: #657a76;
  font-weight: 800;
}

.train-list__body em {
  color: #57716d;
  font-style: normal;
  font-weight: 800;
}

.train-list__message {
  padding: 42px 16px;
  color: #91a29f;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 800;
}

.train-list__message p {
  margin: 0;
  line-height: 1.5;
}

.train-list__message button {
  margin-top: 12px;
  min-height: 32px;
  border: 1px solid #bfe4dd;
  border-radius: 7px;
  background: #ffffff;
  color: #23796f;
  cursor: pointer;
  padding: 0 12px;
  font-size: 0.72rem;
  font-weight: 900;
}

.stay-input {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border: 1px solid #e5f0ed;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.5);
}

.stay-input label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #14302c;
  font-size: 0.84rem;
  font-weight: 900;
}

.stay-input input {
  width: 64px;
  height: 38px;
  border: 1px solid #cfe3df;
  border-radius: 7px;
  color: #14302c;
  text-align: center;
  font-weight: 900;
}

.stay-input small {
  color: #78908c;
  font-size: 0.72rem;
  font-weight: 700;
}

.recommend-button {
  display: flex;
  width: 100%;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(180deg, #23887c 0%, #176a63 100%);
  box-shadow: 0 12px 24px rgba(23, 106, 99, 0.28);
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 900;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.recommend-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.recommend-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.course-finder__note {
  margin: 12px 0 0;
  color: #78908c;
  text-align: center;
  font-size: 0.76rem;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .course-finder__grid {
    grid-template-columns: minmax(0, 1fr) minmax(360px, 0.9fr);
    gap: 18px;
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}

@media (max-width: 940px) {
  .course-finder__grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .route-row,
  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .train-list__body {
    max-height: 220px;
  }
}

@media (min-width: 901px) and (max-height: 820px) {
  .course-finder__title {
    margin-bottom: 8px;
  }

  .field-block {
    margin-bottom: 8px;
  }

  .selected-summary {
    margin-bottom: 10px;
  }

  .selected-summary__cell strong {
    font-size: 0.76rem;
  }

  .date-label {
    font-size: 0.72rem;
  }

  .train-list__body {
    max-height: 150px;
  }

  .recommend-button {
    min-height: 42px;
    margin-top: 10px;
  }

  .course-finder__note {
    margin-top: 6px;
  }
}

@media (min-width: 768px) and (max-width: 900px) {
  .course-finder__title {
    margin-bottom: 12px;
  }

  .course-finder__grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .field-block {
    margin-bottom: 10px;
  }

  .train-list__body {
    max-height: 178px;
  }

  .recommend-button {
    min-height: 44px;
    margin-top: 14px;
  }

  .course-finder__note {
    margin-top: 8px;
  }
}

@media (max-width: 767px) {
  .course-finder {
    padding-bottom: 0;
  }

  .course-finder__grid {
    grid-template-columns: 1fr;
  }

  .selected-summary {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 8px;
  }

  .selected-summary__time {
    border-left: 0;
    border-top: 1px solid rgba(35, 121, 111, 0.18);
    padding-top: 8px;
    padding-left: 0;
    text-align: left;
  }

  .train-list__body {
    max-height: 170px;
  }
}

@media (max-width: 640px) {
  .course-finder {
    padding-bottom: 0;
  }

  .course-finder__title {
    margin-bottom: 12px;
    font-size: 0.95rem;
  }

  .field-block {
    margin-bottom: 11px;
  }

  .mode-tabs button,
  .category-grid button {
    min-height: 34px;
  }

  .recommend-button {
    min-height: 44px;
    margin-top: 14px;
  }
}

@media (max-width: 420px) {
  .course-finder {
    padding-bottom: 0;
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .train-list__head,
  .train-list__body button {
    gap: 8px;
  }

  .train-list__body {
    max-height: 150px;
  }

  .stay-input {
    padding: 14px;
  }
}
</style>
