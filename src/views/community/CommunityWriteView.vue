<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  createPost,
  getPost,
  updatePost,
  CATEGORY_TO_CODE,
  CODE_TO_CATEGORY,
} from "@/api/community";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Footprints,
  Car,
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Train,
  Utensils,
  Coffee,
  Palmtree,
  Theater,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const editPostId = route.params.id as string | undefined;
const isEditMode = !!editPostId;

// ─── [폼 입력 데이터 상태] ───
const title = ref("");
const categories = ["공유해요", "궁금해요", "함께해요", "자유"];
const selectedCategory = ref(
  categories.includes(route.query.category as string)
    ? (route.query.category as string)
    : "공유해요",
);

// 팝업 모달 제어 상태
const isCourseModalOpen = ref(false);
// 기존: const connectedCourse = ref<any>(null);
// 변경:
const connectedCourse = ref<{
  station: string;
  duration: string;
  items: { name: string; category: string; transport: string; time: string }[];
} | null>(null);

// 저장한 코스 목록 데이터
const mySavedCourses = ref([
  {
    id: 101,
    station: "대전역",
    duration: "3시간 30분",
    items: [
      { name: "성심당 본점", category: "음식", transport: "도보", time: "5분" },
      { name: "테미오래", category: "문화", transport: "택시", time: "10분" },
      { name: "한밭수목원", category: "자연", transport: "도보", time: "15분" },
    ],
  },
  {
    id: 102,
    station: "서대전역",
    duration: "2시간",
    items: [
      {
        name: "오정동 칼국수",
        category: "음식",
        transport: "도보",
        time: "10분",
      },
      {
        name: "예쁜 개인카페",
        category: "카페",
        transport: "도보",
        time: "5분",
      },
    ],
  },
  {
    id: 103,
    station: "대전역",
    duration: "1시간 30분",
    items: [
      {
        name: "소제동 카페거리",
        category: "카페",
        transport: "도보",
        time: "7분",
      },
    ],
  },
]);

// ─── [블록 에디터 구조] ───
interface TextBlock {
  id: number;
  type: "text";
  value: string;
}
interface ImageBlock {
  id: number;
  type: "image";
  value: string;
  file: File | null;
}
type EditorBlock = TextBlock | ImageBlock;

const blocks = ref<EditorBlock[]>([
  { id: Date.now(), type: "text", value: "" },
]);

function addTextBlock(index: number) {
  blocks.value.splice(index + 1, 0, {
    id: Date.now(),
    type: "text",
    value: "",
  });
}

function triggerImageBlock(index: number) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const url = URL.createObjectURL(file);
      blocks.value.splice(index + 1, 0, {
        id: Date.now(),
        type: "image",
        value: url,
        file: file,
      });
    }
  };
  input.click();
}

function deleteBlock(index: number) {
  if (blocks.value.length === 1) {
    if (blocks.value[0].type === "text") blocks.value[0].value = "";
    return;
  }
  blocks.value.splice(index, 1);
}

function moveBlock(index: number, direction: "up" | "down") {
  if (direction === "up" && index === 0) return;
  if (direction === "down" && index === blocks.value.length - 1) return;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const temp = blocks.value[index];
  blocks.value[index] = blocks.value[targetIndex];
  blocks.value[targetIndex] = temp;
}

function selectCourse(course: any) {
  connectedCourse.value = course;
  isCourseModalOpen.value = false;
}

const isSubmitting = ref(false);

function handleCancel() {
  if (confirm("내용이 전부 삭제됩니다. 정말 취소하고 목록으로 가시겠습니까?")) {
    router.back();
  }
}

onMounted(async () => {
  if (isEditMode && editPostId) {
    try {
      const post = await getPost(editPostId);
      title.value = post.title;
      selectedCategory.value = CODE_TO_CATEGORY[post.category] ?? "공유해요";
      blocks.value = [{ id: Date.now(), type: "text", value: post.content }];
    } catch {
      alert("게시글을 불러올 수 없습니다.");
      router.back();
    }
  }
});

async function handleRegister() {
  const textContent = blocks.value
    .filter((b) => b.type === "text" && b.value.trim())
    .map((b) => b.value.trim())
    .join("\n\n");

  const hasAnyContent = blocks.value.some((b) =>
    b.type === "text" ? b.value.trim() !== "" : b.value !== "",
  );

  if (!selectedCategory.value) {
    alert("카테고리를 선택해주세요.");
    return;
  }
  if (!title.value.trim()) {
    alert("제목을 입력해주세요.");
    return;
  }
  if (!hasAnyContent) {
    alert("내용을 입력해주세요.");
    return;
  }
  if (!textContent) {
    alert("텍스트 내용을 입력해주세요.");
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode && editPostId) {
      const apiCategory = CATEGORY_TO_CODE[selectedCategory.value];
      await updatePost(
        editPostId,
        title.value.trim(),
        textContent,
        apiCategory,
      );
      router.replace(`/community/${editPostId}`);
    } else {
      const apiCategory = CATEGORY_TO_CODE[selectedCategory.value];
      const newPost = await createPost(
        apiCategory,
        title.value.trim(),
        textContent,
      );
      router.replace(newPost?.id ? `/community/${newPost.id}` : "/community");
    }
  } catch {
    alert(
      isEditMode
        ? "게시글 수정에 실패했습니다. 다시 시도해주세요."
        : "게시글 등록에 실패했습니다. 다시 시도해주세요.",
    );
  } finally {
    isSubmitting.value = false;
  }
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
      min-height: calc(100vh - 64px);
    "
  >
    <div class="max-w-3xl mx-auto px-4 py-6">
      <!-- 상단 내비게이션 -->
      <button
        @click="handleCancel"
        class="flex items-center gap-2 mb-5 transition-opacity hover:opacity-70 bg-transparent border-none cursor-pointer"
        style="color: #6b8c87; font-size: 0.88rem; font-weight: 600"
      >
        <ArrowLeft :size="17" /> 커뮤니티 목록으로 돌아가기
      </button>

      <!-- 본문 박스 -->
      <div
        class="bg-white rounded-2xl p-8"
        style="box-shadow: 0 10px 30px rgba(26, 46, 43, 0.04)"
      >
        <!-- 페이지 제목 -->
        <h2 class="text-lg font-extrabold mb-5" style="color: #1a2e2b">
          {{ isEditMode ? "게시글 수정" : "게시글 작성" }}
        </h2>

        <!-- 카테고리 칩 -->
        <div class="flex gap-2 mb-5">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-4 py-1.5 rounded-sm text-xs font-bold transition-all border cursor-pointer"
            :style="
              selectedCategory === cat
                ? 'background:#3db89e; color:#fff; border-color:#3db89e;'
                : 'background:#fff; color:#9ca3af; border-color:#e5e7eb;'
            "
          >
            {{ cat }}
          </button>
        </div>

        <!-- 제목 입력 -->
        <input
          v-model="title"
          placeholder="제목을 입력하세요"
          class="w-full pb-4 mb-6 font-extrabold text-2xl border-b outline-none"
          style="border-color: rgba(178, 228, 220, 0.4); color: #1a2e2b"
        />

        <!-- 수정된 코스 연결 박스 전체 -->
        <div class="mb-6">
          <!-- 상황 1: 코스가 연결되지 않았을 때 -->
          <button
            v-if="!connectedCourse"
            type="button"
            @click="isCourseModalOpen = true"
            class="flex items-center justify-between w-full py-3 px-4 rounded-sm font-bold text-sm transition-all bg-teal-50/40 hover:bg-teal-50 text-teal-700 border text-left cursor-pointer"
            style="border-color: rgba(178, 228, 220, 0.5)"
          >
            <span class="flex items-center gap-2">📍 저장한 코스 연결하기</span>
            <span class="text-xs text-teal-500 font-bold">선택하기 &gt;</span>
          </button>

          <!-- 상황 2: 코스가 연결되었을 때 (삭제 버튼 추가 완료) -->
          <div
            v-else
            @click="isCourseModalOpen = true"
            class="group relative w-full p-4 rounded-sm bg-teal-50/20 hover:bg-teal-50/40 transition-all border flex flex-col gap-2.5 cursor-pointer"
            style="border-color: rgba(178, 228, 220, 0.6)"
          >
            <!-- 🌟 추가된 삭제 버튼 (클릭 시 connectedCourse를 null로 만듭니다) -->
            <button
              type="button"
              @click.stop="connectedCourse = null"
              class="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 :size="16" />
            </button>

            <!-- 칸 내부 상단 정보 바 -->
            <div class="flex items-center justify-between">
              <div
                class="flex items-center gap-2 text-xs font-bold text-gray-500"
              >
                <span class="flex items-center gap-1 text-teal-600">
                  <Train :size="14" /> {{ connectedCourse.station }}
                </span>
                <span class="text-gray-300 font-normal">|</span>
                <span class="flex items-center gap-1">
                  <Clock :size="13" /> {{ connectedCourse.duration }} 소요
                </span>
              </div>
              <!-- 우측 텍스트 -->
              <span
                class="text-xs font-bold text-teal-600 group-hover:underline mr-6"
                >수정</span
              >
            </div>

            <!-- 칸 내부 하단 경로 텍스트 정보 -->
            <div class="flex flex-wrap items-center gap-1.5">
              <MapPin :size="14" class="text-teal-500 flex-shrink-0 mr-0.5" />
              <template v-for="(place, i) in connectedCourse.items" :key="i">
                <div class="flex items-center gap-1">
                  <component
                    v-if="categoryMeta[place.category]"
                    :is="categoryMeta[place.category].icon"
                    :size="13"
                    :style="`color: ${categoryMeta[place.category].color}`"
                  />
                  <span class="text-xs font-bold text-gray-800">{{
                    place.name
                  }}</span>
                </div>
                <span
                  v-if="connectedCourse && i < connectedCourse.items.length - 1"
                  class="text-[10px] text-gray-300 font-normal mx-0.5"
                >
                  ➔
                </span>
              </template>
            </div>
          </div>
        </div>

        <!-- 에디터 영역 -->
        <div class="flex flex-col gap-3 min-h-[350px]">
          <div
            v-for="(block, idx) in blocks"
            :key="block.id"
            class="group relative border border-transparent hover:border-gray-100 rounded-sm transition-all p-3"
          >
            <div
              class="absolute right-2 top-2 hidden group-hover:flex items-center gap-0.5 bg-white border rounded-md p-1 shadow-sm z-10"
            >
              <button
                type="button"
                @click="moveBlock(idx, 'up')"
                class="p-1 hover:bg-gray-50 rounded text-gray-400 hover:text-gray-700"
              >
                <ArrowUp :size="14" />
              </button>
              <button
                type="button"
                @click="moveBlock(idx, 'down')"
                class="p-1 hover:bg-gray-50 rounded text-gray-400 hover:text-gray-700"
              >
                <ArrowDown :size="14" />
              </button>
              <button
                v-if="blocks.length > 1"
                type="button"
                @click="deleteBlock(idx)"
                class="p-1 hover:bg-red-50 text-red-400 rounded"
              >
                <Trash2 :size="14" />
              </button>
              <span v-else class="p-1 text-gray-200 cursor-not-allowed">
                <Trash2 :size="14" />
              </span>
            </div>

            <div v-if="block.type === 'text'">
              <textarea
                v-model="block.value"
                rows="2"
                placeholder="내용을 작성하세요. 사진 추가하기 버튼을 누르면 중간에 사진을 삽입할 수 있습니다."
                class="w-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none leading-relaxed"
                style="font-family: inherit"
              ></textarea>
            </div>

            <div
              v-else-if="block.type === 'image'"
              class="rounded-sm overflow-hidden bg-gray-50/50 border flex items-center justify-center p-1 max-h-[400px]"
            >
              <img
                :src="block.value"
                class="w-full h-full object-contain max-h-[380px] rounded-sm"
              />
            </div>

            <div
              class="absolute left-1/2 -bottom-3 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20"
            >
              <button
                type="button"
                @click="addTextBlock(idx)"
                class="flex items-center gap-1 text-[10px] font-bold bg-white border border-teal-200 px-2.5 py-0.5 rounded-full shadow-sm text-gray-600 hover:text-teal-600"
              >
                <Plus :size="11" /> 글 추가하기
              </button>
              <button
                type="button"
                @click="triggerImageBlock(idx)"
                class="flex items-center gap-1 text-[10px] font-bold bg-white border border-teal-200 px-2.5 py-0.5 rounded-full shadow-sm text-gray-600 hover:text-teal-600"
              >
                <ImageIcon :size="11" /> 사진 추가하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 메인 액션 바 -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          type="button"
          @click="handleCancel"
          class="px-6 py-2.5 rounded-sm text-sm font-bold bg-white border border-gray-300 text-gray-500 transition-colors cursor-pointer hover:border-red-500 hover:text-red-500"
        >
          작성 취소
        </button>
        <button
          type="button"
          @click="handleRegister"
          :disabled="isSubmitting"
          class="px-6 py-2.5 rounded-sm text-sm font-bold text-white transition-all shadow-sm"
          :style="
            isSubmitting
              ? 'background:#9ca3af; cursor:not-allowed;'
              : 'background: linear-gradient(135deg, #b2e4dc, #3db89e); cursor:pointer;'
          "
        >
          {{
            isSubmitting
              ? isEditMode
                ? "수정 중..."
                : "등록 중..."
              : isEditMode
                ? "수정 완료"
                : "게시글 등록"
          }}
        </button>
      </div>
    </div>

    <!-- [모달 팝업] 1열 리스트 + 기차 아이콘 + 위치핀 + 카테고리별 인라인 아이콘 매핑 -->
    <div
      v-if="isCourseModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white w-full max-w-2xl rounded-sm p-6 shadow-2xl flex flex-col max-h-[80vh]"
      >
        <!-- 모달 헤더 -->
        <div class="flex items-center justify-between pb-4 border-b mb-4">
          <div>
            <h3 class="text-base font-extrabold text-gray-800">
              📋 저장한 코스 연결하기
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              글에 연결할 나만의 이동 코스를 선택해 주세요.
            </p>
          </div>
          <button
            @click="isCourseModalOpen = false"
            class="p-1 hover:bg-gray-100 rounded-sm text-gray-400 hover:text-gray-600 bg-transparent"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- 모달 리스트 영역 -->
        <div class="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          <div
            v-for="course in mySavedCourses"
            :key="course.id"
            @click="selectCourse(course)"
            class="p-4 rounded-sm cursor-pointer bg-gray-50/70 hover:bg-teal-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="flex flex-col gap-2">
              <div
                class="flex items-center gap-2 text-xs font-bold text-gray-500"
              >
                <span class="flex items-center gap-1 text-teal-600">
                  <Train :size="14" /> {{ course.station }}
                </span>
                <span class="text-gray-300 font-normal">|</span>
                <span class="flex items-center gap-1">
                  <Clock :size="13" /> {{ course.duration }} 소요
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-1.5 mt-1">
                <MapPin :size="14" class="text-teal-500 flex-shrink-0 mr-0.5" />

                <template v-for="(place, pIdx) in course.items" :key="pIdx">
                  <div class="flex items-center gap-1">
                    <component
                      v-if="categoryMeta[place.category]"
                      :is="categoryMeta[place.category].icon"
                      :size="13"
                      :style="`color: ${categoryMeta[place.category].color}`"
                    />
                    <span class="text-xs font-bold text-gray-800">{{
                      place.name
                    }}</span>
                  </div>
                  <span
                    v-if="pIdx < course.items.length - 1"
                    class="text-[10px] text-gray-300 font-normal mx-0.5"
                    >➔</span
                  >
                </template>
              </div>
            </div>

            <div class="text-right flex-shrink-0">
              <span class="text-xs font-bold text-teal-600">코스 선택 ➔</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea:focus,
input:focus {
  outline: none;
}
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(178, 228, 220, 0.4);
  border-radius: 2px;
}
</style>
