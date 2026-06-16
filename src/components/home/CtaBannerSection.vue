<script setup lang="ts">
import { Train, ChevronRight } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useCheckLogin } from "@/utils/auth";

const router = useRouter();
const { checkLogin } = useCheckLogin();

function handleCreateCourseCTA() {
  if (!checkLogin()) return;
  router.push("/create-course");
}
</script>

<template>
  <section style="padding: 0 2rem 5rem; max-width: 1440px; margin: 0 auto">
    <div
      class="relative rounded-3xl overflow-hidden px-12 py-14 flex flex-col md:flex-row items-center justify-between gap-8"
      style="
        background: linear-gradient(
          135deg,
          #b2e4dc 0%,
          #3db89e 55%,
          #2aa88e 100%
        );
      "
    >
      <div
        class="absolute inset-0 pointer-events-none"
        style="
          background: radial-gradient(
            ellipse at 80% 50%,
            rgba(255, 255, 255, 0.12),
            transparent 60%
          );
        "
      />
      <div class="space-y-3 relative z-10">
        <h2
          :style="{
            fontWeight: 700,
            fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)',
            color: '#ffffff',
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
          }"
        >
          지금 바로 나만의 대전<br />환승 코스를 만들어보세요!
        </h2>
        <p style="color: rgba(255, 255, 255, 0.85); font-size: 0.95rem">
          무료로 시작하고, 수천 명의 여행자와 후기를 나눠보세요.
        </p>
      </div>
      <button
        @click="handleCreateCourseCTA"
        class="relative z-10 shrink-0 px-8 py-4 rounded-2xl flex items-center gap-2 hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200 border-none cursor-pointer"
        style="
          background: #ffffff;
          color: #3db89e;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        "
      >
        <Train :size="17" />무료로 코스 만들기<ChevronRight :size="15" />
      </button>
    </div>
  </section>
</template>
