<script setup lang="ts">
import {
  CODE_TO_CATEGORY,
  createComment,
  deleteComment,
  deletePost,
  getLikeStatus,
  getPost,
  toggleLike,
} from "@/api/community";
import { useAuthStore } from "@/stores/auth";
import type { PostComment, PostDetail } from "@/types/community";
import {
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const postId = route.params.id as string;
const post = ref<PostDetail | null>(null);
const isLoading = ref(true);
const isLiked = ref(false);
const commentText = ref("");
const isSubmittingComment = ref(false);

// ─── content 블록 파싱 ───
interface ContentBlock {
  type: "text" | "image";
  value?: string;
  url?: string;
  name?: string;
}

const parsedBlocks = computed((): ContentBlock[] => {
  if (!post.value?.content) return [];
  try {
    const parsed = JSON.parse(post.value.content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // legacy fallback
  }
  // 레거시 HTML/평문 → HTML 태그 제거 후 텍스트 하나로 표시
  const plainText = post.value.content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return [{ type: "text", value: plainText }];
});

const isLoggedIn = computed(() => auth.isLoggedIn);
const isOwner = computed(
  () => !!post.value && !!auth.userId && post.value.userId === auth.userId,
);

function isMyComment(comment: PostComment): boolean {
  if (comment.userId && auth.userId) return comment.userId === auth.userId;
  if (auth.nickname) return comment.username === auth.nickname;
  return false;
}

// ─── 날짜 포맷 ───
function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── 좋아요 ───
async function handleToggleLike() {
  if (!isLoggedIn.value) {
    alert("로그인이 필요합니다.");
    return;
  }
  if (!post.value) return;
  try {
    await toggleLike(postId);
    isLiked.value = !isLiked.value;
    post.value.likeCount += isLiked.value ? 1 : -1;
  } catch {
    alert("좋아요 처리에 실패했습니다.");
  }
}

// ─── 댓글 등록 ───
async function handleAddComment() {
  if (!isLoggedIn.value) {
    alert("로그인이 필요합니다.");
    return;
  }
  if (!commentText.value.trim() || !post.value) return;
  isSubmittingComment.value = true;
  try {
    const newComment = await createComment(postId, commentText.value.trim());
    if (newComment) post.value.comments.push(newComment);
    commentText.value = "";
    const refreshed = await getPost(postId);
    post.value = refreshed;
  } catch {
    alert("댓글 등록에 실패했습니다.");
  } finally {
    isSubmittingComment.value = false;
  }
}

// ─── 댓글 삭제 ───
async function handleDeleteComment(commentId: string) {
  if (!confirm("댓글을 삭제하시겠습니까?") || !post.value) return;
  try {
    await deleteComment(postId, commentId);
    post.value.comments = post.value.comments.filter((c) => c.id !== commentId);
    post.value.commentCount--;
  } catch {
    alert("댓글 삭제에 실패했습니다.");
  }
}

// ─── 게시글 삭제 ───
async function handleDeletePost() {
  if (!confirm("게시글을 삭제하시겠습니까?")) return;
  try {
    await deletePost(postId);
    router.replace("/community");
  } catch {
    alert("게시글 삭제에 실패했습니다.");
  }
}

// ─── 초기 로드 ───
onMounted(async () => {
  try {
    const [postData] = await Promise.all([
      getPost(postId),
      isLoggedIn.value
        ? getLikeStatus(postId).then((s) => {
            isLiked.value = s.liked;
          })
        : Promise.resolve(),
    ]);
    post.value = postData;
  } catch {
    router.replace("/community");
  } finally {
    isLoading.value = false;
    if (route.hash === "#comments") {
      setTimeout(() => {
        document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }
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
      min-height: 100vh;
      padding-bottom: 40px;
    "
  >
    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- 뒤로가기 -->
      <button
        @click="router.replace('/community')"
        class="flex items-center gap-2 mb-6 transition-opacity hover:opacity-70"
        style="color: #6b8c87; font-size: 0.88rem; font-weight: 600"
      >
        목록으로
      </button>

      <!-- 로딩 -->
      <div
        v-if="isLoading"
        class="text-center py-24 text-gray-400 text-sm font-medium"
      >
        불러오는 중...
      </div>

      <template v-else-if="post">
        <div
          class="rounded-2xl p-8"
          style="
            background: #fff;
            border: 1.5px solid rgba(178, 228, 220, 0.35);
            box-shadow: 0 4px 24px rgba(26, 46, 43, 0.08);
          "
        >
          <!-- 헤더 -->
          <div class="mb-6">
            <!-- 카테고리 배지 -->
            <div class="mb-3">
              <span
                class="text-[11px] font-bold px-2.5 py-1 rounded-sm"
                style="
                  background: #e8f8f5;
                  color: #3db89e;
                  border: 1px solid #b2e4dc;
                "
              >
                {{ CODE_TO_CATEGORY[post.category] ?? post.category }}
              </span>
            </div>

            <!-- 제목 + 통계 -->
            <div class="flex justify-between items-start mb-4">
              <h1
                style="
                  font-weight: 800;
                  font-size: 1.5rem;
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
                <span class="flex items-center gap-1"
                  ><Eye :size="12" /> {{ post.viewCount }}</span
                >
                <span class="flex items-center gap-1"
                  ><MessageCircle :size="12" /> {{ post.commentCount }}</span
                >
              </div>
            </div>

            <!-- 작성자 + 날짜 + 수정/삭제 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                  style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
                >
                  {{ post.username.charAt(0) }}
                </div>
                <span
                  style="font-weight: 700; font-size: 0.85rem; color: #1a2e2b"
                  >{{ post.username }}</span
                >
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[0.8rem] text-gray-400 font-medium">
                  {{ formatDate(post.createdAt) }}
                </span>
                <template v-if="isOwner">
                  <button
                    @click="router.push(`/community/${postId}/edit`)"
                    class="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Pencil :size="13" /> 수정
                  </button>
                  <button
                    @click="handleDeletePost"
                    class="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 :size="13" /> 삭제
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- 본문 -->
          <div
            class="mb-10 py-6 border-y"
            style="border-color: rgba(178, 228, 220, 0.2)"
          >
            <div class="flex flex-col gap-4">
              <template v-for="(block, i) in parsedBlocks" :key="i">
                <p
                  v-if="block.type === 'text'"
                  style="
                    font-size: 0.95rem;
                    color: #374151;
                    line-height: 1.9;
                    white-space: pre-line;
                  "
                >{{ block.value }}</p>
                <img
                  v-else-if="block.type === 'image'"
                  :src="block.url"
                  :alt="block.name || '이미지'"
                  style="max-width: 100%; border-radius: 8px;"
                />
              </template>
            </div>
          </div>

          <!-- 좋아요 -->
          <div class="flex items-center mb-10">
            <button
              @click="handleToggleLike"
              class="flex items-center gap-2 font-bold transition-colors"
              :style="isLiked ? 'color:#3db89e' : 'color:#9ca3af'"
            >
              <Heart
                :size="20"
                :fill="isLiked ? '#3db89e' : 'none'"
                :stroke="isLiked ? '#3db89e' : '#9ca3af'"
              />
              {{ post.likeCount }}
            </button>
          </div>

          <!-- 댓글 -->
          <section id="comments">
            <div class="mb-4 font-bold text-gray-800">
              댓글 {{ post.commentCount }}개
            </div>

            <!-- 댓글 입력 -->
            <div v-if="isLoggedIn" class="flex gap-3 mb-8">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
              >
                {{ auth.nickname?.charAt(0) ?? "나" }}
              </div>
              <input
                v-model="commentText"
                @keydown.enter="handleAddComment"
                class="flex-1 px-4 py-2 rounded-lg border text-sm outline-none bg-gray-50"
                placeholder="댓글을 입력하세요"
                :disabled="isSubmittingComment"
              />
              <button
                @click="handleAddComment"
                :disabled="isSubmittingComment || !commentText.trim()"
                class="px-4 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-1 transition-opacity"
                :style="
                  isSubmittingComment || !commentText.trim()
                    ? 'background:#9ca3af; cursor:not-allowed;'
                    : 'background:#3db89e;'
                "
              >
                <Send :size="13" /> 등록
              </button>
            </div>
            <div
              v-else
              class="mb-8 py-3 px-4 bg-gray-50 rounded-lg text-xs text-gray-400 text-center font-medium"
            >
              로그인 후 댓글을 작성할 수 있습니다.
            </div>

            <!-- 댓글 목록 -->
            <div
              v-if="isLoggedIn && post.comments.length === 0"
              class="text-center py-8 text-xs text-gray-400 font-medium"
            >
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </div>
            <div class="flex flex-col gap-6">
              <div
                v-for="comment in post.comments"
                :key="comment.id"
                class="flex gap-3"
              >
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-teal-600 bg-teal-50 flex-shrink-0"
                >
                  {{ comment.username.charAt(0) }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-sm text-gray-800">{{
                      comment.username
                    }}</span>
                    <span
                      v-if="comment.userId === post.userId"
                      style="
                        background: #e8f8f5;
                        color: #3db89e;
                        font-size: 10px;
                        padding: 1px 6px;
                        border-radius: 4px;
                        font-weight: 700;
                      "
                      >작성자</span
                    >
                    <span class="text-xs text-gray-400">{{
                      formatDate(comment.createdAt)
                    }}</span>
                    <button
                      v-if="isMyComment(comment)"
                      @click="handleDeleteComment(comment.id)"
                      class="ml-auto text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 :size="13" />
                    </button>
                  </div>
                  <p class="text-sm text-gray-700 leading-relaxed">
                    {{ comment.content }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </template>
    </div>
  </div>
</template>
