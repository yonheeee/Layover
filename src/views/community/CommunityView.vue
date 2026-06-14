<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  MapPin,
  Clock,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Search,
} from "lucide-vue-next";

const router = useRouter();
const activeTab = ref<"reviews" | "notices">("reviews");
const activeCategory = ref("전체");

const categories = ["전체", "공유해요", "궁금해요", "함께해요", "자유"];

const categoryStyle: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  공유해요: { bg: "#E8F8F5", color: "#3db89e", border: "#B2E4DC" },
  궁금해요: { bg: "#FEF9EC", color: "#d97706", border: "#FDE68A" },
  함께해요: { bg: "#F0F4FF", color: "#6366f1", border: "#C7D2FE" },
  자유: { bg: "#F5F0FF", color: "#8b5cf6", border: "#DDD6FE" },
};

// --- 공지사항 ---
const notices = ref([
  {
    id: 1,
    tag: "공지",
    title: "대전 환승 관광 서비스 오픈 안내",
    date: "2025.06.01",
    content:
      "안녕하세요! 대전 환승 관광 웹앱이 정식 오픈되었습니다. 이제 대전역에서 환승하는 시간 동안 알차게 대전을 즐길 수 있는 코스를 추천받아 보세요.",
    pinned: true,
    open: false,
  },
  {
    id: 2,
    tag: "이벤트",
    title: "오픈 기념 코스 후기 이벤트 진행 중!",
    date: "2025.06.01",
    content:
      "오픈 기념으로 코스 후기를 작성해 주신 분들 중 추첨을 통해 소정의 상품을 드립니다. 6월 1일 ~ 6월 30일까지 후기를 작성해 주세요!",
    pinned: false,
    open: false,
  },
  {
    id: 3,
    tag: "업데이트",
    title: "코스 편집 기능 업데이트 안내",
    date: "2025.05.20",
    content:
      "이제 추천받은 코스를 직접 편집하실 수 있습니다. 장소를 추가하거나 삭제하고, 원하는 코스로 맞춤 설정해 보세요.",
    pinned: false,
    open: false,
  },
  {
    id: 4,
    tag: "공지",
    title: "카카오맵 연동 지도 서비스 안내",
    date: "2025.05.10",
    content:
      "실시간 지도 서비스가 카카오맵과 연동되었습니다. 이제 더욱 정확한 위치 정보와 경로 안내를 받아보실 수 있습니다.",
    pinned: false,
    open: false,
  },
]);

const pinnedNotice = computed(() => notices.value.find((n) => n.pinned));
const regularNotices = computed(() => notices.value.filter((n) => !n.pinned));

function toggleNotice(id: number) {
  const n = notices.value.find((n) => n.id === id);
  if (n) n.open = !n.open;
}

// --- 코스 후기 ---
const reviews = ref([
  {
    id: 1,
    category: "공유해요",
    author: "홍길동",
    initials: "홍",
    station: "대전역",
    duration: "3시간 30분",
    places: ["성심당", "테미오래", "한밭수목원"],
    preview:
      "성심당에서 맛있는 빵을 먹고 테미오래에서 감성 사진도 찍고, 한밭수목원에서 산책까지! 3시간이 정말 알차게 느껴졌어요.",
    images: ["", ""],
    date: "2025.06.02",
    likes: 24,
    comments: 8,
    liked: false,
  },
  {
    id: 2,
    category: "궁금해요",
    author: "기차러버",
    initials: "기",
    station: "대전역",
    duration: "1시간",
    places: ["대전역 근처"],
    preview:
      "환승 시간이 1시간인데 어디 갈 수 있을까요? 걸어서 갈 수 있는 카페 추천해주세요!",
    images: [],
    date: "2025.06.01",
    likes: 5,
    comments: 8,
    liked: false,
  },
  {
    id: 3,
    category: "함께해요",
    author: "환승왕",
    initials: "환",
    station: "대전역",
    duration: "2시간 30분",
    places: ["성심당", "중앙시장"],
    preview:
      "이번 주말 대전 환승 같이 하실 분! 성심당이랑 중앙시장 돌아볼 예정입니다. 편하게 연락주세요 :)",
    images: [],
    date: "2025.06.01",
    likes: 7,
    comments: 2,
    liked: false,
  },
  {
    id: 4,
    category: "공유해요",
    author: "대전탐험가",
    initials: "대",
    station: "대전역",
    duration: "5시간",
    places: ["국립중앙과학관", "엑스포과학공원", "한밭수목원", "성심당"],
    preview:
      "시간 여유가 있어서 긴 코스로 다녀왔어요. 국립중앙과학관은 아이들과 오면 정말 좋을 것 같았어요!",
    images: [],
    date: "2025.05.30",
    likes: 42,
    comments: 12,
    liked: false,
  },
  {
    id: 5,
    category: "자유",
    author: "빵순이",
    initials: "빵",
    station: "대전역",
    duration: "3시간",
    places: ["성심당", "성심당 문화점", "은행동"],
    preview:
      "대전 빵지순례 완료 후기입니다 🥐 성심당만 있는 게 아니더라고요, 숨은 맛집들도 너무 많아요!",
    images: [""],
    date: "2025.05.28",
    likes: 24,
    comments: 11,
    liked: false,
  },
]);

const filteredReviews = computed(() =>
  activeCategory.value === "전체"
    ? reviews.value
    : reviews.value.filter((r) => r.category === activeCategory.value),
);

// 인기글 TOP3 (사이드바용)
const popularReviews = computed(() =>
  [...reviews.value].sort((a, b) => b.likes - a.likes).slice(0, 3),
);

const loadingMore = ref(false);
const hasMore = ref(true);
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

function toggleLike(id: number) {
  const r = reviews.value.find((r) => r.id === id);
  if (!r) return;
  r.liked = !r.liked;
  r.likes += r.liked ? 1 : -1;
}

function loadMore() {
  if (loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  setTimeout(() => {
    hasMore.value = false;
    loadingMore.value = false;
  }, 800);
}

onMounted(() => {
  if (sentinel.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});

const tagColors: Record<string, string> = {
  공지: "background:#dbeafe;color:#1e40af",
  이벤트: "background:#fce7f3;color:#9d174d",
  업데이트: "background:#d1fae5;color:#065f46",
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
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- 상단 탭 -->
      <div
        class="flex items-center border-b mb-6"
        style="border-color: rgba(178, 228, 220, 0.3)"
      >
        <button
          v-for="tab in [
            { key: 'reviews', label: '커뮤니티' },
            { key: 'notices', label: '공지사항' },
          ]"
          :key="tab.key"
          @click="
            activeTab = tab.key as any;
            activeCategory = '전체';
          "
          class="relative px-6 py-3 font-semibold text-sm transition-colors"
          :style="activeTab === tab.key ? 'color:#1a2e2b' : 'color:#9ca3af'"
        >
          {{ tab.label }}
          <span
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
            style="background: #3db89e"
          />
        </button>

        <!-- 글쓰기 버튼 -->
        <div class="ml-auto pb-1" v-if="activeTab === 'reviews'">
          <button
            @click="router.push('/community/write')"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style="
              background: linear-gradient(135deg, #b2e4dc, #3db89e);
              color: #fff;
              box-shadow: 0 2px 8px rgba(61, 184, 158, 0.25);
            "
          >
            <Plus :size="15" />
            글쓰기
          </button>
        </div>
      </div>

      <!-- 카테고리 필터 태그 (커뮤니티 탭만) -->
      <div v-if="activeTab === 'reviews'" class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
          :style="
            activeCategory === cat
              ? 'background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff; box-shadow: 0 2px 8px rgba(61,184,158,0.3)'
              : 'background:#fff; color:#6b8c87; border: 1.5px solid rgba(178,228,220,0.5)'
          "
        >
          {{ cat }}
        </button>
      </div>

      <!-- ── 공지사항 탭 ── -->
      <div v-if="activeTab === 'notices'" class="flex flex-col gap-3">
        <!-- 고정 배너 -->
        <div
          v-if="pinnedNotice"
          class="rounded-2xl p-5 flex items-start gap-4"
          style="
            background: linear-gradient(135deg, #e8f8f5, #f0faf8);
            border: 1.5px solid rgba(126, 207, 192, 0.4);
          "
        >
          <div
            class="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
            style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
          >
            <span style="font-size: 0.75rem">📌</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                style="background: #3db89e; color: #fff"
                >고정</span
              >
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="tagColors[pinnedNotice.tag]"
                >{{ pinnedNotice.tag }}</span
              >
            </div>
            <p
              style="font-weight: 700; color: #1a2e2b; font-size: 0.95rem"
              class="mb-1"
            >
              {{ pinnedNotice.title }}
            </p>
            <p style="font-size: 0.82rem; color: #6b8c87; line-height: 1.6">
              {{ pinnedNotice.content }}
            </p>
            <p style="font-size: 0.75rem; color: #9ca3af" class="mt-2">
              {{ pinnedNotice.date }}
            </p>
          </div>
        </div>

        <!-- 공지 목록 (아코디언) -->
        <div
          v-for="notice in regularNotices"
          :key="notice.id"
          class="rounded-2xl overflow-hidden"
          style="
            background: #fff;
            border: 1.5px solid rgba(178, 228, 220, 0.35);
            box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
          "
        >
          <button
            class="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
            @click="toggleNotice(notice.id)"
          >
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              :style="
                tagColors[notice.tag] || 'background:#f3f4f6;color:#374151'
              "
              >{{ notice.tag }}</span
            >
            <span class="flex-1 font-semibold text-sm" style="color: #1a2e2b">{{
              notice.title
            }}</span>
            <span
              style="font-size: 0.78rem; color: #9ca3af"
              class="flex-shrink-0"
              >{{ notice.date }}</span
            >
            <ChevronDown
              v-if="!notice.open"
              :size="16"
              color="#9ca3af"
              class="flex-shrink-0"
            />
            <ChevronUp
              v-else
              :size="16"
              color="#3db89e"
              class="flex-shrink-0"
            />
          </button>
          <div
            v-if="notice.open"
            class="px-5 pb-5 pt-4"
            style="border-top: 1px solid rgba(178, 228, 220, 0.3)"
          >
            <p style="font-size: 0.88rem; color: #374151; line-height: 1.7">
              {{ notice.content }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── 커뮤니티 탭: 2컬럼 레이아웃 ── -->
      <div v-else class="flex gap-6 items-start">
        <!-- 왼쪽: 게시글 목록 -->
        <div class="flex-1 min-w-0 flex flex-col gap-4">
          <!-- 게시글 없을 때 -->
          <div
            v-if="filteredReviews.length === 0"
            class="rounded-2xl py-16 text-center"
            style="
              background: #fff;
              border: 1.5px solid rgba(178, 228, 220, 0.35);
            "
          >
            <p style="font-size: 1rem; color: #9ca3af; font-weight: 600">
              아직 게시글이 없어요
            </p>
            <p style="font-size: 0.85rem; color: #b0c4bf" class="mt-1">
              첫 번째 글을 작성해보세요!
            </p>
          </div>

          <!-- 게시글 카드 -->
          <div
            v-for="review in filteredReviews"
            :key="review.id"
            class="rounded-2xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
            style="
              background: #fff;
              border: 1.5px solid rgba(178, 228, 220, 0.35);
              box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
            "
            @click="router.push(`/community/${review.id}`)"
          >
            <!-- 카드 상단: 카테고리 태그 + 작성자 -->
            <div class="flex items-center gap-3 px-5 pt-4 pb-3">
              <!-- 카테고리 태그 -->
              <span
                class="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                :style="`background:${categoryStyle[review.category]?.bg ?? '#f3f4f6'}; color:${categoryStyle[review.category]?.color ?? '#374151'}; border: 1px solid ${categoryStyle[review.category]?.border ?? '#e5e7eb'}`"
              >
                {{ review.category }}
              </span>
              <!-- 작성자 -->
              <div class="flex items-center gap-2 ml-auto">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
                  style="
                    background: linear-gradient(135deg, #b2e4dc, #3db89e);
                    color: #fff;
                  "
                >
                  {{ review.initials }}
                </div>
                <span
                  style="font-size: 0.82rem; font-weight: 600; color: #1a2e2b"
                  >{{ review.author }}</span
                >
                <span style="font-size: 0.75rem; color: #9ca3af"
                  >· {{ review.date }}</span
                >
              </div>
            </div>

            <!-- 코스 요약 -->
            <div
              class="mx-5 mb-3 px-4 py-3 rounded-xl"
              style="
                background: #f0faf8;
                border: 1px solid rgba(178, 228, 220, 0.4);
              "
            >
              <div class="flex items-center gap-2 mb-1.5">
                <MapPin :size="12" color="#3db89e" />
                <span
                  style="font-size: 0.78rem; font-weight: 600; color: #3db89e"
                  >{{ review.station }}</span
                >
                <span style="font-size: 0.75rem; color: #9ca3af">·</span>
                <Clock :size="12" color="#6b8c87" />
                <span style="font-size: 0.78rem; color: #6b8c87">{{
                  review.duration
                }}</span>
              </div>
              <div class="flex items-center gap-1 flex-wrap">
                <template v-for="(place, i) in review.places" :key="i">
                  <span
                    style="font-size: 0.78rem; font-weight: 600; color: #1a2e2b"
                    >{{ place }}</span
                  >
                  <span
                    v-if="i < review.places.length - 1"
                    style="font-size: 0.72rem; color: #b2e4dc"
                    >→</span
                  >
                </template>
              </div>
            </div>

            <!-- 미리보기 텍스트 -->
            <p
              class="px-5 pb-3"
              style="
                font-size: 0.875rem;
                color: #374151;
                line-height: 1.65;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              "
            >
              {{ review.preview }}
            </p>

            <!-- 이미지 썸네일 -->
            <div v-if="review.images.length > 0" class="px-5 pb-3 flex gap-2">
              <div
                v-for="(img, i) in review.images.slice(0, 3)"
                :key="i"
                class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style="
                  background: #f0faf8;
                  border: 1px solid rgba(178, 228, 220, 0.4);
                "
              >
                <img v-if="img" :src="img" class="w-full h-full object-cover" />
                <ImageIcon v-else :size="20" color="#B2E4DC" />
              </div>
            </div>

            <!-- 액션 바 -->
            <div
              class="px-5 pb-4 flex items-center gap-4 border-t"
              style="border-color: rgba(178, 228, 220, 0.3); padding-top: 12px"
              @click.stop
            >
              <button
                class="flex items-center gap-1.5 transition-colors"
                @click="toggleLike(review.id)"
                :style="review.liked ? 'color:#3db89e' : 'color:#9ca3af'"
              >
                <Heart :size="14" :fill="review.liked ? '#3db89e' : 'none'" />
                <span style="font-size: 0.78rem; font-weight: 600">{{
                  review.likes
                }}</span>
              </button>
              <button class="flex items-center gap-1.5" style="color: #9ca3af">
                <MessageCircle :size="14" />
                <span style="font-size: 0.78rem; font-weight: 600">{{
                  review.comments
                }}</span>
              </button>
            </div>
          </div>

          <!-- 무한 스크롤 sentinel -->
          <div ref="sentinel" class="h-4" />
          <div v-if="loadingMore" class="flex justify-center py-4">
            <div
              class="w-6 h-6 rounded-full border-2 animate-spin"
              style="border-color: #b2e4dc; border-top-color: #3db89e"
            />
          </div>
          <p
            v-if="!hasMore && !loadingMore && filteredReviews.length > 0"
            class="text-center py-2"
            style="font-size: 0.82rem; color: #9ca3af"
          >
            모든 게시글을 불러왔습니다.
          </p>
        </div>

        <!-- 오른쪽: 사이드바 (md 이상에서만 표시) -->
        <aside
          class="hidden md:flex flex-col gap-4"
          style="width: 260px; flex-shrink: 0"
        >
          <!-- 인기글 TOP 3 -->
          <div
            class="rounded-2xl p-5"
            style="
              background: #fff;
              border: 1.5px solid rgba(178, 228, 220, 0.35);
              box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
            "
          >
            <p
              style="font-weight: 700; font-size: 0.9rem; color: #1a2e2b"
              class="mb-4"
            >
              🔥 인기글 TOP 3
            </p>
            <div class="flex flex-col gap-3">
              <div
                v-for="(post, i) in popularReviews"
                :key="post.id"
                class="flex items-start gap-3 cursor-pointer group"
                @click="router.push(`/community/${post.id}`)"
              >
                <span
                  class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                  :style="
                    i === 0
                      ? 'background:#3db89e;color:#fff'
                      : 'background:#f0faf8;color:#6b8c87'
                  "
                >
                  {{ i + 1 }}
                </span>
                <div class="min-w-0">
                  <p
                    class="group-hover:text-teal-600 transition-colors"
                    style="
                      font-size: 0.82rem;
                      font-weight: 600;
                      color: #1a2e2b;
                      display: -webkit-box;
                      -webkit-line-clamp: 2;
                      -webkit-box-orient: vertical;
                      overflow: hidden;
                    "
                  >
                    {{ post.preview }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <span style="font-size: 0.72rem; color: #9ca3af">{{
                      post.author
                    }}</span>
                    <span style="font-size: 0.72rem; color: #b2e4dc">·</span>
                    <span style="font-size: 0.72rem; color: #9ca3af"
                      >♡ {{ post.likes }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 카테고리 안내 -->
          <div
            class="rounded-2xl p-5"
            style="
              background: #fff;
              border: 1.5px solid rgba(178, 228, 220, 0.35);
              box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
            "
          >
            <p
              style="font-weight: 700; font-size: 0.9rem; color: #1a2e2b"
              class="mb-3"
            >
              카테고리 안내
            </p>
            <div class="flex flex-col gap-2">
              <div
                v-for="cat in categories.filter((c) => c !== '전체')"
                :key="cat"
                class="flex items-center gap-2"
              >
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  :style="`background:${categoryStyle[cat]?.bg}; color:${categoryStyle[cat]?.color}; border: 1px solid ${categoryStyle[cat]?.border}`"
                >
                  {{ cat }}
                </span>
                <span style="font-size: 0.78rem; color: #6b8c87">
                  {{
                    cat === "공유해요"
                      ? "코스 후기 공유"
                      : cat === "궁금해요"
                        ? "여행 질문·추천"
                        : cat === "함께해요"
                          ? "동행 구하기"
                          : "자유 주제"
                  }}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
