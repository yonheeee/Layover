<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  X, Eye, EyeOff, Mail, Lock, User,
  CheckCircle, AlertCircle, Train, Phone,
} from 'lucide-vue-next'

type AuthView = 'login' | 'signup' | 'findId' | 'findIdResult' | 'findPassword' | 'resetPassword'

const emit = defineEmits<{ close: [] }>()

const view = ref<AuthView>('login')

// login
const loginId = ref('')
const loginPw = ref('')
const showLoginPw = ref(false)

// signup
const signupName = ref('')
const signupEmail = ref('')
const emailCode = ref('')
const emailCodeSent = ref(false)
const emailCodeVerified = ref(false)
const emailDuplChecked = ref<null | boolean>(null)
const signupPw = ref('')
const signupPwConfirm = ref('')
const showSignupPw = ref(false)
const showSignupPwC = ref(false)

// find id
const findIdName = ref('')
const findIdEmail = ref('')
const findIdCode = ref('')
const findIdCodeSent = ref(false)
const foundId = ref('')

// find password
const findPwId = ref('')
const findPwEmail = ref('')
const findPwCodeSent = ref(false)
const findPwCode = ref('')
const findPwCodeVerified = ref(false)

// reset password
const newPw = ref('')
const newPwConfirm = ref('')
const showNewPw = ref(false)
const showNewPwC = ref(false)
const resetDone = ref(false)

const pwMatch = computed(() => signupPw.value && signupPwConfirm.value && signupPw.value === signupPwConfirm.value)
const pwMismatch = computed(() => signupPwConfirm.value && signupPw.value !== signupPwConfirm.value)
const newPwMatch = computed(() => newPw.value && newPwConfirm.value && newPw.value === newPwConfirm.value)
const newPwMismatch = computed(() => newPwConfirm.value && newPw.value !== newPwConfirm.value)

const titles: Record<AuthView, string> = {
  login: '로그인',
  signup: '회원가입',
  findId: '아이디 찾기',
  findIdResult: '아이디 찾기',
  findPassword: '비밀번호 찾기',
  resetPassword: '새 비밀번호 설정',
}

const inputBase = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '14px',
  border: '1.5px solid rgba(178,228,220,0.5)',
  background: '#f0faf8',
  color: '#1a2e2b',
  fontSize: '0.92rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
}

const btnPrimary = {
  width: '100%',
  padding: '13px',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #B2E4DC, #3db89e)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.95rem',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(61,184,158,0.3)',
  transition: 'opacity 0.2s',
}

const btnOutline = {
  padding: '10px 16px',
  borderRadius: '12px',
  border: '1.5px solid #3db89e',
  background: '#fff',
  color: '#3db89e',
  fontWeight: 600,
  fontSize: '0.82rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
  flexShrink: 0,
}

const btnSmallGray = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1.5px solid rgba(178,228,220,0.5)',
  background: '#f0faf8',
  color: '#6b8c87',
  fontWeight: 600,
  fontSize: '0.82rem',
  cursor: 'default',
  whiteSpace: 'nowrap' as const,
  flexShrink: 0,
}

const linkBtn = {
  background: 'none',
  border: 'none',
  color: '#3db89e',
  fontWeight: 600,
  fontSize: '0.82rem',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
}

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#6b8c87',
  letterSpacing: '0.03em',
  marginBottom: '6px',
  display: 'block',
}
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    style="background: rgba(26,46,43,0.45); backdrop-filter: blur(6px)"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full rounded-3xl overflow-hidden"
      style="max-width: 440px; background: #ffffff; box-shadow: 0 24px 80px rgba(26,46,43,0.2), 0 4px 16px rgba(178,228,220,0.3); max-height: 90vh; overflow-y: auto"
    >
      <!-- Header -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between px-7 py-5"
        style="background: linear-gradient(135deg, #E8F8F5, #f0faf8); border-bottom: 1px solid rgba(178,228,220,0.4)"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-7 h-7 rounded-xl flex items-center justify-center"
            style="background: linear-gradient(135deg, #B2E4DC, #3db89e)"
          >
            <Train :size="13" color="#fff" />
          </div>
          <span style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b; letter-spacing: -0.01em">
            {{ titles[view] }}
          </span>
        </div>
        <button
          class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white"
          style="color: #6b8c87; background: rgba(255,255,255,0.6); border: none; cursor: pointer"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-7 py-6">

        <!-- ── LOGIN ── -->
        <div v-if="view === 'login'" class="flex flex-col gap-5">
          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">아이디 (이메일)</label>
            <div class="relative">
              <Mail :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
              <input :style="{ ...inputBase, paddingLeft: '40px' }" placeholder="example@email.com" v-model="loginId" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">비밀번호</label>
            <div class="relative">
              <Lock :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
              <input
                :style="{ ...inputBase, paddingLeft: '40px', paddingRight: '44px' }"
                :type="showLoginPw ? 'text' : 'password'"
                placeholder="비밀번호 입력"
                v-model="loginPw"
              />
              <button
                style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b8c87; display: flex"
                @click="showLoginPw = !showLoginPw"
              >
                <EyeOff v-if="showLoginPw" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-4">
            <button :style="linkBtn" @click="view = 'findId'">아이디 찾기</button>
            <button :style="linkBtn" @click="view = 'findPassword'">비밀번호 찾기</button>
          </div>

          <button :style="btnPrimary">로그인</button>

          <div style="display: flex; align-items: center; gap: 12px; margin: 4px 0">
            <div style="flex: 1; height: 1px; background: rgba(178,228,220,0.5)" />
            <span style="font-size: 0.78rem; color: #6b8c87; white-space: nowrap">또는</span>
            <div style="flex: 1; height: 1px; background: rgba(178,228,220,0.5)" />
          </div>

          <!-- Kakao -->
          <button
            class="w-full flex items-center justify-center gap-2.5 py-3.5 transition-opacity hover:opacity-90"
            style="background: #FEE500; border: none; cursor: pointer; font-weight: 700; font-size: 0.92rem; color: #3C1E1E; border-radius: 14px"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C7.03 3 3 6.36 3 10.5c0 2.62 1.64 4.93 4.13 6.3L6.1 20.13c-.08.26.2.47.43.33L10.8 17.9c.39.05.79.08 1.2.08 4.97 0 9-3.36 9-7.5S16.97 3 12 3z" fill="#3C1E1E" />
            </svg>
            카카오로 시작하기
          </button>

          <p class="text-center" style="font-size: 0.82rem; color: #6b8c87">
            아직 계정이 없으신가요?
            <button :style="linkBtn" @click="view = 'signup'">회원가입</button>
          </p>
        </div>

        <!-- ── SIGNUP ── -->
        <div v-else-if="view === 'signup'" class="flex flex-col gap-4">
          <!-- 이름 -->
          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">이름</label>
            <div class="relative">
              <User :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
              <input :style="{ ...inputBase, paddingLeft: '40px' }" placeholder="홍길동" v-model="signupName" />
            </div>
          </div>

          <!-- 이메일 + 중복확인 -->
          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">아이디 (이메일)</label>
            <div class="flex gap-2 items-center w-full">
              <div class="relative" style="flex: 1">
                <Mail :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
                <input
                  :style="{ ...inputBase, paddingLeft: '40px' }"
                  placeholder="example@email.com"
                  v-model="signupEmail"
                  @input="emailDuplChecked = null; emailCodeSent = false; emailCodeVerified = false"
                />
              </div>
              <button
                :style="emailDuplChecked === true ? { ...btnOutline, background: '#E8F8F5' } : btnOutline"
                @click="emailDuplChecked = true"
              >{{ emailDuplChecked === true ? '✓ 확인완료' : '중복확인' }}</button>
            </div>
            <div v-if="emailDuplChecked === true" class="flex items-center gap-1.5 mt-1" style="color: #3db89e; font-size: 0.78rem">
              <CheckCircle :size="13" /> 사용 가능한 이메일입니다.
            </div>
            <div v-if="emailDuplChecked === false" class="flex items-center gap-1.5 mt-1" style="color: #e05555; font-size: 0.78rem">
              <AlertCircle :size="13" /> 이미 사용중인 이메일입니다.
            </div>
          </div>

          <!-- 이메일 인증 -->
          <div v-if="emailDuplChecked === true" class="flex flex-col gap-1.5">
            <label :style="labelStyle">이메일 인증</label>
            <div class="flex gap-2 items-center w-full">
              <input
                :style="{ ...inputBase, flex: 1 }"
                placeholder="인증번호 6자리"
                v-model="emailCode"
                maxlength="6"
                :disabled="emailCodeVerified"
              />
              <button v-if="!emailCodeSent" :style="btnOutline" @click="emailCodeSent = true">인증번호 발송</button>
              <button v-else-if="!emailCodeVerified" :style="btnOutline" @click="emailCodeVerified = (emailCode === '123456')">인증 확인</button>
              <button v-else :style="btnSmallGray">확인완료</button>
            </div>
            <div v-if="emailCodeSent && !emailCodeVerified" class="flex items-center gap-1.5 mt-1" style="color: #3db89e; font-size: 0.78rem">
              <CheckCircle :size="13" /> 인증번호가 발송되었습니다. (테스트: 123456)
            </div>
            <div v-if="emailCodeVerified" class="flex items-center gap-1.5 mt-1" style="color: #3db89e; font-size: 0.78rem">
              <CheckCircle :size="13" /> 이메일 인증이 완료되었습니다.
            </div>
          </div>

          <!-- 비밀번호 -->
          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">비밀번호</label>
            <div class="relative">
              <Lock :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
              <input
                :style="{ ...inputBase, paddingLeft: '40px', paddingRight: '44px' }"
                :type="showSignupPw ? 'text' : 'password'"
                placeholder="영문+숫자 8자 이상"
                v-model="signupPw"
              />
              <button style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b8c87; display: flex" @click="showSignupPw = !showSignupPw">
                <EyeOff v-if="showSignupPw" :size="16" /><Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <!-- 비밀번호 확인 -->
          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">비밀번호 확인</label>
            <div class="relative">
              <Lock :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
              <input
                :style="{
                  ...inputBase,
                  paddingLeft: '40px',
                  paddingRight: '44px',
                  borderColor: pwMismatch ? 'rgba(224,85,85,0.5)' : pwMatch ? 'rgba(61,184,158,0.6)' : 'rgba(178,228,220,0.5)',
                }"
                :type="showSignupPwC ? 'text' : 'password'"
                placeholder="비밀번호 재입력"
                v-model="signupPwConfirm"
              />
              <button style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b8c87; display: flex" @click="showSignupPwC = !showSignupPwC">
                <EyeOff v-if="showSignupPwC" :size="16" /><Eye v-else :size="16" />
              </button>
            </div>
            <div v-if="pwMatch" class="flex items-center gap-1.5 mt-1" style="color: #3db89e; font-size: 0.78rem">
              <CheckCircle :size="13" /> 비밀번호가 일치합니다.
            </div>
            <div v-if="pwMismatch" class="flex items-center gap-1.5 mt-1" style="color: #e05555; font-size: 0.78rem">
              <AlertCircle :size="13" /> 비밀번호가 일치하지 않습니다.
            </div>
          </div>

          <button :style="{ ...btnPrimary, marginTop: '4px' }">회원가입 완료</button>
          <p class="text-center" style="font-size: 0.82rem; color: #6b8c87">
            이미 계정이 있으신가요?
            <button :style="linkBtn" @click="view = 'login'">로그인</button>
          </p>
        </div>

        <!-- ── FIND ID ── -->
        <div v-else-if="view === 'findId'" class="flex flex-col gap-4">
          <p style="font-size: 0.85rem; color: #6b8c87; line-height: 1.6; margin-bottom: 4px">
            가입 시 등록한 이름과 이메일을 입력하면<br />아이디를 찾아드립니다.
          </p>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">이름</label>
            <div class="relative">
              <User :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
              <input :style="{ ...inputBase, paddingLeft: '40px' }" placeholder="홍길동" v-model="findIdName" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">이메일</label>
            <div class="flex gap-2 items-center w-full">
              <div class="relative" style="flex: 1">
                <Mail :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
                <input :style="{ ...inputBase, paddingLeft: '40px' }" placeholder="example@email.com" v-model="findIdEmail" />
              </div>
              <button :style="btnOutline" @click="findIdCodeSent = true">인증번호 발송</button>
            </div>
          </div>

          <div v-if="findIdCodeSent" class="flex flex-col gap-1.5">
            <label :style="labelStyle">인증번호</label>
            <div class="flex gap-2 items-center w-full">
              <input :style="{ ...inputBase, flex: 1 }" placeholder="인증번호 6자리" v-model="findIdCode" maxlength="6" />
              <button :style="btnOutline" @click="() => { if (findIdCode === '123456') { foundId = 'hong***@email.com'; view = 'findIdResult' } }">확인</button>
            </div>
            <div class="flex items-center gap-1.5 mt-1" style="color: #3db89e; font-size: 0.78rem">
              <CheckCircle :size="13" /> 인증번호가 발송되었습니다. (테스트: 123456)
            </div>
          </div>

          <button
            :style="{ ...btnPrimary, marginTop: '4px' }"
            @click="() => { if (!findIdCodeSent) findIdCodeSent = true; else { foundId = 'hong***@email.com'; view = 'findIdResult' } }"
          >아이디 찾기</button>

          <div class="flex justify-center gap-4">
            <button :style="linkBtn" @click="view = 'login'">로그인</button>
            <span style="color: rgba(178,228,220,0.8); font-size: 0.82rem">|</span>
            <button :style="linkBtn" @click="view = 'findPassword'">비밀번호 찾기</button>
          </div>
        </div>

        <!-- ── FIND ID RESULT ── -->
        <div v-else-if="view === 'findIdResult'" class="flex flex-col gap-5 items-center text-center">
          <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background: #E8F8F5">
            <CheckCircle :size="32" color="#3db89e" />
          </div>
          <div class="space-y-2">
            <p style="font-size: 0.88rem; color: #6b8c87">입력하신 정보와 일치하는 아이디입니다.</p>
            <div class="px-6 py-4 rounded-2xl" style="background: #E8F8F5; border: 1.5px solid rgba(178,228,220,0.6)">
              <p style="font-weight: 700; font-size: 1.1rem; color: #1a2e2b">{{ foundId }}</p>
            </div>
            <p style="font-size: 0.78rem; color: #6b8c87">가입일: 2025년 03월 12일</p>
          </div>
          <div class="flex flex-col gap-3 w-full pt-2">
            <button :style="btnPrimary" @click="view = 'login'">로그인하기</button>
            <button
              class="w-full py-3 rounded-2xl transition-opacity hover:opacity-80"
              style="border: 1.5px solid rgba(178,228,220,0.5); background: #f0faf8; color: #6b8c87; font-weight: 600; font-size: 0.92rem; cursor: pointer"
              @click="view = 'findPassword'"
            >비밀번호 찾기</button>
          </div>
        </div>

        <!-- ── FIND PASSWORD ── -->
        <div v-else-if="view === 'findPassword'" class="flex flex-col gap-4">
          <p style="font-size: 0.85rem; color: #6b8c87; line-height: 1.6; margin-bottom: 4px">
            아이디와 가입 이메일을 입력하면<br />이메일로 인증번호를 발송합니다.
          </p>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">아이디 (이메일)</label>
            <div class="relative">
              <User :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
              <input :style="{ ...inputBase, paddingLeft: '40px' }" placeholder="example@email.com" v-model="findPwId" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">가입 이메일</label>
            <div class="flex gap-2 items-center w-full">
              <div class="relative" style="flex: 1">
                <Mail :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
                <input :style="{ ...inputBase, paddingLeft: '40px' }" placeholder="example@email.com" v-model="findPwEmail" />
              </div>
              <button :style="btnOutline" @click="findPwCodeSent = true">인증번호 발송</button>
            </div>
          </div>

          <div v-if="findPwCodeSent" class="flex flex-col gap-1.5">
            <label :style="labelStyle">이메일 인증번호</label>
            <div class="flex gap-2 items-center w-full">
              <div class="relative" style="flex: 1">
                <Phone :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
                <input
                  :style="{ ...inputBase, paddingLeft: '40px' }"
                  placeholder="인증번호 6자리"
                  v-model="findPwCode"
                  maxlength="6"
                  :disabled="findPwCodeVerified"
                />
              </div>
              <button v-if="!findPwCodeVerified" :style="btnOutline" @click="findPwCodeVerified = (findPwCode === '123456')">인증 확인</button>
              <button v-else :style="btnSmallGray">확인완료</button>
            </div>
            <div v-if="!findPwCodeVerified" class="flex items-center gap-1.5 mt-1" style="color: #3db89e; font-size: 0.78rem">
              <CheckCircle :size="13" /> 인증번호가 발송되었습니다. (테스트: 123456)
            </div>
            <div v-if="findPwCodeVerified" class="flex items-center gap-1.5 mt-1" style="color: #3db89e; font-size: 0.78rem">
              <CheckCircle :size="13" /> 인증이 완료되었습니다.
            </div>
          </div>

          <button
            :style="{
              ...btnPrimary,
              marginTop: '4px',
              opacity: findPwCodeVerified ? 1 : 0.6,
              cursor: findPwCodeVerified ? 'pointer' : 'default',
            }"
            @click="() => { if (!findPwCodeSent) findPwCodeSent = true; else if (findPwCodeVerified) view = 'resetPassword' }"
          >{{ findPwCodeVerified ? '새 비밀번호 설정하기' : '인증번호 발송' }}</button>

          <div class="flex justify-center gap-4">
            <button :style="linkBtn" @click="view = 'login'">로그인</button>
            <span style="color: rgba(178,228,220,0.8); font-size: 0.82rem">|</span>
            <button :style="linkBtn" @click="view = 'findId'">아이디 찾기</button>
          </div>
        </div>

        <!-- ── RESET PASSWORD ── -->
        <div v-else-if="view === 'resetPassword'" class="flex flex-col gap-4">
          <!-- 완료 상태 -->
          <div v-if="resetDone" class="flex flex-col gap-5 items-center text-center pt-4">
            <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background: #E8F8F5">
              <CheckCircle :size="32" color="#3db89e" />
            </div>
            <div class="space-y-1">
              <p style="font-weight: 700; font-size: 1rem; color: #1a2e2b">비밀번호가 변경되었습니다!</p>
              <p style="font-size: 0.85rem; color: #6b8c87">새 비밀번호로 로그인해 주세요.</p>
            </div>
            <button :style="{ ...btnPrimary, marginTop: '8px' }" @click="view = 'login'">로그인하기</button>
          </div>

          <!-- 입력 상태 -->
          <template v-else>
            <p style="font-size: 0.85rem; color: #6b8c87; line-height: 1.6; margin-bottom: 4px">새로운 비밀번호를 입력해 주세요.</p>

            <div class="flex flex-col gap-1.5">
              <label :style="labelStyle">새 비밀번호</label>
              <div class="relative">
                <Lock :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
                <input
                  :style="{ ...inputBase, paddingLeft: '40px', paddingRight: '44px' }"
                  :type="showNewPw ? 'text' : 'password'"
                  placeholder="영문+숫자 8자 이상"
                  v-model="newPw"
                />
                <button style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b8c87; display: flex" @click="showNewPw = !showNewPw">
                  <EyeOff v-if="showNewPw" :size="16" /><Eye v-else :size="16" />
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label :style="labelStyle">새 비밀번호 확인</label>
              <div class="relative">
                <Lock :size="15" color="#B2E4DC" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)" />
                <input
                  :style="{
                    ...inputBase,
                    paddingLeft: '40px',
                    paddingRight: '44px',
                    borderColor: newPwMismatch ? 'rgba(224,85,85,0.5)' : newPwMatch ? 'rgba(61,184,158,0.6)' : 'rgba(178,228,220,0.5)',
                  }"
                  :type="showNewPwC ? 'text' : 'password'"
                  placeholder="새 비밀번호 재입력"
                  v-model="newPwConfirm"
                />
                <button style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b8c87; display: flex" @click="showNewPwC = !showNewPwC">
                  <EyeOff v-if="showNewPwC" :size="16" /><Eye v-else :size="16" />
                </button>
              </div>
              <div v-if="newPwMatch" class="flex items-center gap-1.5 mt-1" style="color: #3db89e; font-size: 0.78rem">
                <CheckCircle :size="13" /> 비밀번호가 일치합니다.
              </div>
              <div v-if="newPwMismatch" class="flex items-center gap-1.5 mt-1" style="color: #e05555; font-size: 0.78rem">
                <AlertCircle :size="13" /> 비밀번호가 일치하지 않습니다.
              </div>
            </div>

            <button
              :style="{
                ...btnPrimary,
                marginTop: '4px',
                opacity: newPwMatch ? 1 : 0.6,
                cursor: newPwMatch ? 'pointer' : 'default',
              }"
              @click="() => { if (newPwMatch) resetDone = true }"
            >비밀번호 변경 완료</button>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>
