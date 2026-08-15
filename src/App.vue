<script setup lang="ts">
import { useBookmarkStore } from '@/stores/bookmark'
import { useCourseStore } from '@/stores/course'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'

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
    <AppFooter v-if="showFooter" class="app-footer" />
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .app-main {
    padding-bottom: 0;
  }

  .app-main--compact-mobile {
    min-height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
    padding-bottom: 0;
    overflow: hidden;
  }

  .app-footer {
    display: none;
  }
}

@media (max-width: 420px) {
  .app-main {
    padding-bottom: 0;
  }

  .app-main--compact-mobile {
    min-height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
    padding-bottom: 0;
  }
}
</style>
