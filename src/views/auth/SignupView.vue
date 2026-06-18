<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Train,
  Calendar,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import {
  checkEmail,
  sendEmailCode,
  verifyEmailCode,
  signup,
} from "@/api/auth";

const router = useRouter();

const signupName = ref("");
const signupEmail = ref("");
const signupBirthDate = ref("");
const signupPhone = ref("");
const emailCode = ref("");
const emailCodeSent = ref(false);
const emailCodeVerified = ref(false);
const emailDuplChecked = ref<null | boolean>(null);
const signupPw = ref("");
const signupPwConfirm = ref("");
const showPw = ref(false);
const showPwC = ref(false);

const isEmailTouched = ref(false);
const isPwTouched = ref(false);

const emailCheckError = ref("");
const sendCodeError = ref("");
const verifyCodeError = ref("");
const signupError = ref("");
const isLoading = ref(false);

const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(signupEmail.value);
});

const isPwValid = computed(() => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(signupPw.value);
});

const pwMatch = computed(
  () =>
    signupPw.value &&
    signupPwConfirm.value &&
    signupPw.value === signupPwConfirm.value,
);
const pwMismatch = computed(
  () => signupPwConfirm.value && signupPw.value !== signupPwConfirm.value,
);

const showEmailError = computed(
  () =>
    isEmailTouched.value && signupEmail.value.length > 0 && !isEmailValid.value,
);
const showPwError = computed(
  () => isPwTouched.value && signupPw.value.length > 0 && !isPwValid.value,
);

const canCheckDuplication = computed(() => isEmailValid.value);

const handleEmailCheck = async () => {
  emailCheckError.value = "";
  if (!canCheckDuplication.value) {
    isEmailTouched.value = true;
    return;
  }
  try {
    const res = await checkEmail(signupEmail.value);
    if (res.success) {
      emailDuplChecked.value = true;
    } else {
      emailDuplChecked.value = false;
      emailCheckError.value = res.message;
    }
  } catch {
    emailCheckError.value = "이메일 확인 중 오류가 발생했습니다.";
  }
};

const handleSendCode = async () => {
  sendCodeError.value = "";
  try {
    const res = await sendEmailCode(signupEmail.value);
    if (res.success) {
      emailCodeSent.value = true;
    } else {
      sendCodeError.value = res.message;
    }
  } catch {
    sendCodeError.value = "인증번호 발송 중 오류가 발생했습니다.";
  }
};

const handleVerifyCode = async () => {
  verifyCodeError.value = "";
  try {
    const res = await verifyEmailCode(signupEmail.value, emailCode.value);
    if (res.success) {
      emailCodeVerified.value = true;
    } else {
      verifyCodeError.value = res.message;
    }
  } catch {
    verifyCodeError.value = "인증 확인 중 오류가 발생했습니다.";
  }
};

const handleSignup = async () => {
  signupError.value = "";
  isEmailTouched.value = true;
  isPwTouched.value = true;

  if (!signupName.value) {
    signupError.value = "이름을 입력해주세요.";
    return;
  }
  if (!signupBirthDate.value) {
    signupError.value = "생년월일을 입력해주세요.";
    return;
  }
  if (!signupPhone.value) {
    signupError.value = "핸드폰번호를 입력해주세요.";
    return;
  }
  if (!isEmailValid.value || emailDuplChecked.value !== true || !emailCodeVerified.value) {
    signupError.value = "이메일 중복확인 및 인증을 완료해주세요.";
    return;
  }
  if (!isPwValid.value) {
    signupError.value = "비밀번호 형식을 확인해주세요.";
    return;
  }
  if (!pwMatch.value) {
    signupError.value = "비밀번호가 일치하지 않습니다.";
    return;
  }

  isLoading.value = true;
  try {
    const res = await signup(
      signupEmail.value,
      signupPw.value,
      signupName.value,
      signupBirthDate.value,
      signupPhone.value,
    );
    if (res.success) {
      router.push("/login");
    } else {
      signupError.value = res.message;
    }
  } catch {
    signupError.value = "회원가입 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};

const inputStyle =
  "width:100%;padding:12px 16px;border-radius:14px;background:#ffffff;color:#1a2e2b;font-size:0.92rem;outline:none;transition:border-color 0.2s;";
const labelStyle =
  "font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em";
const btnOutlineStyle =
  "padding:10px 16px;border-radius:12px;border:1.5px solid #3db89e;background:#fff;color:#3db89e;font-weight:600;font-size:0.82rem;cursor:pointer;white-space:nowrap;flex-shrink:0";
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
          회원가입
        </h2>
      </div>

      <div class="flex flex-col gap-5">
        <!-- 이름 -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">이름</label>
          <div class="relative">
            <User
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
              v-model="signupName"
              :style="`${inputStyle}padding-left:40px; border:1.5px solid rgba(178,228,220,0.5);`"
              placeholder="홍길동"
            />
          </div>
        </div>

        <!-- 생년월일 -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">생년월일</label>
          <div class="relative">
            <Calendar
              :size="15"
              color="#B2E4DC"
              style="
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
              "
            />
            <input
              v-model="signupBirthDate"
              type="date"
              :style="`${inputStyle}padding-left:40px; border:1.5px solid rgba(178,228,220,0.5);`"
            />
          </div>
        </div>

        <!-- 핸드폰번호 -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">핸드폰번호</label>
          <div class="relative">
            <Phone
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
              v-model="signupPhone"
              type="tel"
              :style="`${inputStyle}padding-left:40px; border:1.5px solid rgba(178,228,220,0.5);`"
              placeholder="01012345678"
            />
          </div>
        </div>

        <!-- 아이디 (이메일) -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">아이디 (이메일)</label>
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
                v-model="signupEmail"
                @blur="isEmailTouched = true"
                :style="`${inputStyle}padding-left:40px; border:${showEmailError ? '1.5px solid #ff4d4f' : '1.5px solid rgba(178,228,220,0.5)'};`"
                placeholder="example@email.com"
                @input="
                  emailDuplChecked = null;
                  emailCodeSent = false;
                  emailCodeVerified = false;
                  emailCheckError = '';
                "
              />
            </div>
            <button
              :style="`${btnOutlineStyle}${emailDuplChecked === true ? ';background:#E8F8F5' : ''}${!canCheckDuplication ? ';opacity:0.5;cursor:not-allowed;border-color:rgba(178,228,220,0.8);color:#6b8c87' : ''}`"
              @click="handleEmailCheck"
              :disabled="!canCheckDuplication"
            >
              {{ emailDuplChecked === true ? "✓ 확인완료" : "중복확인" }}
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
            v-else-if="emailCheckError"
            class="flex items-center gap-1.5"
            style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
          >
            <AlertCircle :size="13" /> {{ emailCheckError }}
          </div>
          <div
            v-else-if="emailDuplChecked === true && isEmailValid"
            class="flex items-center gap-1.5"
            style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
          >
            <CheckCircle :size="13" /> 사용 가능한 이메일입니다.
          </div>
        </div>

        <!-- 이메일 인증 -->
        <div
          v-if="emailDuplChecked === true && isEmailValid"
          class="flex flex-col gap-1.5"
        >
          <label :style="labelStyle">이메일 인증</label>
          <div class="flex gap-2 items-center">
            <input
              v-model="emailCode"
              :style="`${inputStyle}border:1.5px solid rgba(178,228,220,0.5); flex:1`"
              placeholder="인증번호 6자리"
              maxlength="6"
              :disabled="emailCodeVerified"
            />
            <button
              v-if="!emailCodeSent"
              :style="btnOutlineStyle"
              @click="handleSendCode"
            >
              인증번호 발송
            </button>
            <button
              v-else-if="!emailCodeVerified"
              :style="btnOutlineStyle"
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
            v-if="sendCodeError"
            class="flex items-center gap-1.5"
            style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
          >
            <AlertCircle :size="13" /> {{ sendCodeError }}
          </div>
          <div
            v-else-if="emailCodeSent && !emailCodeVerified"
            class="flex items-center gap-1.5"
            style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
          >
            <CheckCircle :size="13" /> 인증번호가 발송되었습니다.
          </div>
          <div
            v-if="verifyCodeError"
            class="flex items-center gap-1.5"
            style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
          >
            <AlertCircle :size="13" /> {{ verifyCodeError }}
          </div>
          <div
            v-if="emailCodeVerified"
            class="flex items-center gap-1.5"
            style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
          >
            <CheckCircle :size="13" /> 이메일 인증이 완료되었습니다.
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">비밀번호</label>
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
              v-model="signupPw"
              :type="showPw ? 'text' : 'password'"
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
              @click="showPw = !showPw"
            >
              <EyeOff v-if="showPw" :size="16" /><Eye v-else :size="16" />
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

        <!-- 비밀번호 확인 -->
        <div class="flex flex-col gap-1.5">
          <label :style="labelStyle">비밀번호 확인</label>
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
              v-model="signupPwConfirm"
              :type="showPwC ? 'text' : 'password'"
              :style="`${inputStyle}padding-left:40px; padding-right:44px; border:${pwMismatch ? '1.5px solid #ff4d4f' : pwMatch ? '1.5px solid #3db89e' : '1.5px solid rgba(178,228,220,0.5)'};`"
              placeholder="비밀번호 재입력"
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
              @click="showPwC = !showPwC"
            >
              <EyeOff v-if="showPwC" :size="16" /><Eye v-else :size="16" />
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

        <!-- 공통 에러 -->
        <div
          v-if="signupError"
          class="flex items-center gap-1.5"
          style="color: #ff4d4f; font-size: 0.82rem; font-weight: 500"
        >
          <AlertCircle :size="14" /> {{ signupError }}
        </div>

        <button
          @click="handleSignup"
          :disabled="isLoading"
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
            margin-top: 4px;
          "
          :style="isLoading ? 'opacity:0.7;cursor:default' : ''"
        >
          {{ isLoading ? "처리 중..." : "회원가입 완료" }}
        </button>

        <p class="text-center" style="font-size: 0.82rem; color: #6b8c87">
          이미 계정이 있으신가요?
          <router-link
            to="/login"
            style="
              color: #3db89e;
              font-weight: 600;
              text-decoration: underline;
              text-underline-offset: 3px;
            "
            >로그인</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>
