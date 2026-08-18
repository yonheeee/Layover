<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Info,
  MapPin,
  Phone,
} from "lucide-vue-next";
import { getPlaceById } from "@/api/places";
import { useBookmarkStore } from "@/stores/bookmark";
import { useKakaoMap } from "@/composables/useKakaoMap";

const props = defineProps<{
  id?: string | null;
}>();

const EMPTY_PLACE = {
  id: null as string | null,
  name: "",
  category: "",
  tags: [] as string[],
  rating: undefined as number | undefined,
  reviewCount: undefined as number | undefined,
  isOpen: false,
  hours: "정보 없음",
  restDate: "",
  infoCenter: "",
  parking: "",
  useFee: "",
  reservation: "",
  address: "정보 없음",
  roadAddress: "",
  phone: "정보 없음",
  kakaoPlaceUrl: "",
  kakaoPhone: "",
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
  distance: "",
  image: "",
  description: "",
  nearbyPlaces: [] as any[],
};

const place = ref<any>({ ...EMPTY_PLACE });
const loading = ref(false);
const placeMapRef = ref<HTMLElement | null>(null);
// 지도 생성·마커·relayout·정리는 useKakaoMap이 담당한다.
const placeMapController = useKakaoMap();

function hasPlaceCoords() {
  return Number.isFinite(place.value.lat) && Number.isFinite(place.value.lng);
}

function formatHours(hours: string): string {
  if (!hours || hours === "정보 없음") return hours;
  return hours.replace(/(\d{4})(\d{2})(\d{2})/g, "$1.$2.$3");
}

function hasValue(value?: string | null) {
  return Boolean(value && value.trim() && value !== "정보 없음");
}

const detailInfoItems = computed(() =>
  [
    {
      label: "운영시간",
      value: place.value.hours,
      icon: Clock,
    },
    {
      label: "휴무일",
      value: place.value.restDate,
      icon: CalendarDays,
    },
    {
      label: "문의",
      value: place.value.infoCenter || place.value.kakaoPhone || place.value.phone,
      icon: Phone,
    },
    {
      label: "주차",
      value: place.value.parking,
      icon: MapPin,
    },
    {
      label: "요금/대표정보",
      value: place.value.useFee,
      icon: Info,
    },
    {
      label: "예약/체험",
      value: place.value.reservation,
      icon: Info,
    },
  ].filter((item) => hasValue(item.value)),
);

function openKakaoMap() {
  if (!place.value.kakaoPlaceUrl) return;
  window.open(place.value.kakaoPlaceUrl, "_blank", "noopener,noreferrer");
}

async function renderPlaceMap() {
  await nextTick();
  if (!placeMapRef.value || !hasPlaceCoords()) return;

  const center = { lat: place.value.lat as number, lng: place.value.lng as number };
  placeMapController.clearOverlays();
  await placeMapController.createMap(placeMapRef.value, { center, level: 4 });
  placeMapController.addMarker(center, { title: place.value.name });
}

function applyPlace(data: any) {
  const normalized = {
    ...data,
    reviewCount: data.reviewCount ?? data.reviews ?? undefined,
    tags: data.tags ?? (data.tag ? [data.tag] : []),
  };
  place.value = { ...EMPTY_PLACE, ...normalized };
}

watch(
  () => props.id,
  async (id) => {
    if (id == null) return;
    loading.value = true;
    place.value = { ...EMPTY_PLACE };
    try {
      const data = await getPlaceById(id);
      applyPlace(data);
    } catch (e) {
      console.error("장소 상세 로딩 실패:", e);
    } finally {
      loading.value = false;
    }
    await renderPlaceMap();
  },
  { immediate: true },
);

const bookmarkStore = useBookmarkStore();

function toggleLike() {
  if (place.value.id) bookmarkStore.toggleBookmark(place.value.id);
}
</script>

<template>
  <div class="place-detail-content">
    <!-- 로딩 -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="w-10 h-10 rounded-full border-2 border-teal-300 border-t-teal-600 animate-spin"
      />
    </div>

    <template v-else>
      <!-- 이름 + 찜버튼 -->
      <div class="flex items-start justify-between gap-3 mb-1">
        <h1
          style="
            font-weight: 800;
            font-size: 1.3rem;
            color: #1a2e2b;
            line-height: 1.3;
          "
        >
          {{ place.name }}
        </h1>
        <button
          @click="toggleLike"
          class="flex flex-col items-center gap-1 flex-shrink-0"
          :style="
            bookmarkStore.isBookmarked(place.id)
              ? 'color:#3db89e'
              : 'color:#9ca3af'
          "
        >
          <Heart
            :size="22"
            :fill="bookmarkStore.isBookmarked(place.id) ? '#3db89e' : 'none'"
          />
          <span style="font-size: 0.7rem; font-weight: 600">찜</span>
        </button>
      </div>

      <!-- 카테고리 -->
      <p
        style="
          font-size: 0.75rem;
          color: #3db89e;
          font-weight: 600;
          margin-bottom: 12px;
        "
      >
        {{ place.category }}
      </p>

      <!-- 구분선 -->
      <hr style="border-color: rgba(178, 228, 220, 0.4); margin-bottom: 16px" />

      <!-- 이미지 -->
      <div
        class="rounded-2xl overflow-hidden mb-4"
        style="border: 1.5px solid rgba(178, 228, 220, 0.35)"
      >
        <img
          v-if="place.image"
          :src="place.image"
          class="w-full h-full object-cover"
          style="max-height: 400px; width: 100%; object-fit: contain"
        />
        <div v-else class="flex flex-col items-center gap-2 py-10">
          <ImageIcon :size="40" color="#B2E4DC" />
          <p style="font-size: 0.82rem; color: #9ca3af; font-weight: 500">
            사진 준비 중입니다
          </p>
        </div>
      </div>

      <!-- 상세 운영 정보 -->
      <div
        class="rounded-2xl mb-4 p-4"
        style="background:#f8fbfa; border:1.5px solid rgba(178,228,220,0.4)"
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <p style="font-size:0.78rem; font-weight:800; color:#3db89e">
              상세 정보
            </p>
            <p style="font-size:0.7rem; color:#7b8f8b; line-height:1.55; margin-top:2px">
              TourAPI와 Kakao Local API 기반 정보입니다. 영업정보는 변동될 수 있어요.
            </p>
          </div>
          <button
            v-if="place.kakaoPlaceUrl"
            type="button"
            class="kakao-map-link"
            @click="openKakaoMap"
          >
            <span class="kakao-map-link__icon">K</span>
            <span>카카오맵</span>
            <ExternalLink :size="13" />
          </button>
        </div>

        <div v-if="detailInfoItems.length" class="grid gap-2">
          <div
            v-for="item in detailInfoItems"
            :key="item.label"
            class="place-detail-info-row"
          >
            <component :is="item.icon" :size="15" color="#3db89e" />
            <div class="min-w-0">
              <p class="place-detail-info-row__label">{{ item.label }}</p>
              <p
                class="place-detail-info-row__value"
                v-html="formatHours(item.value)"
              />
            </div>
          </div>
        </div>
        <p v-else style="font-size:0.78rem; color:#9ca3af; line-height:1.6">
          상세 운영 정보는 아직 준비 중입니다. 최신 정보는 지도 상세 페이지에서 확인해주세요.
        </p>
      </div>

      <!-- 설명 -->
      <div v-if="place.description" class="mb-4">
        <p style="font-size: 0.9rem; color: #374151; line-height: 1.75">
          {{ place.description }}
        </p>
      </div>

      <!-- 카카오 지도 -->
      <div
        class="rounded-2xl overflow-hidden mb-4"
        style="border: 1.5px solid rgba(178, 228, 220, 0.35)"
      >
        <div style="height: 220px; background: #f0faf8; position: relative">
          <div
            v-if="hasPlaceCoords()"
            ref="placeMapRef"
            style="width: 100%; height: 100%"
          />
          <div
            v-else
            class="h-full flex flex-col items-center justify-center text-center"
          >
            <MapPin :size="36" color="#3db89e" />
            <p style="font-size: 0.85rem; color: #6b8c87; margin-top: 8px">
              위치 정보가 없습니다.
            </p>
          </div>
        </div>
      </div>

      <!-- 상세주소 -->
      <div class="flex items-center gap-3">
        <MapPin :size="15" color="#B2E4DC" class="flex-shrink-0" />
        <span style="font-size: 0.88rem; color: #374151">{{
          place.roadAddress || place.address
        }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.kakao-map-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 7px 10px;
  border-radius: 999px;
  background: #fee500;
  color: #191919;
  font-size: 0.72rem;
  font-weight: 900;
  box-shadow: 0 6px 14px rgba(25, 25, 25, 0.12);
}

.kakao-map-link__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  border-radius: 6px;
  background: #191919;
  color: #fee500;
  font-size: 0.68rem;
  font-weight: 950;
  line-height: 1;
}

.place-detail-info-row {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 9px;
  padding: 10px 11px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.place-detail-info-row__label {
  font-size: 0.7rem;
  font-weight: 900;
  color: #6b8c87;
}

.place-detail-info-row__value {
  margin-top: 2px;
  font-size: 0.82rem;
  line-height: 1.55;
  color: #374151;
  word-break: keep-all;
}
</style>
