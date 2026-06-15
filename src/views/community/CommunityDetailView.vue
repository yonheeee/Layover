<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  Footprints,
  Car,
  Image as ImageIcon,
  Utensils,
  Coffee,
  Palmtree,
  Theater,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

// 💡 수정 포인트: 기존 content(string) 대신 작성할 때 사용했던 blocks 구조를 사용
const post = ref({
  id: Number(route.params.id),
  author: "홍길동",
  initials: "홍",
  date: "2025.06.02",
  title: "대전 환승 3시간 30분 완벽 코스 후기",
  blocks: [
    {
      id: 1,
      type: "text",
      value:
        "성심당에서 맛있는 빵을 먹고 테미오래에서 감성 사진도 찍고, 한밭수목원에서 산책까지! 3시간이 정말 알차게 느껴졌어요.",
    },
    { id: 2, type: "image", value: "" },
    {
      id: 3,
      type: "text",
      value:
        "성심당은 오픈 직후에 가는 게 줄이 짧아요. 튀김소보로는 무조건 사야 하는 필수 아이템이고, 판타롱슈크림빵도 정말 맛있었어요.",
    },
  ] as { id: number; type: "text" | "image"; value: string }[],
  station: "대전역",
  duration: "3시간 30분",
  course: [
    { name: "성심당", category: "음식", transport: "도보", time: "5분" },
    { name: "테미오래", category: "문화", transport: "택시", time: "10분" },
    { name: "한밭수목원", category: "자연", transport: "도보", time: "15분" },
  ],
  likes: 24,
  liked: false,
  comments: [
    {
      id: 1,
      author: "여행러버",
      initials: "여",
      date: "2025.06.02",
      text: "저도 이 코스 가봤는데 정말 좋았어요!",
    },
    {
      id: 2,
      author: "대전탐험가",
      initials: "대",
      date: "2025.06.03",
      text: "테미오래 포토존 정보 감사해요!",
    },
  ],
});

const commentText = ref("");

function toggleLike() {
  post.value.liked = !post.value.liked;
  post.value.likes += post.value.liked ? 1 : -1;
}

function addComment() {
  if (!commentText.value.trim()) return;
  post.value.comments.push({
    id: post.value.comments.length + 1,
    author: "나",
    initials: "나",
    date: new Date()
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ".")
      .replace(".", ""),
    text: commentText.value.trim(),
  });
  commentText.value = "";
}

const categoryMeta: Record<string, { icon: any; color: string }> = {
  음식: { icon: Utensils, color: "#D97706" },
  카페: { icon: Coffee, color: "#4F46E5" },
  자연: { icon: Palmtree, color: "#059669" },
  문화: { icon: Theater, color: "#DC2626" },
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
      min-height: 100vh;
      padding-bottom: 40px;
    "
  >
    <div class="max-w-2xl mx-auto px-4 py-6">
      <button
        @click="router.back()"
        class="flex items-center gap-2 mb-6 transition-opacity hover:opacity-70"
        style="color: #6b8c87; font-size: 0.88rem; font-weight: 600"
      >
        <ArrowLeft :size="17" /> 목록으로
      </button>

      <div
        class="rounded-2xl p-8"
        style="
          background: #fff;
          border: 1.5px solid rgba(178, 228, 220, 0.35);
          box-shadow: 0 4px 24px rgba(26, 46, 43, 0.08);
        "
      >
        <div class="mb-6">
          <div class="flex justify-between items-start mb-4">
            <h1
              style="
                font-weight: 800;
                font-size: 1.6rem;
                color: #1a2e2b;
                line-height: 1.3;
                flex: 1;
              "
            >
              {{ post.title }}
            </h1>
            <div
              class="flex items-center gap-3 text-xs font-bold text-gray-400 mt-1 ml-4 flex-shrink-0"
            >
              <span>조회 124</span>
              <span class="flex items-center gap-1"
                ><MessageCircle :size="12" /> {{ post.comments.length }}</span
              >
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
              >
                {{ post.initials }}
              </div>
              <span
                style="font-weight: 700; font-size: 0.85rem; color: #1a2e2b"
                >{{ post.author }}</span
              >
            </div>

            <div class="text-[0.8rem] text-gray-400 font-medium">
              {{ post.date }} 16:24
            </div>
          </div>
        </div>

        <div
          class="mb-8 p-5 rounded-2xl"
          style="
            background: #f0faf8;
            border: 1.5px solid rgba(178, 228, 220, 0.4);
          "
        >
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-xl flex items-center justify-center bg-white border"
              style="border-color: rgba(178, 228, 220, 0.5)"
            >
              <MapPin :size="30" color="#3db89e" />
            </div>
            <div class="flex-1">
              <div
                class="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500"
              >
                <span>{{ post.station }}</span> |
                <span>{{ post.duration }}</span>
              </div>
              <div class="flex flex-col gap-2">
                <div
                  v-for="(place, i) in post.course"
                  :key="i"
                  class="flex items-center gap-2"
                >
                  <div
                    class="w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white bg-teal-500"
                  >
                    {{ i + 1 }}
                  </div>
                  <span
                    style="font-weight: 600; font-size: 0.85rem; color: #1a2e2b"
                    >{{ place.name }}</span
                  >
                  <component
                    :is="categoryMeta[place.category].icon"
                    :size="14"
                    :style="`color:${categoryMeta[place.category].color}`"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-10 flex flex-col gap-6">
          <div v-for="block in post.blocks" :key="block.id">
            <p
              v-if="block.type === 'text'"
              style="
                font-size: 0.95rem;
                color: #374151;
                line-height: 1.8;
                white-space: pre-line;
              "
            >
              {{ block.value }}
            </p>
            <div
              v-else-if="block.type === 'image'"
              class="rounded-xl overflow-hidden aspect-video bg-gray-50 flex items-center justify-center border"
            >
              <ImageIcon :size="40" color="#B2E4DC" />
            </div>
          </div>
        </div>

        <div class="flex items-center pt-6 border-t border-gray-100 mb-10">
          <button
            @click="toggleLike"
            class="flex items-center gap-2 font-bold"
            :style="post.liked ? 'color:#3db89e' : 'color:#9ca3af'"
          >
            <Heart :size="20" :fill="post.liked ? '#3db89e' : 'none'" />
            {{ post.likes }}
          </button>
        </div>

        <section>
          <div class="mb-4 font-bold text-gray-800">
            댓글 {{ post.comments.length }}개
          </div>
          <div class="flex gap-3 mb-8">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
            >
              나
            </div>
            <input
              v-model="commentText"
              @keydown.enter="addComment"
              class="flex-1 px-4 py-2 rounded-lg border text-sm outline-none bg-gray-50"
              placeholder="댓글을 입력하세요"
            />
            <button
              @click="addComment"
              class="px-4 py-2 rounded-lg bg-teal-500 text-white text-xs font-bold"
            >
              등록
            </button>
          </div>
          <div class="flex flex-col gap-6">
            <div
              v-for="comment in post.comments"
              :key="comment.id"
              class="flex gap-3"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-teal-600 bg-teal-50"
              >
                {{ comment.initials }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-sm text-gray-800">{{
                    comment.author
                  }}</span>
                  <span class="text-xs text-gray-400">{{ comment.date }}</span>
                </div>
                <p class="text-sm text-gray-700 leading-relaxed">
                  {{ comment.text }}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
