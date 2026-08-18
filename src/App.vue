<script setup lang="ts">
import { useBookmarkStore } from '@/stores/bookmark'
import { useCourseStore } from '@/stores/course'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'
import ChatDock from './components/chat/ChatDock.vue'
import ToastHost from './components/common/ToastHost.vue'

const route = useRoute()
const showFooter = computed(() => route.path === '/')
const isCompactMobilePage = computed(() => route.path === '/login')

const bookmarkStore = useBookmarkStore()
const courseStore = useCourseStore()

onMounted(() => {
  if (localStorage.getItem('accessToken')) {
    bookmarkStore.fetchBookmarks()
    courseStore.checkConfirmedCourse()
  }
})
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col" style="font-family: 'Noto Sans KR', 'Nunito', sans-serif">
    <AppHeader />
    <main class="app-main flex-1" :class="{ 'app-main--compact-mobile': isCompactMobilePage }">
      <router-view />
    </main>
    <ChatDock />
    <ToastHost />
    <AppFooter v-if="showFooter" class="app-footer" />
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .app-main {
    box-sizing: border-box;
    padding-bottom: var(--mobile-bottom-nav-height);
  }

  .app-main--compact-mobile {
    min-height: calc(100dvh - var(--mobile-bottom-nav-height));
    overflow: auto;
  }

  .app-footer {
    display: none;
  }
}

@media (max-width: 420px) {
  .app-main {
    padding-bottom: var(--mobile-bottom-nav-height);
  }

  .app-main--compact-mobile {
    min-height: calc(100dvh - var(--mobile-bottom-nav-height));
  }
}
</style>
