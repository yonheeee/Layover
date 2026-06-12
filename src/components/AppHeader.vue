<script setup lang="ts">
import { ref } from 'vue'
import { Train, Menu, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const mobileMenuOpen = ref(false)

const NAV_LINKS = [
  { label: '홈', to: '/' },
  { label: '지도', to: '/map' },
  { label: '커뮤니티', to: '/community' },
  { label: '마이페이지', to: '/mypage' },
]
</script>

<template>
  <nav
    class="sticky top-0 z-50"
    :style="{
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(178,228,220,0.35)',
      boxShadow: '0 1px 20px rgba(178,228,220,0.15)',
    }"
  >
    <div class="mx-auto px-8 h-16 flex items-center justify-between" style="max-width: 1440px">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2.5" style="text-decoration: none">
        <div
          class="w-8 h-8 rounded-xl flex items-center justify-center"
          style="background: linear-gradient(135deg, #B2E4DC, #3db89e)"
        >
          <Train :size="15" color="#fff" />
        </div>
        <span
          :style="{
            fontFamily: '\'Nunito\', sans-serif',
            fontWeight: 800,
            fontSize: '1.2rem',
            color: '#1a2e2b',
            letterSpacing: '-0.02em',
          }"
        >
          대전 <span style="color: #3db89e">레이오버</span>
        </span>
      </router-link>

      <!-- Desktop nav links -->
      <div class="hidden md:flex items-center gap-1">
        <router-link
          v-for="link in NAV_LINKS"
          :key="link.label"
          :to="link.to"
          class="px-4 py-2 rounded-xl transition-all duration-200"
          :style="{
            color: $route.path === link.to ? '#3db89e' : '#6b8c87',
            fontWeight: $route.path === link.to ? 600 : 400,
            background: $route.path === link.to ? '#E8F8F5' : 'transparent',
            fontSize: '0.95rem',
            textDecoration: 'none',
          }"
        >{{ link.label }}</router-link>
      </div>

      <!-- Desktop CTA -->
      <div class="hidden md:flex items-center gap-3">
        <router-link
          to="/login"
          class="px-4 py-2 rounded-xl text-sm transition-colors"
          style="color: #6b8c87; font-weight: 500; text-decoration: none"
        >로그인</router-link>
        <router-link
          to="/signup"
          class="px-5 py-2.5 rounded-xl text-sm text-white transition-all duration-200 hover:opacity-90"
          :style="{
            background: 'linear-gradient(135deg, #B2E4DC, #3db89e)',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(61,184,158,0.3)',
            textDecoration: 'none',
          }"
        >무료 시작</router-link>
      </div>

      <!-- Mobile toggle -->
      <button class="md:hidden p-2 rounded-lg" @click="mobileMenuOpen = !mobileMenuOpen">
        <X v-if="mobileMenuOpen" :size="22" color="#3db89e" />
        <Menu v-else :size="22" color="#3db89e" />
      </button>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden px-6 py-4 flex flex-col gap-2"
      style="border-top: 1px solid rgba(178,228,220,0.3); background: #fff"
    >
      <router-link
        v-for="link in NAV_LINKS"
        :key="link.label"
        :to="link.to"
        class="py-3 px-4 rounded-xl"
        :style="{
          color: $route.path === link.to ? '#3db89e' : '#6b8c87',
          background: $route.path === link.to ? '#E8F8F5' : 'transparent',
          fontWeight: $route.path === link.to ? 600 : 400,
          textDecoration: 'none',
        }"
        @click="mobileMenuOpen = false"
      >{{ link.label }}</router-link>
      <div class="flex gap-3 pt-2">
        <router-link to="/login" class="flex-1 py-2.5 rounded-xl text-sm text-center" style="border: 1.5px solid rgba(178,228,220,0.5); color: #6b8c87; text-decoration: none" @click="mobileMenuOpen = false">로그인</router-link>
        <router-link to="/signup" class="flex-1 py-2.5 rounded-xl text-sm text-white text-center" style="background: linear-gradient(135deg, #B2E4DC, #3db89e); text-decoration: none; font-weight: 600" @click="mobileMenuOpen = false">무료 시작</router-link>
      </div>
    </div>
  </nav>
</template>
