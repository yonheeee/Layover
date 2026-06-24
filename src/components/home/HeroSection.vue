<script setup lang="ts">
import { ref } from "vue";
import { MapPin, Train, Navigation, Users } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useCourseStore } from "@/stores/course";
import { generateCourses } from "@/api/courses";
import HeroSearchPanel from "@/components/home/HeroSearchPanel.vue";

const router = useRouter();
const auth = useAuthStore();
const courseStore = useCourseStore();
const isLoading = ref(false);

const FILTER_MAP: Record<string, string> = {
  food: "FOOD",
  cafe: "CAFE",
  culture: "CULTURE",
  nature: "NATURE",
  shopping: "SHOPPING",
};
const STATION_MAP: Record<string, string> = {
  daejeon: "DAEJEON", "seo-daejeon": "SEODDAEJEON", sintanjin: "SINTANJIN",
};

async function handleRecommendCourse(filters: {
  station: string;
  searchMode: "train" | "stay";
  stayDuration: number | string;
  selectedFilters: string[];
  travelDate: string;
  useWeather: boolean;
  remainingMinutes: number;
}) {
  if (!auth.isLoggedIn) {
    alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
    router.push("/login");
    return;
  }

  const durationMinutes =
    filters.searchMode === "train"
      ? filters.remainingMinutes
      : Number(filters.stayDuration) * 60;

  isLoading.value = true;
  try {
    const courses = await generateCourses({
      departureStation: STATION_MAP[filters.station] ?? "DAEJEON",
      durationMinutes,
      travelMode: "TAXI",
      themeTags: filters.selectedFilters
        .map((f) => FILTER_MAP[f])
        .filter(Boolean),
    });
    courseStore.setCourses(courses, {
      departureStation: STATION_MAP[filters.station] ?? "DAEJEON",
      durationMinutes,
      travelMode: "TAXI",
      themeTags: filters.selectedFilters.map((f) => FILTER_MAP[f]).filter(Boolean),
    });
    router.push("/map");
  } catch {
    alert("코스 생성에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <section
    class="hero-section flex items-start md:items-center justify-center relative"
  >
    <!-- 배경 장식 -->
    <div
      class="absolute pointer-events-none"
      style="
        z-index: 0;
        top: -100px;
        right: -100px;
        width: 450px;
        height: 450px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(178, 228, 220, 0.35),
          transparent 70%
        );
      "
    />
    <div
      class="absolute pointer-events-none"
      style="
        z-index: 0;
        bottom: -80px;
        left: -80px;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(61, 184, 158, 0.15),
          transparent 70%
        );
      "
    />

    <div
      class="mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 items-center gap-12"
      style="max-width: 1440px; z-index: 1"
    >
      <!-- 좌측: 타이틀 + 통계 -->
      <div class="space-y-6 w-full">
        <div
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style="background: #e8f8f5; color: #3db89e; font-weight: 600"
        >
          <Train :size="14" /> KTX 환승 여행 가이드
        </div>
        <h1
          :style="{
            fontFamily: '\'Noto Sans KR\', sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
            color: '#1a2e2b',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }"
        >
          대기 시간을<br /><span style="color: #3db89e">여행으로</span> 채우세요
        </h1>
        <p
          style="
            font-size: 1.05rem;
            color: #6b8c87;
            line-height: 1.8;
            max-width: 480px;
          "
        >
          KTX 환승 대기 시간, 그냥 역에서 기다리지 마세요.<br />
          대전의 숨은 명소를 시간에 맞게 똑똑하게 즐겨보세요.
        </p>
        <div class="flex gap-8 pt-2">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <MapPin :size="15" color="#3db89e" /><span
                style="font-weight: 700; font-size: 1.2rem; color: #1a2e2b"
                >50+</span
              >
            </div>
            <span style="font-size: 0.78rem; color: #6b8c87">대전 관광지</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <Users :size="15" color="#3db89e" /><span
                style="font-weight: 700; font-size: 1.2rem; color: #1a2e2b"
                >12,000+</span
              >
            </div>
            <span style="font-size: 0.78rem; color: #6b8c87">여행자 후기</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <Navigation :size="15" color="#3db89e" /><span
                style="font-weight: 700; font-size: 1.2rem; color: #1a2e2b"
                >3분</span
              >
            </div>
            <span style="font-size: 0.78rem; color: #6b8c87">코스 생성</span>
          </div>
        </div>
      </div>

      <!-- 우측: 검색 패널 -->
      <div class="w-full flex justify-center md:justify-center">
        <HeroSearchPanel @recommend="handleRecommendCourse" :isLoading="isLoading" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background: #ffffff;
  min-height: calc(100vh - 64px);
  min-height: calc(100dvh - 64px);
  padding: 2rem 0;
}
@media (max-width: 767px) {
  .hero-section {
    background: linear-gradient(155deg, #e8f8f5 0%, #ffffff 45%, #f0faf8 100%);
    min-height: calc(100dvh - 64px);
    height: auto;
    padding: 3rem 0;
  }
}
</style>
