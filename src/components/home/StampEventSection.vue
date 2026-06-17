<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();

function handleJoinEvent() {
  router.push("/stamp-tour");
}
</script>

<template>
  <section style="padding: 0 2rem 6rem; max-width: 1440px; margin: 0 auto">
    <div
      class="relative rounded-3xl overflow-hidden px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6"
      style="
        background: #f0faf8;
        border: 1.5px solid rgba(61, 184, 158, 0.25);
        box-shadow: 0 10px 30px rgba(178, 228, 220, 0.25);
      "
    >
      <div
        class="absolute pointer-events-none rounded-full"
        style="
          right: 5%;
          top: -20%;
          width: 180px;
          height: 180px;
          background: rgba(178, 228, 220, 0.4);
          filter: blur(20px);
        "
      />
      <div class="flex items-center gap-5 relative z-10">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 animate-bounce"
          style="
            background: #ffffff;
            border: 1px solid rgba(178, 228, 220, 0.6);
          "
        >
          📮
        </div>
        <div class="space-y-1">
          <div
            class="inline-flex items-center gap-1.5 text-xs font-bold"
            style="color: #3db89e"
          >
            <span>NEW</span> • 대전 레이오버 특별 스탬프 이벤트
          </div>
          <h3
            style="
              font-weight: 800;
              font-size: 1.25rem;
              color: #1a2e2b;
              letter-spacing: -0.01em;
              line-height: 1.4;
            "
          >
            여행 일정에 사진을 첨부하면,<br class="block md:hidden" />
            랜덤으로
            <span style="color: #3db89e">대전 캐릭터 스탬프 엽서</span>를
            드려요!
          </h3>
          <p style="color: #6b8c87; font-size: 0.85rem; font-weight: 500">
            기억하고 싶은 환승 순간을 업로드하고 오프라인 한정 굿즈를
            수령하세요.
          </p>
        </div>
      </div>
      <button
        @click="handleJoinEvent"
        class="relative z-10 shrink-0 px-6 py-3.5 rounded-xl flex items-center gap-1.5 font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] shadow-md border-none cursor-pointer"
        style="background: #3db89e"
      >
        이벤트 참여하기 <ChevronRight :size="14" />
      </button>
    </div>
  </section>
</template>
