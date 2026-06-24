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
  description:
    "KTX \ud658\uc2b9 \ub300\uae30 \uc2dc\uac04, \uadf8\ub0e5 \uc5ed\uc5d0\uc11c \uae30\ub2e4\ub9ac\uc9c0 \ub9d0\uace0 \ub300\uc804\uc758 \uc228\uc740 \uba85\uc18c\ub97c \uc2dc\uac04\uc5d0 \ub9de\uac8c \ub611\ub611\ud558\uac8c \uc990\uae30\uc138\uc694.",
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
  trainId: string;
  searchMode: "train" | "stay";
  stayDuration: number | string;
  selectedFilters: string[];
  travelDate: string;
  useWeather: boolean;
  remainingMinutes: number;
}) {
  if (!auth.isLoggedIn) {
    alert(t.loginRequired);
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
        .map((filter) => FILTER_MAP[filter])
        .filter(Boolean),
    });

    courseStore.setCourses(courses, {
      departureStation: STATION_MAP[filters.station] ?? "DAEJEON",
      durationMinutes,
      travelMode: "TAXI",
      themeTags: filters.selectedFilters
        .map((filter) => FILTER_MAP[filter])
        .filter(Boolean),
    });
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
      <div class="home-hero__copy">
        <div class="home-hero__eyebrow">
          <TrainFront :size="15" stroke-width="2.4" />
          {{ t.eyebrow }}
        </div>

        <h1 class="home-hero__title">
          {{ t.title1 }}
          <span>{{ t.title2 }}</span>
          {{ t.title3 }}
        </h1>

        <p class="home-hero__description">
          {{ t.description }}
        </p>

      </div>

      <div class="home-hero__visual" aria-hidden="true">
        <img :src="heroImage" alt="" />
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
  min-height: calc(100vh - 64px);
  min-height: calc(100dvh - 64px);
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(244, 253, 250, 0.78)),
    linear-gradient(145deg, #fbfffe 0%, #eefbf8 56%, #f9fffd 100%);
  padding: 56px 24px 40px;
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
  grid-template-columns: minmax(280px, 0.95fr) minmax(220px, 0.8fr) minmax(390px, 1.05fr);
  align-items: center;
  gap: 42px;
  width: min(100%, 1440px);
  margin: 0 auto;
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  padding: 8px 16px;
  border-radius: 999px;
  background: #dff7f2;
  color: #225f58;
  font-size: 0.86rem;
  font-weight: 800;
}

.home-hero__title {
  display: flex;
  flex-direction: column;
  margin: 0;
  color: #132b29;
  font-size: clamp(3rem, 5vw, 5.25rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.08;
}

.home-hero__title span {
  color: #2f877c;
}

.home-hero__description {
  max-width: 450px;
  margin: 28px 0 34px;
  color: #405d59;
  font-size: 1.08rem;
  font-weight: 600;
  line-height: 1.8;
}

.home-hero__visual {
  align-self: stretch;
  display: flex;
  align-items: center;
  min-height: 440px;
  margin-left: -60px;
  margin-right: -84px;
  opacity: 0.95;
}

.home-hero__visual img {
  width: 100%;
  min-width: 360px;
  height: min(55vh, 560px);
  object-fit: cover;
  object-position: center;
  border-radius: 0 42px 42px 0;
  filter: saturate(0.96) contrast(0.98);
  mask-image: linear-gradient(90deg, transparent 0%, #000 18%, #000 78%, transparent 100%);
}

.home-hero__panel {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.58), rgba(236, 252, 248, 0.38));
  box-shadow: 0 22px 55px rgba(33, 62, 58, 0.14);
  backdrop-filter: blur(8px) saturate(1.1);
  -webkit-backdrop-filter: blur(8px) saturate(1.1);
  padding: 28px 30px 26px;
}

.home-hero__panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  color: #263b38;
}

.home-hero__panel-heading h2 {
  margin: 0;
  color: #132b29;
  font-size: 1.55rem;
  font-weight: 900;
  letter-spacing: 0;
}

@media (max-width: 1180px) {
  .home-hero {
    padding-top: 44px;
  }

  .home-hero__inner {
    grid-template-columns: minmax(300px, 0.9fr) minmax(390px, 1fr);
  }

  .home-hero__visual {
    position: absolute;
    right: 35%;
    width: 42%;
    min-height: 320px;
    opacity: 0.42;
    margin: 0;
  }

  .home-hero__panel {
    grid-column: 2;
  }
}

@media (max-width: 900px) {
  .home-hero {
    padding: 34px 18px 30px;
  }

  .home-hero__inner {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .home-hero__visual {
    position: relative;
    right: auto;
    order: 2;
    width: 100%;
    min-height: auto;
    margin: -10px 0 -18px;
    opacity: 0.9;
  }

  .home-hero__visual img {
    min-width: 0;
    height: 220px;
    border-radius: 18px;
    mask-image: linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
  }

  .home-hero__panel {
    order: 3;
    grid-column: auto;
    padding: 24px 18px 22px;
    border-radius: 18px;
  }
}

@media (max-width: 620px) {
  .home-hero__title {
    font-size: 3rem;
  }

  .home-hero__description {
    margin: 22px 0 24px;
    font-size: 0.98rem;
  }

  .home-hero__panel-heading {
    margin-bottom: 24px;
  }
}
</style>
