<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Lock, Eye, EyeOff, Train } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const loginId = ref('')
const loginPw = ref('')
const showPw = ref(false)
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12" style="background: linear-gradient(155deg, #E8F8F5 0%, #ffffff 60%, #f0faf8 100%)">
    <div class="w-full rounded-3xl overflow-hidden" style="max-width: 440px; background: #ffffff; box-shadow: 0 24px 80px rgba(26,46,43,0.1), 0 4px 16px rgba(178,228,220,0.3)">
      <!-- Header -->
      <div class="px-8 py-6" style="background: linear-gradient(135deg, #E8F8F5, #f0faf8); border-bottom: 1px solid rgba(178,228,220,0.4)">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
            <Train :size="15" color="#fff" />
          </div>
          <span style="font-weight: 700; font-size: 1.15rem; color: #1a2e2b">로그인</span>
        </div>
      </div>

      <!-- Form -->
      <div class="px-8 py-8 flex flex-col gap-5">
        <!-- 아이디 -->
        <div class="flex flex-col gap-1.5">
          <label style="font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em">아이디 (이메일)</label>
          <div class="relative">
            <Mail :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
            <input
              v-model="loginId"
              type="email"
              placeholder="example@email.com"
              style="width:100%;padding:12px 16px 12px 40px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.92rem;outline:none"
            />
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="flex flex-col gap-1.5">
          <label style="font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em">비밀번호</label>
          <div class="relative">
            <Lock :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
            <input
              v-model="loginPw"
              :type="showPw ? 'text' : 'password'"
              placeholder="비밀번호 입력"
              style="width:100%;padding:12px 44px 12px 40px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.92rem;outline:none"
            />
            <button style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#6b8c87;display:flex" @click="showPw = !showPw">
              <EyeOff v-if="showPw" :size="16" /><Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <!-- 링크 -->
        <div class="flex justify-end gap-4">
          <router-link to="/find-id" style="color:#3db89e;font-weight:600;font-size:0.82rem;text-decoration:underline;text-underline-offset:3px">아이디 찾기</router-link>
          <router-link to="/find-password" style="color:#3db89e;font-weight:600;font-size:0.82rem;text-decoration:underline;text-underline-offset:3px">비밀번호 찾기</router-link>
        </div>

        <!-- 로그인 버튼 -->
        <button style="width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(61,184,158,0.3)">
          로그인
        </button>

        <!-- 구분선 -->
        <div style="display:flex;align-items:center;gap:12px">
          <div style="flex:1;height:1px;background:rgba(178,228,220,0.5)" />
          <span style="font-size:0.78rem;color:#6b8c87;white-space:nowrap">또는</span>
          <div style="flex:1;height:1px;background:rgba(178,228,220,0.5)" />
        </div>

        <!-- 카카오 -->
        <button class="w-full flex items-center justify-center gap-2.5 py-3.5 transition-opacity hover:opacity-90" style="background:#FEE500;border:none;cursor:pointer;font-weight:700;font-size:0.92rem;color:#3C1E1E;border-radius:14px">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 3C7.03 3 3 6.36 3 10.5c0 2.62 1.64 4.93 4.13 6.3L6.1 20.13c-.08.26.2.47.43.33L10.8 17.9c.39.05.79.08 1.2.08 4.97 0 9-3.36 9-7.5S16.97 3 12 3z" fill="#3C1E1E" />
          </svg>
          카카오로 시작하기
        </button>

        <p class="text-center" style="font-size:0.82rem;color:#6b8c87">
          아직 계정이 없으신가요?
          <router-link to="/signup" style="color:#3db89e;font-weight:600;text-decoration:underline;text-underline-offset:3px">회원가입</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
