<script setup lang="ts">
import { ref, computed } from "vue";
import { Mail, Lock, Eye, EyeOff, Train } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();
const loginId = ref("");
const loginPw = ref("");
const showPw = ref(false);

// 🌟 [추가] 사용자가 입력을 시도했거나 폼을 제출했는지 여부 확인 플래그
const isIdTouched = ref(false);
const isPwTouched = ref(false);

// 🌟 [추가] 1. 아이디(이메일) 유효성 검사 로직
const isIdValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(loginId.value);
});

// 🌟 [추가] 2. 비밀번호 유효성 검사 로직 (영어, 특수문자, 숫자 포함 8자 이상)
const isPwValid = computed(() => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(loginPw.value);
});

// 🌟 [추가] 아이디 에러 노출 조건 (값이 있고, 형식이 틀렸거나, 포커스를 잃었을 때 등)
const showIdError = computed(() => {
  return isIdTouched.value && loginId.value.length > 0 && !isIdValid.value;
});

// 🌟 [추가] 비밀번호 에러 노출 조건
const showPwError = computed(() => {
  return isPwTouched.value && loginPw.value.length > 0 && !isPwValid.value;
});

// 로그인 버튼 클릭 시 전체 검사
const handleLogin = async () => {
  isIdTouched.value = true;
  isPwTouched.value = true;

  if (isIdValid.value && isPwValid.value) {
    await auth.login(loginId.value, loginPw.value);
    router.push("/");
  }
};
</script>

<template>
  <div
    class="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12"
    style="
      background: linear-gradient(
        155deg,
        #e8f8f5 0%,
        #ffffff 60%,
        #f0faf8 100%
      );
    "
  >
    <div class="w-full" style="max-width: 400px; background: transparent">
      <div class="pb-8 flex flex-col items-center justify-center gap-3">
        <div
          class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
          style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
        >
          <Train :size="18" color="#fff" />
        </div>
        <h2
          style="
            font-weight: 800;
            font-size: 1.6rem;
            color: #1a2e2b;
            letter-spacing: -0.02em;
          "
        >
          로그인
        </h2>
      </div>

      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label
            style="
              font-size: 0.8rem;
              font-weight: 600;
              color: #6b8c87;
              letter-spacing: 0.03em;
            "
            >아이디 (이메일)</label
          >
          <div class="relative">
            <Mail
              :size="15"
              color="#B2E4DC"
              style="
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
              "
            />
            <input
              v-model="loginId"
              type="email"
              placeholder="example@email.com"
              @blur="isIdTouched = true"
              :style="{
                width: '100%',
                padding: '12px 16px 12px 40px',
                borderRadius: '14px',
                border: showIdError
                  ? '1.5px solid #ff4d4f'
                  : '1.5px solid rgba(178,228,220,0.5)',
                background: '#ffffff',
                color: '#1a2e2b',
                fontSize: '0.92rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }"
            />
          </div>
          <p
            v-if="showIdError"
            style="
              font-size: 0.78rem;
              color: #ff4d4f;
              margin: 2px 0 0 4px;
              font-weight: 500;
            "
          >
            알맞은 형식으로 입력해주세요. (예시: daejeon@layover.com)
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label
            style="
              font-size: 0.8rem;
              font-weight: 600;
              color: #6b8c87;
              letter-spacing: 0.03em;
            "
            >비밀번호</label
          >
          <div class="relative">
            <Lock
              :size="15"
              color="#B2E4DC"
              style="
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
              "
            />
            <input
              v-model="loginPw"
              :type="showPw ? 'text' : 'password'"
              placeholder="비밀번호 입력"
              @blur="isPwTouched = true"
              :style="{
                width: '100%',
                padding: '12px 44px 12px 40px',
                borderRadius: '14px',
                border: showPwError
                  ? '1.5px solid #ff4d4f'
                  : '1.5px solid rgba(178,228,220,0.5)',
                background: '#ffffff',
                color: '#1a2e2b',
                fontSize: '0.92rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }"
            />
            <button
              style="
                position: absolute;
                right: 14px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                color: #6b8c87;
                display: flex;
              "
              @click="showPw = !showPw"
            >
              <EyeOff v-if="showPw" :size="16" /><Eye v-else :size="16" />
            </button>
          </div>
          <p
            v-if="showPwError"
            style="
              font-size: 0.78rem;
              color: #ff4d4f;
              margin: 2px 0 0 4px;
              font-weight: 500;
            "
          >
            영어, 특수문자, 숫자를 포함해 8자 이상 입력해주세요.
          </p>
        </div>

        <div class="flex justify-end gap-4">
          <router-link
            to="/find-id"
            style="
              color: #3db89e;
              font-weight: 600;
              font-size: 0.82rem;
              text-decoration: underline;
              text-underline-offset: 3px;
            "
            >아이디 찾기</router-link
          >
          <router-link
            to="/find-password"
            style="
              color: #3db89e;
              font-weight: 600;
              font-size: 0.82rem;
              text-decoration: underline;
              text-underline-offset: 3px;
            "
            >비밀번호 찾기</router-link
          >
        </div>

        <button
          @click="handleLogin"
          style="
            width: 100%;
            padding: 13px;
            border-radius: 14px;
            background: linear-gradient(135deg, #b2e4dc, #3db89e);
            color: #fff;
            font-weight: 700;
            font-size: 0.95rem;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(61, 184, 158, 0.3);
          "
        >
          로그인
        </button>

        <div style="display: flex; align-items: center; gap: 12px">
          <div
            style="flex: 1; height: 1px; background: rgba(178, 228, 220, 0.5)"
          />
          <span style="font-size: 0.78rem; color: #6b8c87; white-space: nowrap"
            >또는</span
          >
          <div
            style="flex: 1; height: 1px; background: rgba(178, 228, 220, 0.5)"
          />
        </div>

        <button
          class="w-full flex items-center justify-center gap-2.5 py-3.5 transition-opacity hover:opacity-90"
          style="
            background: #fee500;
            border: none;
            cursor: pointer;
            font-weight: 700;
            font-size: 0.92rem;
            color: #3c1e1e;
            border-radius: 14px;
          "
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C7.03 3 3 6.36 3 10.5c0 2.62 1.64 4.93 4.13 6.3L6.1 20.13c-.08.26.2.47.43.33L10.8 17.9c.39.05.79.08 1.2.08 4.97 0 9-3.36 9-7.5S16.97 3 12 3z"
              fill="#3C1E1E"
            />
          </svg>
          카카오로 시작하기
        </button>

        <p class="text-center" style="font-size: 0.82rem; color: #6b8c87">
          아직 계정이 없으신가요?
          <router-link
            to="/signup"
            style="
              color: #3db89e;
              font-weight: 600;
              text-decoration: underline;
              text-underline-offset: 3px;
            "
            >회원가입</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>
