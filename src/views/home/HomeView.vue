<script setup lang="ts">
import { ref } from "vue";
import HeroSection from "@/components/home/HeroSection.vue";
import RecommendedSpotsSection from "@/components/home/RecommendedSpotsSection.vue";
import CtaBannerSection from "@/components/home/CtaBannerSection.vue";
import StampEventSection from "@/components/home/StampEventSection.vue";
import PlaceDetailContent from "../place/PlaceDetailContents.vue";
import { useBookmarkStore } from "@/stores/bookmark";

const bookmarkStore = useBookmarkStore();
const selectedSpotId = ref<string | null>(null);

function openSpotModal(id: string) {
  selectedSpotId.value = id;
}

function closeSpotModal() {
  selectedSpotId.value = null;
}
</script>

<template>
  <div class="home-page">
    <HeroSection />

    <div class="home-page__section home-page__section--after-hero">
      <RecommendedSpotsSection
        :likedSpots="[...bookmarkStore.bookmarked]"
        @openSpotModal="openSpotModal"
        @toggleLike="bookmarkStore.toggleBookmark"
      />
    </div>

    <div class="home-page__section">
      <CtaBannerSection />
    </div>

    <div class="home-page__section">
      <StampEventSection />
    </div>
  </div>

  <!-- 장소 상세 모달 -->
  <Transition name="fade-modal">
    <div
      v-if="selectedSpotId"
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
          <PlaceDetailContent :id="selectedSpotId" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.home-page {
  background: #ffffff;
}

.home-page__section {
  margin-top: 80px;
  margin-bottom: 80px;
}

.home-page__section--after-hero {
  margin-top: 48px;
  margin-bottom: 0;
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

@media (max-width: 767px) {
  .home-page__section {
    margin-top: 48px;
    margin-bottom: 48px;
  }

  .home-page__section--after-hero {
    margin-top: 32px;
    margin-bottom: 0;
  }
}
</style>
