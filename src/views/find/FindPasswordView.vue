<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Train,
} from "lucide-vue-next";
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
  resetPassword,
} from "@/api/auth";

type Step = "form" | "reset" | "done";
const step = ref<Step>("form");

const pwEmail = ref("");
const codeSent = ref(false);
const code = ref("");
const codeVerified = ref(false);

const newPw = ref("");
const newPwConfirm = ref("");
const showNewPw = ref(false);
const showNewPwC = ref(false);

const isEmailTouched = ref(false);
const isPwTouched = ref(false);
const isLoading = ref(false);

const sendCodeError = ref("");
const verifyCodeError = ref("");
const resetError = ref("");

const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(pwEmail.value);
});

const isPwValid = computed(() => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(newPw.value);
});

const pwMatch = computed(
  () => newPw.value && newPwConfirm.value && newPw.value === newPwConfirm.value,
);
const pwMismatch = computed(
  () => newPwConfirm.value && newPw.value !== newPwConfirm.value,
);

const showEmailError = computed(
  () => isEmailTouched.value && pwEmail.value.length > 0 && !isEmailValid.value,
);
const showPwError = computed(
  () => isPwTouched.value && newPw.value.length > 0 && !isPwValid.value,
);

const inputStyle =
  "width:100%;padding:12px 16px;border-radius:14px;background:#ffffff;color:#1a2e2b;font-size:0.92rem;outline:none;transition:border-color 0.2s;";
const labelStyle =
  "font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em";
const btnOutline =
  "padding:10px 16px;border-radius:12px;border:1.5px solid #3db89e;background:#fff;color:#3db89e;font-weight:600;font-size:0.82rem;cursor:pointer;white-space:nowrap;flex-shrink:0";

const handleSendCode = async () => {
  sendCodeError.value = "";
  isEmailTouched.value = true;
  if (!isEmailValid.value) return;

  isLoading.value = true;
  try {
    const res = await sendPasswordResetCode(pwEmail.value);
    if (res.success) {
      codeSent.value = true;
    } else {
      sendCodeError.value = res.message;
    }
  } catch {
    sendCodeError.value = "인증번호 발송 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};

const handleVerifyCode = async () => {
  verifyCodeError.value = "";
  isLoading.value = true;
  try {
    const res = await verifyPasswordResetCode(pwEmail.value, code.value);
    if (res.success) {
      codeVerified.value = true;
    } else {
      verifyCodeError.value = res.message;
    }
  } catch {
    verifyCodeError.value = "인증 확인 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};

const handleResetPassword = async () => {
  resetError.value = "";
  isPwTouched.value = true;
  if (!pwMatch.value || !isPwValid.value) return;

  isLoading.value = true;
  try {
    const res = await resetPassword(pwEmail.value, newPw.value);
    if (res.success) {
      step.value = "done";
    } else {
      resetError.value = res.message;
    }
  } catch {
    resetError.value = "비밀번호 변경 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
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
          {{ step === "reset" ? "새 비밀번호 설정" : "비밀번호 찾기" }}
        </h2>
      </div>

      <div class="flex flex-col gap-5">
        <!-- STEP 3: 변경 완료 -->
        <template v-if="step === 'done'">
          <div class="flex flex-col gap-6 items-center text-center pt-2">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center"
              style="background: #e8f8f5"
            >
              <CheckCircle :size="32" color="#3db89e" />
            </div>
            <div class="space-y-1">
              <h4 style="font-weight: 700; font-size: 1.15rem; color: #1a2e2b">
                비밀번호가 변경되었습니다!
              </h4>
              <p style="font-size: 0.85rem; color: #6b8c87">
                새 비밀번호로 로그인해 주세요.
              </p>
            </div>
            <router-link
              to="/login"
              style="
                display: block;
                width: 100%;
                padding: 13px;
                border-radius: 14px;
                background: linear-gradient(135deg, #b2e4dc, #3db89e);
                color: #fff;
                font-weight: 700;
                font-size: 0.95rem;
                text-align: center;
                text-decoration: none;
                box-shadow: 0 4px 14px rgba(61, 184, 158, 0.3);
              "
              >로그인하기</router-link
            >
          </div>
        </template>

        <!-- STEP 2: 새 비밀번호 설정 -->
        <template v-else-if="step === 'reset'">
          <p
            style="
              font-size: 0.85rem;
              color: #6b8c87;
              line-height: 1.6;
              text-align: center;
            "
          >
            새로운 비밀번호를 입력해 주세요.
          </p>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">새 비밀번호</label>
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
                v-model="newPw"
                :type="showNewPw ? 'text' : 'password'"
                @blur="isPwTouched = true"
                :style="`${inputStyle}padding-left:40px; padding-right:44px; border:${showPwError ? '1.5px solid #ff4d4f' : '1.5px solid rgba(178,228,220,0.5)'};`"
                placeholder="영문+숫자+특수문자 8자 이상"
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
                @click="showNewPw = !showNewPw"
              >
                <EyeOff v-if="showNewPw" :size="16" /><Eye v-else :size="16" />
              </button>
            </div>
            <div
              v-if="showPwError"
              class="flex items-center gap-1.5"
              style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
            >
              <AlertCircle :size="13" /> 영어, 특수문자, 숫자를 포함해 8자 이상
              입력해주세요.
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">새 비밀번호 확인</label>
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
                v-model="newPwConfirm"
                :type="showNewPwC ? 'text' : 'password'"
                :style="`${inputStyle}padding-left:40px; padding-right:44px; border:${pwMismatch ? '1.5px solid #ff4d4f' : pwMatch ? '1.5px solid #3db89e' : '1.5px solid rgba(178,228,220,0.5)'};`"
                placeholder="새 비밀번호 재입력"
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
                @click="showNewPwC = !showNewPwC"
              >
                <EyeOff v-if="showNewPwC" :size="16" /><Eye v-else :size="16" />
              </button>
            </div>
            <div
              v-if="pwMatch"
              class="flex items-center gap-1.5"
              style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
            >
              <CheckCircle :size="13" /> 비밀번호가 일치합니다.
            </div>
            <div
              v-if="pwMismatch"
              class="flex items-center gap-1.5"
              style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
            >
              <AlertCircle :size="13" /> 비밀번호가 일치하지 않습니다.
            </div>
          </div>

          <div
            v-if="resetError"
            class="flex items-center gap-1.5"
            style="color: #ff4d4f; font-size: 0.82rem; font-weight: 500"
          >
            <AlertCircle :size="14" /> {{ resetError }}
          </div>

          <button
            @click="handleResetPassword"
            :disabled="isLoading || !pwMatch || !isPwValid"
            :style="`width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;border:none;box-shadow:0 4px 14px rgba(61,184,158,0.3);opacity:${pwMatch && isPwValid && !isLoading ? 1 : 0.6};cursor:${pwMatch && isPwValid && !isLoading ? 'pointer' : 'default'}`"
          >
            {{ isLoading ? "처리 중..." : "비밀번호 변경 완료" }}
          </button>
        </template>

        <!-- STEP 1: 이메일 인증 -->
        <template v-else>
          <p
            style="
              font-size: 0.85rem;
              color: #6b8c87;
              line-height: 1.6;
              text-align: center;
            "
          >
            아이디(가입 이메일)을 입력하면<br />이메일로 인증번호를 발송합니다.
          </p>

          <!-- 이메일 입력 -->
          <div class="flex flex-col gap-1.5">
            <label :style="labelStyle">아이디 (가입 이메일)</label>
            <div class="flex gap-2 items-center">
              <div class="relative flex-1">
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
                  v-model="pwEmail"
                  @blur="isEmailTouched = true"
                  @input="sendCodeError = ''"
                  :style="`${inputStyle}padding-left:40px; border:${showEmailError ? '1.5px solid #ff4d4f' : '1.5px solid rgba(178,228,220,0.5)'};`"
                  placeholder="example@email.com"
                />
              </div>
              <button
                :style="`${btnOutline}${isLoading ? ';opacity:0.6;cursor:default' : ''}`"
                @click="handleSendCode"
                :disabled="isLoading"
              >
                {{ codeSent ? "재발송" : "인증번호 발송" }}
              </button>
            </div>
            <div
              v-if="showEmailError"
              class="flex items-center gap-1.5"
              style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
            >
              <AlertCircle :size="13" /> 알맞은 형식으로 입력해주세요.
            </div>
            <div
              v-else-if="sendCodeError"
              class="flex items-center gap-1.5"
              style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
            >
              <AlertCircle :size="13" /> {{ sendCodeError }}
            </div>
          </div>

          <!-- 인증번호 입력 -->
          <div v-if="codeSent" class="flex flex-col gap-1.5">
            <label :style="labelStyle">이메일 인증번호</label>
            <div class="flex gap-2 items-center">
              <div class="relative flex-1">
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
                  v-model="code"
                  :style="`${inputStyle}padding-left:40px; border:1.5px solid rgba(178,228,220,0.5);`"
                  placeholder="인증번호 6자리"
                  maxlength="6"
                  :disabled="codeVerified"
                />
              </div>
              <button
                v-if="!codeVerified"
                :style="`${btnOutline}${isLoading ? ';opacity:0.6;cursor:default' : ''}`"
                @click="handleVerifyCode"
                :disabled="isLoading"
              >
                인증 확인
              </button>
              <button
                v-else
                style="
                  padding: 10px 14px;
                  border-radius: 12px;
                  border: 1.5px solid rgba(178, 228, 220, 0.5);
                  background: #ffffff;
                  color: #6b8c87;
                  font-weight: 600;
                  font-size: 0.82rem;
                  cursor: default;
                  white-space: nowrap;
                "
              >
                확인완료
              </button>
            </div>
            <div
              v-if="verifyCodeError"
              class="flex items-center gap-1.5"
              style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
            >
              <AlertCircle :size="13" /> {{ verifyCodeError }}
            </div>
            <div
              v-else-if="!codeVerified"
              class="flex items-center gap-1.5"
              style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
            >
              <CheckCircle :size="13" /> 인증번호가 발송되었습니다.
            </div>
            <div
              v-if="codeVerified"
              class="flex items-center gap-1.5"
              style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
            >
              <CheckCircle :size="13" /> 인증이 완료되었습니다.
            </div>
          </div>

          <button
            @click="() => { if (codeVerified) step = 'reset'; }"
            :disabled="!codeVerified"
            :style="`width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;border:none;box-shadow:0 4px 14px rgba(61,184,158,0.3);opacity:${codeVerified ? 1 : 0.6};cursor:${codeVerified ? 'pointer' : 'default'}`"
          >
            새 비밀번호 설정하기
          </button>

          <div class="flex justify-center gap-4">
            <router-link
              to="/login"
              style="
                color: #3db89e;
                font-weight: 600;
                font-size: 0.82rem;
                text-decoration: underline;
                text-underline-offset: 3px;
              "
              >로그인</router-link
            >
            <span style="color: rgba(178, 228, 220, 0.8); font-size: 0.82rem"
              >|</span
            >
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
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
