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

// 🌟 [추가] 사용자가 각 입력창을 건드렸는지 여부 추적
const isEmailTouched = ref(false);
const isPwTouched = ref(false);

// 🌟 [추가] 5. 이메일 형식 유효성 검사
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(pwEmail.value);
});

// 🌟 [추가] 새 비밀번호 형식 유효성 검사 (영어, 특수문자, 숫자 포함 8자 이상)
const isPwValid = computed(() => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(newPw.value);
});

// 비밀번호 일치 및 불일치 조건 계산
const pwMatch = computed(
  () => newPw.value && newPwConfirm.value && newPw.value === newPwConfirm.value,
);
const pwMismatch = computed(
  () => newPwConfirm.value && newPw.value !== newPwConfirm.value,
);

// 실시간 에러 노출 조건들
const showEmailError = computed(
  () => isEmailTouched.value && pwEmail.value.length > 0 && !isEmailValid.value,
);
const showPwError = computed(
  () => isPwTouched.value && newPw.value.length > 0 && !isPwValid.value,
);

// 🌟 [수정] 6. 입력창 기본 배경색을 #ffffff(흰색)으로 변경
const inputStyle =
  "width:100%;padding:12px 16px;border-radius:14px;background:#ffffff;color:#1a2e2b;font-size:0.92rem;outline:none;transition:border-color 0.2s;";
const labelStyle =
  "font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em";
const btnOutline =
  "padding:10px 16px;border-radius:12px;border:1.5px solid #3db89e;background:#fff;color:#3db89e;font-weight:600;font-size:0.82rem;cursor:pointer;white-space:nowrap;flex-shrink:0";

// 인증번호 발송 버튼 클릭 시
const handleSendCode = () => {
  isEmailTouched.value = true;
  if (!isEmailValid.value) {
    alert("올바른 이메일 형식을 먼저 입력해주세요.");
    return;
  }
  codeSent.value = true;
};

// 인증 확인 버튼 클릭 시
const handleVerifyCode = () => {
  if (code.value === "123456") {
    codeVerified.value = true;
  } else {
    alert("인증번호가 일치하지 않습니다. (테스트 번호: 123456)");
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
    <!-- 🌟 [수정] 1. 외곽 박스를 제거하고 배경을 투명하게 설정 -->
    <div class="w-full" style="max-width: 400px; background: transparent">
      <!-- Header -->
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
        <!-- ---------------- STEP 3: 변경 완료 ---------------- -->
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

        <!-- ---------------- STEP 2: 새 비밀번호 설정 ---------------- -->
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

          <!-- 새 비밀번호 입력 -->
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

          <!-- 새 비밀번호 확인 -->
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

          <button
            :style="`width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;border:none;box-shadow:0 4px 14px rgba(61,184,158,0.3);opacity:${pwMatch && isPwValid ? 1 : 0.6};cursor:${pwMatch && isPwValid ? 'pointer' : 'default'}`"
            @click="
              () => {
                if (pwMatch && isPwValid) step = 'done';
              }
            "
          >
            비밀번호 변경 완료
          </button>
        </template>

        <!-- ---------------- STEP 1: 인증 입력 ---------------- -->
        <template v-else>
          <!-- 🌟 [수정] 3. 안내 문구 변경 -->
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

          <!-- 🌟 [수정] 2. 불필요한 중복 아이디 입력 박스 삭제 완료 -->

          <!-- 아이디(가입 이메일) 입력창 -->
          <div class="flex flex-col gap-1.5">
            <!-- 🌟 [수정] 4. 라벨 표시명 변경 -->
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
                <!-- 🌟 [수정] 5&6. 흰색 배경화 및 실시간 에러 테두리 속성 추가 -->
                <input
                  v-model="pwEmail"
                  @blur="isEmailTouched = true"
                  :style="`${inputStyle}padding-left:40px; border:${showEmailError ? '1.5px solid #ff4d4f' : '1.5px solid rgba(178,228,220,0.5)'};`"
                  placeholder="example@email.com"
                />
              </div>
              <button :style="btnOutline" @click="handleSendCode">
                인증번호 발송
              </button>
            </div>
            <!-- 🌟 [추가] 5. 이메일 에러 가이드 문구 추가 -->
            <div
              v-if="showEmailError"
              class="flex items-center gap-1.5"
              style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
            >
              <AlertCircle :size="13" /> 알맞은 형식으로 입력해주세요. (예시:
              daejeon@layover.com)
            </div>
          </div>

          <!-- 이메일 인증번호 입력창 -->
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
                <!-- 🌟 [수정] 6. 배경을 흰색(#ffffff)으로 연동 및 아이콘 Phone에서 Lock으로 매칭 변경 -->
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
                :style="btnOutline"
                @click="handleVerifyCode"
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
              v-if="!codeVerified"
              class="flex items-center gap-1.5"
              style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
            >
              <CheckCircle :size="13" /> 인증번호가 발송되었습니다. (테스트:
              123456)
            </div>
            <div
              v-if="codeVerified"
              class="flex items-center gap-1.5"
              style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
            >
              <CheckCircle :size="13" /> 인증이 완료되었습니다.
            </div>
          </div>

          <!-- 하단 액션 버튼 -->
          <button
            :style="`width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#B2E4DC,#3db89e);color:#fff;font-weight:700;font-size:0.95rem;border:none;box-shadow:0 4px 14px rgba(61,184,158,0.3);opacity:${codeVerified ? 1 : 0.6};cursor:${codeVerified ? 'pointer' : 'default'}`"
            @click="
              () => {
                if (codeVerified) step = 'reset';
              }
            "
          >
            새 비밀번호 설정하기
          </button>

          <!-- 하단 이동 링크 -->
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
