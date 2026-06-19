<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Search } from "lucide-vue-next";
import PlaceDetailContent from "./PlaceDetailContents.vue";
import PlaceCard from "@/components/common/PlaceCard.vue";
import { getPlaces } from "@/api/places";
import type { PlacePage } from "@/api/places";
import type { Place } from "@/types/place";

const router = useRouter();

const recommendedPlaces = ref([
  {
    id: "banner-1",
    name: "장태산 자연휴양림",
    desc: "메타세쿼이아 숲길에서 즐기는 이국적인 힐링",
    img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
    tag: "#인생샷 #힐링명소",
  },
  {
    id: "banner-2",
    name: "대청호 오백리길",
    desc: "푸른 호수를 따라 걷는 대전 최고의 드라이브 코스",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    tag: "#데이트코스 #산책",
  },
  {
    id: "banner-3",
    name: "엑스포 과학공원 한빛탑",
    desc: "화려한 음악분수와 대전의 아름다운 야경을 한눈에",
    img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    tag: "#야경명소 #음악분수",
  },
]);

const currentSlide = ref(0);
let slideTimer: any = null;

const startSlideShow = () => {
  slideTimer = setInterval(() => {
    currentSlide.value =
      (currentSlide.value + 1) % recommendedPlaces.value.length;
  }, 4000);
};

const CATEGORY_TABS = [
  { key: "", label: "전체" },
  { key: "TOUR", label: "관광명소" },
  { key: "FOOD", label: "음식" },
  { key: "CULTURE", label: "문화/예술" },
  { key: "FESTIVAL", label: "축제" },
  { key: "LEPORTS", label: "레포츠" },
  { key: "SHOPPING", label: "쇼핑" },
  { key: "STAY", label: "숙박" },
];

const activeCategory = ref("");
const searchQuery = ref("");
const places = ref<PlacePage>({
  content: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  size: 30,
  hasNext: false,
});
const loading = ref(false);
const likedIds = ref(new Set<string>());
let debounceTimer: any = null;

async function fetchPlaces(page = 0) {
  loading.value = true;
  try {
    places.value = await getPlaces(
      activeCategory.value || undefined,
      searchQuery.value || undefined,
      page,
    );
  } catch (e) {
    console.error("관광지 목록 로딩 실패:", e);
  } finally {
    loading.value = false;
  }
}

async function selectCategory(key: string) {
  activeCategory.value = key;
  await fetchPlaces(0);
}

watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchPlaces(0), 300);
});

function toggleLike(id: string) {
  if (likedIds.value.has(id)) {
    likedIds.value.delete(id);
  } else {
    likedIds.value.add(id);
  }
}

const pageNumbers = computed(() => {
  const total = places.value.totalPages;
  const current = places.value.currentPage;
  let start = Math.max(0, current - 2);
  let end = Math.min(total - 1, current + 2);
  if (end - start < 4) {
    if (start === 0) end = Math.min(4, total - 1);
    else start = Math.max(0, end - 4);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const isDetailOpen = ref(false);
const selectedPlaceId = ref<string | null>(null);

function openDetail(place: Place) {
  selectedPlaceId.value = place.id;
  isDetailOpen.value = true;
}

onMounted(() => {
  startSlideShow();
  fetchPlaces();
});

onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer);
  clearTimeout(debounceTimer);
});
</script>

<template>
  <div
    style="
      background: linear-gradient(
        155deg,
        #e8f8f5 0%,
        #ffffff 50%,
        #f0faf8 100%
      );
      min-height: calc(100vh - 64px);
    "
  >
    <div class="max-w-5xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-5">
        <button
          @click="router.back()"
          class="flex items-center gap-2 transition-opacity hover:opacity-70"
          style="color: #6b8c87; font-size: 0.88rem; font-weight: 600"
        >
          <ArrowLeft :size="17" /> 뒤로가기
        </button>

        <div class="relative w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="어디로 떠나고 싶으신가요?"
            class="w-full pl-9 pr-4 py-1.5 rounded-full border border-teal-100 text-xs outline-none bg-white/80 focus:bg-white focus:border-teal-400 transition-all text-[#1a2e2b]"
          />
          <Search class="absolute left-3 top-2 text-teal-500" :size="14" />
        </div>
      </div>

      <!-- 배너 슬라이더 -->
      <section
        class="relative w-full h-[260px] md:h-[320px] rounded-2xl overflow-hidden shadow-sm mb-10 group"
      >
        <div
          v-for="(slide, index) in recommendedPlaces"
          :key="slide.id"
          class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'"
        >
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"
          ></div>
          <img
            :src="slide.img"
            class="w-full h-full object-cover transform scale-100 group-hover:scale-102 transition-transform duration-[4000ms]"
          />
          <div class="absolute bottom-6 left-6 right-6 z-20 text-white">
            <span
              class="px-2.5 py-1 rounded-md bg-teal-500/90 text-[0.68rem] font-bold tracking-wider mb-2 inline-block"
            >
              {{ slide.tag }}
            </span>
            <h2 class="text-xl md:text-2xl font-extrabold tracking-tight mb-1">
              {{ slide.name }}
            </h2>
            <p class="text-xs md:text-sm text-gray-200 font-light opacity-90">
              {{ slide.desc }}
            </p>
          </div>
        </div>

        <div class="absolute bottom-6 right-6 z-20 flex gap-1.5">
          <button
            v-for="(_, index) in recommendedPlaces"
            :key="index"
            @click="currentSlide = index"
            class="w-2 h-2 rounded-full transition-all"
            :class="currentSlide === index ? 'bg-teal-400 w-5' : 'bg-white/50'"
          ></button>
        </div>
      </section>

      <!-- 카테고리 필터 + 결과 수 -->
      <section>
        <div
          class="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-3 mb-6 gap-4"
        >
          <div class="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              v-for="tab in CATEGORY_TABS"
              :key="tab.key"
              @click="selectCategory(tab.key)"
              class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              :style="
                activeCategory === tab.key
                  ? 'background: #3db89e; color: #ffffff;'
                  : 'background: #ffffff; color: #6b8c87; border: 1px solid #e2e8f0;'
              "
            >
              {{ tab.label }}
            </button>
          </div>

          <span class="text-xs text-gray-400 font-semibold self-end md:self-auto">
            총 <span class="text-teal-600">{{ places.totalElements }}</span>개의 장소
          </span>
        </div>

        <!-- 로딩 -->
        <div v-if="loading" class="flex justify-center items-center h-48">
          <div
            class="w-8 h-8 rounded-full border-2 border-teal-300 border-t-teal-600 animate-spin"
          />
        </div>

        <!-- 카드 그리드 -->
        <div
          v-else-if="places.content.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center"
        >
          <PlaceCard
            v-for="place in places.content"
            :key="place.id"
            :spot="place"
            :liked="likedIds.has(place.id)"
            @click="openDetail(place)"
            @toggle-like="toggleLike(place.id)"
          />
        </div>

        <div
          v-else
          class="w-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200"
        >
          <p class="text-sm text-gray-400 font-medium">
            해당 카테고리나 조건에 맞는 관광지가 없습니다.
          </p>
        </div>

        <!-- 페이지네이션 -->
        <div
          v-if="places.totalPages > 1"
          class="flex items-center justify-center gap-2 mt-10"
        >
          <button
            @click="fetchPlaces(places.currentPage - 1)"
            :disabled="places.currentPage === 0"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            :style="
              places.currentPage === 0
                ? 'background: #f1f5f9; color: #b0c4c1; cursor: not-allowed;'
                : 'background: #ffffff; color: #3db89e; border: 1px solid #b2e4dc;'
            "
          >
            &lt; 이전
          </button>

          <button
            v-for="n in pageNumbers"
            :key="n"
            @click="fetchPlaces(n)"
            class="w-8 h-8 rounded-xl text-xs font-bold transition-all"
            :style="
              places.currentPage === n
                ? 'background: #3db89e; color: #ffffff;'
                : 'background: #ffffff; color: #6b8c87; border: 1px solid #e2e8f0;'
            "
          >
            {{ n + 1 }}
          </button>

          <button
            @click="fetchPlaces(places.currentPage + 1)"
            :disabled="!places.hasNext"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            :style="
              !places.hasNext
                ? 'background: #f1f5f9; color: #b0c4c1; cursor: not-allowed;'
                : 'background: #ffffff; color: #3db89e; border: 1px solid #b2e4dc;'
            "
          >
            다음 &gt;
          </button>
        </div>
      </section>
    </div>

    <!-- 상세 모달 -->
    <div
      v-if="isDetailOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="isDetailOpen = false"
    >
      <div
        class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 flex flex-col"
        @click.stop
      >
        <button
          @click="isDetailOpen = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-lg"
        >
          ✕
        </button>

        <PlaceDetailContent :id="selectedPlaceId" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
