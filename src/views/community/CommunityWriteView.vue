<script setup lang="ts">
import {
  CATEGORY_TO_CODE,
  CODE_TO_CATEGORY,
  createPost,
  getCommunityErrorMessage,
  getPost,
  updatePost,
  uploadPostImage,
} from "@/api/community";
import type { SavedCourseResponse } from "@/api/courses";
import { getMyCourses } from "@/api/courses";
import {
  Car,
  Clock,
  Coffee,
  Footprints,
  GripVertical,
  Image as ImageIcon,
  MapPin,
  Palmtree,
  Plus,
  Theater,
  Trash2,
  Utensils,
  X,
} from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const editPostId = route.params.id as string | undefined;
const isEditMode = !!editPostId;

// ─── 폼 입력 데이터 ───
const title = ref("");
const categories = ["공유해요", "궁금해요", "함께해요", "자유"];
const selectedCategory = ref(
  categories.includes(route.query.category as string)
    ? (route.query.category as string)
    : "공유해요",
);

// ─── 코스 연결 ───
const isCourseModalOpen = ref(false);
const connectedCourse = ref<SavedCourseResponse | null>(null);
const mySavedCourses = ref<SavedCourseResponse[]>([]);
const isLoadingCourses = ref(false);

// ─── 블록 에디터 ───
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
  name?: string;
}
type EditorBlock = TextBlock | ImageBlock;

const blocks = ref<EditorBlock[]>([
  { id: Date.now(), type: "text", value: "" },
]);

// ─── 드래그 앤 드롭 ───
const dragIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

function onDragStart(index: number) {
  dragIndex.value = index;
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault();
  dragOverIndex.value = index;
}

function onDrop(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) {
    dragIndex.value = null;
    dragOverIndex.value = null;
    return;
  }
  const moved = blocks.value.splice(dragIndex.value, 1)[0];
  blocks.value.splice(index, 0, moved);
  dragIndex.value = null;
  dragOverIndex.value = null;
}

function onDragEnd() {
  dragIndex.value = null;
  dragOverIndex.value = null;
}

// ─── 블록 조작 ───
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
        name: file.name,
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

// ─── 코스 모달 ───
async function openCourseModal() {
  isCourseModalOpen.value = true;
  if (mySavedCourses.value.length === 0 && !isLoadingCourses.value) {
    isLoadingCourses.value = true;
    try {
      mySavedCourses.value = await getMyCourses();
    } catch {
      // 로드 실패 무시
    } finally {
      isLoadingCourses.value = false;
    }
  }
}

function selectCourse(course: SavedCourseResponse) {
  connectedCourse.value = course;
  isCourseModalOpen.value = false;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

// ─── content JSON 파싱 (수정 모드 로드) ───
function parseContentToBlocks(content: string): EditorBlock[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((b: any, i: number) => {
        if (b.type === "image") {
          return {
            id: Date.now() + i,
            type: "image",
            value: b.url ?? "",
            file: null,
            name: b.name ?? "",
          } as ImageBlock;
        }
        return {
          id: Date.now() + i,
          type: "text",
          value: b.value ?? "",
        } as TextBlock;
      });
    }
  } catch {
    // 레거시 데이터 fallback
  }
  return [{ id: Date.now(), type: "text", value: content }];
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
      blocks.value = parseContentToBlocks(post.content);
    } catch {
      alert("게시글을 불러올 수 없습니다.");
      router.back();
    }
  }
});

async function handleRegister() {
  if (!selectedCategory.value) {
    alert("카테고리를 선택해주세요.");
    return;
  }
  if (!title.value.trim()) {
    alert("제목을 입력해주세요.");
    return;
  }
  const hasContent = blocks.value.some((b) =>
    b.type === "text" ? b.value.trim() !== "" : true,
  );
  if (!hasContent) {
    alert("내용을 입력해주세요.");
    return;
  }

  isSubmitting.value = true;
  try {
    // 새 이미지 블록을 서버에 업로드하고 URL로 교체
    for (const block of blocks.value) {
      if (block.type === "image" && (block as ImageBlock).file) {
        const url = await uploadPostImage((block as ImageBlock).file!);
        block.value = url;
        (block as ImageBlock).file = null;
      }
    }

    // 블록 배열을 JSON으로 직렬화
    const serializedBlocks = blocks.value
      .filter(
        (b) =>
          b.type === "image" ||
          (b.type === "text" && (b as TextBlock).value.trim()),
      )
      .map((b) => {
        if (b.type === "image") {
          return {
            type: "image",
            url: b.value,
            name: (b as ImageBlock).name ?? "",
          };
        }
        return { type: "text", value: (b as TextBlock).value.trim() };
      });
    const content = JSON.stringify(serializedBlocks);

    const apiCategory = CATEGORY_TO_CODE[selectedCategory.value];
    if (!apiCategory) {
      alert("카테고리를 다시 선택해주세요.");
      return;
    }

    if (isEditMode && editPostId) {
      await updatePost(editPostId, title.value.trim(), content, apiCategory);
      router.replace(`/community/${editPostId}`);
    } else {
      const newPost = await createPost(
        apiCategory,
        title.value.trim(),
        content,
      );
      router.replace(newPost?.id ? `/community/${newPost.id}` : "/community");
    }
  } catch (error) {
    const fallbackMessage = isEditMode
      ? "게시글 수정에 실패했습니다. 다시 시도해주세요."
      : "게시글 등록에 실패했습니다. 다시 시도해주세요.";
    alert(getCommunityErrorMessage(error, fallbackMessage));
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
      <!-- 상단 내비게이션 (화살표 제거) -->
      <button
        @click="handleCancel"
        class="flex items-center gap-2 mb-5 transition-opacity hover:opacity-70 bg-transparent border-none cursor-pointer"
        style="color: #6b8c87; font-size: 0.88rem; font-weight: 600"
      >
        목록으로
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

        <!-- 저장된 코스 연결 -->
        <div class="mb-6">
          <!-- 코스 미연결 -->
          <button
            v-if="!connectedCourse"
            type="button"
            @click="openCourseModal"
            class="flex items-center justify-between w-full py-3 px-4 rounded-sm font-bold text-sm transition-all bg-teal-50/40 hover:bg-teal-50 text-teal-700 border text-left cursor-pointer"
            style="border-color: rgba(178, 228, 220, 0.5)"
          >
            <span class="flex items-center gap-2">📍 저장한 코스 연결하기</span>
            <span class="text-xs text-teal-500 font-bold">선택하기 &gt;</span>
          </button>

          <!-- 코스 연결됨 -->
          <div
            v-else
            @click="openCourseModal"
            class="group relative w-full p-4 rounded-sm bg-teal-50/20 hover:bg-teal-50/40 transition-all border flex flex-col gap-2.5 cursor-pointer"
            style="border-color: rgba(178, 228, 220, 0.6)"
          >
            <button
              type="button"
              @click.stop="connectedCourse = null"
              class="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Trash2 :size="16" />
            </button>

            <div class="flex items-center justify-between">
              <div
                class="flex items-center gap-2 text-xs font-bold text-gray-500"
              >
                <span class="flex items-center gap-1 text-teal-600">
                  <component
                    :is="
                      connectedCourse.travelMode === 'WALK' ? Footprints : Car
                    "
                    :size="14"
                  />
                  {{ connectedCourse.travelMode === "WALK" ? "도보" : "택시" }}
                </span>
                <span class="text-gray-300 font-normal">|</span>
                <span class="flex items-center gap-1">
                  <Clock :size="13" />
                  {{ formatDuration(connectedCourse.durationMinutes) }} 소요
                </span>
              </div>
              <span
                class="text-xs font-bold text-teal-600 group-hover:underline mr-6"
                >수정</span
              >
            </div>

            <div class="flex flex-wrap items-center gap-1.5">
              <MapPin :size="14" class="text-teal-500 flex-shrink-0 mr-0.5" />
              <template v-for="(place, i) in connectedCourse.places" :key="i">
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
                  v-if="i < connectedCourse.places.length - 1"
                  class="text-[10px] text-gray-300 font-normal mx-0.5"
                  >➔</span
                >
              </template>
            </div>
          </div>
        </div>

        <!-- 에디터 영역 -->
        <div class="flex flex-col gap-3 min-h-[350px]">
          <div
            v-for="(block, idx) in blocks"
            :key="block.id"
            class="group relative border border-transparent hover:border-gray-100 rounded-sm transition-all p-3 pl-8"
            :class="{
              'opacity-40': dragIndex === idx,
              'border-teal-200 bg-teal-50/10':
                dragOverIndex === idx && dragIndex !== idx,
            }"
            @dragover="onDragOver($event, idx)"
            @drop="onDrop(idx)"
            @dragleave="dragOverIndex = null"
          >
            <!-- 드래그 핸들 -->
            <div
              class="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
              :class="{ 'cursor-grabbing': dragIndex === idx }"
              draggable="true"
              @dragstart="onDragStart(idx)"
              @dragend="onDragEnd"
            >
              <GripVertical :size="16" class="text-gray-300" />
            </div>

            <!-- 삭제 버튼 -->
            <div
              class="absolute right-2 top-2 hidden group-hover:flex items-center bg-white border rounded-md p-1 shadow-sm z-10"
            >
              <button
                v-if="blocks.length > 1"
                type="button"
                @click="deleteBlock(idx)"
                class="p-1 hover:bg-red-50 text-red-400 rounded cursor-pointer"
              >
                <Trash2 :size="14" />
              </button>
              <span v-else class="p-1 text-gray-200 cursor-not-allowed">
                <Trash2 :size="14" />
              </span>
            </div>

            <!-- 텍스트 블록 -->
            <div v-if="block.type === 'text'">
              <textarea
                v-model="block.value"
                rows="2"
                placeholder="내용을 작성하세요. 사진 추가하기 버튼을 누르면 중간에 사진을 삽입할 수 있습니다."
                class="w-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none leading-relaxed"
                style="font-family: inherit"
              ></textarea>
            </div>

            <!-- 이미지 블록 -->
            <div
              v-else-if="block.type === 'image'"
              class="rounded-sm overflow-hidden bg-gray-50/50 border flex items-center justify-center p-1 max-h-[400px]"
            >
              <img
                :src="block.value"
                class="w-full h-full object-contain max-h-[380px] rounded-sm"
              />
            </div>

            <!-- 블록 추가 버튼 (하단) -->
            <div
              class="absolute left-1/2 -bottom-3 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20"
            >
              <button
                type="button"
                @click="addTextBlock(idx)"
                class="flex items-center gap-1 text-[10px] font-bold bg-white border border-teal-200 px-2.5 py-0.5 rounded-full shadow-sm text-gray-600 hover:text-teal-600 cursor-pointer"
              >
                <Plus :size="11" /> 글 추가하기
              </button>
              <button
                type="button"
                @click="triggerImageBlock(idx)"
                class="flex items-center gap-1 text-[10px] font-bold bg-white border border-teal-200 px-2.5 py-0.5 rounded-full shadow-sm text-gray-600 hover:text-teal-600 cursor-pointer"
              >
                <ImageIcon :size="11" /> 사진 추가하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 액션 바 -->
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

    <!-- 코스 선택 모달 -->
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
            class="p-1 hover:bg-gray-100 rounded-sm text-gray-400 hover:text-gray-600 bg-transparent cursor-pointer"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- 로딩 -->
        <div
          v-if="isLoadingCourses"
          class="text-center py-10 text-gray-400 text-sm"
        >
          불러오는 중...
        </div>

        <!-- 코스 없음 -->
        <div
          v-else-if="mySavedCourses.length === 0"
          class="text-center py-10 text-gray-400 text-sm font-medium"
        >
          저장된 코스가 없습니다.
        </div>

        <!-- 코스 목록 -->
        <div v-else class="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
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
                  <component
                    :is="course.travelMode === 'WALK' ? Footprints : Car"
                    :size="14"
                  />
                  {{ course.travelMode === "WALK" ? "도보" : "택시" }}
                </span>
                <span class="text-gray-300 font-normal">|</span>
                <span class="flex items-center gap-1">
                  <Clock :size="13" />
                  {{ formatDuration(course.durationMinutes) }} 소요
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-1.5 mt-1">
                <MapPin :size="14" class="text-teal-500 flex-shrink-0 mr-0.5" />
                <template v-for="(place, pIdx) in course.places" :key="pIdx">
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
                    v-if="pIdx < course.places.length - 1"
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
