<script setup lang="ts">
import { Heart } from "lucide-vue-next";
import type { Place } from "@/types/place";

const props = defineProps<{
  spot: Place;
  liked: boolean;
}>();

const emit = defineEmits<{
  click: [spot: Place];
  toggleLike: [id: string];
}>();

function onMouseEnter(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(-4px)";
}

function onMouseLeave(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(0)";
}

function shortAddress(address?: string): string {
  if (!address) return "";
  const gu = address.split(" ")[1];
  const dongMatch = address.match(/\(([^)]+)\)/);
  const dong = dongMatch?.[1];
  return dong ? `${gu} ${dong}` : (gu ?? "");
}
</script>

<template>
  <div
    class="spot-card group transition-all duration-300"
    :style="{ cursor: 'pointer' }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="emit('click', spot)"
  >
    <!-- 이미지 영역 -->
    <div class="spot-card-image relative overflow-hidden rounded-xl">
      <img
        v-if="spot.image"
        :src="spot.image"
        :alt="spot.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span style="font-size: 0.75rem; color: #9ca3af"
          >제공되는 사진이 없습니다</span
        >
      </div>
    </div>

    <!-- 카드 본문 -->
    <div class="spot-card-body pt-2 px-0 space-y-1">
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
          <button
            class="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-all flex-shrink-0"
            style="background: #f0faf8"
            @click.stop="emit('toggleLike', spot.id)"
          >
            <Heart
              :size="13"
              :fill="liked ? '#f87171' : 'none'"
              :color="liked ? '#f87171' : '#9ca3af'"
            />
          </button>
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
        {{ shortAddress(spot.address) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.spot-card {
  width: 240px;
  flex-shrink: 0;
}
.spot-card-image {
  aspect-ratio: 1 / 1;
}
.spot-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (max-width: 767px) {
  .spot-card {
    width: 222px;
  }
  .spot-card-body {
    display: none;
  }
  .spot-img-badge {
    display: none;
  }
}
</style>
