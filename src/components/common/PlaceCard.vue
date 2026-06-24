<script setup lang="ts">
import { Star, Clock, Heart } from "lucide-vue-next";
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
  el.style.boxShadow =
    "0 12px 40px rgba(178,228,220,0.4), 0 4px 12px rgba(0,0,0,0.07)";
}

function onMouseLeave(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(0)";
  el.style.boxShadow =
    "0 4px 24px rgba(178,228,220,0.2), 0 1px 4px rgba(0,0,0,0.04)";
}

function shortAddress(address?: string): string {
  if (!address) return "";
  const gu = address.split(" ")[1];
  const dongMatch = address.match(/\(([^)]+)\)/);
  const dong = dongMatch?.[1];
  return dong ? `${gu} ${dong}` : gu ?? "";
}
</script>

<template>
  <div
    class="spot-card group rounded-2xl overflow-hidden transition-all duration-300"
    :style="{
      background: '#ffffff',
      boxShadow: '0 4px 24px rgba(178,228,220,0.2), 0 1px 4px rgba(0,0,0,0.04)',
      border: '1px solid rgba(178,228,220,0.35)',
      cursor: 'pointer',
    }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="emit('click', spot)"
  >
    <!-- 이미지 영역 -->
    <div
      class="spot-card-image relative overflow-hidden"
      style="background: #f0faf8"
    >
      <img
        :src="spot.image"
        :alt="spot.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      
      <!-- 좋아요 버튼 -->
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
          :fill="liked ? '#f87171' : 'none'"
          :color="liked ? '#f87171' : '#9ca3af'"
        />
      </button>
    </div>

    <!-- 카드 본문 -->
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
  height: 150px;
}
.spot-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  .spot-img-badge {
    display: none;
  }
}
</style>
