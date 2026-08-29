<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { MapPin, X } from "lucide-vue-next";
import PlaceDetailContent from "@/views/place/PlaceDetailContents.vue";
import { useKakaoMap } from "@/composables/useKakaoMap";

const props = defineProps<{
  placeId: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const MOBILE_QUERY = "(max-width: 767px)";

const isMobile = ref(false);
let mobileMediaQuery: MediaQueryList | null = null;

function handleMobileQueryChange(e: MediaQueryListEvent) {
  isMobile.value = e.matches;
}

onMounted(() => {
  mobileMediaQuery = window.matchMedia(MOBILE_QUERY);
  isMobile.value = mobileMediaQuery.matches;
  mobileMediaQuery.addEventListener("change", handleMobileQueryChange);
});

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener("change", handleMobileQueryChange);
});

const sheetState = ref<"half" | "full">("half");

function toggleSheet() {
  sheetState.value = sheetState.value === "half" ? "full" : "half";
}

const mapCoords = ref<{ lat: number; lng: number; name: string } | null>(null);
const mobileMapRef = ref<HTMLElement | null>(null);
// 모바일 전용 지도 인스턴스. 데스크톱 지도는 PlaceDetailContents 가 자체적으로 그린다.
const mobileMapController = useKakaoMap();

// 장소가 바뀔 때마다 half 로 되돌리고, 이전 장소의 지도 상태를 지운다.
// (좌표 없는 장소로 바뀌었는데 이전 마커가 그대로 남는 것을 막는다.)
watch(
  () => props.placeId,
  (id) => {
    if (id) {
      sheetState.value = "half";
      mapCoords.value = null;
    }
  },
);

async function handleLoaded(payload: { lat: number; lng: number; name: string }) {
  mapCoords.value = payload;
  await nextTick();
  if (!mobileMapRef.value) return;

  const center = { lat: payload.lat, lng: payload.lng };
  mobileMapController.clearOverlays();
  await mobileMapController.createMap(mobileMapRef.value, { center, level: 4 });
  mobileMapController.addMarker(center, { title: payload.name });
}

/**
 * 모바일 지도는 PlaceDetailModal 스코프에서 만든다(하위 컴포넌트가 아니라).
 * useKakaoMap 의 onBeforeUnmount 정리는 이 컴포넌트 자체가 사라질 때만 실행되고,
 * v-if 로 모바일 지도 레이어만 사라지는 경우(닫기, 데스크톱으로 리사이즈)는
 * 잡아주지 않는다. 그래서 모바일 모달이 꺼질 때 직접 destroy() 한다.
 */
const isMobileModalOpen = computed(() => !!props.placeId && isMobile.value);
watch(isMobileModalOpen, (open) => {
  if (!open) {
    mobileMapController.destroy();
    mapCoords.value = null;
  }
});
</script>

<template>
  <Teleport to="body">
    <!-- 데스크톱: 기존 중앙 팝업 구조 그대로 -->
    <Transition name="fade-modal">
      <div
        v-if="placeId && !isMobile"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="emit('close')"
      >
        <div
          class="place-detail-modal bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col p-6"
          style="max-height: calc(100dvh - 2rem)"
          @click.stop
        >
          <div
            class="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 flex-shrink-0"
          >
            <h3 class="text-base font-bold text-gray-800">장소 상세 정보</h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer transition-colors"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>
          <div class="flex-1 min-h-0 overflow-y-auto pr-1">
            <PlaceDetailContent :id="placeId" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- 모바일: 지도가 배경 전체, 정보는 하단 시트 -->
    <Transition name="fade-modal">
      <div v-if="placeId && isMobile" class="place-detail-mobile">
        <div class="place-detail-mobile__map-layer">
          <div v-if="mapCoords" ref="mobileMapRef" class="place-detail-mobile__map" />
          <div v-else class="place-detail-mobile__map-empty">
            <MapPin :size="40" color="#3db89e" />
            <p>위치 정보가 없습니다.</p>
          </div>
        </div>

        <button
          type="button"
          class="place-detail-mobile__close"
          aria-label="닫기"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>

        <div
          class="place-detail-mobile__sheet"
          :class="sheetState === 'full' ? 'place-detail-mobile__sheet--full' : 'place-detail-mobile__sheet--half'"
        >
          <button
            type="button"
            class="place-detail-mobile__handle"
            :aria-expanded="sheetState === 'full'"
            :aria-label="sheetState === 'full' ? '정보 접기' : '정보 더 보기'"
            @click="toggleSheet"
          >
            <span class="place-detail-mobile__handle-bar" />
          </button>
          <div class="place-detail-mobile__sheet-body">
            <PlaceDetailContent :id="placeId" hide-map @loaded="handleLoaded" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.25s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.place-detail-mobile {
  position: fixed;
  inset: 0 0 var(--mobile-bottom-nav-height) 0;
  z-index: 100;
  overflow: hidden;
  background: #f0faf8;
}

.place-detail-mobile__map-layer {
  position: absolute;
  inset: 0;
}

.place-detail-mobile__map {
  width: 100%;
  height: 100%;
}

.place-detail-mobile__map-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f0faf8;
  color: #6b8c87;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
}

.place-detail-mobile__close {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 14px);
  right: 14px;
  z-index: 2;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  color: #123d35;
  box-shadow: 0 6px 18px rgba(18, 61, 53, 0.22);
}

.place-detail-mobile__sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  box-shadow: 0 -10px 32px rgba(18, 61, 53, 0.22);
  transition: height 0.25s ease-out;
}

.place-detail-mobile__sheet--half {
  height: 55dvh;
}

.place-detail-mobile__sheet--full {
  height: 92dvh;
}

.place-detail-mobile__handle {
  flex-shrink: 0;
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.place-detail-mobile__handle-bar {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: #d1d5db;
}

.place-detail-mobile__sheet-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 20px 20px;
}
</style>
