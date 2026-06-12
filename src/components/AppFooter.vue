<script setup lang="ts">
import { Train } from 'lucide-vue-next'
</script>

<template>
  <footer style="border-top: 1px solid rgba(178,228,220,0.3); background: #f0faf8">
    <div
      class="mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
      style="max-width: 1440px"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 rounded-lg flex items-center justify-center"
          style="background: linear-gradient(135deg, #B2E4DC, #3db89e)"
        >
          <Train :size="12" color="#fff" />
        </div>
        <span style="font-weight: 700; color: #1a2e2b; font-size: 0.9rem">대전 레이오버</span>
      </div>
      <p style="font-size: 0.78rem; color: #6b8c87">© 2026 대전 레이오버. 환승 여행을 더 스마트하게.</p>
      <div class="flex gap-5">
        <a
          v-for="item in ['이용약관', '개인정보처리방침', '문의하기']"
          :key="item"
          href="#"
          style="font-size: 0.78rem; color: #6b8c87; text-decoration: none; transition: color 0.2s"
          @mouseenter="($event.target as HTMLElement).style.color = '#3db89e'"
          @mouseleave="($event.target as HTMLElement).style.color = '#6b8c87'"
        >{{ item }}</a>
      </div>
    </div>
  </footer>
</template>
