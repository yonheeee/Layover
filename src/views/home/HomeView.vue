<script setup lang="ts">
import { ref, onMounted } from "vue";
import HeroSection from "@/components/home/HeroSection.vue";
import RecommendedSpotsSection from "@/components/home/RecommendedSpotsSection.vue";
import CtaBannerSection from "@/components/home/CtaBannerSection.vue";
import PopularCoursesSection from "@/components/home/PopularCoursesSection.vue";
import StampEventSection from "@/components/home/StampEventSection.vue";
import PlaceDetailContent from "../place/PlaceDetailContents.vue";
import type { Place } from "@/types/place";
import { fetchPlaces } from "@/api/places";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const spots = ref<Place[]>([]);
const likedSpots = ref<number[]>([]);

const selectedSpotForModal = ref<Place | null>(null);

function openSpotModal(spot: Place) {
  selectedSpotForModal.value = spot;
}

function closeSpotModal() {
  selectedSpotForModal.value = null;
}

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

function toggleLike(id: number) {
  if (!checkLogin()) return;
  const idx = likedSpots.value.indexOf(id);
  if (idx >= 0) likedSpots.value.splice(idx, 1);
  else likedSpots.value.push(id);
}

onMounted(async () => {
  spots.value = await fetchPlaces();
});
</script>

<template>
  <HeroSection />

  <RecommendedSpotsSection
    :spots="spots"
    :likedSpots="likedSpots"
    @openSpotModal="openSpotModal"
    @toggleLike="toggleLike"
  />

  <CtaBannerSection />

  <PopularCoursesSection />

  <StampEventSection />

  <!-- 장소 상세 모달 -->
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
