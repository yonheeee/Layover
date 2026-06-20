<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
import {
  MapPin,
  Clock,
  ChevronRight,
  Edit2,
  Check,
  X,
  Plus,
  Search,
  Footprints,
  Car,
  Share2,
  ExternalLink,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-vue-next";
import type { Course, CourseStop } from "@/types/course";
import { searchPlaces } from "@/api/courses";
import { useCourseStore } from "@/stores/course";

const courseStore = useCourseStore();

const courses = ref<Course[]>([]);

onMounted(async () => {
  courses.value = courseStore.generatedCourses;
  allMockSearch.value = await searchPlaces("");
  searchResults.value = allMockSearch.value;
});

// 현재 선택된 코스 탭 인덱스
const activeTab = ref(0);
// 현재 활성화된 코스 객체 (Computed로 바인딩하여 탭 전환 시 자동 변경)
const currentCourse = computed(() => courses.value[activeTab.value]);

// 상단 요약 정보
const totalTime = computed(() => currentCourse.value.totalTime);
const estimatedCost = computed(() => currentCourse.value.estimatedCost);
// 현재 코스의 장소 리스트 단축 바인딩
const currentPlaces = computed(() => currentCourse.value.places);

// 상태 플래그들
const isEditing = ref(false);
const isSaving = ref(false);
const isRegenerating = ref(false); // AI 재추천 로딩 상태
const showAddModal = ref(false);
const searchKeyword = ref("");

const allMockSearch = ref<Omit<CourseStop, "stayTime" | "isLocked">[]>([]);
const searchResults = ref<Omit<CourseStop, "stayTime" | "isLocked">[]>([]);

// 자물쇠 고정 토글 함수
function toggleLock(idx: number) {
  currentPlaces.value[idx].isLocked = !currentPlaces.value[idx].isLocked;
}

// 고정된 장소 유지하고 AI 재추천 시뮬레이션
async function handleAiRegenerate() {
  isRegenerating.value = true;

  // 프론트엔드 모킹: 1.2초 대기 후 자물쇠가 풀려있는(isLocked === false) 장소만 새로운 장소로 교체함
  await new Promise((r) => setTimeout(r, 1200));

  currentCourse.value.places = currentPlaces.value.map((place) => {
    if (place.isLocked) return place; // 잠긴 장소는 그대로 유지

    // 풀려있는 장소는 모킹 데이터에서 무작위로 하나 매핑 (실제로는 백엔드 AI 결과가 올 자리)
    const randomSeed =
      allMockSearch.value[Math.floor(Math.random() * allMockSearch.value.length)];
    return {
      ...randomSeed,
      stayTime: "45분",
      isLocked: false,
      transport: "taxi",
      transportTime: "8분",
      taxiFare: "4,000원",
    } as CourseStop;
  });

  isRegenerating.value = false;
}

// 장소 편집 기능들
function openAddModal() {
  searchKeyword.value = "";
  searchResults.value = allMockSearch.value;
  showAddModal.value = true;
}

function handleSearch() {
  searchResults.value = allMockSearch.value.filter(
    (p) => p.name.includes(searchKeyword.value) || searchKeyword.value === "",
  );
}

function addPlace(scanned: any) {
  currentPlaces.value.push({
    ...scanned,
    stayTime: "30분",
    isLocked: false,
    transport: "walk",
    transportTime: "5분",
  });
  showAddModal.value = false;
}

function removePlace(idx: number) {
  currentPlaces.value.splice(idx, 1);
}

async function finishEdit() {
  isSaving.value = true;
  await new Promise((r) => setTimeout(r, 800));
  isSaving.value = false;
  isEditing.value = false;
}

// 코스 확정 모달 및 토스트
const showConfirmModal = ref(false);
const showShareToast = ref(false);

function confirmCourse() {
  courseStore.setConfirmed();
  showConfirmModal.value = false;
  router.push("/stamp-tour");
}
</script>

<template>
  <div
    class="w-full h-[calc(100vh-64px)] flex overflow-hidden font-sans bg-[#fbfefe]"
  >
    <div
      class="w-[440px] h-full flex flex-col shrink-0 bg-white border-r border-teal-100/60 shadow-xl z-10 relative"
    >
      <div class="p-6 pb-4 border-b border-gray-50">
        <p class="text-xs text-teal-500 font-bold tracking-wide uppercase mb-1">
          AI 레이오버 추천 결과
        </p>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-extrabold text-[#1a2e2b] tracking-tight">
            나의 대전 환승 코스
          </h1>
          <button
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
            :style="{
              background: isEditing
                ? 'linear-gradient(135deg, #B2E4DC, #3db89e)'
                : '#E8F8F5',
              color: isEditing ? '#fff' : '#3db89e',
            }"
            :disabled="isSaving"
            @click="isEditing ? finishEdit() : (isEditing = true)"
          >
            <span v-if="isSaving">저장 중...</span>
            <template v-else>
              <Check v-if="isEditing" :size="13" />
              <Edit2 v-else :size="13" />
              {{ isEditing ? "완료" : "코스 편집" }}
            </template>
          </button>
        </div>

        <div
          class="flex gap-1.5 mt-4 bg-gray-50 p-1 rounded-xl border border-gray-100"
        >
          <button
            v-for="(course, idx) in courses"
            :key="course.id"
            @click="activeTab = idx"
            class="flex-1 py-2 text-center rounded-lg transition-all text-xs font-bold"
            :class="
              activeTab === idx
                ? 'bg-white text-teal-600 shadow-sm border border-teal-100/50'
                : 'text-gray-400 hover:text-gray-600'
            "
            :disabled="isEditing"
          >
            <div>{{ course.title }}</div>
            <div
              class="text-[0.65rem] opacity-80 font-normal mt-0.5 line-clamp-1"
            >
              {{ course.subTitle }}
            </div>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin">
        <div
          class="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-teal-50/40 border border-teal-100/40"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"
            >
              <Clock :size="14" class="text-teal-500" />
            </div>
            <div>
              <p class="text-[0.65rem] text-gray-400 font-medium">
                총 소요 시간
              </p>
              <p class="text-sm font-bold text-[#1a2e2b]">{{ totalTime }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"
            >
              <span class="text-xs">💰</span>
            </div>
            <div>
              <p class="text-[0.65rem] text-gray-400 font-medium">예상 비용</p>
              <p class="text-sm font-bold text-[#1a2e2b]">
                {{ estimatedCost }}
              </p>
            </div>
          </div>
        </div>

        <div class="relative pl-1 space-y-1">
          <div
            v-if="isRegenerating"
            class="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2 rounded-2xl"
          >
            <RefreshCw :size="24" class="text-teal-500 animate-spin" />
            <p class="text-xs font-semibold text-teal-600">
              AI가 코스를 최적화하는 중...
            </p>
          </div>

          <template v-for="(place, idx) in currentPlaces" :key="place.id">
            <div
              class="relative flex items-center gap-3.5 py-3.5 px-4 rounded-2xl transition-all border group"
              :style="{
                background: place.isLocked && isEditing ? '#f3fbf9' : '#ffffff',
                borderColor:
                  place.isLocked && isEditing
                    ? 'rgba(61, 184, 158, 0.4)'
                    : 'rgba(178, 228, 220, 0.25)',
              }"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-extrabold text-white shrink-0 shadow-sm"
                style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
              >
                {{ idx + 1 }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <p
                    class="font-extrabold text-sm text-[#1a2e2b] truncate group-hover:text-teal-600 transition-colors"
                  >
                    {{ place.name }}
                  </p>
                  <span class="text-[0.7rem] text-gray-400 font-medium shrink-0"
                    >⏱ {{ place.stayTime }} 체류</span
                  >
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span
                    class="px-2 py-0.5 rounded-full text-[0.65rem] bg-gray-50 border border-gray-100 text-gray-500 font-medium"
                    >{{ place.category }}</span
                  >
                  <span
                    v-if="place.waitingTime"
                    class="px-2 py-0.5 rounded-full text-[0.65rem] bg-amber-50 text-amber-700 border border-amber-100 font-bold"
                    >⏳ 대기 {{ place.waitingTime }}</span
                  >
                </div>
              </div>

              <button
                v-if="isEditing"
                class="p-2 rounded-xl transition-all shrink-0 border"
                :class="
                  place.isLocked
                    ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600'
                "
                @click="toggleLock(idx)"
                title="이 장소를 고정하고 다른 곳만 재추천받기"
              >
                <Lock v-if="place.isLocked" :size="13" />
                <Unlock v-else :size="13" />
              </button>

              <button
                v-if="isEditing"
                class="w-7 h-7 rounded-full flex items-center justify-center transition-all bg-red-50 text-red-500 hover:scale-105 shrink-0"
                @click="removePlace(idx)"
              >
                <X :size="13" />
              </button>
            </div>

            <div
              v-if="idx < currentPlaces.length - 1"
              class="flex items-center gap-2 py-1.5 pl-[11px]"
            >
              <div class="w-[2px] h-6 rounded bg-teal-100/60" />
              <div
                class="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4fbf9] border border-teal-100/40 shadow-2xs"
              >
                <Footprints
                  v-if="place.transport === 'walk'"
                  :size="11"
                  class="text-teal-500"
                />
                <Car v-else :size="11" class="text-teal-500" />

                <span class="text-[0.7rem] text-gray-500 font-semibold">
                  {{ place.transport === "walk" ? "도보" : "택시" }}
                  {{ place.transportTime }}
                  <span v-if="place.taxiFare" class="text-teal-600 ml-1"
                    >({{ place.taxiFare }})</span
                  >
                </span>
              </div>
            </div>
          </template>

          <button
            v-if="isEditing"
            class="w-full py-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-teal-50/30 mt-3 border-2 border-dashed border-teal-200/60 text-teal-600 font-bold text-xs"
            @click="openAddModal"
          >
            <Plus :size="14" /> 장소 추가하기
          </button>
        </div>

        <div
          v-if="isEditing"
          class="p-4 rounded-2xl bg-gradient-to-br from-[#E8F8F5] to-white border border-teal-100/70 shadow-2xs text-center space-y-2"
        >
          <p class="text-xs text-[#1a2e2b] font-medium leading-relaxed">
            마음에 드는 장소는
            <span class="font-bold text-teal-600"
              ><Lock :size="11" class="inline" /> 자물쇠</span
            >로 잠그고,<br />
            나머지 장소만 AI에게 새로 추천받아 보세요!
          </p>
          <button
            @click="handleAiRegenerate"
            class="w-full py-2 bg-white hover:bg-teal-50/50 text-teal-600 border border-teal-200 rounded-xl font-bold text-xs shadow-3xs flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw :size="12" /> 고정 장소 유지 후 AI 재추천
          </button>
        </div>
      </div>

      <div class="p-6 border-t border-gray-100 bg-white flex gap-3 shadow-2xl">
        <button
          class="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all bg-[#E8F8F5] text-teal-600 hover:opacity-90"
        >
          <Share2 :size="14" /> 코스 공유
        </button>
        <button
          class="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-1 font-extrabold text-xs text-white transition-all shadow-md hover:opacity-95"
          style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
          @click="showConfirmModal = true"
        >
          코스 최종 확정하기 <ChevronRight :size="14" />
        </button>
      </div>
    </div>

    <div class="flex-1 h-full relative bg-[#e5e9f0]">
      <div id="map" class="w-full h-full flex items-center justify-center">
        <div
          class="text-center bg-white/90 backdrop-blur-md px-8 py-6 rounded-3xl border border-teal-100 shadow-xl max-w-sm"
        >
          <div
            class="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3"
          >
            <MapPin :size="24" class="text-teal-500 animate-bounce" />
          </div>
          <h3 class="text-sm font-extrabold text-[#1a2e2b] mb-1">
            Kakao Map API 연동 스팟
          </h3>
          <p class="text-xs text-gray-400 font-medium leading-relaxed">
            현재 탭 코스 <strong>"{{ currentCourse.subTitle }}"</strong>에 속한
            총 {{ currentPlaces.length }}개의 핀을 잇는 최적 동선
            폴리라인(Polyline)이 렌더링될 구역입니다.
          </p>
        </div>
      </div>

      <div
        class="absolute top-5 right-5 z-20 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-teal-50 flex items-center gap-3"
      >
        <div class="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <p class="text-xs text-gray-600 font-semibold">
          현재 기차 환승 대기 스케줄에 실시간 동기화 완료
        </p>
      </div>
    </div>

    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs"
      @click.self="showAddModal = false"
    >
      <div
        class="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-teal-50"
      >
        <div
          class="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-[#E8F8F5] to-white border-b border-teal-100/30"
        >
          <span class="font-extrabold text-sm text-[#1a2e2b]"
            >새로운 경유지 추가</span
          >
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="showAddModal = false"
          >
            <X :size="16" />
          </button>
        </div>
        <div class="p-5">
          <div class="relative mb-4">
            <Search
              :size="14"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-300"
            />
            <input
              v-model="searchKeyword"
              class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-teal-100 text-xs text-[#1a2e2b] outline-none bg-teal-50/30 focus:bg-white focus:border-teal-400 transition-all"
              placeholder="추가하고 싶은 대전 명소를 검색하세요"
              @input="handleSearch"
            />
          </div>
          <div class="overflow-y-auto max-h-[240px] space-y-1.5 pr-1">
            <button
              v-for="result in searchResults"
              :key="result.id"
              class="w-full flex items-center justify-between p-3 rounded-xl bg-[#fbfefe] border border-teal-50 hover:bg-teal-50/40 text-left transition-all"
              @click="addPlace(result)"
            >
              <div>
                <p class="font-bold text-xs text-[#1a2e2b]">
                  {{ result.name }}
                </p>
                <span class="text-[0.65rem] text-teal-600 font-semibold">{{
                  result.category
                }}</span>
              </div>
              <Plus :size="14" class="text-teal-500" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      @click.self="showConfirmModal = false"
    >
      <div
        class="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div
          class="px-6 py-4 bg-gradient-to-br from-[#E8F8F5] to-[#f0faf8] border-b border-teal-100 flex items-center justify-between"
        >
          <div>
            <p
              class="text-[0.68rem] text-teal-600 font-bold uppercase tracking-wider"
            >
              레이오버 엽서 패키지 빌드업
            </p>
            <h3 class="font-extrabold text-sm text-[#1a2e2b]">
              코스 확정 전, 이것만 체크해보세요!
            </h3>
          </div>
          <button
            class="w-7 h-7 bg-white/80 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700"
            @click="showConfirmModal = false"
          >
            <X :size="14" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <p class="text-xs text-gray-500 leading-relaxed">
            유저님이 짜신 일정을 분석해 보니, 귀가 기차표 시간을
            <span class="text-teal-600 font-bold">딱 30분만 미뤄도</span> 대전의
            숨겨진 인생샷 명소 한 곳을 더 완벽하게 정복하고 기념 엽서 에셋을
            획득하실 수 있어요!
          </p>
          <div
            class="p-3.5 rounded-xl border border-amber-200/60 bg-amber-50/30 flex gap-3"
          >
            <div
              class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-lg"
            >
              🌿
            </div>
            <div class="flex-1 text-xs">
              <div class="flex justify-between font-bold text-[#1a2e2b]">
                <span>보문산 청정 공원산책 (+30분 여유 코스)</span>
                <span class="text-amber-700">추천</span>
              </div>
              <p class="text-gray-400 text-[0.7rem] mt-0.5">
                마지막 스팟인 대전역 광장에서 택시로 12분 거리
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2 pt-2">
            <a
              href="https://www.letskorail.com"
              target="_blank"
              class="w-full py-3 bg-teal-50 text-teal-600 text-center font-bold text-xs rounded-xl hover:bg-teal-100/60 transition-all flex items-center justify-center gap-1"
              style="text-decoration: none"
            >
              <ExternalLink :size="13" /> 더 여유롭게 코레일 기차표 변경하러
              가기
            </a>
            <button
              @click="confirmCourse"
              class="w-full py-3 text-white text-center font-extrabold text-xs rounded-xl shadow-md transition-all hover:opacity-95"
              style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
            >
              시간 변경 없이 이 코스 그대로 최종 확정하기
            </button>
          </div>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div
        v-if="showShareToast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a2e2b] text-white px-5 py-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-3 min-w-[340px] border border-teal-900"
      >
        <div class="flex items-center gap-2.5">
          <div class="text-xl">✉️</div>
          <div>
            <p class="text-xs font-bold text-teal-300">
              코스 확정 완료 & 디지털 엽서 발행!
            </p>
            <p class="text-[0.72rem] text-gray-300 mt-0.5">
              실제 다녀온 인증샷을 올리면 나만의 커스텀 엽서가 완성됩니다.
            </p>
          </div>
        </div>
        <div class="flex justify-end gap-2 text-xs">
          <button
            class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
            @click="showShareToast = false"
          >
            나중에 하기
          </button>
          <router-link
            to="/community/write"
            class="px-3 py-1.5 rounded-lg font-bold text-white shadow-sm flex items-center"
            style="
              background: linear-gradient(135deg, #b2e4dc, #3db89e);
              text-decoration: none;
            "
          >
            엽서 꾸미고 커뮤니티 공유
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 타임라인 스크롤바 미려하게 보정 */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(178, 228, 220, 0.4);
  border-radius: 10px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(61, 184, 158, 0.4);
}

/* 공유 유도 토스트 트랜지션 효과 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 25px);
}
</style>
