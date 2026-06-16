<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  MessageCircle,
  User,
  Paperclip,
  X,
} from "lucide-vue-next";
import type { Review, Notice, FaqItem, Inquiry } from "@/types/community";
import { fetchReviews, fetchNotices, fetchFaqData, fetchMyInquiries } from "@/api/community";

const router = useRouter();
const activeTab = ref<"reviews" | "notices">("reviews");

// ─── 카테고리 정의 ───
const activeCategory = ref("전체");
const categories = ["전체", "공유해요", "궁금해요", "함께해요", "자유"];

// 공지사항 메뉴 구조
const activeNoticeCategory = ref("공지/이벤트");
const isMunyeeOpen = ref(true); // 문의사항 하위 메뉴 기본 열림 상태
const activeFaqSubCategory = ref("자주 묻는 질문");

const isMyPostsOnly = ref(false);
const isLoggedIn = ref(true);
const searchQuery = ref("");

// 파일 첨부 관련 상태
const attachedFiles = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

// 카테고리 스타일 정의
const categoryStyle: Record<
  string,
  { bg: string; color: string; border: string; desc: string }
> = {
  공유해요: {
    bg: "#ffffff",
    color: "#3db89e",
    border: "#3db89e",
    desc: "나만의 알찬 대전 환승 코스 후기를 공유하는 공간입니다.",
  },
  궁금해요: {
    bg: "#FEF9EC",
    color: "#d97706",
    border: "#FDE68A",
    desc: "대전 여행, 맛집, 환승 시간 활용 등 무엇이든 물어보세요!",
  },
  함께해요: {
    bg: "#F0F4FF",
    color: "#6366f1",
    border: "#C7D2FE",
    desc: "짧은 환승 시간도 함께하면 두 배! 대전 여정을 같이할 동행을 구해보세요.",
  },
  자유: {
    bg: "#F5F0FF",
    color: "#8b5cf6",
    border: "#DDD6FE",
    desc: "소소한 대전 이야기부터 일상까지 자유롭게 소통하는 공간입니다.",
  },
};

// --- 당일 기준 NEW 체크 로직 ---
const checkIsNew = (dateStr: string) => {
  const postDate = new Date(dateStr.replace(/\./g, "-"));
  const currentDate = new Date();
  const diffTime = currentDate.getTime() - postDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 2;
};

const hasNewPostInCategory = (category: string) => {
  return reviews.value.some((r) => {
    const matchesCat = category === "전체" || r.category === category;
    return matchesCat && checkIsNew(r.date);
  });
};

// --- 공지사항 데이터 ---
const notices = ref<Notice[]>([]);

const pinnedNotices = computed(() =>
  notices.value.filter((n) => n.pinned && n.type === "공지/이벤트"),
);
const regularNotices = computed(() =>
  notices.value.filter((n) => !n.pinned && n.type === "공지/이벤트"),
);

function toggleNotice(id: number) {
  const n = notices.value.find((n) => n.id === id);
  if (n) n.open = !n.open;
}

// --- 문의사항 (FAQ) 데이터 ---
const faqData = ref<FaqItem[]>([]);

// 나의 1:1 문의 내역 데이터
const myInquiries = ref<Inquiry[]>([]);

// 파일 첨부 이벤트 처리 함수
function triggerFileInput() {
  fileInput.value?.click();
}
function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    attachedFiles.value.push(...Array.from(target.files));
  }
}
function removeFile(index: number) {
  attachedFiles.value.splice(index, 1);
}

// --- 코스 후기 데이터 ---
const reviews = ref<Review[]>([]);

const filteredReviews = computed(() => {
  return reviews.value.filter((r) => {
    const matchesCategory =
      activeCategory.value === "전체" || r.category === activeCategory.value;
    const matchesMyPosts = !isMyPostsOnly.value || r.isMine;
    return matchesCategory && matchesMyPosts;
  });
});

onMounted(async () => {
  [reviews.value, notices.value, faqData.value, myInquiries.value] = await Promise.all([
    fetchReviews(),
    fetchNotices(),
    fetchFaqData(),
    fetchMyInquiries(),
  ]);
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
          @click="activeTab = tab.key as any"
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

        <div
          class="ml-auto pb-1 flex items-center gap-4"
          v-if="activeTab === 'reviews'"
        >
          <button
            v-if="isLoggedIn"
            @click="isMyPostsOnly = !isMyPostsOnly"
            class="flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs transition-colors rounded-md"
            :style="
              isMyPostsOnly
                ? 'background:#3db89e; color:#fff;'
                : 'background:transparent; color:#6b8c87;'
            "
          >
            <User :size="13" /> 내가 작성한 글 보기
          </button>
          <button
            @click="router.push('/community/write')"
            class="flex items-center gap-1 px-1 py-2 transition-all hover:opacity-80"
            style="
              background: transparent;
              color: #3db89e;
              font-size: 0.96rem;
              font-weight: 800;
              border: none;
            "
          >
            <Plus :size="17" style="stroke-width: 2.5" /> 글쓰기
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'notices'" class="flex gap-8 items-start mt-1">
        <nav
          class="hidden md:flex flex-col gap-1 w-44 flex-shrink-0 sticky top-20"
        >
          <button
            @click="activeNoticeCategory = '공지/이벤트'"
            class="w-full text-left px-4 py-3 rounded-none text-sm font-bold transition-all"
            :style="
              activeNoticeCategory === '공지/이벤트'
                ? 'background:#3db89e; color:#fff;'
                : 'background:transparent; color:#6b8c87;'
            "
          >
            공지/이벤트
          </button>
          <div class="flex flex-col">
            <button
              @click="isMunyeeOpen = !isMunyeeOpen"
              class="w-full text-left px-4 py-3 rounded-none text-sm font-bold transition-all flex items-center justify-between"
              :style="
                activeNoticeCategory === '문의사항'
                  ? 'color:#3db89e;'
                  : 'color:#6b8c87;'
              "
            >
              <span>문의사항</span>
              <ChevronDown
                :size="14"
                class="transition-transform duration-200"
                :class="{ 'rotate-180': isMunyeeOpen }"
              />
            </button>
            <div
              v-if="isMunyeeOpen"
              class="flex flex-col pl-3 bg-gray-50/40 border-l-2 ml-4 mb-2"
              style="border-color: rgba(178, 228, 220, 0.4)"
            >
              <button
                v-for="sub in ['자주 묻는 질문', '1:1 문의하기']"
                :key="sub"
                @click="
                  activeNoticeCategory = '문의사항';
                  activeFaqSubCategory = sub;
                "
                class="text-left px-3 py-2 text-xs font-semibold transition-all"
                :style="
                  activeNoticeCategory === '문의사항' &&
                  activeFaqSubCategory === sub
                    ? 'color:#3db89e; font-weight:800;'
                    : 'color:#9ca3af;'
                "
              >
                · {{ sub }}
              </button>
            </div>
          </div>
        </nav>

        <div class="flex-1 min-w-0 flex flex-col">
          <template v-if="activeNoticeCategory === '공지/이벤트'">
            <div
              v-if="pinnedNotices.length > 0"
              class="mb-6 bg-white rounded-xl p-5 border shadow-sm"
              style="border-color: rgba(126, 207, 192, 0.4)"
            >
              <div
                class="flex items-center gap-1.5 mb-3 text-xs font-bold text-teal-600"
              >
                📌 필독 중요 공지
              </div>
              <div class="flex flex-col">
                <div
                  v-for="(pNotice, index) in pinnedNotices"
                  :key="pNotice.id"
                  class="py-3 flex flex-col gap-2"
                  :class="{ 'border-t border-gray-100': index > 0 }"
                >
                  <button
                    class="w-full flex items-center gap-3 text-left bg-transparent"
                    @click="toggleNotice(pNotice.id)"
                  >
                    <span
                      class="text-xs font-semibold px-2 py-0.5 rounded-sm"
                      :style="tagColors[pNotice.tag]"
                      >{{ pNotice.tag }}</span
                    >
                    <span
                      class="flex-1 font-bold text-sm text-gray-800 hover:text-teal-600 transition-colors"
                      >{{ pNotice.title }}</span
                    >
                    <span
                      style="font-size: 0.78rem; color: #9ca3af"
                      class="mr-1"
                      >{{ pNotice.date }}</span
                    >
                    <ChevronDown
                      v-if="!pNotice.open"
                      :size="15"
                      color="#9ca3af"
                    /><ChevronUp v-else :size="15" color="#3db89e" />
                  </button>
                  <div
                    v-if="pNotice.open"
                    class="px-3 py-3 bg-gray-50/60 rounded-md mt-1"
                  >
                    <p
                      class="text-xs text-gray-600 leading-relaxed white-space: pre-line;"
                    >
                      {{ pNotice.content }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="regularNotices.length === 0 && pinnedNotices.length === 0"
              class="text-center py-16 text-gray-400 text-sm font-medium"
            >
              등록된 내용이 없습니다.
            </div>
            <div
              v-for="notice in regularNotices"
              :key="notice.id"
              class="group pt-4 pb-5 border-b flex flex-col gap-2"
              style="border-color: rgba(178, 228, 220, 0.25)"
            >
              <button
                class="w-full flex items-center gap-3 text-left bg-transparent"
                @click="toggleNotice(notice.id)"
              >
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-sm flex-shrink-0"
                  :style="tagColors[notice.tag]"
                  >{{ notice.tag }}</span
                >
                <span class="flex-1 font-semibold text-sm text-gray-800">{{
                  notice.title
                }}</span>
                <span
                  style="font-size: 0.78rem; color: #9ca3af"
                  class="flex-shrink-0 mr-1"
                  >{{ notice.date }}</span
                >
                <ChevronDown
                  v-if="!notice.open"
                  :size="16"
                  color="#9ca3af"
                /><ChevronUp v-else :size="16" color="#3db89e" />
              </button>
              <div
                v-if="notice.open"
                class="px-2 py-3 bg-gray-50/50 rounded-md"
              >
                <p style="font-size: 0.88rem; color: #374151; line-height: 1.7">
                  {{ notice.content }}
                </p>
              </div>
            </div>
          </template>

          <template v-else-if="activeNoticeCategory === '문의사항'">
            <div
              v-if="activeFaqSubCategory === '자주 묻는 질문'"
              class="flex flex-col gap-3"
            >
              <div
                v-for="faq in faqData"
                :key="faq.id"
                class="border rounded-md bg-white p-4"
                style="border-color: rgba(178, 228, 220, 0.3)"
              >
                <details class="group">
                  <summary
                    class="list-none flex items-center justify-between font-bold text-sm cursor-pointer"
                    style="color: #1a2e2b"
                  >
                    <span class="flex gap-2"
                      ><span style="color: #3db89e">Q.</span>
                      {{ faq.question }}</span
                    >
                    <ChevronDown
                      :size="15"
                      class="transition-transform group-open:rotate-180"
                      color="#9ca3af"
                    />
                  </summary>
                  <div
                    class="mt-3 pt-3 text-xs leading-relaxed border-t text-gray-600"
                    style="border-color: rgba(178, 228, 220, 0.2)"
                  >
                    <p>{{ faq.answer }}</p>
                  </div>
                </details>
              </div>
            </div>

            <div v-else class="flex flex-col gap-6">
              <div
                class="bg-white border rounded-md p-5"
                style="border-color: rgba(178, 228, 220, 0.3)"
              >
                <h4 class="text-sm font-bold text-gray-800 mb-3">
                  ✉️ 고객센터 1:1 문의하기
                </h4>
                <div class="flex flex-col gap-3">
                  <input
                    placeholder="제목을 입력해주세요"
                    style="
                      width: 100%;
                      padding: 10px;
                      border: 1px solid rgba(178, 228, 220, 0.4);
                      border-radius: 6px;
                      font-size: 0.8rem;
                      outline: none;
                    "
                  />
                  <textarea
                    rows="4"
                    placeholder="문의하실 내용을 입력해주세요."
                    style="
                      width: 100%;
                      padding: 10px;
                      border: 1px solid rgba(178, 228, 220, 0.4);
                      border-radius: 6px;
                      font-size: 0.8rem;
                      outline: none;
                      resize: none;
                    "
                  ></textarea>

                  <div class="flex flex-col gap-2 mt-1">
                    <button
                      type="button"
                      @click="triggerFileInput"
                      class="self-start flex items-center gap-1.5 px-3 py-1.5 border border-dashed text-gray-500 rounded-md text-xs font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <Paperclip :size="13" /> 파일 첨부하기
                    </button>
                    <input
                      type="file"
                      ref="fileInput"
                      class="hidden"
                      multiple
                      @change="handleFileUpload"
                    />

                    <div
                      v-if="attachedFiles.length > 0"
                      class="flex flex-wrap gap-1.5 mt-1"
                    >
                      <div
                        v-for="(file, idx) in attachedFiles"
                        :key="idx"
                        class="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-[11px] font-medium"
                      >
                        <span class="max-w-[150px] truncate">{{
                          file.name
                        }}</span>
                        <button
                          @click="removeFile(idx)"
                          class="text-gray-400 hover:text-gray-600"
                        >
                          <X :size="11" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    class="w-full py-2.5 rounded-md font-bold text-xs text-white mt-2"
                    style="background: #3db89e"
                  >
                    문의 신청하기
                  </button>
                </div>
              </div>

              <div class="flex flex-col gap-3 mt-2">
                <h4
                  class="text-sm font-bold text-gray-800 flex items-center gap-1.5"
                >
                  📋 나의 1:1 문의 내역
                  <span class="text-xs font-normal text-gray-400"
                    >(최근 접수순)</span
                  >
                </h4>
                <div
                  v-if="myInquiries.length === 0"
                  class="text-center py-10 bg-white rounded border text-xs text-gray-400 font-medium"
                >
                  작성한 문의 내역이 없습니다.
                </div>

                <div
                  v-for="inq in myInquiries"
                  :key="inq.id"
                  class="bg-white border rounded p-4 flex flex-col gap-2"
                  style="border-color: rgba(178, 228, 220, 0.25)"
                >
                  <details class="group">
                    <summary
                      class="list-none flex items-center gap-3 cursor-pointer"
                    >
                      <span
                        class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        :style="
                          inq.status === '답변완료'
                            ? 'background:#e8f8f5; color:#3db89e;'
                            : 'background:#f3f4f6; color:#6b8c87;'
                        "
                        >{{ inq.status }}</span
                      >
                      <span
                        class="flex-1 text-xs font-bold text-gray-700 truncate group-open:text-teal-600"
                        >{{ inq.title }}</span
                      >
                      <span class="text-[11px] text-gray-400">{{
                        inq.date
                      }}</span>
                      <ChevronDown
                        :size="13"
                        class="text-gray-400 group-open:rotate-180 transition-transform"
                      />
                    </summary>
                    <div
                      class="mt-3 pt-3 border-t text-xs text-gray-600 flex flex-col gap-3"
                      style="border-color: rgba(178, 228, 220, 0.15)"
                    >
                      <div class="bg-gray-50/50 p-2.5 rounded">
                        <p class="font-semibold text-gray-500 mb-1">
                          질문 내용:
                        </p>
                        <p class="leading-relaxed">{{ inq.content }}</p>
                      </div>
                      <div
                        v-if="inq.answer"
                        class="bg-teal-50/30 p-2.5 border border-teal-100/50 rounded"
                      >
                        <p class="font-bold text-teal-600 mb-1">
                          ↳ 서비스 답변:
                        </p>
                        <p class="leading-relaxed text-gray-700">
                          {{ inq.answer }}
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div v-else class="flex gap-8 items-start mt-1">
        <nav
          class="hidden md:flex flex-col gap-1 w-40 flex-shrink-0 sticky top-20"
        >
          <button
            v-for="cat in categories"
            :key="cat"
            @click="activeCategory = cat"
            class="w-full text-left px-4 py-3 rounded-none text-sm font-bold transition-all flex items-center justify-between"
            :style="
              activeCategory === cat
                ? 'background:#3db89e; color:#fff;'
                : 'background:transparent; color:#6b8c87;'
            "
          >
            <span>{{ cat }}</span>
            <span
              v-if="hasNewPostInCategory(cat)"
              class="text-[9px] px-1.5 py-0.5 rounded-sm font-extrabold"
              :style="
                activeCategory === cat
                  ? 'background:#fff; color:#3db89e;'
                  : 'background:#ff4d4f; color:#fff;'
              "
              >NEW</span
            >
          </button>
        </nav>

        <div class="flex-1 min-w-0 flex flex-col">
          <div
            class="rounded-xl p-5 mb-4 transition-all"
            :style="`background: ${activeCategory === '전체' ? 'linear-gradient(135deg, #e8f8f5, #f0faf8)' : categoryStyle[activeCategory]?.bg}; border: 1.5px solid ${activeCategory === '전체' ? 'rgba(126, 207, 192, 0.35)' : categoryStyle[activeCategory]?.border};`"
          >
            <div class="flex flex-col gap-1">
              <h3 style="font-weight: 800; font-size: 1.05rem; color: #1a2e2b">
                {{
                  activeCategory === "전체"
                    ? "💬 대전 광장 전체보기"
                    : `# ${activeCategory}`
                }}
              </h3>
              <p style="font-size: 0.82rem; color: #6b8c87; line-height: 1.5">
                {{
                  activeCategory === "전체"
                    ? "대전 환승러들이 자유롭게 이야기를 나누고 유용한 여행 팁을 얻어가는 통합 소통 커뮤니티입니다."
                    : categoryStyle[activeCategory]?.desc
                }}
              </p>
            </div>
          </div>

          <div
            v-for="review in filteredReviews"
            :key="review.id"
            class="group cursor-pointer pt-4 pb-5 transition-colors border-b flex gap-5 items-start"
            style="border-color: rgba(178, 228, 220, 0.25)"
            @click="router.push(`/community/${review.id}`)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 pb-2.5">
                <span
                  class="text-[11px] font-bold px-2.5 py-0.5 rounded-none flex-shrink-0"
                  :style="`background:${categoryStyle[review.category]?.bg ?? '#f3f4f6'}; color:${categoryStyle[review.category]?.color ?? '#374151'}; border: 1px solid ${categoryStyle[review.category]?.border ?? '#e5e7eb'}; font-weight: 700;`"
                  >{{ review.category }}</span
                >
                <div class="flex items-center gap-2 ml-auto">
                  <div
                    class="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-[10px]"
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
                </div>
              </div>
              <p class="pb-3 text-sm text-gray-600 line-clamp-2">
                {{ review.preview }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
