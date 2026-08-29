<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import GuidedTour from "@/components/tutorial/GuidedTour.vue";
import HeroSection from "@/components/home/HeroSection.vue";
import RecommendedSpotsSection from "@/components/home/RecommendedSpotsSection.vue";
import PopularCoursesSection from "@/components/home/PopularCoursesSection.vue";
import CtaBannerSection from "@/components/home/CtaBannerSection.vue";
import StampEventSection from "@/components/home/StampEventSection.vue";
import PlaceDetailModal from "@/components/place/PlaceDetailModal.vue";
import { useBookmarkStore } from "@/stores/bookmark";

const bookmarkStore = useBookmarkStore();
const route = useRoute();
const selectedSpotId = ref<string | null>(null);
const forceHomeTour = computed(() =>
  route.query.tour === "home" ? String(route.query.run ?? "home") : false,
);

const homeTourSteps = [
  {
    selector: '[data-tour="home-station"]',
    title: "출발역을 선택해 보세요",
    description: "환승을 시작할 대전역 또는 서대전역을 누르면 다음 안내로 넘어가요.",
  },
  {
    selector: '[data-tour="home-time"]',
    title: "여행 가능한 시간을 정해요",
    description: "기차 출발 시간 기준 또는 직접 입력 중 원하는 방식을 선택해 보세요.",
  },
  {
    selector: '[data-tour="home-category"]',
    title: "관심 있는 여행 테마를 골라요",
    description: "맛집, 문화, 자연, 쇼핑 중 끌리는 카테고리를 클릭해 보세요.",
  },
  {
    selector: '[data-tour="home-recommend"]',
    title: "AI에게 일정을 추천받아요",
    description: "이 버튼을 클릭하면 실제 생성 없이 홈 화면 안내만 완료돼요.",
  },
];

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
      <PopularCoursesSection />
    </div>

    <div class="home-page__section">
      <CtaBannerSection />
    </div>

    <div class="home-page__section">
      <StampEventSection />
    </div>
  </div>

  <!-- 장소 상세 모달 -->
  <PlaceDetailModal :place-id="selectedSpotId" @close="closeSpotModal" />

  <GuidedTour
    storage-key="layover-tour-home-v1"
    :steps="homeTourSteps"
    :force="forceHomeTour"
  />
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

@media (max-width: 1024px) {
  .home-page__section {
    margin-top: 64px;
    margin-bottom: 64px;
  }

  .home-page__section--after-hero {
    margin-top: 40px;
    margin-bottom: 0;
  }
}

@media (max-width: 640px) {
  .home-page__section {
    margin-top: 48px;
    margin-bottom: 48px;
  }

  .home-page__section--after-hero {
    margin-top: 32px;
  }
}

@media (max-width: 420px) {
  .home-page__section {
    margin-top: 40px;
    margin-bottom: 40px;
  }
}
</style>
