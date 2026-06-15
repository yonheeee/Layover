<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Menu, X } from "lucide-vue-next";
import { useRoute } from "vue-router";

const route = useRoute();
const mobileMenuOpen = ref(false);
const scrolled = ref(false);

function onScroll() {
  scrolled.value = window.scrollY > 10;
}

onMounted(() => window.addEventListener("scroll", onScroll));
onUnmounted(() => window.removeEventListener("scroll", onScroll));

const NAV_LINKS = [
  { label: "홈", to: "/" },
  { label: "지도", to: "/map" },
  { label: "관광지", to: "/place" },
  { label: "커뮤니티", to: "/community" },
  { label: "마이페이지", to: "/mypage" },
];
</script>

<template>
  <nav
    class="z-50 transition-all duration-300"
    :class="scrolled ? 'mobile-scrolled' : 'mobile-top'"
  >
    <div class="transition-all duration-300">
      <div
        class="mx-auto px-6 h-16 flex items-center justify-between"
        style="max-width: 1440px"
      >
        <!-- 로고 -->
        <router-link
          to="/"
          class="flex items-center"
          style="text-decoration: none"
        >
          <img
            src="@/assets/images/logo.png"
            alt="Layover 로고"
            style="height: 36px; width: auto; object-fit: contain"
          />
        </router-link>

        <!-- 데스크탑 네비게이션 -->
        <div class="hidden md:flex items-center gap-1">
          <router-link
            v-for="link in NAV_LINKS"
            :key="link.label"
            :to="link.to"
            class="px-4 py-2 rounded-xl transition-all duration-200 text-sm"
            :style="{
              color: route.path === link.to ? '#3db89e' : '#1a2e2b',
              fontWeight: route.path === link.to ? 600 : 400,
              background:
                route.path === link.to
                  ? 'rgba(232,248,245,0.8)'
                  : 'transparent',
              textDecoration: 'none',
            }"
            >{{ link.label }}</router-link
          >
        </div>

        <!-- 데스크탑 CTA -->
        <div class="hidden md:flex items-center gap-3">
          <router-link
            to="/login"
            class="px-4 py-2 rounded-xl text-sm"
            style="color: #6b8c87; font-weight: 500; text-decoration: none"
            >로그인</router-link
          >
          <router-link
            to="/signup"
            class="px-5 py-2.5 rounded-xl text-sm text-white hover:opacity-90 transition-opacity"
            style="
              background: linear-gradient(135deg, #b2e4dc, #3db89e);
              font-weight: 600;
              box-shadow: 0 4px 14px rgba(61, 184, 158, 0.3);
              text-decoration: none;
            "
            >무료 시작</router-link
          >
        </div>

        <!-- 모바일 햄버거 -->
        <button
          class="md:hidden p-2 rounded-lg"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" :size="22" color="#3db89e" />
          <Menu v-else :size="22" color="#1a2e2b" />
        </button>
      </div>
    </div>

    <!-- 모바일 드롭다운 메뉴 -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden px-6 py-4 flex flex-col gap-1"
      style="
        border-top: 1px solid rgba(178, 228, 220, 0.3);
        background: #ffffff;
      "
    >
      <router-link
        v-for="link in NAV_LINKS"
        :key="link.label"
        :to="link.to"
        class="py-3 px-4 rounded-xl text-sm block text-right"
        :style="{
          color: route.path === link.to ? '#3db89e' : '#1a2e2b',
          background: route.path === link.to ? '#E8F8F5' : 'transparent',
          fontWeight: route.path === link.to ? 600 : 400,
          textDecoration: 'none',
        }"
        @click="mobileMenuOpen = false"
        >{{ link.label }}</router-link
      >

      <div class="flex gap-3 pt-3">
        <router-link
          to="/login"
          class="flex-1 py-2.5 rounded-xl text-sm text-center"
          style="
            border: 1.5px solid rgba(178, 228, 220, 0.5);
            color: #6b8c87;
            text-decoration: none;
          "
          @click="mobileMenuOpen = false"
          >로그인</router-link
        >
        <router-link
          to="/signup"
          class="flex-1 py-2.5 rounded-xl text-sm text-white text-center"
          style="
            background: linear-gradient(135deg, #b2e4dc, #3db89e);
            text-decoration: none;
            font-weight: 600;
          "
          @click="mobileMenuOpen = false"
          >무료 시작</router-link
        >
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* PC: static, 완전 흰색, 안 따라다님 */
@media (min-width: 768px) {
  nav {
    position: relative;
    background: #ffffff;
    border-bottom: 1px solid rgba(178, 228, 220, 0.2);
    box-shadow: none;
  }
}

/* 모바일: sticky */
@media (max-width: 767px) {
  nav {
    position: sticky;
    top: 0;
  }

  nav.mobile-top {
    background: #ffffff;
    border-bottom: 1px solid rgba(178, 228, 220, 0.2);
    box-shadow: none;
  }

  nav.mobile-scrolled {
    background: rgba(240, 250, 248, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(61, 184, 158, 0.2);
    box-shadow: 0 2px 16px rgba(61, 184, 158, 0.15);
  }
}
</style>
