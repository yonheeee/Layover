<script setup lang="ts">
import {
  Navigation,
  TrainFront,
} from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import heroImage from "@/assets/images/home-hero-daejeon.png";
import { generateCourses } from "@/api/courses";
import HeroSearchPanel from "@/components/home/HeroSearchPanel.vue";
import { useAuthStore } from "@/stores/auth";
import { useCourseStore } from "@/stores/course";

const t = {
  eyebrow: "KTX \ud658\uc2b9 \uc5ec\ud589 \uac00\uc774\ub4dc",
  title1: "\ub300\uae30 \uc2dc\uac04\uc744",
  title2: "\uc5ec\ud589\uc73c\ub85c",
  title3: "\ucc44\uc6b0\uc138\uc694",
  descriptionDesktopLine1:
    "KTX 환승 대기 시간, 그냥 역에서 기다리지 말고",
  descriptionDesktopLine2:
    "대전의 숨은 명소를 시간에 맞게 똑똑하게 즐기세요",
  descriptionResponsiveLines: [
    "KTX 환승 대기 시간,",
    "그냥 역에서 기다리지 말고",
    "대전의 숨은 명소를",
    "시간에 맞게",
    "똑똑하게 즐기세요",
  ],
  descriptionMobile:
    "KTX 환승 대기 시간, 그냥 역에서 기다리지 말고 대전의 숨은 명소를 시간에 맞게 똑똑하게 즐기세요",
  panelTitle: "\ub9de\ucda4 \ucf54\uc2a4 \ucc3e\uae30",
  panelLabel: "\ub9de\ucda4 \ucf54\uc2a4 \ucc3e\uae30",
  loginRequired:
    "\ub85c\uadf8\uc778\uc774 \ud544\uc694\ud55c \uc11c\ube44\uc2a4\uc785\ub2c8\ub2e4. \ub85c\uadf8\uc778 \ud398\uc774\uc9c0\ub85c \uc774\ub3d9\ud569\ub2c8\ub2e4.",
  generateFailed:
    "\ucf54\uc2a4 \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \uc2dc\ub3c4\ud574\uc8fc\uc138\uc694.",
};

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
  daejeon: "DAEJEON",
  "seo-daejeon": "SEODDAEJEON",
  sintanjin: "SINTANJIN",
};

async function handleRecommendCourse(filters: {
  station: string;
  destination: string;
  trainId: string;
  searchMode: "train" | "stay";
  stayDuration: number | string;
  selectedFilters: string[];
  travelDate: string;
  travelMode: "WALK" | "TAXI";
  useWeather: boolean;
  remainingMinutes: number;
}) {
  if (!auth.isLoggedIn) {
    alert(t.loginRequired);
    router.push("/login");
    return;
  }

  // 열차 모드든 직접 입력 모드든 버퍼를 빼지 않은 값을 그대로 보낸다.
  // 복귀 버퍼 차감은 백엔드(course.return-buffer-minutes)가 일괄 처리한다.
  const durationMinutes =
    filters.searchMode === "train"
      ? filters.remainingMinutes
      : Number(filters.stayDuration) * 60;

  const request = {
    departureStation: STATION_MAP[filters.station] ?? "DAEJEON",
    durationMinutes,
    travelMode: filters.travelMode,
    themeTags: filters.selectedFilters
      .map((filter) => FILTER_MAP[filter])
      .filter(Boolean),
  };

  isLoading.value = true;
  try {
    const courses = await generateCourses(request);
    courseStore.setCourses(courses, request);
    router.push("/map");
  } catch {
    alert(t.generateFailed);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <section class="home-hero">
    <div class="home-hero__line home-hero__line--top" />
    <div class="home-hero__line home-hero__line--bottom" />

    <div class="home-hero__inner">
      <div
        class="home-hero__copy"
        :style="{ '--hero-bg-image': `url(${heroImage})` }"
      >
        <div class="home-hero__eyebrow">
          <TrainFront :size="15" stroke-width="2.4" />
          {{ t.eyebrow }}
        </div>

        <h1 class="home-hero__title">
          <span class="home-hero__title-line">{{ t.title1 }}</span>
          <span class="home-hero__title-line home-hero__title-line--accent">{{ t.title2 }}</span>
          <span class="home-hero__title-line">{{ t.title3 }}</span>
        </h1>

        <p class="home-hero__description home-hero__description--desktop">
          {{ t.descriptionDesktopLine1 }}<br />
          {{ t.descriptionDesktopLine2 }}
        </p>

        <p class="home-hero__description home-hero__description--responsive">
          <span
            v-for="line in t.descriptionResponsiveLines"
            :key="line"
          >
            {{ line }}
          </span>
        </p>

        <p class="home-hero__description home-hero__description--mobile">
          {{ t.descriptionMobile }}
        </p>

      </div>

      <aside class="home-hero__panel" :aria-label="t.panelLabel">
        <div class="home-hero__panel-heading">
          <h2>{{ t.panelTitle }}</h2>
          <Navigation :size="24" stroke-width="1.8" />
        </div>
        <HeroSearchPanel
          :is-loading="isLoading"
          @recommend="handleRecommendCourse"
        />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: stretch;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(244, 253, 250, 0.78)),
    linear-gradient(145deg, #fbfffe 0%, #eefbf8 56%, #f9fffd 100%);
  padding: clamp(16px, 2.4vh, 28px) 24px;
}

.home-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(61, 184, 158, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(61, 184, 158, 0.05) 1px, transparent 1px);
  background-size: 96px 96px;
  mask-image: linear-gradient(110deg, transparent 0%, #000 38%, transparent 78%);
}

.home-hero__line {
  position: absolute;
  pointer-events: none;
  border: 1px dashed rgba(61, 120, 112, 0.22);
  border-color: transparent transparent rgba(61, 120, 112, 0.22);
  border-radius: 50%;
}

.home-hero__line--top {
  top: -110px;
  right: -80px;
  width: 420px;
  height: 210px;
  transform: rotate(8deg);
}

.home-hero__line--bottom {
  bottom: 28px;
  left: -150px;
  width: 580px;
  height: 230px;
  transform: rotate(-10deg);
}

.home-hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(480px, 1fr) minmax(560px, 1fr);
  align-items: start;
  gap: 36px;
  width: min(100%, 1480px);
  margin: 0 auto;
  padding-top: clamp(34px, 5vh, 64px);
}

.home-hero__copy {
  position: relative;
  z-index: 2;
  min-height: min(520px, calc(100vh - 172px));
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  isolation: isolate;
  padding-top: 0;
}

.home-hero__copy::before {
  content: "";
  position: absolute;
  inset: 40px -18px 0 26%;
  z-index: -1;
  background-image:
    linear-gradient(90deg, rgba(251, 255, 254, 0.92) 0%, rgba(251, 255, 254, 0.42) 35%, rgba(251, 255, 254, 0.08) 70%),
    var(--hero-bg-image);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center bottom;
  border-radius: 0 28px 28px 0;
  opacity: 0.42;
  mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 82%, transparent 100%);
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-bottom: clamp(14px, 2.4vh, 24px);
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: #225f58;
  font-size: 0.86rem;
  font-weight: 800;
}

.home-hero__title {
  display: flex;
  flex-direction: column;
  margin: 0;
  color: #132b29;
  font-size: clamp(3rem, 4.2vw, 4rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.08;
  word-break: keep-all;
}

.home-hero__title-line {
  display: block;
  white-space: nowrap;
}

.home-hero__title-line--accent {
  color: #2f877c;
}

.home-hero__description {
  max-width: 720px;
  margin: clamp(18px, 2.6vh, 26px) 0 0;
  color: #405d59;
  font-size: 1.08rem;
  font-weight: 600;
  line-height: 1.8;
}

.home-hero__description--responsive,
.home-hero__description--mobile {
  display: none;
}

.home-hero__description--responsive span {
  display: block;
}

.home-hero__panel {
  position: relative;
  z-index: 2;
  align-self: start;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: min(660px, calc(100vh - 150px));
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.58), rgba(236, 252, 248, 0.38));
  box-shadow: 0 22px 55px rgba(33, 62, 58, 0.14);
  backdrop-filter: blur(8px) saturate(1.1);
  -webkit-backdrop-filter: blur(8px) saturate(1.1);
  max-height: min(660px, calc(100vh - 150px));
  overflow: hidden;
  padding: clamp(24px, 3vh, 34px) clamp(30px, 3vw, 42px) clamp(22px, 2.6vh, 32px);
}

.home-hero__panel :deep(.course-finder) {
  flex: 1;
}

.home-hero__panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(18px, 2.8vh, 30px);
  color: #263b38;
}

.home-hero__panel-heading h2 {
  margin: 0;
  color: #132b29;
  font-size: 1.55rem;
  font-weight: 900;
  letter-spacing: 0;
}

@media (max-width: 1400px) {
  .home-hero {
    padding-right: 18px;
    padding-left: 18px;
  }

  .home-hero__inner {
    grid-template-columns: minmax(300px, 1fr) minmax(0, 3fr);
    gap: 28px;
  }

  .home-hero__title {
    font-size: clamp(2.55rem, 4vw, 3.7rem);
  }

  .home-hero__description {
    max-width: 310px;
    font-size: 1.04rem;
    line-height: 1.7;
  }

  .home-hero__description--desktop {
    display: none;
  }

  .home-hero__description--responsive {
    display: block;
  }

  .home-hero__panel {
    padding: 28px 34px 26px;
  }
}

@media (max-width: 1180px) {
  .home-hero__inner {
    grid-template-columns: minmax(260px, 1fr) minmax(0, 3fr);
    gap: 22px;
  }

  .home-hero__copy::before {
    inset: 46px -14px 0 12%;
    opacity: 0.24;
  }

  .home-hero__title {
    font-size: clamp(2.25rem, 3.8vw, 3.1rem);
  }

  .home-hero__description {
    max-width: 300px;
    font-size: 1rem;
  }

  .home-hero__panel {
    padding: 26px 30px 24px;
  }
}

@media (max-width: 1024px) {
  .home-hero {
    padding: 24px 22px 34px;
  }

  .home-hero__inner {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 18px;
    padding-top: 12px;
  }

  .home-hero__title {
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 0.18em;
    max-width: 100%;
    font-size: clamp(1.75rem, 4.1vw, 2.35rem);
    line-height: 1.12;
    white-space: nowrap;
  }

  .home-hero__title-line {
    display: inline;
    white-space: nowrap;
  }

  .home-hero__copy {
    min-height: 0;
    padding-top: 0;
  }

  .home-hero__copy::before {
    inset: 16px -16px -10px 48%;
    opacity: 0.14;
  }

  .home-hero__description {
    max-width: 100%;
    margin-top: 12px;
    font-size: 0.92rem;
    line-height: 1.62;
  }

  .home-hero__description--responsive {
    display: none;
  }

  .home-hero__description--mobile {
    display: block;
  }

  .home-hero__panel {
    grid-column: auto;
    align-self: start;
    min-height: auto;
    max-height: none;
    padding: 28px 26px 24px;
  }

  .home-hero__panel-heading {
    margin-bottom: 24px;
  }
}

@media (min-width: 1025px) and (max-height: 820px) {
  .home-hero {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .home-hero__inner {
    padding-top: 22px;
  }

  .home-hero__copy {
    min-height: calc(100vh - 132px);
    padding-top: 0;
  }

  .home-hero__eyebrow {
    margin-bottom: 14px;
  }

  .home-hero__title {
    font-size: clamp(2.65rem, 3.8vw, 3.55rem);
    line-height: 1.06;
  }

  .home-hero__description {
    margin-top: 16px;
    font-size: 0.98rem;
    line-height: 1.58;
  }

  .home-hero__panel {
    min-height: calc(100vh - 92px);
    max-height: calc(100vh - 92px);
    padding: 18px 24px 16px;
  }

  .home-hero__panel-heading {
    margin-bottom: 16px;
  }

  .home-hero__panel-heading h2 {
    font-size: 1.35rem;
  }
}

@media (min-width: 768px) and (max-width: 900px) {
  .home-hero {
    padding-top: 20px;
  }

  .home-hero__inner {
    grid-template-columns: 1fr;
    gap: 16px;
    padding-top: 0;
  }

  .home-hero__copy {
    max-width: 100%;
    min-height: 0;
    padding-top: 0;
  }

  .home-hero__copy::before {
    inset: 34px -22px -12px 34%;
    opacity: 0.22;
  }

  .home-hero__eyebrow {
    margin-bottom: 18px;
  }

  .home-hero__title {
    max-width: 100%;
    font-size: clamp(1.72rem, 4vw, 2.2rem);
  }

  .home-hero__description {
    max-width: 100%;
    margin: 12px 0 4px;
    font-size: 0.9rem;
    line-height: 1.62;
  }

  .home-hero__panel {
    grid-column: auto;
    max-width: none;
    min-height: auto;
    margin-top: 8px;
  }
}

@media (max-width: 767px) {
  .home-hero {
    padding: 18px 16px calc(72px + env(safe-area-inset-bottom, 0px));
  }

  .home-hero__inner {
    grid-template-columns: 1fr;
    gap: 16px;
    padding-top: 0;
  }

  .home-hero__copy {
    min-height: 0;
    padding-top: 0;
  }

  .home-hero__copy::before {
    inset: 36px -16px -8px 22%;
    opacity: 0.16;
    background-position: center bottom;
    mask-image: radial-gradient(ellipse at 62% 58%, #000 0%, #000 42%, transparent 78%);
  }

  .home-hero__title {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 0.18em;
    max-width: 100%;
    font-size: clamp(1.85rem, 5.8vw, 2.45rem);
    line-height: 1.16;
    white-space: nowrap;
  }

  .home-hero__title-line {
    display: inline;
    white-space: nowrap;
  }

  .home-hero__panel {
    position: relative;
    z-index: 2;
    grid-column: auto;
    min-height: auto;
    max-height: none;
    padding: 18px 16px 18px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
  }

  .home-hero__panel-heading {
    display: none;
  }
}

@media (max-width: 640px) {
  .home-hero {
    padding: 16px 14px calc(70px + env(safe-area-inset-bottom, 0px));
  }

  .home-hero__title {
    font-size: clamp(1.7rem, 5.6vw, 2.25rem);
  }

  .home-hero__description {
    max-width: 100%;
    margin: 16px 0 10px;
    font-size: 0.9rem;
    line-height: 1.65;
  }

  .home-hero__description--responsive {
    display: none;
  }

  .home-hero__description--mobile {
    display: block;
  }

  .home-hero__panel-heading {
    margin-bottom: 24px;
  }
}

@media (max-width: 420px) {
  .home-hero {
    padding: 12px 10px calc(66px + env(safe-area-inset-bottom, 0px));
  }

  .home-hero__eyebrow {
    margin-bottom: 12px;
    padding: 7px 12px;
    font-size: 0.78rem;
  }

  .home-hero__title {
    font-size: clamp(1.45rem, 6.2vw, 1.72rem);
  }

  .home-hero__description {
    margin-top: 14px;
    font-size: 0.92rem;
  }

  .home-hero__copy::before {
    inset: 32px -10px -4px 12%;
    opacity: 0.13;
  }

  .home-hero__panel {
    padding: 16px 12px;
  }
}
</style>
