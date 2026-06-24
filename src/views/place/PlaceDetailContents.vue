<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from "vue";
import { MapPin, Clock, Heart, Image as ImageIcon } from "lucide-vue-next";
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

    const existingScript = document.getElementById(
      "kakao-map-script",
    ) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", loadMaps, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Kakao Maps SDK failed to load.")),
        {
          once: true,
        },
      );
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

      <!-- 영업시간 -->
      <div
        v-if="place.hours && place.hours !== '정보 없음'"
        class="flex items-center gap-3 mb-3"
      >
        <Clock :size="15" color="#B2E4DC" class="flex-shrink-0" />
        <span
          style="font-size: 0.88rem; color: #374151"
          v-html="formatHours(place.hours)"
        />
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
          place.address
        }}</span>
      </div>
    </template>
  </div>
</template>
