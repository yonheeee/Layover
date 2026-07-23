<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
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

const text = {
  title: "\ub9de\ucda4 \ucf54\uc2a4 \ucc3e\uae30",
  courseConditions: "\ucf54\uc2a4 \uc870\uac74",
  emptySelection: "\uc5ec\ud589\uc744 \uc120\ud0dd\ud574\uc8fc\uc138\uc694",
  travelDate: "\uc5ec\ud589 \ub0a0\uc9dc",
  station: "\ucd9c\ubc1c\uc5ed",
  category: "\uad00\uc2ec \uce74\ud14c\uace0\ub9ac",
  multiSelect: "\ubcf5\uc218 \uc120\ud0dd",
  timeSelect: "\uc2dc\uac04 \uc120\ud0dd",
  trainMode: "\uae30\ucc28\uc2dc\uac04 \uae30\uc900",
  stayMode: "\uc9c1\uc811 \uc785\ub825",
  train: "\uc5f4\ucc28",
  depart: "\ucd9c\ubc1c",
  loading: "\ubd88\ub7ec\uc624\ub294 \uc911...",
  noTrains: "\uc5f4\ucc28 \uc815\ubcf4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4",
  stayTime: "\uccb4\ub958 \uc608\uc815 \uc2dc\uac04",
  hour: "\uc2dc\uac04",
  stayHint: "\ucd5c\ub300 6\uc2dc\uac04\uae4c\uc9c0 \ucd94\ucc9c\ud560 \uc218 \uc788\uc5b4\uc694.",
  generating: "\ucf54\uc2a4 \uc0dd\uc131 \uc911...",
  recommend: "\ucf54\uc2a4 \ucd94\ucc9c\ubc1b\uae30",
  note: "AI\uac00 \ud658\uc2b9 \ub300\uae30\uc2dc\uac04\uc5d0 \ub9de\ub294 \ucd5c\uc801 \ucf54\uc2a4\ub97c \ucd94\ucc9c\ud569\ub2c8\ub2e4.",
  alreadyDeparted: "\uc774\ubbf8 \ucd9c\ubc1c",
  minute: "\ubd84",
};

const CATEGORY_FILTERS = [
  { key: "food", label: "\uc74c\uc2dd", icon: Utensils },
  { key: "culture", label: "\ubb38\ud654", icon: Landmark },
  { key: "nature", label: "\uc790\uc5f0", icon: Trees },
  { key: "shopping", label: "\uc1fc\ud551", icon: ShoppingBag },
];

const STATION_OPTIONS = [
  { value: "daejeon", label: "\ub300\uc804\uc5ed" },
  { value: "seo-daejeon", label: "\uc11c\ub300\uc804\uc5ed" },
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
const selectedStation = ref("daejeon");
const selectedTrain = ref("");
const selectedFilters = ref<string[]>([]);
const searchMode = ref<"train" | "stay">("train");
const stayDuration = ref<number | string>("");
const today = new Date();
const travelDate = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
);

const todayLabel = computed(() => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}\ub144 ${mm}\uc6d4 ${dd}\uc77c ${DAYS[d.getDay()]}\uc694\uc77c`;
});

const selectedTrainDetail = computed(() => {
  if (!selectedTrain.value) return null;
  const train = trains.value.find((item) => item.trainNo === selectedTrain.value);
  if (!train) return null;

  const stationLabel =
    STATION_OPTIONS.find((station) => station.value === selectedStation.value)
      ?.label ?? "";

  return {
    station: stationLabel,
    name: formatTrainName(train),
    depart: train.departTime,
    remaining: calcRemaining(travelDate.value, train.departTime),
    remainingMinutes: calcRemainingMinutes(travelDate.value, train.departTime),
  };
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

function selectStation(value: string) {
  selectedStation.value = value;
  selectedTrain.value = "";
  loadTrains();
}

async function loadTrains() {
  if (!travelDate.value || !selectedStation.value) return;
  isTrainsLoading.value = true;

  try {
    const date = travelDate.value.replace(/-/g, "");
    const all = await fetchTrains(selectedStation.value, date);
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

function handleRecommendCourse() {
  const remaining = selectedTrainDetail.value?.remainingMinutes ?? 0;
  emit("recommend", {
    station: selectedStation.value,
    trainId: selectedTrain.value,
    searchMode: searchMode.value,
    stayDuration: stayDuration.value,
    travelDate: travelDate.value,
    selectedFilters: selectedFilters.value,
    useWeather: false,
    remainingMinutes: remaining,
  });
}
</script>

<template>
  <div class="course-finder">
    <h3 class="course-finder__title">{{ text.title }}</h3>

    <div class="course-finder__grid">
      <section class="course-finder__left" :aria-label="text.courseConditions">
        <div class="selected-summary">
          <template v-if="searchMode === 'train' && selectedTrainDetail">
            <span>{{ selectedTrainDetail.station }}</span>
            <strong>{{ selectedTrainDetail.name }}</strong>
            <em>{{ text.depart }} {{ selectedTrainDetail.depart }}</em>
            <b>{{ selectedTrainDetail.remaining }}</b>
          </template>
          <template v-else-if="searchMode === 'stay' && stayDuration">
            <span>
              {{
                STATION_OPTIONS.find((station) => station.value === selectedStation)
                  ?.label
              }}
            </span>
            <strong>{{ stayDuration }}{{ text.hour }}</strong>
          </template>
          <template v-else>
            <span class="selected-summary__empty">{{ text.emptySelection }}</span>
          </template>
        </div>

        <div class="field-block">
          <span class="field-label">{{ text.travelDate }}</span>
          <strong class="date-label">{{ todayLabel }}</strong>
        </div>

        <div class="field-block">
          <span class="field-label">{{ text.station }}</span>
          <div class="segmented" data-tour="home-station">
            <button
              v-for="station in STATION_OPTIONS"
              :key="station.value"
              type="button"
              :class="{ active: selectedStation === station.value }"
              @click="selectStation(station.value)"
            >
              {{ station.label }}
            </button>
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
            <span>{{ text.train }}</span>
            <span>{{ text.depart }}</span>
          </div>

          <div v-if="isTrainsLoading" class="train-list__message">
            {{ text.loading }}
          </div>
          <div v-else-if="trains.length === 0" class="train-list__message">
            {{ text.noTrains }}
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
}

.course-finder__title {
  margin: 0 0 18px;
  color: #1b332f;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0;
}

.course-finder__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 16px;
  align-items: start;
}

.course-finder__left,
.course-finder__right {
  min-width: 0;
}

.selected-summary {
  display: flex;
  min-height: 82px;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  margin-bottom: 14px;
  padding: 13px 14px;
  border: 1px solid #e2efec;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.48);
  box-shadow: 0 12px 24px rgba(40, 78, 72, 0.08);
}

.selected-summary span {
  color: #667c79;
  font-size: 0.72rem;
  font-weight: 700;
}

.selected-summary strong {
  color: #14302c;
  font-size: 0.82rem;
  font-weight: 900;
}

.selected-summary em {
  color: #57716d;
  font-size: 0.72rem;
  font-style: normal;
  font-weight: 700;
}

.selected-summary b {
  color: #23796f;
  font-size: 1.12rem;
  font-weight: 900;
  line-height: 1;
}

.selected-summary__empty {
  display: block;
  text-align: center;
}

.field-block {
  margin-bottom: 13px;
}

.field-label {
  display: block;
  margin-bottom: 7px;
  color: #5d7470;
  font-size: 0.72rem;
  font-weight: 900;
}

.field-label small {
  color: #91a7a3;
  font-size: 0.68rem;
  font-weight: 700;
}

.date-label {
  display: block;
  color: #23796f;
  font-size: 0.78rem;
  font-weight: 900;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.segmented button,
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

.segmented button {
  min-height: 32px;
  border-radius: 6px;
  font-size: 0.72rem;
}

.segmented button.active,
.category-grid button.active {
  border-color: #2f877c;
  background: #e9f8f5;
  color: #226d64;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.category-grid button {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 6px;
  font-size: 0.7rem;
}

.mode-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 10px;
  border-bottom: 2px solid #edf5f3;
}

.mode-tabs button {
  min-height: 34px;
  border-color: transparent;
  border-radius: 7px 7px 0 0;
  background: transparent;
  color: #748884;
  font-size: 0.72rem;
}

.mode-tabs button.active {
  border-color: #e0efec;
  border-bottom-color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.68);
  color: #226d64;
}

.train-list {
  border: 1px solid #e5f0ed;
  border-radius: 7px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
}

.train-list__head,
.train-list__body button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.train-list__head {
  padding: 7px 10px;
  background: #f5fbfa;
  color: #6a807c;
  font-size: 0.68rem;
  font-weight: 900;
}

.train-list__body {
  max-height: 208px;
  overflow-y: auto;
}

.train-list__body button {
  width: 100%;
  min-height: 34px;
  border: 0;
  border-top: 1px solid #f0f6f5;
  background: rgba(255, 255, 255, 0.08);
  color: #14302c;
  cursor: pointer;
  padding: 7px 10px;
  text-align: left;
}

.train-list__body button.active {
  background: #e9f8f5;
}

.train-list__body strong,
.train-list__body span {
  font-size: 0.72rem;
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

.train-list__message {
  padding: 32px 10px;
  color: #91a29f;
  text-align: center;
  font-size: 0.74rem;
  font-weight: 800;
}

.stay-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid #e5f0ed;
  border-radius: 8px;
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
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  border: 0;
  border-radius: 9px;
  background: linear-gradient(180deg, #23887c 0%, #176a63 100%);
  box-shadow: 0 12px 24px rgba(23, 106, 99, 0.28);
  color: #ffffff;
  cursor: pointer;
  font-size: 0.9rem;
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
  margin: 10px 0 0;
  color: #78908c;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
}

@media (max-width: 620px) {
  .course-finder__grid {
    grid-template-columns: 1fr;
  }

  .train-list__body {
    max-height: 170px;
  }
}
</style>
