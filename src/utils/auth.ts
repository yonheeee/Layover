import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useCheckLogin() {
  const auth = useAuthStore()
  const router = useRouter()

  function checkLogin(): boolean {
    if (!auth.isLoggedIn) {
      alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.')
      router.push('/login')
      return false
    }
    return true
  }

  return { checkLogin }
}
