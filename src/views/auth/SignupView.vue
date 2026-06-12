<script setup lang="ts">
import { ref, computed } from 'vue'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, Train } from 'lucide-vue-next'

const signupName = ref('')
const signupEmail = ref('')
const emailCode = ref('')
const emailCodeSent = ref(false)
const emailCodeVerified = ref(false)
const emailDuplChecked = ref<null | boolean>(null)
const signupPw = ref('')
const signupPwConfirm = ref('')
const showPw = ref(false)
const showPwC = ref(false)

const pwMatch = computed(() => signupPw.value && signupPwConfirm.value && signupPw.value === signupPwConfirm.value)
const pwMismatch = computed(() => signupPwConfirm.value && signupPw.value !== signupPwConfirm.value)

const inputStyle = 'width:100%;padding:12px 16px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.92rem;outline:none'
const labelStyle = 'font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em'
const btnOutlineStyle = 'padding:10px 16px;border-radius:12px;border:1.5px solid #3db89e;background:#fff;color:#3db89e;font-weight:600;font-size:0.82rem;cursor:pointer;white-space:nowrap;flex-shrink:0'
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
          <span style="font-weight: 700; font-size: 1.15rem; color: #1a2e2b">회원가입</span>
        </div>
      </div>

      <!-- Form -->
      <div class="px-8 py-8 flex flex-col gap-4">
        <!-- 이름 -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">이름</label>
          <div class="relative">
            <User :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
            <input v-model="signupName" :style="`${inputStyle};padding-left:40px`" placeholder="홍길동" />
          </div>
        </div>

        <!-- 이메일 + 중복확인 -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">아이디 (이메일)</label>
          <div class="flex gap-2 items-center">
            <div class="relative flex-1">
              <Mail :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
              <input v-model="signupEmail" :style="`${inputStyle};padding-left:40px`" placeholder="example@email.com" @input="emailDuplChecked = null; emailCodeSent = false; emailCodeVerified = false" />
            </div>
            <button :style="`${btnOutlineStyle}${emailDuplChecked === true ? ';background:#E8F8F5' : ''}`" @click="emailDuplChecked = true">
              {{ emailDuplChecked === true ? '✓ 확인완료' : '중복확인' }}
            </button>
          </div>
          <div v-if="emailDuplChecked === true" class="flex items-center gap-1.5" style="color:#3db89e;font-size:0.78rem"><CheckCircle :size="13" /> 사용 가능한 이메일입니다.</div>
          <div v-if="emailDuplChecked === false" class="flex items-center gap-1.5" style="color:#e05555;font-size:0.78rem"><AlertCircle :size="13" /> 이미 사용중인 이메일입니다.</div>
        </div>

        <!-- 이메일 인증 -->
        <div v-if="emailDuplChecked === true" class="flex flex-col gap-1.5">
          <label :style="labelStyle">이메일 인증</label>
          <div class="flex gap-2 items-center">
            <input v-model="emailCode" :style="`${inputStyle};flex:1`" placeholder="인증번호 6자리" maxlength="6" :disabled="emailCodeVerified" />
            <button v-if="!emailCodeSent" :style="btnOutlineStyle" @click="emailCodeSent = true">인증번호 발송</button>
            <button v-else-if="!emailCodeVerified" :style="btnOutlineStyle" @click="emailCodeVerified = (emailCode === '123456')">인증 확인</button>
            <button v-else style="padding:10px 14px;border-radius:12px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#6b8c87;font-weight:600;font-size:0.82rem;cursor:default;white-space:nowrap">확인완료</button>
          </div>
          <div v-if="emailCodeSent && !emailCodeVerified" class="flex items-center gap-1.5" style="color:#3db89e;font-size:0.78rem"><CheckCircle :size="13" /> 인증번호가 발송되었습니다. (테스트: 123456)</div>
          <div v-if="emailCodeVerified" class="flex items-center gap-1.5" style="color:#3db89e;font-size:0.78rem"><CheckCircle :size="13" /> 이메일 인증이 완료되었습니다.</div>
        </div>

        <!-- 비밀번호 -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">비밀번호</label>
          <div class="relative">
            <Lock :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
            <input v-model="signupPw" :type="showPw ? 'text' : 'password'" :style="`${inputStyle};padding-left:40px;padding-right:44px`" placeholder="영문+숫자 8자 이상" />
            <button style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#6b8c87;display:flex" @click="showPw = !showPw">
              <EyeOff v-if="showPw" :size="16" /><Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">비밀번호 확인</label>
          <div class="relative">
            <Lock :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
            <input
              v-model="signupPwConfirm"
              :type="showPwC ? 'text' : 'password'"
              :style="`${inputStyle};padding-left:40px;padding-right:44px;border-color:${pwMismatch ? 'rgba(224,85,85,0.5)' : pwMatch ? 'rgba(61,184,158,0.6)' : 'rgba(178,228,220,0.5)'}`"
              placeholder="비밀번호 재입력"
            />
            <button style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#6b8c87;display:flex" @click="showPwC = !showPwC">
              <EyeOff v-if="showPwC" :size="16" /><Eye v-else :size="16" />
            </button>
          </div>
          <div v-if="pwMatch" class="flex items-center gap-1.5" style="color:#3db89e;font-size:0.78rem"><CheckCircle :size="13" /> 비밀번호가 일치합니다.</div>
          <div v-if="pwMismatch" class="flex items-center gap-1.5" style="color:#e05555;font-size:0.78rem"><AlertCircle :size="13" /> 비밀번호가 일치하지 않습니다.</div>
        </div>

        <button style="width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(61,184,158,0.3);margin-top:4px">
          회원가입 완료
        </button>

        <p class="text-center" style="font-size:0.82rem;color:#6b8c87">
          이미 계정이 있으신가요?
          <router-link to="/login" style="color:#3db89e;font-weight:600;text-decoration:underline;text-underline-offset:3px">로그인</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
