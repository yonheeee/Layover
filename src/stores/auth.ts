import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import type { User } from "@/types/user";
import { login as loginApi, getKakaoAuthUrl } from "@/api/auth";
import { fetchUser } from "@/api/user";
import { useBookmarkStore } from "./bookmark";
import { useCourseStore } from "./course";
import { useStampStore } from "./stamp";
import { clearUserScopedStorage } from "@/utils/storage";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(localStorage.getItem("accessToken"));
  const refreshToken = ref<string | null>(localStorage.getItem("refreshToken"));
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => !!accessToken.value);

  // null = 아직 서버에 확인하지 않음, true/false = 서버에서 받아온 값
  const profileComplete = ref<boolean | null>(null);
  let profileCheckPromise: Promise<void> | null = null;

  const userId = computed<string | null>(() => {
    if (!accessToken.value) return null;
    try {
      const payload = jwtDecode<{ sub: string }>(accessToken.value);
      return payload.sub ?? null;
    } catch {
      return null;
    }
  });

  const nickname = computed<string | null>(() => {
    if (!accessToken.value) return null;
    try {
      const payload = jwtDecode<{ nickname?: string; username?: string }>(
        accessToken.value,
      );
      return payload.nickname ?? payload.username ?? null;
    } catch {
      return null;
    }
  });

  async function login(email: string, password: string): Promise<void> {
    const res = await loginApi(email, password);
    if (!res.success) {
      throw new Error(res.message);
    }
    accessToken.value = res.data.accessToken;
    refreshToken.value = res.data.refreshToken;
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    await useBookmarkStore().fetchBookmarks();
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    profileComplete.value = null;
    clearUserScopedStorage();
    useBookmarkStore().$reset();
    useCourseStore().reset();
    useStampStore().clearActiveCourse();
  }

  /**
   * profileComplete 를 서버에서 받아와 캐시한다.
   *
   * 라우터 가드가 매 이동마다 호출하므로, 이미 값을 알고 있거나(null 이 아님)
   * 이미 요청이 진행 중이면 새로 요청하지 않는다. 실패 시에는 profileComplete 를
   * 건드리지 않고 그냥 반환한다 — 네트워크 오류로 사용자를 프로필 화면에
   * 가둬서는 안 되기 때문이다.
   */
  async function ensureProfileState(): Promise<void> {
    if (!isLoggedIn.value) return;
    if (profileComplete.value !== null) return;
    if (profileCheckPromise) return profileCheckPromise;

    profileCheckPromise = (async () => {
      try {
        const fetchedUser = await fetchUser();
        profileComplete.value = fetchedUser.profileComplete;
      } catch {
        // 네트워크 오류: profileComplete 를 건드리지 않고 통과시킨다.
      } finally {
        profileCheckPromise = null;
      }
    })();

    return profileCheckPromise;
  }

  function markProfileComplete() {
    profileComplete.value = true;
  }

  async function kakaoLogin(): Promise<void> {
    const res = await getKakaoAuthUrl();
    if (!res.success) throw new Error(res.message);
    window.location.href = res.data;
  }

  async function handleKakaoCallback(
    token: string,
    refresh: string,
  ): Promise<void> {
    profileComplete.value = null; // 계정이 바뀌므로 이전 캐시를 버린다
    accessToken.value = token;
    refreshToken.value = refresh;
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refresh);
    await useBookmarkStore().fetchBookmarks();
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    userId,
    nickname,
    profileComplete,
    login,
    logout,
    kakaoLogin,
    handleKakaoCallback,
    ensureProfileState,
    markProfileComplete,
  };
});
