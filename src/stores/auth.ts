import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import type { User } from "@/types/user";
import { login as loginApi, getKakaoAuthUrl } from "@/api/auth";
import { useBookmarkStore } from "./bookmark";
import { useCourseStore } from "./course";
import { useStampStore } from "./stamp";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(localStorage.getItem("accessToken"));
  const refreshToken = ref<string | null>(localStorage.getItem("refreshToken"));
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => !!accessToken.value);

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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    useBookmarkStore().$reset();
    useCourseStore().reset();
    useStampStore().clearPhotos();
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
    login,
    logout,
    kakaoLogin,
    handleKakaoCallback,
  };
});
