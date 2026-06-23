<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { CODE_TO_CATEGORY, getMyPosts } from "@/api/community";
import { httpDelete, httpPut } from "@/api/http";
import {
  fetchCharacters,
  fetchPostcardData,
  fetchUser,
  fetchUserActivity,
} from "@/api/user";
import PlaceCard from "@/components/common/PlaceCard.vue";
import { useAuthStore } from "@/stores/auth";
import { useBookmarkStore } from "@/stores/bookmark";
import { useStampStore, type StampPhoto } from "@/stores/stamp";
import type { MyPost } from "@/types/community";
import type { Place } from "@/types/place";
import type {
  Character,
  MapPin as MapPinType,
  MyCourse,
  UserPhoto,
  User as UserType,
} from "@/types/user";
import PlaceDetailContent from "@/views/place/PlaceDetailContents.vue";
import {
  Activity,
  Award,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  MapPin,
  MessageCircle,
  Trash2,
  User,
} from "lucide-vue-next";

const stampStore = useStampStore();
const auth = useAuthStore();
const bookmarkStore = useBookmarkStore();
const router = useRouter();

type Tab = "activity" | "info" | "postcard";
const activeTab = ref<Tab>("activity");

const user = ref<UserType>({
  username: "",
  realName: "",
  email: "",
  birthDate: "",
  phone: "",
  profileImage: null,
  stampCount: 0,
  role: "",
  kakao: false,
});

// ─── 프로필 이미지 ───
function handleImageUpload(e: any) {
  const file = e.target.files[0];
  if (file) user.value.profileImage = URL.createObjectURL(file);
}
function removeProfileImage() {
  user.value.profileImage = null;
}

// ─── 데이터 로드 ───
onMounted(async () => {
  try {
    const [fetchedUser, activity, fetchedCharacters, postcardData, fetchedPosts] =
      await Promise.all([
        fetchUser(),
        fetchUserActivity(),
        fetchCharacters(),
        fetchPostcardData(),
        getMyPosts(),
      ]);
    user.value = fetchedUser;
    editName.value = fetchedUser.username;
    editPhone.value = fetchedUser.phone ?? "";
    myCourses.value = activity.myCourses;
    characters.value = fetchedCharacters;
    mapPins.value = postcardData.mapPins;
    userPhotos.value = postcardData.userPhotos;
    myPosts.value = fetchedPosts;
  } catch (e) {
    console.error("마이페이지 데이터 로딩 실패:", e);
  }
  await bookmarkStore.fetchBookmarks();
});

// ─── 내 정보 탭 ───
const editName = ref("");
const nicknameError = ref("");
const currentPw = ref("");
const newPw = ref("");
const newPwConfirm = ref("");
const showCurrentPw = ref(false);
const showNewPw = ref(false);
const showNewPwC = ref(false);
const savingInfo = ref(false);
const savingPw = ref(false);
const showDeleteDialog = ref(false);
const isPwEditing = ref(false);

const isNicknameChanged = computed(
  () => editName.value !== user.value.username,
);

const pwRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const isNewPwValid = computed(() => {
  if (!newPw.value) return true;
  return pwRegex.test(newPw.value);
});
const pwMatch = computed(
  () => newPw.value && newPwConfirm.value && newPw.value === newPwConfirm.value,
);
const pwMismatch = computed(
  () => newPwConfirm.value && newPw.value !== newPwConfirm.value,
);

async function saveInfo() {
  nicknameError.value = "";
  savingInfo.value = true;
  try {
    await httpPut("/api/user/me/nickname", { username: editName.value });
    user.value.username = editName.value;
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? "닉네임 변경에 실패했습니다.";
    if (msg.includes("이미 사용 중인")) {
      nicknameError.value = "이미 사용중인 닉네임입니다.";
    } else {
      nicknameError.value = msg;
    }
  } finally {
    savingInfo.value = false;
  }
}

const editPhone = ref("");
const savingPhone = ref(false);

async function savePhone() {
  savingPhone.value = true;
  try {
    await httpPut("/api/user/me/phone", { phone: editPhone.value });
    user.value.phone = editPhone.value;
    alert("전화번호가 변경되었습니다.");
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? "전화번호 변경에 실패했습니다.";
    alert(msg);
  } finally {
    savingPhone.value = false;
  }
}

async function changePw() {
  if (!pwMatch.value || !pwRegex.test(newPw.value)) return;
  savingPw.value = true;
  try {
    await httpPut("/api/user/me/password", {
      currentPassword: currentPw.value,
      newPassword: newPw.value,
    });
    currentPw.value = "";
    newPw.value = "";
    newPwConfirm.value = "";
    isPwEditing.value = false;
    alert("비밀번호가 변경되었습니다.");
    window.location.reload();
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ?? "현재 비밀번호가 올바르지 않습니다.";
    alert(msg);
  } finally {
    savingPw.value = false;
  }
}

async function withdraw() {
  try {
    await httpDelete("/api/user/me");
    auth.logout();
    router.push("/login");
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ?? "회원탈퇴 중 오류가 발생했습니다.";
    alert(msg);
  }
}

// ─── 엽서 탭 (카카오 지도) ───
const mapPins = ref<MapPinType[]>([]);
const userPhotos = ref<UserPhoto[]>([]);
let postcardMap: any = null;
let postcardOverlays: any[] = [];

function initPostcardMap() {
  const container = document.getElementById("postcard-stamp-map");
  if (!container) return;
  const kakao = (window as any).kakao;
  if (!kakao?.maps) return;
  const center = new kakao.maps.LatLng(36.3619, 127.41);
  postcardMap = new kakao.maps.Map(container, { center, level: 8 });
  renderPostcardPins();
}

function renderPostcardPins() {
  if (!postcardMap) return;
  const kakao = (window as any).kakao;
  postcardOverlays.forEach((o) => o.setMap(null));
  postcardOverlays = [];
  if (stampStore.photos.length === 0) return;
  const bounds = new kakao.maps.LatLngBounds();
  stampStore.photos.forEach((photo) => {
    const pos = new kakao.maps.LatLng(photo.lat, photo.lng);
    bounds.extend(pos);
    const content = `<div style="width:52px;height:52px;border-radius:12px;border:3px solid #3db89e;box-shadow:0 3px 12px rgba(61,184,158,0.4);overflow:hidden;cursor:pointer;"><img src="${photo.url}" style="width:100%;height:100%;object-fit:cover;" /></div>`;
    const overlay = new kakao.maps.CustomOverlay({
      position: pos,
      content,
      yAnchor: 1,
    });
    overlay.setMap(postcardMap);
    postcardOverlays.push(overlay);
  });
  postcardMap.setBounds(bounds);
}

watch(
  () => activeTab.value,
  async (tab) => {
    if (tab === "postcard") {
      await nextTick();
      if (!postcardMap) {
        if (!(window as any).kakao?.maps) {
          if (!document.getElementById("kakao-map-script")) {
            const script = document.createElement("script");
            script.id = "kakao-map-script";
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_KEY}&autoload=false`;
            document.head.appendChild(script);
            script.onload = () =>
              (window as any).kakao.maps.load(() => initPostcardMap());
          }
        } else {
          initPostcardMap();
        }
      } else {
        renderPostcardPins();
      }
    }
  },
);

// ─── 활동 탭 데이터 ───
const myCourses = ref<MyCourse[]>([]);
const myPosts = ref<MyPost[]>([]);
const selectedCourse = ref<MyCourse | null>(null);
const selectedPlaceId = ref<string | null>(null);
const likedScrollRef = ref<HTMLDivElement | null>(null);
const characters = ref<Character[]>([]);

// ─── 모달 상태 ───
const showLogout = ref(false);
const activePhotoModal = ref<string | null>(null);
const activeMapPopup = ref<(typeof mapPins.value)[0] | null>(null);
const activeCharacterDetail = ref<{
  name: string;
  imageUrl?: string;
  imageAlt?: string;
  role?: string;
  placeName?: string;
  photoUrl?: string;
  description: string;
} | null>(null);

type PostcardCharacter = {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  placeName: string;
  photoUrl: string;
  takenAt: string;
};

function isCharacterPhoto(photo: StampPhoto): photo is StampPhoto & {
  characterId: string;
  characterName: string;
  characterImageUrl: string;
} {
  return Boolean(photo.characterId && photo.characterName && photo.characterImageUrl);
}

const postcardCharacters = computed<PostcardCharacter[]>(() => {
  const byCharacter = new Map<string, PostcardCharacter>();

  stampStore.photos.filter(isCharacterPhoto).forEach((photo) => {
    if (byCharacter.has(photo.characterId)) return;
    byCharacter.set(photo.characterId, {
      id: photo.characterId,
      name: photo.characterName,
      role: photo.characterRole ?? "꿈씨패밀리",
      description: photo.characterDescription ?? "스탬프 투어에서 함께 인증한 꿈씨패밀리 캐릭터입니다.",
      imageUrl: photo.characterImageUrl,
      imageAlt: photo.characterImageAlt ?? photo.characterName,
      placeName: photo.placeName,
      photoUrl: photo.url,
      takenAt: photo.takenAt,
    });
  });

  return [...byCharacter.values()];
});

const sidebarTabs = [
  { key: "activity", label: "활동", icon: Activity },
  { key: "info", label: "기본정보", icon: User },
  { key: "postcard", label: "엽서", icon: Award },
];

// ─── 스타일 상수 ───
const infoBoxBase =
  "width:100%; height:44px; display:flex; align-items:center; padding:0 14px; border-radius:4px; border:1px solid #e2e8f0; color:#1a2e2b; font-size:0.9rem;";
const inputBase =
  "width:100%;padding:11px 14px;border-radius:4px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.9rem;outline:none";
const labelBase =
  "font-size:0.78rem;font-weight:700;color:#6b8c87;letter-spacing:0.03em";

// ─── 헬퍼 ───
function travelModeLabel(mode: string): string {
  return (
    ({ WALK: "도보", TAXI: "택시", BUS: "버스" } as Record<string, string>)[
      mode
    ] ?? mode
  );
}
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
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
        <!-- ─── 사이드바 ─── -->
        <aside class="w-64 flex-shrink-0 flex flex-col gap-8 sticky top-6">
          <!-- 프로필 카드 -->
          <div
            class="p-6 bg-white flex flex-col items-center justify-center gap-3 shadow-sm"
            style="aspect-ratio: 4/5; width: 100%"
          >
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
                <span v-else>{{ user.username[0] }}</span>
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
                {{ user.username }}
              </p>
              <div class="flex items-center justify-center gap-2">
                <p style="font-size: 0.88rem; color: #9ca3af">
                  {{ user.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- 탭 메뉴 -->
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
        </aside>

        <!-- ─── 메인 콘텐츠 ─── -->
        <main
          class="flex-1 min-w-0 bg-white rounded-2xl p-6"
          style="
            border: 1.5px solid rgba(178, 228, 220, 0.35);
            box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
          "
        >
          <!-- 활동 탭 -->
          <template v-if="activeTab === 'activity'">
            <!-- 내 여행 일지 -->
            <div class="pb-6">
              <div class="flex items-center justify-between mb-4">
                <h2
                  style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
                >
                  내 여행 일지
                </h2>
                <span
                  style="font-size: 0.78rem; color: #9ca3af; font-weight: 500"
                >
                  총 {{ myCourses.length }}개
                </span>
              </div>
              <div
                v-if="myCourses.length === 0"
                class="flex flex-col items-center justify-center py-12 rounded-2xl"
                style="background: #f9fafb; border: 1.5px dashed #e5e7eb"
              >
                <span class="text-4xl mb-3">🗺️</span>
                <p style="font-size: 0.85rem; font-weight: 600; color: #9ca3af">
                  아직 저장한 코스가 없어요
                </p>
                <p style="font-size: 0.75rem; color: #d1d5db; margin-top: 4px">
                  코스를 만들고 여행을 기록해보세요!
                </p>
              </div>
              <div v-else class="flex flex-col gap-2.5">
                <button
                  v-for="course in myCourses"
                  :key="course.id"
                  @click="selectedCourse = course"
                  class="flex items-start gap-3 p-4 rounded-xl text-left border border-gray-100 transition-colors hover:bg-teal-50/30 hover:border-teal-100"
                >
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-50 shrink-0 mt-0.5"
                  >
                    <MapPin :size="16" color="#3db89e" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      style="
                        font-weight: 700;
                        font-size: 0.9rem;
                        color: #1a2e2b;
                      "
                      class="truncate"
                    >
                      {{ course.subTitle }}
                    </p>
                    <div class="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        class="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style="background: #e6f7f4; color: #3db89e"
                        >{{ travelModeLabel(course.travelMode) }}</span
                      >
                      <span style="font-size: 0.75rem; color: #9ca3af"
                        >{{ course.durationMinutes }}분</span
                      >
                      <span style="font-size: 0.75rem; color: #9ca3af"
                        >· {{ course.places.length }}곳</span
                      >
                      <span style="font-size: 0.75rem; color: #9ca3af"
                        >· {{ formatDate(course.createdAt) }}</span
                      >
                    </div>
                  </div>
                  <ChevronRight
                    :size="16"
                    color="#d1d5db"
                    class="shrink-0 mt-1"
                  />
                </button>
              </div>
            </div>

            <!-- 찜한 장소 -->
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
              <div class="relative px-10">
                <button
                  @click="
                    likedScrollRef?.scrollBy({ left: -256, behavior: 'smooth' })
                  "
                  type="button"
                  class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center text-[#3db89e] hover:scale-125 transition-all duration-200"
                >
                  <ChevronLeft :size="28" :stroke-width="3" />
                </button>
                <div ref="likedScrollRef" class="liked-scroll-container">
                  <div class="liked-scroll-inner">
                    <div
                      v-if="bookmarkStore.bookmarkedPlaces.length === 0"
                      class="flex flex-col items-center justify-center px-8 py-6 rounded-2xl"
                      style="background: #f9fafb; border: 1.5px dashed #e5e7eb; min-width: 200px"
                    >
                      <p style="font-size: 0.82rem; font-weight: 600; color: #9ca3af">찜한 장소가 없어요</p>
                    </div>
                    <PlaceCard
                      v-for="place in bookmarkStore.bookmarkedPlaces.slice(0, 5)"
                      :key="place.id"
                      :spot="place"
                      :liked="bookmarkStore.isBookmarked(place.id)"
                      @click="selectedPlaceId = place.id"
                      @toggleLike="(id) => bookmarkStore.toggleBookmark(id)"
                    />
                  </div>
                </div>
                <button
                  @click="
                    likedScrollRef?.scrollBy({ left: 256, behavior: 'smooth' })
                  "
                  type="button"
                  class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center text-[#3db89e] hover:scale-125 transition-all duration-200"
                >
                  <ChevronRight :size="28" :stroke-width="3" />
                </button>
              </div>
            </div>

            <!-- 내가 쓴 글 -->
            <div class="pt-6 border-t border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h2
                  style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
                >
                  내가 쓴 글
                </h2>
                <div class="flex items-center gap-3">
                  <span
                    style="font-size: 0.78rem; color: #9ca3af; font-weight: 500"
                  >
                    총 {{ myPosts.length }}개
                  </span>
                  <button
                    @click="router.push('/community?my=true')"
                    style="font-size: 0.78rem; color: #3db89e; font-weight: 600"
                  >
                    더보기
                  </button>
                </div>
              </div>
              <div
                v-if="myPosts.length === 0"
                class="flex flex-col items-center justify-center py-12 rounded-2xl"
                style="background: #f9fafb; border: 1.5px dashed #e5e7eb"
              >
                <span class="text-4xl mb-3">✍️</span>
                <p style="font-size: 0.85rem; font-weight: 600; color: #9ca3af">
                  아직 작성한 글이 없어요
                </p>
                <p style="font-size: 0.75rem; color: #d1d5db; margin-top: 4px">
                  커뮤니티에서 첫 글을 남겨보세요!
                </p>
                <button
                  @click="router.push('/community/write')"
                  class="mt-4 px-4 py-2 rounded-xl text-white text-xs font-bold"
                  style="background: #3db89e"
                >
                  글쓰기
                </button>
              </div>
              <div v-else>
                <div
                  v-for="post in myPosts.slice(0, 5)"
                  :key="post.id"
                  @click="router.push('/community/' + post.id)"
                  class="flex items-center gap-3 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors px-1"
                >
                  <span
                    class="shrink-0 text-xs px-2 py-0.5 rounded-full font-bold"
                    :style="
                      post.category === 'SHARE'
                        ? 'background:#d1fae5;color:#059669'
                        : post.category === 'QUESTION'
                          ? 'background:#dbeafe;color:#2563eb'
                          : post.category === 'TOGETHER'
                            ? 'background:#ede9fe;color:#7c3aed'
                            : 'background:#f3f4f6;color:#6b7280'
                    "
                  >
                    {{ CODE_TO_CATEGORY[post.category] }}
                  </span>
                  <p
                    class="flex-1 truncate"
                    style="font-size: 0.88rem; color: #1a2e2b; font-weight: 500"
                  >
                    {{ post.title }}
                  </p>
                  <div class="flex items-center gap-2.5 shrink-0">
                    <span
                      class="flex items-center gap-0.5"
                      style="font-size: 0.72rem; color: #9ca3af"
                    >
                      <Eye :size="11" />&nbsp;{{ post.viewCount }}
                    </span>
                    <span
                      class="flex items-center gap-0.5"
                      style="font-size: 0.72rem; color: #9ca3af"
                    >
                      <Heart :size="11" />&nbsp;{{ post.likeCount }}
                    </span>
                    <span
                      class="flex items-center gap-0.5"
                      style="font-size: 0.72rem; color: #9ca3af"
                    >
                      <MessageCircle :size="11" />&nbsp;{{ post.commentCount }}
                    </span>
                    <span style="font-size: 0.72rem; color: #d1d5db">{{
                      formatDate(post.createdAt)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 기본정보 탭 -->
          <template v-else-if="activeTab === 'info'">
            <div class="pb-6">
              <h2
                class="mb-6"
                style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
              >
                내 정보
              </h2>
              <div class="grid grid-cols-2 gap-x-6 gap-y-5 mb-6">
                <!-- 이름 (수정 불가) -->
                <div class="flex flex-col gap-1.5">
                  <span :style="labelBase">이름</span>
                  <div
                    :style="infoBoxBase"
                    style="
                      background: #f3f4f6;
                      color: #9ca3af;
                      cursor: not-allowed;
                    "
                  >
                    <span>{{ user.realName }}</span>
                  </div>
                </div>

                <!-- 닉네임 -->
                <div class="flex flex-col gap-1.5">
                  <span :style="labelBase">닉네임</span>
                  <div class="flex justify-between items-center gap-2">
                    <input
                      v-model="editName"
                      :style="[
                        inputBase,
                        {
                          borderColor: nicknameError
                            ? '#ef4444'
                            : 'rgba(178,228,220,0.5)',
                          background: '#ffffff',
                          borderRadius: '4px',
                        },
                      ]"
                      @input="nicknameError = ''"
                    />
                    <button
                      @click="saveInfo"
                      class="px-4 h-[44px] shrink-0 rounded-[4px] bg-teal-500 text-white font-bold text-xs hover:bg-teal-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      :disabled="savingInfo || !isNicknameChanged"
                    >
                      {{ savingInfo ? "저장중" : "변경" }}
                    </button>
                  </div>
                  <p
                    v-if="nicknameError"
                    class="text-xs text-red-500 font-semibold pl-1"
                  >
                    {{ nicknameError }}
                  </p>
                </div>

                <!-- 이메일 (수정 불가 + 가입방식 뱃지) -->
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center gap-2">
                    <span :style="labelBase">이메일</span>
                    <span
                      v-if="user.kakao"
                      style="
                        font-size: 0.65rem;
                        font-weight: 700;
                        background: #fee500;
                        color: #3c1e1e;
                        padding: 2px 8px;
                        border-radius: 999px;
                      "
                    >
                      카카오 로그인
                    </span>
                    <span
                      v-else
                      style="
                        font-size: 0.65rem;
                        font-weight: 700;
                        background: #e8f8f5;
                        color: #3db89e;
                        padding: 2px 8px;
                        border-radius: 999px;
                      "
                    >
                      이메일 가입
                    </span>
                  </div>
                  <div
                    :style="infoBoxBase"
                    style="
                      background: #f3f4f6;
                      color: #9ca3af;
                      cursor: not-allowed;
                    "
                  >
                    <span>{{ user.email }}</span>
                  </div>
                </div>

                <!-- 전화번호 -->
                <div class="flex flex-col gap-1.5">
                  <span :style="labelBase">전화번호</span>
                  <!-- 전화번호 없을 때: 입력 가능 -->
                  <div
                    v-if="!user.phone"
                    class="flex justify-between items-center gap-2"
                  >
                    <input
                      v-model="editPhone"
                      :style="inputBase"
                      style="background: #ffffff; border-radius: 4px"
                      placeholder="전화번호를 입력하세요"
                    />
                    <button
                      @click="savePhone"
                      class="px-4 h-[44px] shrink-0 rounded-[4px] bg-teal-500 text-white font-bold text-xs hover:bg-teal-600 transition-colors"
                      :disabled="savingPhone"
                    >
                      {{ savingPhone ? "저장중" : "변경" }}
                    </button>
                  </div>
                  <!-- 전화번호 있을 때: 수정 불가 -->
                  <div
                    v-else
                    :style="infoBoxBase"
                    style="
                      background: #f3f4f6;
                      color: #9ca3af;
                      cursor: not-allowed;
                    "
                  >
                    <span>{{ user.phone }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 비밀번호 변경 (카카오 유저 숨김) -->
            <div v-if="!user.kakao" class="py-6 border-t border-gray-100">
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
                <!-- 현재 비밀번호 -->
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
                <!-- 새 비밀번호 -->
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
                <p
                  v-if="!isNewPwValid"
                  class="text-xs text-red-500 pl-1 font-semibold"
                >
                  영어, 숫자, 특수문자 포함해서 8자 이상 작성해주세요.
                </p>
                <!-- 새 비밀번호 확인 -->
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

            <!-- FAQ / 1:1문의 버튼 -->
            <div class="py-6 border-t border-gray-100 flex gap-4">
              <button
                @click="
                  router.push('/community?tab=notices&sub=자주 묻는 질문')
                "
                class="flex-1 py-3.5 rounded-[4px] border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-all text-center font-bold text-sm text-gray-700"
              >
                자주 묻는 질문
              </button>
              <button
                @click="router.push('/community?tab=notices&sub=1:1 문의하기')"
                class="flex-1 py-3.5 rounded-[4px] border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-all text-center font-bold text-sm text-gray-700"
              >
                1:1 문의하기
              </button>
            </div>

            <!-- 로그아웃 | 회원탈퇴 -->
            <div class="pt-2 pb-4 flex items-center justify-center gap-3">
              <button
                @click="showLogout = true"
                style="color: #9ca3af; font-size: 0.72rem; font-weight: 600"
              >
                로그아웃
              </button>
              <span style="color: #e5e7eb; font-size: 0.72rem">|</span>
              <button
                @click="showDeleteDialog = true"
                style="color: #9ca3af; font-size: 0.72rem; font-weight: 600"
              >
                회원 탈퇴
              </button>
            </div>
          </template>

          <!-- 엽서 탭 -->
          <template v-else-if="activeTab === 'postcard'">
            <!-- 스탬프 지도 -->
            <div class="pb-6">
              <h2
                class="mb-4"
                style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
              >
                스탬프 지도
              </h2>
              <div
                v-if="stampStore.photos.length === 0"
                class="flex flex-col items-center justify-center h-[200px] rounded-2xl"
                style="background: #f9fafb; border: 1.5px dashed #e5e7eb"
              >
                <span class="text-4xl mb-3">🗺️</span>
                <p style="font-size: 0.85rem; font-weight: 600; color: #9ca3af">
                  인증한 장소가 지도에 표시돼요
                </p>
                <p style="font-size: 0.75rem; color: #d1d5db; margin-top: 4px">
                  스탬프 투어에서 장소를 방문해보세요!
                </p>
              </div>
              <div
                v-else
                class="relative w-full h-[340px] rounded-2xl overflow-hidden"
                style="border: 1px solid rgba(178, 228, 220, 0.4)"
              >
                <div
                  id="postcard-stamp-map"
                  style="width: 100%; height: 100%"
                />
              </div>
            </div>

            <!-- 스탬프 인증 사진 -->
            <div class="py-6 border-t border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h2
                  style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
                >
                  스탬프 인증 사진
                </h2>
                <span class="text-xs text-gray-400 font-medium"
                  >총 {{ stampStore.photos.length }}장</span
                >
              </div>
              <div
                v-if="stampStore.photos.length === 0"
                class="flex flex-col items-center justify-center py-12 rounded-2xl"
                style="background: #f9fafb; border: 1.5px dashed #e5e7eb"
              >
                <span class="text-4xl mb-3">📮</span>
                <p style="font-size: 0.85rem; font-weight: 600; color: #9ca3af">
                  아직 인증한 사진이 없어요
                </p>
                <p style="font-size: 0.75rem; color: #d1d5db; margin-top: 4px">
                  스탬프 투어에서 장소를 인증해보세요!
                </p>
              </div>
              <div
                v-else
                class="grid grid-cols-3 gap-2 overflow-y-auto pr-1 max-h-[420px] custom-scrollbar"
              >
                <div
                  v-for="photo in stampStore.photos"
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
                    <span class="text-[0.7rem] text-white font-medium truncate"
                      >{{ photo.placeEmoji }} {{ photo.placeName }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- 캐릭터 -->
            <div class="pt-6 border-t border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h2
                  style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b"
                >
                  캐릭터
                </h2>
                <span
                  style="font-size: 0.82rem; font-weight: 700; color: #3db89e"
                  >획득 {{ postcardCharacters.length }}명</span
                >
              </div>
              <div
                v-if="postcardCharacters.length === 0"
                class="flex flex-col items-center justify-center py-12 rounded-2xl"
                style="background: #f9fafb; border: 1.5px dashed #e5e7eb"
              >
                <span class="text-4xl mb-3">🌟</span>
                <p style="font-size: 0.85rem; font-weight: 600; color: #9ca3af">
                  아직 함께 찍은 꿈씨패밀리가 없어요
                </p>
                <p style="font-size: 0.75rem; color: #d1d5db; margin-top: 4px">
                  스탬프 투어에서 사진을 인증하면 여기에 모여요!
                </p>
              </div>
              <div v-else class="grid grid-cols-3 gap-3">
                <div
                  v-for="char in postcardCharacters"
                  :key="char.id"
                  @click="activeCharacterDetail = char"
                  class="p-3 rounded-xl border text-center transition-all bg-white border-teal-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                >
                  <img
                    :src="char.imageUrl"
                    :alt="char.imageAlt"
                    class="w-16 h-16 object-contain mx-auto mb-2"
                  />
                  <p
                    class="text-[#1a2e2b] truncate"
                    style="font-size: 0.7rem; font-weight: 700"
                  >
                    {{ char.name }}
                  </p>
                  <p class="truncate" style="font-size:0.62rem;color:#9ca3af;margin-top:2px">
                    {{ char.placeName }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </main>
      </div>
    </div>

    <!-- ─── 모달들 ─── -->
    <Teleport to="body">
      <!-- 장소 상세 모달 -->
      <div
        v-if="selectedPlaceId"
        class="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        @click="selectedPlaceId = null"
      >
        <div
          class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative p-6 flex flex-col"
          style="max-height: 85vh"
          @click.stop
        >
          <div
            class="flex items-center justify-between pb-3 mb-4 border-b border-gray-100"
          >
            <h3 class="text-base font-bold text-gray-800">장소 상세 정보</h3>
            <button
              @click="selectedPlaceId = null"
              class="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
          <div
            class="overflow-y-auto pr-1"
            style="max-height: calc(85vh - 80px)"
          >
            <PlaceDetailContent :id="selectedPlaceId" />
          </div>
        </div>
      </div>
      <!-- 로그아웃 모달 -->
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
              @click="
                auth.logout();
                router.push('/login');
              "
              class="flex-1 py-2 rounded-xl bg-red-500 text-white"
            >
              확인
            </button>
          </div>
        </div>
      </div>

      <!-- 회원탈퇴 모달 -->
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
              @click="
                withdraw();
                showDeleteDialog = false;
              "
              class="flex-1 py-2 rounded-xl bg-gray-800 text-white"
            >
              탈퇴
            </button>
          </div>
        </div>
      </div>

      <!-- 사진 모달 -->
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

      <!-- 캐릭터 상세 모달 -->
      <div
        v-if="activeCharacterDetail"
        class="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
        @click.self="activeCharacterDetail = null"
      >
        <div
          class="bg-white p-6 rounded-2xl w-[340px] shadow-xl border border-teal-50 flex flex-col items-center gap-4"
        >
          <img
            v-if="activeCharacterDetail.imageUrl"
            :src="activeCharacterDetail.imageUrl"
            :alt="activeCharacterDetail.imageAlt || activeCharacterDetail.name"
            class="w-28 h-28 object-contain mt-2"
          />
          <div class="text-center w-full">
            <h3 class="font-bold text-base text-[#1a2e2b] mb-1">
              {{ activeCharacterDetail.name }}
            </h3>
            <p
              v-if="activeCharacterDetail.role"
              class="text-[0.72rem] text-teal-600 font-bold mb-2"
            >
              {{ activeCharacterDetail.role }}
            </p>
            <p class="text-xs text-gray-500 leading-relaxed px-2 break-all">
              {{ activeCharacterDetail.description }}
            </p>
          </div>
          <div
            class="w-full bg-teal-50/50 p-3 rounded-xl border border-teal-100/50"
          >
            <p class="text-[0.68rem] text-teal-700 font-bold mb-2 text-center">
              함께 찍은 인증 장소
            </p>
            <div class="flex items-center gap-3">
              <img
                v-if="activeCharacterDetail.photoUrl"
                :src="activeCharacterDetail.photoUrl"
                alt="함께 찍은 인증 사진"
                class="w-14 h-14 rounded-xl object-cover border border-white shadow-sm"
              />
              <div class="min-w-0 text-left">
                <p class="text-xs font-bold text-[#1a2e2b] truncate">
                  {{ activeCharacterDetail.placeName }}
                </p>
                <p class="text-[0.68rem] text-gray-400 mt-1">
                  이 장소에서 함께 인증했어요.
                </p>
              </div>
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

      <!-- 회고 모달 -->
      <div
        v-if="selectedCourse"
        class="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        @click.self="selectedCourse = null"
      >
        <div
          class="bg-white rounded-2xl w-[480px] max-h-[80vh] overflow-y-auto shadow-2xl"
          style="border: 1.5px solid rgba(178, 228, 220, 0.4)"
        >
          <div
            class="p-5 border-b border-gray-100 flex items-start justify-between gap-3"
          >
            <div>
              <p
                style="font-weight: 800; font-size: 1.05rem; color: #1a2e2b"
                class="leading-snug"
              >
                {{ selectedCourse.subTitle }}
              </p>
              <p style="font-size: 0.8rem; color: #9ca3af; margin-top: 4px">
                {{ formatDate(selectedCourse.createdAt) }}
              </p>
            </div>
            <button
              @click="selectedCourse = null"
              class="shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div class="p-5 flex flex-col gap-5">
            <!-- 여행 정보 칩 -->
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold"
                style="background: #e6f7f4; color: #3db89e"
              >
                {{ travelModeLabel(selectedCourse.travelMode) }}
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                style="background: #f0faf8; color: #6b8c87"
              >
                {{ selectedCourse.durationMinutes }}분
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                style="background: #f0faf8; color: #6b8c87"
              >
                {{ selectedCourse.places.length }}곳
              </span>
            </div>

            <!-- 장소 목록 -->
            <div>
              <p
                style="
                  font-size: 0.78rem;
                  font-weight: 700;
                  color: #6b8c87;
                  margin-bottom: 10px;
                "
              >
                방문 장소
              </p>
              <div class="flex flex-col gap-1.5">
                <template
                  v-for="(place, idx) in selectedCourse.places"
                  :key="place.id"
                >
                  <div
                    class="flex items-center gap-2.5 p-2.5 rounded-xl"
                    style="background: #f9fafb"
                  >
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style="background: #e6f7f4"
                    >
                      <MapPin :size="12" color="#3db89e" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        style="
                          font-size: 0.85rem;
                          font-weight: 600;
                          color: #1a2e2b;
                        "
                        class="truncate"
                      >
                        {{ place.name }}
                      </p>
                      <p style="font-size: 0.7rem; color: #9ca3af">
                        {{ place.category }}
                      </p>
                    </div>
                  </div>
                  <div
                    v-if="idx < selectedCourse!.places.length - 1"
                    class="text-center"
                    style="font-size: 0.75rem; color: #d1d5db"
                  >
                    ↓
                  </div>
                </template>
              </div>
            </div>

            <!-- 확장 포인트 -->
            <div>
              <p
                style="
                  font-size: 0.78rem;
                  font-weight: 700;
                  color: #6b8c87;
                  margin-bottom: 10px;
                "
              >
                여행 기록
              </p>
              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="item in [
                    { icon: '📸', label: '인증 사진' },
                    { icon: '🎖️', label: '획득 엽서' },
                    { icon: '⭐', label: '별점·한줄평' },
                  ]"
                  :key="item.label"
                  class="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border"
                  style="
                    border-color: #e5e7eb;
                    background: #fafafa;
                    opacity: 0.6;
                  "
                >
                  <span class="text-xl">{{ item.icon }}</span>
                  <p
                    style="font-size: 0.72rem; font-weight: 600; color: #9ca3af"
                  >
                    {{ item.label }}
                  </p>
                  <p style="font-size: 0.65rem; color: #d1d5db">준비 중</p>
                </div>
              </div>
            </div>
          </div>
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
.liked-scroll-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 0;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.liked-scroll-container::-webkit-scrollbar {
  display: none;
}
.liked-scroll-inner {
  display: flex;
  gap: 12px;
  width: max-content;
}
</style>
