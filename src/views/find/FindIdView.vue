<script setup lang="ts">
import { ref } from 'vue'
import { Mail, User, CheckCircle, Train } from 'lucide-vue-next'

type Step = 'form' | 'result'
const step = ref<Step>('form')
const name = ref('')
const email = ref('')
const code = ref('')
const codeSent = ref(false)
const foundId = ref('')

function sendCode() { codeSent.value = true }
function verify() {
  if (code.value === '123456') {
    foundId.value = 'hong***@email.com'
    step.value = 'result'
  }
}

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
          <span style="font-weight: 700; font-size: 1.15rem; color: #1a2e2b">아이디 찾기</span>
        </div>
      </div>

      <div class="px-8 py-8 flex flex-col gap-4">
        <!-- 결과 화면 -->
        <template v-if="step === 'result'">
          <div class="flex flex-col gap-5 items-center text-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background: #E8F8F5">
              <CheckCircle :size="32" color="#3db89e" />
            </div>
            <div class="space-y-2">
              <p style="font-size:0.88rem;color:#6b8c87">입력하신 정보와 일치하는 아이디입니다.</p>
              <div class="px-6 py-4 rounded-2xl" style="background:#E8F8F5;border:1.5px solid rgba(178,228,220,0.6)">
                <p style="font-weight:700;font-size:1.1rem;color:#1a2e2b">{{ foundId }}</p>
              </div>
              <p style="font-size:0.78rem;color:#6b8c87">가입일: 2025년 03월 12일</p>
            </div>
            <div class="flex flex-col gap-3 w-full">
              <router-link to="/login" style="display:block;width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;text-align:center;text-decoration:none">로그인하기</router-link>
              <router-link to="/find-password" style="display:block;width:100%;padding:13px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#6b8c87;font-weight:600;font-size:0.92rem;text-align:center;text-decoration:none">비밀번호 찾기</router-link>
            </div>
          </div>
        </template>

        <!-- 입력 화면 -->
        <template v-else>
          <p style="font-size:0.85rem;color:#6b8c87;line-height:1.6">가입 시 등록한 이름과 이메일을 입력하면<br />아이디를 찾아드립니다.</p>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">이름</label>
            <div class="relative">
              <User :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
              <input v-model="name" :style="`${inputStyle};padding-left:40px`" placeholder="홍길동" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">이메일</label>
            <div class="flex gap-2 items-center">
              <div class="relative flex-1">
                <Mail :size="15" color="#B2E4DC" style="position:absolute;left:14px;top:50%;transform:translateY(-50%)" />
                <input v-model="email" :style="`${inputStyle};padding-left:40px`" placeholder="example@email.com" />
              </div>
              <button :style="btnOutline" @click="sendCode">인증번호 발송</button>
            </div>
          </div>

          <div v-if="codeSent" class="flex flex-col gap-1.5">
            <label :style="labelStyle">인증번호</label>
            <div class="flex gap-2 items-center">
              <input v-model="code" :style="`${inputStyle};flex:1`" placeholder="인증번호 6자리" maxlength="6" />
              <button :style="btnOutline" @click="verify">확인</button>
            </div>
            <div class="flex items-center gap-1.5" style="color:#3db89e;font-size:0.78rem"><CheckCircle :size="13" /> 인증번호가 발송되었습니다. (테스트: 123456)</div>
          </div>

          <button style="width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(61,184,158,0.3)" @click="() => { if (!codeSent) sendCode(); else verify() }">
            아이디 찾기
          </button>

          <div class="flex justify-center gap-4">
            <router-link to="/login" style="color:#3db89e;font-weight:600;font-size:0.82rem;text-decoration:underline">로그인</router-link>
            <span style="color:rgba(178,228,220,0.8);font-size:0.82rem">|</span>
            <router-link to="/find-password" style="color:#3db89e;font-weight:600;font-size:0.82rem;text-decoration:underline">비밀번호 찾기</router-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
