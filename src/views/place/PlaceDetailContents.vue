<script setup lang="ts">
import { ref, watch } from "vue";
import {
  MapPin,
  Clock,
  Heart,
  Star,
  Phone,
  Image as ImageIcon,
  Footprints,
} from "lucide-vue-next";

// 💡 1. 부모(PlaceDetailView)가 넘겨주는 :id를 받도록 규격을 통일합니다.
const props = defineProps<{
  id: number | null;
}>();

// 💡 2. 대전 전체 관광지 상세 데이터 저장소 (실제로는 API나 Store에서 가져올 데이터셋)
const ALL_PLACES_DATABASE = [
  {
    id: 1,
    name: "성심당 본점",
    category: "맛집/빵집",
    tags: ["베이커리", "대전 명물", "튀김소보로"],
    rating: 4.8,
    reviewCount: 2453,
    isOpen: true,
    hours: "08:00 ~ 22:00",
    address: "대전 중구 대종로480번길 15",
    phone: "042-256-4314",
    distance: "도보 10분 (450m)",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80",
    description:
      "1956년에 창업한 대전의 대표 빵집입니다. 대전을 방문하면 반드시 들러야 하는 명소로, 튀김소보로, 판타롱슈크림빵 등 다양한 명물 빵들이 가득합니다.",
    liked: false,
    nearbyPlaces: [
      { id: 3, name: "중앙시장", category: "맛집/빵집", distance: "도보 5분" },
      {
        id: 4,
        name: "소제동 카페거리",
        category: "카페",
        distance: "택시 7분",
      },
    ],
  },
  {
    id: 2,
    name: "한밭수목원",
    category: "관광명소",
    tags: ["자연", "힐링명소", "산책코스"],
    rating: 4.6,
    reviewCount: 892,
    isOpen: true,
    hours: "06:00 ~ 21:00",
    address: "대전 서구 만년동 396",
    phone: "042-270-8452",
    distance: "버스 20분",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
    description:
      "도심 속 녹색 쉼터이자 정부대전청사와 엑스포과학공원의 중앙에 위치한 대한민국 최대 규모의 도심 수목원입니다. 사계절 아름다운 인공수목원을 감상할 수 있습니다.",
    liked: false,
    nearbyPlaces: [
      {
        id: 5,
        name: "이응노미술관",
        category: "문화/예술",
        distance: "도보 3분",
      },
    ],
  },
  {
    id: 3,
    name: "중앙시장",
    category: "맛집/빵집",
    tags: ["전통시장", "먹거리", "대전역근처"],
    rating: 4.3,
    reviewCount: 412,
    isOpen: true,
    hours: "09:00 ~ 22:00",
    address: "대전 동구 중앙로 200-1",
    phone: "042-226-0319",
    distance: "도보 5분",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
    description:
      "대전역 바로 앞에 위치한 중부권 최대 규모의 전통 재래시장입니다. 다양한 로컬 주전부리와 먹자골목이 발달해 있어 가벼운 레이오버 여행에 제격입니다.",
    liked: false,
    nearbyPlaces: [
      {
        id: 1,
        name: "성심당 본점",
        category: "맛집/빵집",
        distance: "도보 5분",
      },
    ],
  },
  // 💡 나머지 4, 5, 6번 장소들도 이 규격에 맞춰 데이터를 넣어두시면 완벽하게 연동됩니다!
];

// 화면 템플릿이 바라보는 반응형 변수
const place = ref<any>({ ...ALL_PLACES_DATABASE[0] });

// 💡 3. 부모가 넘겨준 props.id 값이 바뀔 때마다 감시(watch)해서 알맞은 장소 정보를 바인딩합니다.
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      // 데이터베이스에서 내가 클릭한 카드의 id와 일치하는 장소를 서치합니다.
      const targetPlace = ALL_PLACES_DATABASE.find((p) => p.id === newId);
      if (targetPlace) {
        place.value = { ...targetPlace };
      }
    }
  },
  { immediate: true }, // 컴포넌트가 처음 켜질 때도 즉시 실행하도록 설정
);

function toggleLike() {
  place.value.liked = !place.value.liked;
}

const categoryColor: Record<string, string> = {
  "맛집/빵집": "background:#FEF3C7;color:#92400E",
  관광명소: "background:#D1FAE5;color:#065F46",
  카페: "background:#E0E7FF;color:#3730A3",
  "문화/예술": "background:#FCE7F3;color:#9D174D",
};
</script>

<template>
  <div class="place-detail-content">
    <div class="grid grid-cols-4 gap-2 mb-4" style="height: 200px">
      <div
        class="col-span-2 row-span-2 rounded-2xl overflow-hidden flex items-center justify-center"
        style="
          background: #f0faf8;
          border: 1.5px solid rgba(178, 228, 220, 0.35);
        "
      >
        <img
          v-if="place.image"
          :src="place.image"
          class="w-full h-full object-cover"
        />
        <ImageIcon v-else :size="40" color="#B2E4DC" />
      </div>
      <div
        v-for="i in 3"
        :key="i"
        class="rounded-xl overflow-hidden flex items-center justify-center"
        style="
          background: #f0faf8;
          border: 1.5px solid rgba(178, 228, 220, 0.35);
        "
      >
        <ImageIcon :size="20" color="#B2E4DC" />
      </div>
    </div>

    <div
      class="rounded-2xl p-6 mb-4"
      style="
        background: #fff;
        border: 1.5px solid rgba(178, 228, 220, 0.35);
        box-shadow: 0 4px 24px rgba(26, 46, 43, 0.08);
      "
    >
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :style="
                categoryColor[place.category] ||
                'background:#f3f4f6;color:#374151'
              "
              >{{ place.category }}</span
            >
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :style="
                place.isOpen
                  ? 'background:#d1fae5;color:#065f46'
                  : 'background:#fee2e2;color:#991b1b'
              "
              >{{ place.isOpen ? "영업중" : "영업종료" }}</span
            >
          </div>
          <h1 style="font-weight: 800; font-size: 1.3rem; color: #1a2e2b">
            {{ place.name }}
          </h1>
        </div>
        <button
          @click="toggleLike"
          class="flex flex-col items-center gap-1 flex-shrink-0"
          :style="place.liked ? 'color:#3db89e' : 'color:#9ca3af'"
        >
          <Heart :size="22" :fill="place.liked ? '#3db89e' : 'none'" />
          <span style="font-size: 0.7rem; font-weight: 600">찜</span>
        </button>
      </div>

      <div class="flex items-center gap-2 mb-4">
        <Star :size="15" fill="#fbbf24" color="#fbbf24" />
        <span style="font-weight: 700; font-size: 0.95rem; color: #1a2e2b">{{
          place.rating
        }}</span>
        <span style="font-size: 0.82rem; color: #9ca3af"
          >(리뷰 {{ place.reviewCount.toLocaleString() }}개)</span
        >
      </div>

      <div class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in place.tags"
          :key="tag"
          class="text-xs px-3 py-1 rounded-full"
          style="background: #e8f8f5; color: #3db89e; font-weight: 600"
        >
          # {{ tag }}
        </span>
      </div>

      <div class="flex flex-col gap-2.5">
        <div class="flex items-center gap-3">
          <Clock :size="15" color="#B2E4DC" class="flex-shrink-0" />
          <span style="font-size: 0.88rem; color: #374151">{{
            place.hours
          }}</span>
        </div>
        <div class="flex items-center gap-3">
          <MapPin :size="15" color="#B2E4DC" class="flex-shrink-0" />
          <span style="font-size: 0.88rem; color: #374151">{{
            place.address
          }}</span>
        </div>
        <div class="flex items-center gap-3">
          <Phone :size="15" color="#B2E4DC" class="flex-shrink-0" />
          <span style="font-size: 0.88rem; color: #374151">{{
            place.phone
          }}</span>
        </div>
        <div class="flex items-center gap-3">
          <Footprints :size="15" color="#B2E4DC" class="flex-shrink-0" />
          <span style="font-size: 0.88rem; color: #3db89e; font-weight: 600"
            >대전역에서 {{ place.distance }}</span
          >
        </div>
      </div>
    </div>

    <div
      class="rounded-2xl p-6 mb-4"
      style="
        background: #fff;
        border: 1.5px solid rgba(178, 228, 220, 0.35);
        box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
      "
    >
      <h2
        style="
          font-weight: 700;
          font-size: 0.95rem;
          color: #1a2e2b;
          margin-bottom: 12px;
        "
      >
        장소 소개
      </h2>
      <p style="font-size: 0.9rem; color: #374151; line-height: 1.75">
        {{ place.description }}
      </p>
    </div>

    <div
      class="rounded-2xl overflow-hidden mb-4"
      style="
        border: 1.5px solid rgba(178, 228, 220, 0.35);
        box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
      "
    >
      <div
        class="px-5 py-4"
        style="
          background: #fff;
          border-bottom: 1px solid rgba(178, 228, 220, 0.3);
        "
      >
        <h2 style="font-weight: 700; font-size: 0.95rem; color: #1a2e2b">
          위치
        </h2>
      </div>
      <div
        class="flex items-center justify-center"
        style="height: 200px; background: #f0faf8"
      >
        <div class="text-center">
          <MapPin :size="36" color="#3db89e" />
          <p style="font-size: 0.85rem; color: #6b8c87; margin-top: 8px">
            카카오맵 연동 예정
          </p>
        </div>
      </div>
    </div>

    <div
      class="rounded-2xl p-5"
      style="
        background: #fff;
        border: 1.5px solid rgba(178, 228, 220, 0.35);
        box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
      "
    >
      <h2
        style="
          font-weight: 700;
          font-size: 0.95rem;
          color: #1a2e2b;
          margin-bottom: 12px;
        "
      >
        함께 가면 좋은 곳
      </h2>
      <div class="flex flex-col gap-2">
        <div
          v-for="nearby in place.nearbyPlaces"
          :key="nearby.id"
          class="flex items-center gap-3 p-3 rounded-xl text-left"
          style="border: 1.5px solid rgba(178, 228, 220, 0.35)"
        >
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background: #e8f8f5"
          >
            <MapPin :size="16" color="#3db89e" />
          </div>
          <div class="flex-1 min-w-0">
            <p style="font-weight: 600; font-size: 0.9rem; color: #1a2e2b">
              {{ nearby.name }}
            </p>
            <p style="font-size: 0.78rem; color: #9ca3af">
              {{ nearby.distance }}
            </p>
          </div>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
            :style="
              categoryColor[nearby.category] ||
              'background:#f3f4f6;color:#374151'
            "
            >{{ nearby.category }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
