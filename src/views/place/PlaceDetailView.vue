<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Star, Heart, MapPin, Eye, Search } from "lucide-vue-next";
import PlaceDetailContent from "./PlaceDetailContents.vue";

const router = useRouter();

// 1. 상단 슬라이드 배너용 더미 데이터 & 로직
const recommendedPlaces = ref([
  {
    id: 101,
    name: "장태산 자연휴양림",
    desc: "메타세쿼이아 숲길에서 즐기는 이국적인 힐링",
    img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
    tag: "#인생샷 #힐링명소",
  },
  {
    id: 102,
    name: "대청호 오백리길",
    desc: "푸른 호수를 따라 걷는 대전 최고의 드라이브 코스",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    tag: "#데이트코스 #산책",
  },
  {
    id: 103,
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
  }, 4000); // 4초마다 자동 전환
};

// 2. 카테고리 및 전체 관광지 더미 데이터
const categories = ["전체", "관광명소", "맛집/빵집", "카페", "문화/예술"];
const activeCategory = ref("전체");
const searchQuery = ref("");

const allPlaces = ref([
  {
    id: 1,
    name: "성심당 본점",
    category: "맛집/빵집",
    rating: 4.8,
    reviewCount: 2453,
    viewCount: 12050,
    address: "중구 은행동",
    emoji: "🍞",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    name: "한밭수목원",
    category: "관광명소",
    rating: 4.6,
    reviewCount: 892,
    viewCount: 5430,
    address: "서구 만년동",
    emoji: "🌿",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    name: "중앙시장",
    category: "맛집/빵집",
    rating: 4.3,
    reviewCount: 412,
    viewCount: 3120,
    address: "동구 중앙동",
    emoji: "🏪",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    name: "소제동 카페거리",
    category: "카페",
    rating: 4.5,
    reviewCount: 654,
    viewCount: 4890,
    address: "동구 소제동",
    emoji: "☕",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    name: "이응노미술관",
    category: "문화/예술",
    rating: 4.7,
    reviewCount: 187,
    viewCount: 2110,
    address: "서구 만년동",
    emoji: "🎨",
    img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 6,
    name: "뿌리공원",
    category: "관광명소",
    rating: 4.4,
    reviewCount: 231,
    viewCount: 1980,
    address: "중구 안영동",
    emoji: "🌳",
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80",
  },
]);

// 필터링된 관광지 리스트 산출
const filteredPlaces = computed(() => {
  return allPlaces.value.filter((place) => {
    const matchesCategory =
      activeCategory.value === "전체" ||
      place.category === activeCategory.value;
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      place.address.includes(searchQuery.value);
    return matchesCategory && matchesSearch;
  });
});

// 상세 페이지 이동 함수
const goToDetail = (id: number) => {
  router.push(`/place/${id}`);
};

onMounted(() => {
  startSlideShow();
});

onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer);
});

// 팝업 열림 상태 및 현재 선택된 관광지 ID를 관리하는 반응형 변수
const isDetailOpen = ref(false);
const selectedPlaceId = ref<number | null>(null);

// 카드를 클릭했을 때 실행할 함수
const openPlaceDetail = (id: number) => {
  selectedPlaceId.value = id; // 어떤 관광지인지 ID 저장
  isDetailOpen.value = true; // 팝업 열기
};
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

      <section>
        <div
          class="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-3 mb-6 gap-4"
        >
          <div class="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="activeCategory = cat"
              class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              :style="
                activeCategory === cat
                  ? 'background: #3db89e; color: #ffffff; shadow: 0 2px 8px rgba(61,184,158,0.2);'
                  : 'background: #ffffff; color: #6b8c87; border: 1px solid #e2e8f0;'
              "
            >
              {{ cat }}
            </button>
          </div>

          <span
            class="text-xs text-gray-400 font-semibold self-end md:self-auto"
          >
            총 <span class="text-teal-600">{{ filteredPlaces.length }}</span
            >개의 장소
          </span>
        </div>

        <div
          v-if="filteredPlaces.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          <div
            v-for="place in filteredPlaces"
            :key="place.id"
            @click="openPlaceDetail(place.id)"
            class="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
          >
            <div
              class="relative aspect-[4/3] w-full overflow-hidden bg-gray-50"
            >
              <img
                :src="place.img"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span
                class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[0.68rem] font-bold px-2 py-0.5 rounded text-teal-700 border border-teal-50"
              >
                {{ place.emoji }} {{ place.category }}
              </span>
            </div>

            <div class="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div class="flex items-start justify-between gap-2 mb-1">
                  <h3
                    class="font-extrabold text-sm text-[#1a2e2b] line-clamp-1 group-hover:text-teal-600 transition-colors"
                  >
                    {{ place.name }}
                  </h3>
                </div>

                <div class="flex items-center gap-1 text-xs mb-2">
                  <div class="flex items-center text-amber-400">
                    <Star :size="13" fill="currentColor" />
                    <span class="font-bold ml-0.5 text-gray-800">{{
                      place.rating.toFixed(1)
                    }}</span>
                  </div>
                  <span class="text-gray-300">|</span>
                  <span class="text-gray-500 font-medium"
                    >리뷰 {{ place.reviewCount.toLocaleString() }}</span
                  >
                </div>
              </div>

              <div
                class="flex items-center justify-between text-[0.72rem] text-gray-400 pt-2.5 border-t border-gray-50"
              >
                <p class="flex items-center gap-0.5">
                  <MapPin :size="12" class="text-gray-300" />
                  {{ place.address }}
                </p>
                <p class="flex items-center gap-0.5 opacity-80">
                  <Eye :size="12" /> {{ place.viewCount.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="w-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200"
        >
          <p class="text-sm text-gray-400 font-medium">
            해당 카테고리나 조건에 맞는 관광지가 아직 없습니다.
          </p>
        </div>
      </section>
    </div>

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
/* 가로 스크롤바 가리기 전용 */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
