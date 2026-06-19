import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { login as loginApi, getKakaoAuthUrl } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!accessToken.value)

  async function login(email: string, password: string): Promise<void> {
    const res = await loginApi(email, password)
    if (!res.success) {
      throw new Error(res.message)
    }
    accessToken.value = res.data.accessToken
    refreshToken.value = res.data.refreshToken
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  async function kakaoLogin(): Promise<void> {
    const res = await getKakaoAuthUrl()
    if (!res.success) throw new Error(res.message)
    window.location.href = res.data
  }

  function handleKakaoCallback(token: string, refresh: string): void {
    accessToken.value = token
    refreshToken.value = refresh
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refresh)
  }

  return { accessToken, refreshToken, user, isLoggedIn, login, logout, kakaoLogin, handleKakaoCallback }
})
