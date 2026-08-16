<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import {
  Home,
  LogIn,
  MapPinned,
  MessageSquareText,
  Sparkles,
  Stamp,
  UserRound,
} from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const auth = useAuthStore();
const router = useRouter();
const scrolled = ref(false);

const ui = {
  logoAlt: "Layover \ub85c\uace0",
  logout: "\ub85c\uadf8\uc544\uc6c3",
  login: "\ub85c\uadf8\uc778",
  signup: "\ubb34\ub8cc \uc2dc\uc791",
};

function onScroll() {
  scrolled.value = window.scrollY > 10;
}

onMounted(() => window.addEventListener("scroll", onScroll));
onUnmounted(() => window.removeEventListener("scroll", onScroll));

const ALL_NAV_LINKS = [
  { label: "\ud648", to: "/", icon: Home },
  { label: "\uad00\uad11\uc9c0", to: "/place", icon: MapPinned },
  { label: "\ucee4\ubba4\ub2c8\ud2f0", to: "/community", icon: MessageSquareText },
  { label: "\uc2a4\ud0ec\ud504", to: "/stamp-tour", icon: Stamp },
  { label: "\ub9c8\uc774\ud398\uc774\uc9c0", to: "/mypage", icon: UserRound, authOnly: true },
];

const NAV_LINKS = computed(() =>
  ALL_NAV_LINKS.filter((link) => !link.authOnly || auth.isLoggedIn),
);

const mobileAuthLink = computed(() =>
  auth.isLoggedIn
    ? { label: "\ub9c8\uc774", to: "/mypage", icon: UserRound, authOnly: true }
    : { label: "\ub85c\uadf8\uc778", to: "/login", icon: LogIn },
);

const MOBILE_NAV_LINKS = computed(() => {
  const mainLinks = NAV_LINKS.value.filter((link) => link.to !== "/mypage");
  return [...mainLinks.slice(0, 4), mobileAuthLink.value];
});

function isActiveLink(link: (typeof ALL_NAV_LINKS)[number]) {
  return route.path === link.to;
}

function handleLogout() {
  auth.logout();
  router.push("/");
}
</script>

<template>
  <nav
    class="app-header"
    :class="{ 'app-header--scrolled': scrolled }"
    aria-label="Primary navigation"
  >
    <div class="app-header__inner">
      <router-link to="/" class="app-header__logo">
        <img src="@/assets/images/logo.png" :alt="ui.logoAlt" />
      </router-link>

      <div class="app-header__nav-links">
        <router-link
          v-for="link in NAV_LINKS"
          :key="link.label"
          :to="link.to"
          class="app-header__nav-link"
          :class="{ 'app-header__nav-link--active': isActiveLink(link) }"
        >
          {{ link.label }}
        </router-link>
      </div>

      <div class="app-header__actions">
        <button
          v-if="auth.isLoggedIn"
          class="app-header__text-button"
          type="button"
          @click="handleLogout"
        >
          {{ ui.logout }}
        </button>
        <template v-else>
          <router-link to="/login" class="app-header__text-link">
            {{ ui.login }}
          </router-link>
          <router-link to="/signup" class="app-header__primary-link">
            <Sparkles :size="14" stroke-width="2.2" />
            {{ ui.signup }}
          </router-link>
        </template>
      </div>
    </div>
  </nav>

  <nav class="mobile-bottom-nav" aria-label="Mobile navigation">
    <router-link
      v-for="link in MOBILE_NAV_LINKS"
      :key="link.label"
      :to="link.to"
      class="mobile-bottom-nav__item"
      :class="{ 'mobile-bottom-nav__item--active': isActiveLink(link) }"
    >
      <component :is="link.icon" :size="20" stroke-width="2.15" />
      <span>{{ link.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.app-header {
  position: relative;
  z-index: 50;
  background: #ffffff;
  border-bottom: 1px solid rgba(178, 228, 220, 0.2);
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.app-header--scrolled {
  box-shadow: 0 2px 16px rgba(61, 184, 158, 0.08);
}

.app-header__inner {
  display: flex;
  width: min(100%, 1440px);
  height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 0 auto;
  padding: 0 24px;
}

.app-header__logo {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  text-decoration: none;
}

.app-header__logo img {
  width: auto;
  height: 36px;
  object-fit: contain;
}

.app-header__nav-links,
.app-header__actions {
  display: flex;
  align-items: center;
}

.app-header__nav-links {
  min-width: 0;
  justify-content: center;
  gap: 4px;
}

.app-header__actions {
  justify-content: flex-end;
  gap: 12px;
}

.app-header__nav-link,
.app-header__text-link,
.app-header__primary-link,
.app-header__text-button {
  min-height: 40px;
  align-items: center;
  border-radius: 12px;
  font-size: 0.875rem;
  text-decoration: none;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    opacity 0.18s ease;
}

.app-header__nav-link {
  display: inline-flex;
  padding: 0 16px;
  color: #1a2e2b;
  font-weight: 400;
}

.app-header__nav-link--active {
  background: rgba(232, 248, 245, 0.8);
  color: #3db89e;
  font-weight: 600;
}

.app-header__text-link,
.app-header__text-button {
  display: inline-flex;
  padding: 0 16px;
  color: #6b8c87;
  font-weight: 500;
}

.app-header__text-button {
  border: 0;
  background: none;
  cursor: pointer;
}

.app-header__primary-link {
  display: inline-flex;
  gap: 6px;
  padding: 0 16px;
  background: linear-gradient(135deg, #b2e4dc, #3db89e);
  color: #ffffff;
  font-weight: 700;
}

.mobile-bottom-nav {
  display: none;
}

@media (max-width: 1024px) {
  .app-header__inner {
    gap: 14px;
    padding: 0 20px;
  }

  .app-header__nav-link {
    padding: 0 12px;
    font-size: 0.82rem;
  }

  .app-header__primary-link,
  .app-header__text-link,
  .app-header__text-button {
    padding: 0 12px;
    font-size: 0.82rem;
  }
}

@media (max-width: 640px) {
  .app-header {
    display: none;
  }

  .mobile-bottom-nav {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 50;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0;
    width: 100%;
    min-width: 360px;
    height: var(--mobile-bottom-nav-height);
    min-height: var(--mobile-bottom-nav-height);
    padding:
      6px max(6px, env(safe-area-inset-right, 0px))
      calc(6px + env(safe-area-inset-bottom, 0px))
      max(6px, env(safe-area-inset-left, 0px));
    border-top: 1px solid rgba(178, 228, 220, 0.45);
    background: #ffffff;
  }

  .mobile-bottom-nav__item {
    display: flex;
    min-width: 0;
    min-height: 52px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border-radius: 0;
    color: #6b8c87;
    font-size: 0.66rem;
    font-weight: 800;
    line-height: 1.1;
    text-decoration: none;
  }

  .mobile-bottom-nav__item svg {
    flex: 0 0 auto;
  }

  .mobile-bottom-nav__item span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-bottom-nav__item--active {
    background: #e8f8f5;
    color: #3db89e;
  }
}

@media (max-width: 420px) {
  .mobile-bottom-nav {
    height: var(--mobile-bottom-nav-height);
    min-height: var(--mobile-bottom-nav-height);
    padding:
      5px max(4px, env(safe-area-inset-right, 0px))
      calc(5px + env(safe-area-inset-bottom, 0px))
      max(4px, env(safe-area-inset-left, 0px));
  }

  .mobile-bottom-nav__item {
    min-height: 52px;
    font-size: 0.6rem;
  }
}
</style>
