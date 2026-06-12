<script setup lang="ts">
import { ref, computed } from 'vue'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, Phone, Train } from 'lucide-vue-next'

type Step = 'form' | 'reset' | 'done'
const step = ref<Step>('form')

const pwId = ref('')
const pwEmail = ref('')
const codeSent = ref(false)
const code = ref('')
const codeVerified = ref(false)
const newPw = ref('')
const newPwConfirm = ref('')
const showNewPw = ref(false)
const showNewPwC = ref(false)

const pwMatch = computed(() => newPw.value && newPwConfirm.value && newPw.value === newPwConfirm.value)
const pwMismatch = computed(() => newPwConfirm.value && newPw.value !== newPwConfirm.value)

const inputStyle = 'width:100%;padding:12px 16px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.92rem;outline:none'
const labelStyle = 'font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em'
const btnOutline = 'padding:10px 16px;border-radius:12px;border:1.5px solid #3db89e;background:#fff;color:#3db89e;font-weight:600;font-size:0.82rem;cursor:pointer;white-space:nowrap;flex-shrink:0'
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
          <span style="font-weight: 700; font-size: 1.15rem; color: #1a2e2b">{{ step === 'reset' ? '새 비밀번호 설정' : '비밀번호 찾기' }}</span>
        </div>
      </div>

      <div class="px-8 py-8 flex flex-col gap-4">
        <!-- 완료 -->
        <template v-if="step === 'done'">
          <div class="flex flex-col gap-5 items-center text-center pt-2">
            <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background: #E8F8F5">
              <CheckCircle :size="32" color="#3db89e" />
            </div>
            <div class="space-y-1">
              <p style="font-weight:700;font-size:1rem;color:#1a2e2b">비밀번호가 변경되었습니다!</p>
              <p style="font-size:0.85rem;color:#6b8c87">새 비밀번호로 로그인해 주세요.</p>
            </div>
            <router-link to="/login" style="display:block;width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;text-align:center;text-decoration:none;margin-top:8px">로그인하기</router-link>
          </div>
        </template>

        <!-- 새 비밀번호 설정 -->
        <template v-else-if="step === 'reset'">
          <p style="font-size:0.85rem;color:#6b8c87;line-height:1.6">새로운 비밀번호를 입력해 주세요.</p>
          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">새 비밀번호</label>
            <div class="relative">
              <Lock :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
              <input v-model="newPw" :type="showNewPw ? 'text' : 'password'" :style="`${inputStyle};padding-left:40px;padding-right:44px`" placeholder="영문+숫자 8자 이상" />
              <button style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#6b8c87;display:flex" @click="showNewPw = !showNewPw">
                <EyeOff v-if="showNewPw" :size="16" /><Eye v-else :size="16" />
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">새 비밀번호 확인</label>
            <div class="relative">
              <Lock :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
              <input v-model="newPwConfirm" :type="showNewPwC ? 'text' : 'password'" :style="`${inputStyle};padding-left:40px;padding-right:44px;border-color:${pwMismatch ? 'rgba(224,85,85,0.5)' : pwMatch ? 'rgba(61,184,158,0.6)' : 'rgba(178,228,220,0.5)'}`" placeholder="새 비밀번호 재입력" />
              <button style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#6b8c87;display:flex" @click="showNewPwC = !showNewPwC">
                <EyeOff v-if="showNewPwC" :size="16" /><Eye v-else :size="16" />
              </button>
            </div>
            <div v-if="pwMatch" class="flex items-center gap-1.5" style="color:#3db89e;font-size:0.78rem"><CheckCircle :size="13" /> 비밀번호가 일치합니다.</div>
          </div>
          <button :style="`width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;border:none;box-shadow:0 4px 14px rgba(61,184,158,0.3);opacity:${pwMatch ? 1 : 0.6};cursor:${pwMatch ? 'pointer' : 'default'}`" @click="() => { if (pwMatch) step = 'done' }">
            비밀번호 변경 완료
          </button>
        </template>

        <!-- 인증 입력 -->
        <template v-else>
          <p style="font-size:0.85rem;color:#6b8c87;line-height:1.6">아이디와 가입 이메일을 입력하면<br />이메일로 인증번호를 발송합니다.</p>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">아이디 (이메일)</label>
            <div class="relative">
              <User :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
              <input v-model="pwId" :style="`${inputStyle};padding-left:40px`" placeholder="example@email.com" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">가입 이메일</label>
            <div class="flex gap-2 items-center">
              <div class="relative flex-1">
                <Mail :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
                <input v-model="pwEmail" :style="`${inputStyle};padding-left:40px`" placeholder="example@email.com" />
              </div>
              <button :style="btnOutline" @click="codeSent = true">인증번호 발송</button>
            </div>
          </div>

          <div v-if="codeSent" class="flex flex-col gap-1.5">
            <label :style="labelStyle">이메일 인증번호</label>
            <div class="flex gap-2 items-center">
              <div class="relative flex-1">
                <Phone :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
                <input v-model="code" :style="`${inputStyle};padding-left:40px`" placeholder="인증번호 6자리" maxlength="6" :disabled="codeVerified" />
              </div>
              <button v-if="!codeVerified" :style="btnOutline" @click="codeVerified = (code === '123456')">인증 확인</button>
              <button v-else style="padding:10px 14px;border-radius:12px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#6b8c87;font-weight:600;font-size:0.82rem;cursor:default;white-space:nowrap">확인완료</button>
            </div>
            <div v-if="!codeVerified" class="flex items-center gap-1.5" style="color:#3db89e;font-size:0.78rem"><CheckCircle :size="13" /> 인증번호가 발송되었습니다. (테스트: 123456)</div>
            <div v-if="codeVerified" class="flex items-center gap-1.5" style="color:#3db89e;font-size:0.78rem"><CheckCircle :size="13" /> 인증이 완료되었습니다.</div>
          </div>

          <button :style="`width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;border:none;box-shadow:0 4px 14px rgba(61,184,158,0.3);opacity:${codeVerified ? 1 : 0.6};cursor:${codeVerified ? 'pointer' : 'default'}`"
            @click="() => { if (!codeSent) codeSent = true; else if (codeVerified) step = 'reset' }">
            {{ codeVerified ? '새 비밀번호 설정하기' : '인증번호 발송' }}
          </button>

          <div class="flex justify-center gap-4">
            <router-link to="/login" style="color:#3db89e;font-weight:600;font-size:0.82rem;text-decoration:underline">로그인</router-link>
            <span style="color:rgba(178,228,220,0.8);font-size:0.82rem">|</span>
            <router-link to="/find-id" style="color:#3db89e;font-weight:600;font-size:0.82rem;text-decoration:underline">아이디 찾기</router-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
