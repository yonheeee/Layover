<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useBookmarkStore } from '@/stores/bookmark'

const route = useRoute()
const showFooter = computed(() => route.path === '/')

const bookmarkStore = useBookmarkStore()

onMounted(() => {
  if (localStorage.getItem('accessToken')) {
    bookmarkStore.fetchBookmarks()
  }
})
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col" style="font-family: 'Noto Sans KR', 'Nunito', sans-serif">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>
