<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Heart,
} from "lucide-vue-next";
import type { Place } from "@/types/place";

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

function onCardMouseEnter(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(-4px)";
  el.style.boxShadow =
    "0 12px 40px rgba(178,228,220,0.4), 0 4px 12px rgba(0,0,0,0.07)";
}

function onCardMouseLeave(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(0)";
  el.style.boxShadow =
    "0 4px 24px rgba(178,228,220,0.2), 0 1px 4px rgba(0,0,0,0.04)";
}

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
          <div
            v-for="spot in spots"
            :key="spot.id"
            class="spot-card group rounded-2xl overflow-hidden transition-all duration-300"
            :style="{
              background: '#ffffff',
              boxShadow:
                '0 4px 24px rgba(178,228,220,0.2), 0 1px 4px rgba(0,0,0,0.04)',
              border: '1px solid rgba(178,228,220,0.35)',
              cursor: 'pointer',
            }"
            @mouseenter="onCardMouseEnter"
            @mouseleave="onCardMouseLeave"
            @click="emit('openSpotModal', spot)"
          >
            <div
              class="spot-card-image relative overflow-hidden"
              style="background: #f0faf8"
            >
              <img
                :src="spot.image"
                :alt="spot.name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div class="absolute top-3 right-3 spot-img-badge">
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  :style="{
                    background: spot.isOpen
                      ? 'rgba(61,184,158,0.92)'
                      : 'rgba(150,150,150,0.85)',
                    color: '#fff',
                    fontWeight: 600,
                    backdropFilter: 'blur(6px)',
                  }"
                >
                  {{ spot.isOpen ? "● 영업중" : "○ 영업종료" }}
                </span>
              </div>
              <button
                class="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                style="
                  background: rgba(255, 255, 255, 0.92);
                  backdrop-filter: blur(6px);
                "
                @click.stop="emit('toggleLike', spot.id)"
              >
                <Heart
                  :size="13"
                  :fill="likedSpots.includes(spot.id) ? '#f87171' : 'none'"
                  :color="likedSpots.includes(spot.id) ? '#f87171' : '#9ca3af'"
                />
              </button>
            </div>

            <div class="spot-card-body p-4 space-y-3">
              <div>
                <div class="w-full flex items-center justify-between">
                  <h3
                    style="
                      font-weight: 700;
                      font-size: 0.95rem;
                      color: #1a2e2b;
                      line-height: 1.3;
                    "
                  >
                    {{ spot.name }}
                  </h3>
                  <div class="flex items-center gap-1 shrink-0 pt-0.5">
                    <Star :size="11" fill="#fbbf24" color="#fbbf24" />
                    <span
                      style="
                        font-size: 0.78rem;
                        font-weight: 600;
                        color: #1a2e2b;
                      "
                      >{{ spot.rating }}</span
                    >
                  </div>
                </div>
                <p
                  style="
                    font-size: 0.72rem;
                    color: #3db89e;
                    font-weight: 500;
                    margin-top: 2px;
                  "
                >
                  {{ spot.category }}
                </p>
              </div>
              <p
                class="spot-description"
                style="font-size: 0.8rem; color: #6b8c87; line-height: 1.6"
              >
                {{ spot.description }}
              </p>
              <div
                class="spot-distance-time rounded-xl p-2.5 flex items-center justify-center"
                style="background: #f0faf8"
              >
                <div class="flex items-center gap-1.5">
                  <Clock :size="12" color="#3db89e" />
                  <span
                    style="font-size: 0.78rem; color: #1a2e2b; font-weight: 600"
                    >평균 {{ spot.duration }} 소요</span
                  >
                </div>
              </div>
            </div>
          </div>
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
.spot-card {
  width: 240px;
  flex-shrink: 0;
}
.spot-card-image {
  height: 150px;
}
.spot-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.spot-card-mobile {
  display: none;
}
@media (max-width: 767px) {
  .spot-card {
    width: 222px;
  }
  .spot-card-image {
    height: 222px;
  }
  .spot-card-body {
    display: none;
  }
  .spot-card-mobile {
    display: block;
  }
  .spot-img-badge {
    display: none;
  }
}
</style>
