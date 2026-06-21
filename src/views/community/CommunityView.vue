<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  ChevronDown,
  Plus,
  MessageCircle,
  User,
  Paperclip,
  X,
  Eye,
  Heart,
} from "lucide-vue-next";
import type {
  Post,
  Notice,
  FaqItem,
  InquiryItem,
  InquiryDetail,
} from "@/types/community";
import {
  getPosts,
  getNotices,
  getNotice,
  getFaqs,
  createInquiry,
  getMyInquiries,
  getInquiry,
  CATEGORY_TO_CODE,
  CODE_TO_CATEGORY,
} from "@/api/community";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const isLoggedIn = computed(() => auth.isLoggedIn);

const activeTab = ref<"reviews" | "notices">("reviews");

// ─── 커뮤니티 카테고리 ───
const activeCategory = ref("전체");
const categories = ["전체", "공유해요", "궁금해요", "함께해요", "자유"];

// ─── 공지사항 메뉴 ───
const activeNoticeCategory = ref("공지/이벤트");
const isMunyeeOpen = ref(true);
const activeFaqSubCategory = ref("자주 묻는 질문");

const isMyPostsOnly = ref(false);

// ─── 파일 첨부 ───
const attachedFiles = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

// ─── 1:1 문의 폼 ───
const inquiryTitle = ref("");
const inquiryContent = ref("");
const isSubmittingInquiry = ref(false);

// ─── 카테고리 스타일 ───
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

// ─── 날짜 포맷 ───
function formatDate(isoStr: string): string {
  return new Date(isoStr)
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

// ─── NEW 체크 ───
const checkIsNew = (isoStr: string) => {
  const diffDays = (Date.now() - new Date(isoStr).getTime()) / 86400000;
  return diffDays >= 0 && diffDays <= 2;
};

// ─── 게시글 ───
const posts = ref<Post[]>([]);
const isPostsLoading = ref(false);

const filteredPosts = computed(() => {
  if (!posts.value) return [];
  return posts.value.filter((p) => {
    const korCat = CODE_TO_CATEGORY[p.category] ?? p.category;
    const matchesCat =
      activeCategory.value === "전체" || korCat === activeCategory.value;
    const matchesMine = !isMyPostsOnly.value || p.userId === auth.userId;
    return matchesCat && matchesMine;
  });
});

const hasNewPostInCategory = (category: string) => {
  if (!posts.value || posts.value.length === 0) return false;
  return posts.value.some((p) => {
    const korCat = CODE_TO_CATEGORY[p.category] ?? p.category;
    const matchesCat = category === "전체" || korCat === category;
    return matchesCat && checkIsNew(p.createdAt);
  });
};

// ─── 공지사항 ───
const notices = ref<Notice[]>([]);
const isNoticesLoading = ref(false);
// undefined = 미로드, null = 로딩 중, string = 로드 완료
const noticeContents = ref<Record<string, string | null | undefined>>({});

async function onNoticeToggle(id: string, e: Event) {
  const details = e.target as HTMLDetailsElement;
  if (details.open && noticeContents.value[id] === undefined) {
    noticeContents.value[id] = null; // 로딩 중
    try {
      const detail = await getNotice(id);
      noticeContents.value[id] = detail.content ?? "";
    } catch {
      noticeContents.value[id] = "내용을 불러올 수 없습니다.";
    }
  }
}

// ─── FAQ ───
const faqData = ref<FaqItem[]>([]);
const isFaqLoading = ref(false);

// ─── 1:1 문의 ───
const myInquiries = ref<InquiryItem[]>([]);
const inquiryDetails = ref<Record<string, InquiryDetail>>({});
const loadingInquiryIds = ref<Set<string>>(new Set());

async function onInquiryToggle(id: string, e: Event) {
  const details = e.target as HTMLDetailsElement;
  if (
    details.open &&
    !inquiryDetails.value[id] &&
    !loadingInquiryIds.value.has(id)
  ) {
    loadingInquiryIds.value.add(id);
    try {
      inquiryDetails.value[id] = await getInquiry(id);
    } catch {
      // 조회 실패 시 무시
    } finally {
      loadingInquiryIds.value.delete(id);
    }
  }
}

function inquiryStatusLabel(status: string) {
  return status === "ANSWERED" ? "답변완료" : "답변 대기";
}

// ─── 파일 첨부 ───
function triggerFileInput() {
  fileInput.value?.click();
}
function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files) attachedFiles.value.push(...Array.from(target.files));
}
function removeFile(index: number) {
  attachedFiles.value.splice(index, 1);
}

// ─── 1:1 문의 제출 ───
async function submitInquiry() {
  if (!inquiryTitle.value.trim() || !inquiryContent.value.trim()) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }
  isSubmittingInquiry.value = true;
  try {
    await createInquiry(inquiryTitle.value.trim(), inquiryContent.value.trim());
    inquiryTitle.value = "";
    inquiryContent.value = "";
    attachedFiles.value = [];
    myInquiries.value = await getMyInquiries();
    alert("문의가 등록되었습니다.");
  } catch {
    alert("문의 등록에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isSubmittingInquiry.value = false;
  }
}

// 쿼리 파라미터 감지 (onMounted + watch 둘 다)
function applyRouteQuery() {
  if (route.query.tab === "notices") {
    activeTab.value = "notices";
    if (route.query.sub) {
      const sub = route.query.sub as string;
      // sub가 '자주 묻는 질문' 또는 '1:1 문의하기'면 문의사항 카테고리로
      if (sub === "자주 묻는 질문" || sub === "1:1 문의하기") {
        activeNoticeCategory.value = "문의사항";
        activeFaqSubCategory.value = sub;
      } else {
        activeNoticeCategory.value = sub;
      }
    }
  }
}

// ─── 초기 데이터 로드 ───
onMounted(async () => {
  isPostsLoading.value = true;
  isNoticesLoading.value = true;
  isFaqLoading.value = true;
  try {
    const [postsData, noticesData, faqsData] = await Promise.all([
      getPosts(),
      getNotices(),
      getFaqs(),
    ]);
    posts.value = postsData.content;
    notices.value = noticesData;
    faqData.value = faqsData;
  } catch {
    // 네트워크 오류 무시
  } finally {
    isPostsLoading.value = false;
    isNoticesLoading.value = false;
    isFaqLoading.value = false;
  }

  if (auth.isLoggedIn) {
    try {
      myInquiries.value = await getMyInquiries();
    } catch {
      // 로그인 만료 등 무시
    }
  }
});

watch(() => route.query, applyRouteQuery, { immediate: true });
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
      <!-- 탭 바 -->
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
            v-if="isLoggedIn"
            @click="
              router.push(
                activeCategory === '전체'
                  ? '/community/write'
                  : `/community/write?category=${activeCategory}`,
              )
            "
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

      <!-- ─── 공지사항 탭 ─── -->
      <div v-if="activeTab === 'notices'" class="flex gap-8 items-start mt-1">
        <!-- 좌측 메뉴 -->
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

        <!-- 우측 콘텐츠 -->
        <div class="flex-1 min-w-0 flex flex-col">
          <!-- 공지/이벤트 -->
          <template v-if="activeNoticeCategory === '공지/이벤트'">
            <div
              v-if="isNoticesLoading"
              class="text-center py-16 text-gray-400 text-sm font-medium"
            >
              불러오는 중...
            </div>
            <div
              v-else-if="notices.length === 0"
              class="text-center py-16 text-gray-400 text-sm font-medium"
            >
              등록된 공지사항이 없습니다.
            </div>
            <div v-else class="flex flex-col">
              <div
                v-for="(notice, index) in notices"
                :key="notice.id"
                class="border-b"
                :class="{ 'border-t': index === 0 }"
                style="border-color: rgba(178, 228, 220, 0.25)"
              >
                <details
                  class="group"
                  @toggle="onNoticeToggle(notice.id, $event)"
                >
                  <summary
                    class="list-none flex items-center gap-3 py-4 cursor-pointer"
                  >
                    <span
                      class="flex-1 font-semibold text-sm text-gray-800 group-open:text-teal-600 transition-colors"
                      >{{ notice.title }}</span
                    >
                    <span
                      style="font-size: 0.78rem; color: #9ca3af; flex-shrink: 0"
                      >{{ formatDate(notice.createdAt) }}</span
                    >
                    <ChevronDown
                      :size="15"
                      class="transition-transform group-open:rotate-180 flex-shrink-0"
                      color="#9ca3af"
                    />
                  </summary>
                  <div class="px-2 py-3 bg-gray-50/50 rounded-md mb-3">
                    <p
                      v-if="noticeContents[notice.id] === null"
                      class="text-xs text-gray-400"
                    >
                      불러오는 중...
                    </p>
                    <p
                      v-else
                      style="
                        font-size: 0.88rem;
                        color: #374151;
                        line-height: 1.7;
                        white-space: pre-line;
                      "
                    >
                      {{ noticeContents[notice.id] }}
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </template>

          <!-- 문의사항 -->
          <template v-else-if="activeNoticeCategory === '문의사항'">
            <!-- 자주 묻는 질문 -->
            <div
              v-if="activeFaqSubCategory === '자주 묻는 질문'"
              class="flex flex-col gap-3"
            >
              <div
                v-if="isFaqLoading"
                class="text-center py-10 text-gray-400 text-sm"
              >
                불러오는 중...
              </div>
              <template v-else>
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
                <div
                  v-if="faqData.length === 0"
                  class="text-center py-10 text-gray-400 text-sm font-medium"
                >
                  등록된 FAQ가 없습니다.
                </div>
              </template>
            </div>

            <!-- 1:1 문의 -->
            <div v-else class="flex flex-col gap-6">
              <div
                class="bg-white border rounded-md p-5"
                style="border-color: rgba(178, 228, 220, 0.3)"
              >
                <h4 class="text-sm font-bold text-gray-800 mb-3">
                  ✉️ 고객센터 1:1 문의하기
                </h4>
                <div
                  v-if="!isLoggedIn"
                  class="text-center py-6 text-sm text-gray-400 font-medium"
                >
                  1:1 문의는 로그인 후 이용 가능합니다.
                </div>
                <div v-else class="flex flex-col gap-3">
                  <input
                    v-model="inquiryTitle"
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
                    v-model="inquiryContent"
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
                    @click="submitInquiry"
                    :disabled="isSubmittingInquiry"
                    class="w-full py-2.5 rounded-md font-bold text-xs text-white mt-2 transition-opacity"
                    :style="
                      isSubmittingInquiry
                        ? 'background:#9ca3af; cursor:not-allowed;'
                        : 'background:#3db89e;'
                    "
                  >
                    {{ isSubmittingInquiry ? "등록 중..." : "문의 신청하기" }}
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
                  v-if="!isLoggedIn"
                  class="text-center py-10 bg-white rounded border text-xs text-gray-400 font-medium"
                >
                  로그인 후 내 문의 내역을 확인할 수 있습니다.
                </div>
                <div
                  v-else-if="myInquiries.length === 0"
                  class="text-center py-10 bg-white rounded border text-xs text-gray-400 font-medium"
                >
                  작성한 문의 내역이 없습니다.
                </div>
                <div
                  v-for="inq in myInquiries"
                  :key="inq.id"
                  class="bg-white border rounded p-4"
                  style="border-color: rgba(178, 228, 220, 0.25)"
                >
                  <details
                    class="group"
                    @toggle="onInquiryToggle(inq.id, $event)"
                  >
                    <summary
                      class="list-none flex items-center gap-3 cursor-pointer"
                    >
                      <span
                        class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        :style="
                          inq.status === 'ANSWERED'
                            ? 'background:#e8f8f5; color:#3db89e;'
                            : 'background:#f3f4f6; color:#6b8c87;'
                        "
                        >{{ inquiryStatusLabel(inq.status) }}</span
                      >
                      <span
                        class="flex-1 text-xs font-bold text-gray-700 truncate group-open:text-teal-600"
                        >{{ inq.title }}</span
                      >
                      <span class="text-[11px] text-gray-400">{{
                        formatDate(inq.createdAt)
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
                      <div
                        v-if="loadingInquiryIds.has(inq.id)"
                        class="text-center py-3 text-gray-400"
                      >
                        불러오는 중...
                      </div>
                      <template v-else-if="inquiryDetails[inq.id]">
                        <div class="bg-gray-50/50 p-2.5 rounded">
                          <p class="font-semibold text-gray-500 mb-1">
                            질문 내용:
                          </p>
                          <p
                            class="leading-relaxed"
                            style="white-space: pre-line"
                          >
                            {{ inquiryDetails[inq.id].content }}
                          </p>
                        </div>
                        <div
                          v-if="inquiryDetails[inq.id].answer"
                          class="bg-teal-50/30 p-2.5 border border-teal-100/50 rounded"
                        >
                          <p class="font-bold text-teal-600 mb-1">
                            ↳ 서비스 답변:
                          </p>
                          <p
                            class="leading-relaxed text-gray-700"
                            style="white-space: pre-line"
                          >
                            {{ inquiryDetails[inq.id].answer }}
                          </p>
                        </div>
                      </template>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- ─── 커뮤니티 탭 ─── -->
      <div v-else class="flex gap-8 items-start mt-1">
        <!-- 좌측 카테고리 메뉴 -->
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

        <!-- 우측 게시글 목록 -->
        <div class="flex-1 min-w-0 flex flex-col">
          <!-- 카테고리 설명 박스 -->
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

          <!-- 로딩 -->
          <div
            v-if="isPostsLoading"
            class="text-center py-16 text-gray-400 text-sm font-medium"
          >
            불러오는 중...
          </div>

          <!-- 게시글 없음 -->
          <div
            v-else-if="filteredPosts.length === 0"
            class="text-center py-16 text-gray-400 text-sm font-medium"
          >
            {{
              isMyPostsOnly
                ? "내가 작성한 게시글이 없습니다."
                : "게시글이 없습니다. 첫 글을 작성해보세요!"
            }}
          </div>

          <!-- 게시글 목록 -->
          <div
            v-for="post in filteredPosts"
            :key="post.id"
            class="group cursor-pointer pt-4 pb-5 transition-colors border-b flex gap-5 items-start"
            style="border-color: rgba(178, 228, 220, 0.25)"
            @click="router.push(`/community/${post.id}`)"
          >
            <div class="flex-1 min-w-0">
              <!-- 카테고리 + 통계 -->
              <div class="flex items-center gap-2 pb-2">
                <span
                  class="text-[11px] font-bold px-2.5 py-0.5 flex-shrink-0"
                  :style="`background:${categoryStyle[CODE_TO_CATEGORY[post.category] ?? post.category]?.bg ?? '#f3f4f6'}; color:${categoryStyle[CODE_TO_CATEGORY[post.category] ?? post.category]?.color ?? '#374151'}; border: 1px solid ${categoryStyle[CODE_TO_CATEGORY[post.category] ?? post.category]?.border ?? '#e5e7eb'}; font-weight: 700;`"
                >
                  {{ CODE_TO_CATEGORY[post.category] ?? post.category }}
                </span>
                <div
                  class="flex items-center gap-3 ml-auto text-[11px] text-gray-400 font-medium"
                >
                  <span class="flex items-center gap-1"
                    ><Eye :size="11" /> {{ post.viewCount }}</span
                  >
                  <span class="flex items-center gap-1"
                    ><Heart :size="11" /> {{ post.likeCount }}</span
                  >
                  <span class="flex items-center gap-1"
                    ><MessageCircle :size="11" /> {{ post.commentCount }}</span
                  >
                </div>
              </div>

              <!-- 제목 -->
              <p
                class="pb-2.5 text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-2"
              >
                {{ post.title }}
              </p>

              <!-- 작성자 + 날짜 -->
              <div class="flex items-center gap-2">
                <div
                  class="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-[9px]"
                  style="
                    background: linear-gradient(135deg, #b2e4dc, #3db89e);
                    color: #fff;
                  "
                >
                  {{ post.username.charAt(0) }}
                </div>
                <span
                  style="font-size: 0.8rem; font-weight: 600; color: #1a2e2b"
                  >{{ post.username }}</span
                >
                <span
                  class="ml-auto"
                  style="font-size: 0.75rem; color: #9ca3af"
                  >{{ formatDate(post.createdAt) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
details > summary::-webkit-details-marker {
  display: none;
}
</style>
