<script setup lang="ts">
import { useBookmarkStore } from '@/stores/bookmark'
import { useCourseStore } from '@/stores/course'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'

const route = useRoute()
const showFooter = computed(() => route.path === '/')

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
    <main class="app-main flex-1">
      <router-view />
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .app-main {
    padding-bottom: calc(92px + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 420px) {
  .app-main {
    padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
