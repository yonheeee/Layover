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
import { allPlacesDatabase } from "@/mocks/places";
import { useCheckLogin } from "@/utils/auth";
import type { Place } from "@/types/place";

// 두 가지 경로를 모두 지원합니다.
//  - PlaceDetailView(라우트): :id 로 호출  → id로 상세 DB(allPlacesDatabase) 조회
//  - HomeView(모달): :initialData 로 장소 객체를 직접 전달 → 그 데이터를 그대로 사용
// ※ 홈 카드 데이터와 상세 DB는 id 체계가 서로 달라서, 모달 경로에서는 DB를 조회하지 않습니다.
const props = defineProps<{
  id?: number | null;
  initialData?: Place | null;
}>();

// 템플릿이 참조하는 모든 필드의 안전한 기본값(빠진 필드가 있어도 안 터지도록)
const EMPTY_PLACE = {
  id: null,
  name: "",
  category: "",
  tags: [] as string[],
  rating: 0,
  reviewCount: 0,
  isOpen: false,
  hours: "정보 없음",
  address: "정보 없음",
  phone: "정보 없음",
  distance: "",
  image: "",
  description: "",
  liked: false,
  nearbyPlaces: [] as any[],
};

// 화면 템플릿이 바라보는 반응형 변수
const place = ref<any>({ ...EMPTY_PLACE });

// 들어온 데이터를 안전한 형태로 정규화해서 place에 반영합니다.
function applyPlace(data: any) {
  const normalized = {
    ...data,
    // 홈 카드(reviews/tag)와 상세 DB(reviewCount/tags)의 필드명 차이를 보정
    reviewCount: data.reviewCount ?? data.reviews ?? 0,
    tags: data.tags ?? (data.tag ? [data.tag] : []),
  };
  place.value = { ...EMPTY_PLACE, ...normalized };
}

// id 또는 initialData가 바뀔 때마다 알맞은 장소 정보를 바인딩합니다.
watch(
  [() => props.id, () => props.initialData],
  () => {
    if (props.initialData) {
      // HomeView 모달: 넘어온 장소 데이터를 그대로 사용
      applyPlace(props.initialData);
    } else if (props.id != null) {
      // PlaceDetailView 라우트: id로 상세 DB 조회
      const target = allPlacesDatabase.find((p) => p.id === props.id);
      if (target) applyPlace(target);
    }
  },
  { immediate: true }, // 컴포넌트가 처음 켜질 때도 즉시 실행
);

const { checkLogin } = useCheckLogin();

function toggleLike() {
  if (!checkLogin()) return;
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
