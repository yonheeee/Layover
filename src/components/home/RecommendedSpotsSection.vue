<script setup lang="ts">
import { ref, onMounted } from "vue";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-vue-next";
import type { Place } from "@/types/place";
import PlaceCard from "@/components/common/PlaceCard.vue";

const props = defineProps<{
  spots: Place[];
  likedSpots: number[];
}>();

const emit = defineEmits<{
  openSpotModal: [spot: Place];
  toggleLike: [id: number];
}>();

const scrollContainer = ref<HTMLDivElement | null>(null);
const isAtStart = ref(true);
const isAtEnd = ref(false);

const scroll = (direction: "left" | "right") => {
  const container = scrollContainer.value;
  if (!container) return;
  const scrollAmount = 256;
  const targetLeft =
    container.scrollLeft +
    (direction === "left" ? -scrollAmount : scrollAmount);
  container.scrollTo({ left: targetLeft, behavior: "smooth" });
};

const checkScrollPosition = () => {
  const container = scrollContainer.value;
  if (!container) return;
  isAtStart.value = container.scrollLeft <= 5;
  isAtEnd.value =
    container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;
};

onMounted(() => {
  setTimeout(checkScrollPosition, 100);
});
</script>

<template>
  <section style="max-width: 1440px; margin: 0 auto; padding: 4rem 2rem">
    <div class="flex items-end justify-between mb-6">
      <div class="space-y-2">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm"
          style="background: #e8f8f5; color: #3db89e; font-weight: 600"
        >
          <MapPin :size="13" />대전 인기 명소
        </div>
        <h2
          :style="{
            fontWeight: 700,
            fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
            color: '#1a2e2b',
            letterSpacing: '-0.02em',
          }"
        >
          환승 시간에 딱 맞는 코스
        </h2>
      </div>
      <router-link
        to="/place"
        class="flex items-center gap-1 text-sm hover:gap-2 transition-all duration-200"
        style="color: #3db89e; font-weight: 600; text-decoration: none"
      >
        전체 보기 <ChevronRight :size="16" />
      </router-link>
    </div>

    <div class="relative px-16">
      <button
        @click="scroll('left')"
        type="button"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-transparent flex items-center justify-center text-[#3db89e] hover:scale-125 transition-all duration-200 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
        :disabled="isAtStart"
      >
        <ChevronLeft :size="36" :stroke-width="3" />
      </button>

      <div
        ref="scrollContainer"
        @scroll="checkScrollPosition"
        class="spots-scroll-container scroll-smooth"
      >
        <div class="spots-scroll-inner">
          <PlaceCard
            v-for="spot in spots"
            :key="spot.id"
            :spot="spot"
            :liked="likedSpots.includes(spot.id)"
            @click="emit('openSpotModal', spot)"
            @toggleLike="emit('toggleLike', spot.id)"
          />
        </div>
      </div>

      <button
        @click="scroll('right')"
        type="button"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-transparent flex items-center justify-center text-[#3db89e] hover:scale-125 transition-all duration-200 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
        :disabled="isAtEnd"
      >
        <ChevronRight :size="36" :stroke-width="3" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.spots-scroll-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 0;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
.spots-scroll-container::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}
.spots-scroll-inner {
  display: flex;
  gap: 16px;
  width: max-content;
}
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
