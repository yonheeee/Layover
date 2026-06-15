<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Camera,
  User,
  Activity,
  Award,
  ChevronRight,
  Star,
  Heart,
  MapPin,
  Clock,
  Coffee,
  Trees,
  Utensils,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle,
  Save,
  Lock,
  Trash2,
} from "lucide-vue-next";

const router = useRouter();
type Tab = "activity" | "info" | "postcard";
const activeTab = ref<Tab>("activity");

interface User {
  nickname: string;
  email: string;
  statusMessage: string;
  profileImage: string | null;
  level: number;
  xp: number;
  xpForNext: number;
  stampCount: number;
}

const user = ref<User>({
  nickname: "홍길동",
  email: "hong@example.com",
  statusMessage: "대전 환승 여행 중! 🥖",
  profileImage: null as string | null,
  level: 13,
  xp: 750,
  xpForNext: 1000,
  stampCount: 7,
});

const xpPercent = computed(() =>
  Math.round((user.value.xp / user.value.xpForNext) * 100),
);

// 프로필 로직
function handleImageUpload(e: any) {
  const file = e.target.files[0];
  if (file) user.value.profileImage = URL.createObjectURL(file);
}

function removeProfileImage() {
  user.value.profileImage = null;
}

const isEditing = ref(false);
const tempMessage = ref("");
const startEditing = () => {
  tempMessage.value = user.value.statusMessage;
  isEditing.value = true;
};
const saveStatus = () => {
  user.value.statusMessage = tempMessage.value;
  isEditing.value = false;
};

// 내 정보 탭 로직
const editName = ref(user.value.nickname);
const currentPw = ref("");
const newPw = ref("");
const newPwConfirm = ref("");
const showCurrentPw = ref(false);
const showNewPw = ref(false);
const showNewPwC = ref(false);

// 비밀번호 유효성 검사 (영어, 숫자, 특수문자 포함 8자 이상)
const pwRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z]\d@$!%*#?&]{8,}$/;
const isNewPwValid = computed(() => {
  if (!newPw.value) return true; // 입력 안 했을 때는 빨간 테두리 안 뜨게
  return pwRegex.test(newPw.value);
});

const pwMatch = computed(
  () => newPw.value && newPwConfirm.value && newPw.value === newPwConfirm.value,
);
const pwMismatch = computed(
  () => newPwConfirm.value && newPw.value !== newPwConfirm.value,
);

const savingInfo = ref(false);
const savingPw = ref(false);
const showDeleteDialog = ref(false);

const isPwEditing = ref(false);
const loginType = ref("이메일 로그인");

// 엽서 - 스탬프 지도용 핀 데이터 (추후 활동 탭 일지 ID 연동을 고려한 설계)
const mapPins = ref([
  {
    id: 1,
    location: "성심당 본점",
    journalTitle: "성심당 빵지순례 투어",
    visitDate: "2026년 12월 03일",
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
  },
  {
    id: 2,
    location: "한밭수목원",
    journalTitle: "주말 힐링 산책 코스",
    visitDate: "2026년 01월 21일",
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  },
]);

// 엽서 - 사진
const userPhotos = ref([
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    location: "성심당 본점",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    location: "한밭수목원",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    location: "중앙시장",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    location: "대흥동 카페거리",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    location: "식장산 야경",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    location: "대청호 오백리길",
  },
]);

const activePhotoModal = ref<string | null>(null);
const activeMapPopup = ref<(typeof mapPins.value)[0] | null>(null);
const activeCharacterDetail = ref<{
  name: string;
  description: string;
  poses: string[];
} | null>(null);

async function saveInfo() {
  savingInfo.value = true;
  await new Promise((r) => setTimeout(r, 800));
  user.value.nickname = editName.value;
  savingInfo.value = false;
}

async function changePw() {
  if (!pwMatch.value || !pwRegex.test(newPw.value)) return;
  savingPw.value = true;
  await new Promise((r) => setTimeout(r, 800));
  currentPw.value = "";
  newPw.value = "";
  newPwConfirm.value = "";
  savingPw.value = false;
  isPwEditing.value = false;

  // 데이터 수정 완료와 동시에 페이지 새로고침
  window.location.reload();
}

// 활동 탭 데이터
const journals = [
  {
    date: "12월 03일",
    icon: Coffee,
    title: "성심당 투어",
    count: 3,
    bg: "#FEF3C7",
    iconColor: "#D97706",
  },
  {
    date: "1월 21일",
    icon: Trees,
    title: "산책 코스",
    count: 2,
    bg: "#D1FAE5",
    iconColor: "#059669",
  },
  {
    date: "1월 08일",
    icon: Utensils,
    title: "시장 맛집",
    count: 4,
    bg: "#FCE7F3",
    iconColor: "#DB2777",
  },
];

const myCourses = [
  {
    id: 1,
    title: "성심당 → 한밭수목원",
    rating: 4.5,
    badge: "방문완료",
    badgeStyle: "background:#D1FAE5;color:#065F46",
    placeCount: 2,
    duration: "3시간",
  },
  {
    id: 2,
    title: "중앙시장 → 지림미술관",
    rating: 4.0,
    badge: "분류미정",
    badgeStyle: "background:#F3F4F6;color:#6B7280",
    placeCount: 2,
    duration: "2시간 30분",
  },
];

const likedPlaces = [
  { id: 1, name: "성심당", emoji: "🍞", category: "음식" },
  { id: 2, name: "한밭수목원", emoji: "🌿", category: "자연" },
  { id: 3, name: "중앙시장", emoji: "🏪", category: "음식" },
];

const characters = [
  {
    id: 1,
    name: "꿈돌이 베이직",
    emoji: "🌟",
    unlocked: true,
    description: "가장 기본적이고 귀여운 대전의 마스코트 꿈돌이입니다.",
    poses: ["🌟", "✨", "🎵"],
  },
  {
    id: 2,
    name: "꿈돌이 탐험가",
    emoji: "🗺️",
    unlocked: true,
    description: "대전 방방곳곳을 탐험하며 기록을 남기는 탐험가 꿈돌이입니다.",
    poses: ["🗺️", "🧭", "🎒"],
  },
  {
    id: 3,
    name: "꿈돌이 미식가",
    emoji: "🍞",
    unlocked: true,
    description: "빵과 맛있는 음식을 사랑하는 대전 최고의 미식가 꿈돌이입니다.",
    poses: ["🍞", "🍕", "🍰"],
  },
  {
    id: 4,
    name: "꿈돌이 문화인",
    emoji: "🎭",
    unlocked: false,
    description: "미술관과 전시회를 즐겨 찾는 감성 가득한 문화인 꿈돌이입니다.",
    poses: ["🎭"],
  },
  {
    id: 5,
    name: "꿈돌이 자연인",
    emoji: "🌿",
    unlocked: false,
    description: "수목원과 대청호의 맑은 공기를 좋아하는 자연인 꿈돌이입니다.",
    poses: ["🌿"],
  },
  {
    id: 6,
    name: "꿈돌이 대전왕",
    emoji: "👑",
    unlocked: false,
    description: "모든 코스를 섭렵한 진정한 대전의 끝판왕 꿈돌이입니다.",
    poses: ["👑"],
  },
];

const showLogout = ref(false);

const sidebarTabs = [
  { key: "activity", label: "활동", icon: Activity },
  { key: "info", label: "기본정보", icon: User },
  { key: "postcard", label: "엽서", icon: Award },
];

// 모서리가 살짝만 둥근 스타일 기조 반영 및 인풋 기본 정의
const infoBoxBase =
  "width:100%; height:44px; display:flex; align-items:center; padding:0 14px; border-radius:4px; border:1px solid #e2e8f0; bg: #ffffff; color:#1a2e2b; font-size:0.9rem;";
const inputBase =
  "width:100%;padding:11px 14px;border-radius:4px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.9rem;outline:none";
const labelBase =
  "font-size:0.78rem;font-weight:700;color:#6b8c87;letter-spacing:0.03em";
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
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="flex gap-6 items-start">
        <aside class="w-64 flex-shrink-0 flex flex-col gap-8 sticky top-6">
          <div
            class="p-6 bg-white flex flex-col items-center justify-center gap-3 shadow-sm"
            style="aspect-ratio: 4/5; width: 100%"
          >
            <div class="relative w-full px-2 mt-2">
              <div
                class="relative p-3 rounded-2xl bg-white text-center border-2 border-dashed border-teal-300 shadow-sm cursor-pointer"
                @click="!isEditing && startEditing()"
              >
                <p
                  v-if="!isEditing"
                  class="text-[0.8rem] text-gray-700 min-h-[1.2rem]"
                >
                  {{ user.statusMessage || "상태 메시지를 입력하세요" }}
                </p>
                <div
                  v-else
                  class="flex flex-col gap-1 items-center"
                  @click.stop
                >
                  <input
                    v-model="tempMessage"
                    maxlength="40"
                    autofocus
                    class="w-full text-center text-[0.8rem] outline-none border-b border-teal-500"
                  />
                  <button
                    @click="saveStatus"
                    class="mt-1 px-2 py-0.5 text-[0.7rem] bg-teal-500 text-white rounded-full font-bold"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>

            <div class="relative group">
              <div
                class="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl text-white overflow-hidden border"
                style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
              >
                <img
                  v-if="user.profileImage"
                  :src="user.profileImage"
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ user.nickname[0] }}</span>
              </div>
              <label
                class="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer bg-white shadow-md"
              >
                <Camera :size="14" color="#3db89e" />
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
                />
              </label>
              <button
                v-if="user.profileImage"
                @click="removeProfileImage"
                class="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"
              >
                <Trash2 :size="12" color="#e07070" />
              </button>
            </div>

            <div class="text-center">
              <p style="font-weight: 800; font-size: 1.1rem; color: #1a2e2b">
                {{ user.nickname }}
              </p>
              <p style="font-size: 0.88rem; color: #9ca3af">{{ user.email }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-4 text-right">
            <button
              v-for="tab in sidebarTabs"
              :key="tab.key"
              @click="activeTab = tab.key as Tab"
              class="transition-all px-2 py-1"
              :style="
                activeTab === tab.key
                  ? 'font-size: 1.25rem; font-weight: 800; color: #3db89e; border-right: 3px solid #3db89e;'
                  : 'font-size: 1rem; font-weight: 500; color: #9ca3af;'
              "
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="text-right">
            <button
              @click="showLogout = true"
              style="color: #cbd5e1; font-size: 0.72rem; font-weight: 600"
            >
              로그아웃
            </button>
          </div>
        </aside>

        <main
          class="flex-1 min-w-0 bg-white rounded-2xl p-6"
          style="
            border: 1.5px solid rgba(178, 228, 220, 0.35);
            box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
          "
        >
          <template v-if="activeTab === 'activity'">
            <div class="pb-6">
              <div class="flex items-center justify-between mb-4">
                <h2
                  style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
                >
                  내 여행 일지
                </h2>
                <button
                  style="font-size: 0.78rem; color: #3db89e; font-weight: 600"
                >
                  자세히보기
                </button>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div
                  v-for="j in journals"
                  :key="j.title"
                  class="rounded-2xl p-4 flex flex-col gap-2"
                  :style="`background:${j.bg};border:1.5px solid rgba(0,0,0,0.04)`"
                >
                  <p
                    style="font-size: 0.72rem; font-weight: 600; color: #6b7280"
                  >
                    {{ j.date }}
                  </p>
                  <component :is="j.icon" :size="22" :color="j.iconColor" />
                  <p
                    style="font-weight: 700; font-size: 0.88rem; color: #1a2e2b"
                  >
                    {{ j.title }}
                  </p>
                  <p style="font-size: 0.75rem; color: #6b7280">
                    {{ j.count }}코스 방문
                  </p>
                </div>
              </div>
            </div>

            <div class="py-6 border-t border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h2
                  style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
                >
                  내 코스
                </h2>
                <button
                  @click="router.push('/courses/result')"
                  style="font-size: 0.78rem; color: #3db89e; font-weight: 600"
                >
                  더보기
                </button>
              </div>
              <div class="flex flex-col gap-2.5">
                <button
                  v-for="course in myCourses"
                  :key="course.id"
                  class="flex items-center gap-3 p-4 rounded-xl text-left border border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-50"
                  >
                    <MapPin :size="16" color="#3db89e" />
                  </div>
                  <div class="flex-1">
                    <p
                      style="
                        font-weight: 700;
                        font-size: 0.9rem;
                        color: #1a2e2b;
                      "
                    >
                      {{ course.title }}
                    </p>
                    <div class="flex items-center gap-2 mt-1">
                      <span
                        class="text-xs px-2 py-0.5 rounded-full font-semibold"
                        :style="course.badgeStyle"
                        >{{ course.badge }}</span
                      >
                      <span style="font-size: 0.75rem; color: #9ca3af">{{
                        course.duration
                      }}</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h2
                  style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
                >
                  찜한 장소
                </h2>
                <button
                  @click="router.push('/bookmarks')"
                  style="font-size: 0.78rem; color: #3db89e; font-weight: 600"
                >
                  더보기
                </button>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div
                  v-for="place in likedPlaces"
                  :key="place.id"
                  class="rounded-2xl p-4 flex flex-col items-center gap-2 bg-gray-50"
                >
                  <span class="text-2xl">{{ place.emoji }}</span>
                  <p
                    style="font-weight: 600; font-size: 0.8rem; color: #1a2e2b"
                  >
                    {{ place.name }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'info'">
            <div class="pb-6">
              <h2
                class="mb-6"
                style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
              >
                내 정보
              </h2>

              <div class="grid grid-cols-2 gap-x-6 gap-y-5 mb-6">
                <div class="flex flex-col gap-1.5">
                  <span :style="labelBase">이름</span>
                  <div :style="infoBoxBase">
                    <span>{{ user.nickname }}</span>
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span :style="labelBase">닉네임</span>
                  <div class="flex justify-between items-center gap-2">
                    <input
                      v-model="editName"
                      :style="inputBase"
                      style="background: #ffffff; border-radius: 4px"
                    />
                    <button
                      @click="saveInfo"
                      class="px-4 h-[44px] shrink-0 rounded-[4px] bg-teal-500 text-white font-bold text-xs hover:bg-teal-600 transition-colors"
                      :disabled="savingInfo"
                    >
                      {{ savingInfo ? "저장중" : "변경" }}
                    </button>
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span :style="labelBase">이메일</span>
                  <div
                    :style="infoBoxBase"
                    style="
                      background: #f5f5f5;
                      color: #9ca3af;
                      cursor: not-allowed;
                    "
                  >
                    {{ user.email }}
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span :style="labelBase">가입 방식</span>
                  <div
                    :style="infoBoxBase"
                    style="
                      background: #f5f5f5;
                      color: #9ca3af;
                      cursor: not-allowed;
                    "
                  >
                    {{ loginType }}
                  </div>
                </div>
              </div>
            </div>

            <div class="py-6 border-t border-gray-100">
              <h2
                class="mb-4"
                style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
              >
                비밀번호 변경
              </h2>

              <div v-if="!isPwEditing" class="flex">
                <button
                  @click="isPwEditing = true"
                  class="px-5 py-2.5 rounded-[4px] border border-teal-500 text-teal-600 font-bold text-sm hover:bg-teal-50 transition-colors"
                >
                  비밀번호 변경
                </button>
              </div>

              <div v-else class="flex flex-col gap-3 max-w-md">
                <div class="relative">
                  <input
                    :type="showCurrentPw ? 'text' : 'password'"
                    v-model="currentPw"
                    :style="inputBase"
                    style="border-radius: 4px"
                    placeholder="현재 비밀번호"
                  />
                  <button
                    @click="showCurrentPw = !showCurrentPw"
                    class="absolute right-3 top-3.5 text-gray-400"
                  >
                    <Eye v-if="showCurrentPw" :size="16" /><EyeOff
                      v-else
                      :size="16"
                    />
                  </button>
                </div>

                <!-- 새 비밀번호 인풋 -->
                <div class="relative">
                  <input
                    :type="showNewPw ? 'text' : 'password'"
                    v-model="newPw"
                    :style="[
                      inputBase,
                      {
                        borderColor: !isNewPwValid
                          ? '#ef4444'
                          : 'rgba(178,228,220,0.5)',
                        borderRadius: '4px',
                      },
                    ]"
                    placeholder="새 비밀번호"
                  />
                  <button
                    @click="showNewPw = !showNewPw"
                    class="absolute right-3 top-3.5 text-gray-400"
                  >
                    <Eye v-if="showNewPw" :size="16" /><EyeOff
                      v-else
                      :size="16"
                    />
                  </button>
                </div>
                <!-- 유효성 조건문 실패 시 노출되는 가이드 텍스트 -->
                <p
                  v-if="!isNewPwValid"
                  class="text-xs text-red-500 pl-1 font-semibold"
                >
                  영어, 숫자, 특수문자 포함해서 8자 이상 작성해주세요.
                </p>

                <!-- 새 비밀번호 확인 인풋 -->
                <div class="relative">
                  <input
                    :type="showNewPwC ? 'text' : 'password'"
                    v-model="newPwConfirm"
                    :style="[
                      inputBase,
                      {
                        borderColor: pwMismatch
                          ? '#ef4444'
                          : 'rgba(178,228,220,0.5)',
                        borderRadius: '4px',
                      },
                    ]"
                    placeholder="새 비밀번호 확인"
                  />
                  <button
                    @click="showNewPwC = !showNewPwC"
                    class="absolute right-3 top-3.5 text-gray-400"
                  >
                    <Eye v-if="showNewPwC" :size="16" /><EyeOff
                      v-else
                      :size="16"
                    />
                  </button>
                </div>

                <div
                  v-if="pwMismatch"
                  class="text-xs text-red-500 font-semibold pl-1"
                >
                  새 비밀번호가 일치하지 않습니다.
                </div>
                <div
                  v-if="pwMatch && isNewPwValid"
                  class="text-xs text-teal-600 font-semibold pl-1"
                >
                  새 비밀번호가 일치하며 사용 가능합니다.
                </div>

                <div class="flex gap-2 justify-end mt-2">
                  <button
                    @click="isPwEditing = false"
                    class="px-4 py-2 rounded-[4px] text-gray-400 font-bold text-sm hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    @click="changePw"
                    :disabled="!pwMatch || !isNewPwValid || savingPw"
                    class="px-5 py-2 rounded-[4px] bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {{ savingPw ? "변경중..." : "변경하기" }}
                  </button>
                </div>
              </div>
            </div>

            <div class="py-6 border-t border-gray-100 flex gap-4">
              <button
                @click="router.push('/community/notice/inquiry/faq')"
                class="flex-1 py-3.5 rounded-[4px] border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-all text-center font-bold text-sm text-gray-700"
              >
                자주 묻는 질문
              </button>
              <button
                @click="router.push('/community/notice/inquiry/personal')"
                class="flex-1 py-3.5 rounded-[4px] border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-all text-center font-bold text-sm text-gray-700"
              >
                1:1 문의하기
              </button>
            </div>

            <div class="pt-6 border-t border-gray-100 flex justify-center">
              <button
                @click="showDeleteDialog = true"
                class="text-[0.72rem] text-gray-400 font-medium underline hover:text-red-400 transition-colors"
              >
                회원 탈퇴하기
              </button>
            </div>
          </template>

          <!-- 2. 게이미피케이션 카테고리 개편 영역 (엽서 탭) -->
          <template v-else-if="activeTab === 'postcard'">
            <!-- 스탬프 지도 섹션 -->
            <div class="pb-6">
              <h2
                class="mb-4"
                style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
              >
                스탬프 지도
              </h2>
              <div
                class="relative w-full h-[340px] rounded-2xl bg-teal-50/50 border border-teal-100 overflow-hidden flex items-center justify-center"
              >
                <!-- 지도 컨테이너 Mockup -->
                <div
                  class="absolute inset-0 bg-[#eef7f6] flex items-center justify-center text-xs text-teal-700 font-medium"
                >
                  [ Kakao Map API Map Container ]

                  <!-- 핀 1: 여백 없이 초록 테두리 안에 사진을 꽉 채운 핀 -->
                  <div
                    @click="activeMapPopup = mapPins[0]"
                    class="absolute top-1/3 left-1/4 w-12 h-12 rounded-xl border-2 border-teal-500 shadow-md cursor-pointer hover:scale-110 transition-transform overflow-hidden"
                  >
                    <img
                      :src="mapPins[0].url"
                      class="w-full h-full object-cover"
                    />
                  </div>

                  <!-- 핀 2 -->
                  <div
                    @click="activeMapPopup = mapPins[1]"
                    class="absolute top-1/2 right-1/3 w-12 h-12 rounded-xl border-2 border-teal-500 shadow-md cursor-pointer hover:scale-110 transition-transform overflow-hidden"
                  >
                    <img
                      :src="mapPins[1].url"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <!-- 위치핀 클릭 시 뜨는 여행 일정 정보 연동 팝업 -->
                <div
                  v-if="activeMapPopup"
                  class="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur shadow-lg rounded-xl flex items-center justify-between border border-teal-100 z-10 animate-fade-in"
                >
                  <div class="flex items-center gap-3.5">
                    <!-- 팝업 내부 이미지도 정방형으로 알맞게 채움 -->
                    <img
                      :src="activeMapPopup.url"
                      class="w-14 h-14 object-cover rounded-lg border border-gray-100"
                    />
                    <div class="flex flex-col gap-0.5">
                      <span
                        class="text-[0.68rem] text-teal-600 font-bold tracking-wide"
                        >{{ activeMapPopup.visitDate }} 방문</span
                      >
                      <p class="text-sm font-extrabold text-[#1a2e2b]">
                        {{ activeMapPopup.journalTitle }}
                      </p>
                      <p
                        class="text-[0.72rem] text-gray-500 flex items-center gap-0.5"
                      >
                        <span class="font-semibold text-gray-700">{{
                          activeMapPopup.location
                        }}</span
                        >에서 기록한 발자국
                      </p>
                    </div>
                  </div>
                  <button
                    @click="activeMapPopup = null"
                    class="text-xs text-gray-400 font-bold px-2.5 py-1.5 hover:bg-gray-100 rounded-md transition-colors shrink-0"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>

            <!-- 사진 섹션 (PC 최적화 내부 스크롤 디자인 적용) -->
            <div class="py-6 border-t border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h2
                  style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
                >
                  사진
                </h2>
                <span class="text-xs text-gray-400 font-medium"
                  >총 {{ userPhotos.length }}장</span
                >
              </div>

              <!-- max-h를 주어 3열 형태를 유지하면서 스크롤되도록 처리 (스크롤바는 스타일 숨김 처리 가능) -->
              <div
                class="grid grid-cols-3 gap-2 overflow-y-auto pr-1 max-h-[420px] custom-scrollbar"
              >
                <div
                  v-for="photo in userPhotos"
                  :key="photo.id"
                  @click="activePhotoModal = photo.url"
                  class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer border border-gray-100"
                >
                  <img
                    :src="photo.url"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2"
                  >
                    <span
                      class="text-[0.7rem] text-white font-medium truncate"
                      >{{ photo.location }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- 캐릭터 섹션 -->
            <div class="pt-6 border-t border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h2
                  style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
                >
                  캐릭터
                </h2>
                <span
                  style="font-size: 0.82rem; font-weight: 700; color: #3db89e"
                  >획득 7 / 전체 20</span
                >
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div
                  v-for="char in characters"
                  :key="char.id"
                  @click="char.unlocked && (activeCharacterDetail = char)"
                  class="p-3 rounded-xl border text-center transition-all"
                  :class="
                    char.unlocked
                      ? 'bg-white border-teal-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5'
                      : 'bg-gray-50 border-gray-200'
                  "
                >
                  <span
                    class="text-2xl inline-block mb-1"
                    :style="
                      !char.unlocked
                        ? 'filter: grayscale(1); opacity: 0.35;'
                        : ''
                    "
                    >{{ char.emoji }}</span
                  >
                  <p
                    style="font-size: 0.7rem; font-weight: 600"
                    :class="char.unlocked ? 'text-[#1a2e2b]' : 'text-gray-400'"
                  >
                    {{ char.name }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </main>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showLogout"
        class="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
        @click.self="showLogout = false"
      >
        <div class="bg-white p-6 rounded-2xl w-[320px]">
          <p class="font-bold mb-4">로그아웃 하시겠어요?</p>
          <div class="flex gap-2">
            <button
              @click="showLogout = false"
              class="flex-1 py-2 rounded-xl bg-gray-100"
            >
              취소
            </button>
            <button
              @click="router.push('/login')"
              class="flex-1 py-2 rounded-xl bg-red-500 text-white"
            >
              확인
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showDeleteDialog"
        class="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
        @click.self="showDeleteDialog = false"
      >
        <div class="bg-white p-6 rounded-2xl w-[360px]">
          <p class="font-bold mb-2">정말 탈퇴하시겠어요?</p>
          <p class="text-sm text-gray-500 mb-4">
            모든 데이터가 영구 삭제됩니다.
          </p>
          <div class="flex gap-2">
            <button
              @click="showDeleteDialog = false"
              class="flex-1 py-2 rounded-xl bg-gray-100"
            >
              취소
            </button>
            <button
              @click="router.push('/login')"
              class="flex-1 py-2 rounded-xl bg-gray-800 text-white"
            >
              탈퇴
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="activePhotoModal"
        class="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm"
        @click="activePhotoModal = null"
      >
        <div
          class="relative max-w-lg max-h-[80vh] p-2 bg-white rounded-2xl shadow-2xl mx-4"
          @click.stop
        >
          <img
            :src="activePhotoModal"
            class="w-full h-auto max-h-[70vh] object-contain rounded-xl"
          />
          <div class="text-center mt-3">
            <button
              @click="activePhotoModal = null"
              class="px-4 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="activeCharacterDetail"
        class="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
        @click.self="activeCharacterDetail = null"
      >
        <div
          class="bg-white p-6 rounded-2xl w-[340px] shadow-xl border border-teal-50 flex flex-col items-center gap-4"
        >
          <span class="text-5xl animate-bounce mt-2">{{
            activeCharacterDetail.emoji
          }}</span>
          <div class="text-center w-full">
            <h3 class="font-bold text-base text-[#1a2e2b] mb-1">
              {{ activeCharacterDetail.name }}
            </h3>
            <p class="text-xs text-gray-500 leading-relaxed px-2 break-all">
              {{ activeCharacterDetail.description }}
            </p>
          </div>
          <div
            class="w-full bg-teal-50/50 p-3 rounded-xl border border-teal-100/50"
          >
            <p class="text-[0.68rem] text-teal-700 font-bold mb-2 text-center">
              획득 포즈 컬렉션
            </p>
            <div class="flex justify-center gap-4">
              <span
                v-for="(pose, idx) in activeCharacterDetail.poses"
                :key="idx"
                class="text-xl bg-white p-2 rounded-lg shadow-sm border border-gray-100"
                >{{ pose }}</span
              >
            </div>
          </div>
          <button
            @click="activeCharacterDetail = null"
            class="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors text-white text-xs font-bold"
          >
            확인
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 사진 스크롤바 커스텀 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
