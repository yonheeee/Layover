<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from "vue";
import {
  MapPin,
  Clock,
  Heart,
  Star,
  Phone,
  Image as ImageIcon,
  Footprints,
} from "lucide-vue-next";
import { getPlaceById } from "@/api/places";
import { useBookmarkStore } from "@/stores/bookmark";

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
  address: "정보 없음",
  phone: "정보 없음",
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
let placeMap: any = null;
let placeMarker: any = null;
let mapResizeObserver: ResizeObserver | null = null;

function hasPlaceCoords() {
  return Number.isFinite(place.value.lat) && Number.isFinite(place.value.lng);
}

function formatHours(hours: string): string {
  if (!hours || hours === "정보 없음") return hours;
  return hours.replace(/(\d{4})(\d{2})(\d{2})/g, "$1.$2.$3");
}

function ensureKakaoMaps() {
  return new Promise<any>((resolve, reject) => {
    const win = window as any;
    const loadMaps = () => {
      if (!win.kakao?.maps) {
        reject(new Error("Kakao Maps SDK is not available."));
        return;
      }
      win.kakao.maps.load(() => resolve(win.kakao));
    };

    if (win.kakao?.maps) {
      loadMaps();
      return;
    }

    const existingScript = document.getElementById("kakao-map-script") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", loadMaps, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Kakao Maps SDK failed to load.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_KEY}&autoload=false`;
    script.onload = loadMaps;
    script.onerror = () => reject(new Error("Kakao Maps SDK failed to load."));
    document.head.appendChild(script);
  });
}

async function renderPlaceMap() {
  await nextTick();
  if (!placeMapRef.value || !hasPlaceCoords()) return;

  try {
    const kakao = await ensureKakaoMaps();
    const center = new kakao.maps.LatLng(place.value.lat, place.value.lng);

    placeMap = new kakao.maps.Map(placeMapRef.value, {
      center,
      level: 4,
    });

    placeMarker?.setMap(null);
    placeMarker = new kakao.maps.Marker({
      position: center,
      map: placeMap,
      title: place.value.name,
    });

    mapResizeObserver?.disconnect();
    mapResizeObserver = new ResizeObserver(() => {
      placeMap?.relayout();
      placeMap?.setCenter(center);
    });
    mapResizeObserver.observe(placeMapRef.value);

    requestAnimationFrame(() => {
      placeMap?.relayout();
      placeMap?.setCenter(center);
    });
  } catch (e) {
    console.error("카카오맵 로딩 실패:", e);
  }
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

onUnmounted(() => {
  mapResizeObserver?.disconnect();
  placeMarker?.setMap(null);
});

const bookmarkStore = useBookmarkStore();

function toggleLike() {
  if (place.value.id) bookmarkStore.toggleBookmark(place.value.id);
}

const categoryColor: Record<string, string> = {
  "맛집/빵집": "background:#FEF3C7;color:#92400E",
  음식: "background:#FEF3C7;color:#92400E",
  관광명소: "background:#D1FAE5;color:#065F46",
  카페: "background:#E0E7FF;color:#3730A3",
  "문화/예술": "background:#FCE7F3;color:#9D174D",
  축제: "background:#FEE2E2;color:#991B1B",
  레포츠: "background:#DBEAFE;color:#1E40AF",
  쇼핑: "background:#EDE9FE;color:#5B21B6",
  숙박: "background:#F0FDF4;color:#166534",
};
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
      <!-- 이미지 갤러리 -->
      <div
        class="rounded-2xl overflow-hidden flex items-center justify-center mb-4"
        style="height: 220px; background: #f0faf8; border: 1.5px solid rgba(178, 228, 220, 0.35);"
      >
        <img
          v-if="place.image"
          :src="place.image"
          class="w-full h-full object-cover"
        />
        <div v-else class="flex flex-col items-center gap-2">
          <ImageIcon :size="40" color="#B2E4DC" />
          <p style="font-size: 0.82rem; color: #9ca3af; font-weight: 500">사진 준비 중입니다</p>
        </div>
      </div>

      <!-- 기본 정보 -->
      <div
        class="rounded-2xl p-6 mb-4"
        style="
          background: #fff;
          border: 1.5px solid rgba(178, 228, 220, 0.35);
          box-shadow: 0 4px 24px rgba(26, 46, 43, 0.08);
        "
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="
                  categoryColor[place.category] ||
                  'background:#f3f4f6;color:#374151'
                "
                >{{ place.category }}</span
              >
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="
                  place.isOpen
                    ? 'background:#d1fae5;color:#065f46'
                    : 'background:#fee2e2;color:#991b1b'
                "
                >{{ place.isOpen ? "영업중" : "영업종료" }}</span
              >
            </div>
            <h1 style="font-weight: 800; font-size: 1.3rem; color: #1a2e2b">
              {{ place.name }}
            </h1>
          </div>
          <button
            @click="toggleLike"
            class="flex flex-col items-center gap-1 flex-shrink-0"
            :style="bookmarkStore.isBookmarked(place.id) ? 'color:#3db89e' : 'color:#9ca3af'"
          >
            <Heart :size="22" :fill="bookmarkStore.isBookmarked(place.id) ? '#3db89e' : 'none'" />
            <span style="font-size: 0.7rem; font-weight: 600">찜</span>
          </button>
        </div>

        <div v-if="place.rating" class="flex items-center gap-2 mb-4">
          <Star :size="15" fill="#fbbf24" color="#fbbf24" />
          <span style="font-weight: 700; font-size: 0.95rem; color: #1a2e2b">{{
            place.rating
          }}</span>
          <span v-if="place.reviewCount" style="font-size: 0.82rem; color: #9ca3af"
            >(리뷰 {{ place.reviewCount.toLocaleString() }}개)</span
          >
        </div>

        <div v-if="place.tags?.length" class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="tag in place.tags"
            :key="tag"
            class="text-xs px-3 py-1 rounded-full"
            style="background: #e8f8f5; color: #3db89e; font-weight: 600"
          >
            # {{ tag }}
          </span>
        </div>

        <div class="flex flex-col gap-2.5">
          <div class="flex items-center gap-3">
            <Clock :size="15" color="#B2E4DC" class="flex-shrink-0" />
            <span style="font-size: 0.88rem; color: #374151" v-html="formatHours(place.hours)" />
          </div>
          <div class="flex items-center gap-3">
            <MapPin :size="15" color="#B2E4DC" class="flex-shrink-0" />
            <span style="font-size: 0.88rem; color: #374151">{{
              place.address
            }}</span>
          </div>
          <div v-if="place.phone !== '정보 없음'" class="flex items-center gap-3">
            <Phone :size="15" color="#B2E4DC" class="flex-shrink-0" />
            <span style="font-size: 0.88rem; color: #374151">{{
              place.phone
            }}</span>
          </div>
          <div v-if="place.distance" class="flex items-center gap-3">
            <Footprints :size="15" color="#B2E4DC" class="flex-shrink-0" />
            <span style="font-size: 0.88rem; color: #3db89e; font-weight: 600"
              >대전역에서 {{ place.distance }}</span
            >
          </div>
        </div>
      </div>

      <!-- 장소 소개 -->
      <div
        v-if="place.description"
        class="rounded-2xl p-6 mb-4"
        style="
          background: #fff;
          border: 1.5px solid rgba(178, 228, 220, 0.35);
          box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
        "
      >
        <h2
          style="
            font-weight: 700;
            font-size: 0.95rem;
            color: #1a2e2b;
            margin-bottom: 12px;
          "
        >
          장소 소개
        </h2>
        <p style="font-size: 0.9rem; color: #374151; line-height: 1.75">
          {{ place.description }}
        </p>
      </div>

      <!-- 위치 -->
      <div
        class="rounded-2xl overflow-hidden mb-4"
        style="
          border: 1.5px solid rgba(178, 228, 220, 0.35);
          box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
        "
      >
        <div
          class="px-5 py-4"
          style="
            background: #fff;
            border-bottom: 1px solid rgba(178, 228, 220, 0.3);
          "
        >
          <h2 style="font-weight: 700; font-size: 0.95rem; color: #1a2e2b">
            위치
          </h2>
        </div>
        <div style="height: 220px; background: #f0faf8; position: relative">
          <div
            v-if="hasPlaceCoords()"
            ref="placeMapRef"
            style="width: 100%; height: 100%"
          />
          <div
            v-if="hasPlaceCoords()"
            class="absolute left-3 right-3 bottom-3 rounded-xl px-3 py-2 flex items-center gap-2"
            style="background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); box-shadow: 0 2px 10px rgba(26,46,43,0.08)"
          >
            <MapPin :size="16" color="#3db89e" />
            <p class="truncate" style="font-size: 0.78rem; color: #1a2e2b; font-weight: 600">
              {{ place.address }}
            </p>
          </div>
          <div v-else class="h-full flex flex-col items-center justify-center text-center">
            <MapPin :size="36" color="#3db89e" />
            <p style="font-size: 0.85rem; color: #6b8c87; margin-top: 8px">
              위치 정보가 없습니다.
            </p>
          </div>
        </div>
      </div>

      <!-- 함께 가면 좋은 곳 -->
      <div
        v-if="place.nearbyPlaces?.length"
        class="rounded-2xl p-5"
        style="
          background: #fff;
          border: 1.5px solid rgba(178, 228, 220, 0.35);
          box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
        "
      >
        <h2
          style="
            font-weight: 700;
            font-size: 0.95rem;
            color: #1a2e2b;
            margin-bottom: 12px;
          "
        >
          함께 가면 좋은 곳
        </h2>
        <div class="flex flex-col gap-2">
          <div
            v-for="nearby in place.nearbyPlaces"
            :key="nearby.id"
            class="flex items-center gap-3 p-3 rounded-xl text-left"
            style="border: 1.5px solid rgba(178, 228, 220, 0.35)"
          >
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: #e8f8f5"
            >
              <MapPin :size="16" color="#3db89e" />
            </div>
            <div class="flex-1 min-w-0">
              <p style="font-weight: 600; font-size: 0.9rem; color: #1a2e2b">
                {{ nearby.name }}
              </p>
              <p style="font-size: 0.78rem; color: #9ca3af">
                {{ nearby.distance }}
              </p>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
              :style="
                categoryColor[nearby.category] ||
                'background:#f3f4f6;color:#374151'
              "
              >{{ nearby.category }}</span
            >
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
