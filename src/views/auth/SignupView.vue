<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Train,
} from "lucide-vue-next";

const signupName = ref("");
const signupEmail = ref("");
const emailCode = ref("");
const emailCodeSent = ref(false);
const emailCodeVerified = ref(false);
const emailDuplChecked = ref<null | boolean>(null); // null: 체크안함, true: 중복없음(사용가능), false: 중복임(사용불가)
const signupPw = ref("");
const signupPwConfirm = ref("");
const showPw = ref(false);
const showPwC = ref(false);

const isEmailTouched = ref(false);
const isPwTouched = ref(false);

// 이메일 형식 유효성 검사
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(signupEmail.value);
});

// 비밀번호 형식 유효성 검사
const isPwValid = computed(() => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(signupPw.value);
});

// 비밀번호 일치 여부
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

// 🌟 [추가] 프론트엔드 단에서 중복확인 버튼 활성화 조건 (올바른 이메일 형식을 썼을 때만 클릭 가능)
const canCheckDuplication = computed(() => isEmailValid.value);

// 🌟 [수정] 중복확인 클릭 시 빈 값 및 형식 체크 트리거
const handleEmailCheck = () => {
  if (!canCheckDuplication.value) {
    isEmailTouched.value = true;
    alert("올바른 이메일 형식을 먼저 입력해주세요.");
    return;
  }

  // 원래는 여기서 백엔드 API를 호출해야 합니다! (ex: axios.post('/api/check-email', ...))
  // 임시로 테스트하기 위해 무조건 true(사용 가능)로 처리하는 로직
  emailDuplChecked.value = true;
};

const inputStyle =
  "width:100%;padding:12px 16px;border-radius:14px;background:#ffffff;color:#1a2e2b;font-size:0.92rem;outline:none;transition:border-color 0.2s;";
const labelStyle =
  "font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em";
const btnOutlineStyle =
  "padding:10px 16px;border-radius:12px;border:1.5px solid #3db89e;background:#fff;color:#3db89e;font-weight:600;font-size:0.82rem;cursor:pointer;white-space:nowrap;flex-shrink:0";

const handleSignup = () => {
  isEmailTouched.value = true;
  isPwTouched.value = true;

  if (!signupName.value) {
    alert("이름을 입력해주세요.");
    return;
  }
  if (
    !isEmailValid.value ||
    emailDuplChecked.value !== true ||
    !emailCodeVerified.value
  ) {
    alert("이메일 중복확인 및 인증을 완료해주세요.");
    return;
  }
  if (!isPwValid.value) {
    alert("비밀번호 형식을 확인해주세요.");
    return;
  }
  if (!pwMatch.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  console.log("회원가입 진행 완료");
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
          회원가입
        </h2>
      </div>

      <div class="flex flex-col gap-5">
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
                "
              />
            </div>
            <button
              :style="`${btnOutlineStyle}${emailDuplChecked === true ? ';background:#E8F8F5' : ''}${!canCheckDuplication ? ';opacity:0.5;cursor:not-allowed;border-color:rgba(178,228,220,0.8);color:#6b8c87' : ''}`"
              @click="handleEmailCheck"
            >
              {{ emailDuplChecked === true ? "✓ 확인완료" : "중복확인" }}
            </button>
          </div>
          <div
            v-if="showEmailError"
            class="flex items-center gap-1.5"
            style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
          >
            <AlertCircle :size="13" /> 알맞은 형식으로 입력해주세요. (예시:
            daejeon@layover.com)
          </div>
          <div
            v-else-if="emailDuplChecked === true && isEmailValid"
            class="flex items-center gap-1.5"
            style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
          >
            <CheckCircle :size="13" /> 사용 가능한 이메일입니다.
          </div>
          <div
            v-else-if="emailDuplChecked === false && signupEmail.length > 0"
            class="flex items-center gap-1.5"
            style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
          >
            <AlertCircle :size="13" /> 이미 사용중인 이메일입니다.
          </div>
        </div>

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
              @click="emailCodeSent = true"
            >
              인증번호 발송
            </button>
            <button
              v-else-if="!emailCodeVerified"
              :style="btnOutlineStyle"
              @click="emailCodeVerified = emailCode === '123456'"
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
            v-if="emailCodeSent && !emailCodeVerified"
            class="flex items-center gap-1.5"
            style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
          >
            <CheckCircle :size="13" /> 인증번호가 발송되었습니다. (테스트:
            123456)
          </div>
          <div
            v-if="emailCodeVerified"
            class="flex items-center gap-1.5"
            style="color: #3db89e; font-size: 0.78rem; font-weight: 500"
          >
            <CheckCircle :size="13" /> 이메일 인증이 완료되었습니다.
          </div>
        </div>

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

        <button
          @click="handleSignup"
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
        >
          회원가입 완료
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
