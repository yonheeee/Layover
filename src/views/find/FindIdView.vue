<script setup lang="ts">
import { ref } from "vue";
import { CheckCircle, AlertCircle, Train, X, User, Calendar, Phone } from "lucide-vue-next";
import { findId } from "@/api/auth";

type Step = "intro" | "result";
const step = ref<Step>("intro");
const maskedEmail = ref("");
const createdAt = ref("");

const isModalOpen = ref(false);
const isLoading = ref(false);
const modalError = ref("");

const realName = ref("");
const birthDate = ref("");
const phone = ref("");

const openAuthModal = () => {
  isModalOpen.value = true;
  modalError.value = "";
  realName.value = "";
  birthDate.value = "";
  phone.value = "";
};

const handleFindId = async () => {
  modalError.value = "";
  if (!realName.value || !birthDate.value || !phone.value) {
    modalError.value = "모든 항목을 입력해주세요.";
    return;
  }

  isLoading.value = true;
  try {
    const res = await findId(realName.value, birthDate.value, phone.value);
    if (res.success) {
      maskedEmail.value = res.data.maskedEmail;
      createdAt.value = res.data.createdAt;
      isModalOpen.value = false;
      step.value = "result";
    } else {
      modalError.value = res.message;
    }
  } catch {
    modalError.value = "아이디 찾기 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};

const formatCreatedAt = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, "0")}월 ${String(d.getDate()).padStart(2, "0")}일`;
};

const inputStyle =
  "width:100%;padding:12px 16px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#ffffff;color:#1a2e2b;font-size:0.92rem;outline:none";
const labelStyle =
  "font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em";
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
          아이디 찾기
        </h2>
      </div>

      <div class="flex flex-col gap-5">
        <!-- 결과 화면 -->
        <template v-if="step === 'result'">
          <div class="flex flex-col gap-6 items-center text-center">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center"
              style="background: #e8f8f5"
            >
              <CheckCircle :size="32" color="#3db89e" />
            </div>
            <div class="space-y-2 w-full">
              <p style="font-size: 0.88rem; color: #6b8c87">
                본인확인 정보와 일치하는 아이디를 찾았습니다.
              </p>
              <div
                class="px-6 py-4 rounded-2xl"
                style="
                  background: #ffffff;
                  border: 1.5px solid rgba(178, 228, 220, 0.5);
                  box-shadow: 0 4px 12px rgba(26, 46, 43, 0.02);
                "
              >
                <p
                  style="
                    font-weight: 700;
                    font-size: 1.15rem;
                    color: #1a2e2b;
                    letter-spacing: 0.02em;
                  "
                >
                  {{ maskedEmail }}
                </p>
              </div>
              <p style="font-size: 0.78rem; color: #6b8c87; padding-top: 4px">
                가입일: {{ formatCreatedAt(createdAt) }}
              </p>
            </div>

            <div class="flex flex-col gap-3 w-full">
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
              <router-link
                to="/find-password"
                style="
                  display: block;
                  width: 100%;
                  padding: 13px;
                  border-radius: 14px;
                  border: 1.5px solid rgba(178, 228, 220, 0.5);
                  background: #ffffff;
                  color: #6b8c87;
                  font-weight: 600;
                  font-size: 0.92rem;
                  text-align: center;
                  text-decoration: none;
                "
                >비밀번호 찾기</router-link
              >
            </div>
          </div>
        </template>

        <!-- 인트로 화면 -->
        <template v-else>
          <div class="text-center py-4">
            <p
              style="
                font-size: 0.95rem;
                font-weight: 600;
                color: #1a2e2b;
                line-height: 1.6;
              "
            >
              이름, 생년월일, 핸드폰번호로<br />가입한 아이디를 찾습니다.
            </p>
            <p style="font-size: 0.82rem; color: #6b8c87; margin-top: 6px">
              가입 시 등록한 정보를 정확히 입력해주세요.
            </p>
          </div>

          <button
            @click="openAuthModal"
            style="
              width: 100%;
              padding: 14px;
              border-radius: 14px;
              background: linear-gradient(135deg, #b2e4dc, #3db89e);
              color: #fff;
              font-weight: 700;
              font-size: 1rem;
              border: none;
              cursor: pointer;
              box-shadow: 0 4px 14px rgba(61, 184, 158, 0.3);
            "
          >
            아이디 찾기
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
              >로그인으로 돌아가기</router-link
            >
            <span style="color: rgba(178, 228, 220, 0.8); font-size: 0.82rem"
              >|</span
            >
            <router-link
              to="/signup"
              style="
                color: #3db89e;
                font-weight: 600;
                font-size: 0.82rem;
                text-decoration: underline;
                text-underline-offset: 3px;
              "
              >회원가입</router-link
            >
          </div>
        </template>
      </div>
    </div>

    <!-- 아이디 찾기 모달 -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
      style="background: rgba(26, 46, 43, 0.5); backdrop-filter: blur(4px)"
    >
      <div
        class="w-full bg-white rounded-3xl p-6 shadow-2xl relative"
        style="max-width: 360px; border: 1px solid rgba(178, 228, 220, 0.4)"
      >
        <button
          @click="isModalOpen = false"
          class="absolute top-5 right-5"
          style="background: none; border: none; cursor: pointer"
        >
          <X :size="20" color="#6b8c87" />
        </button>

        <div class="flex flex-col gap-4">
          <div class="pt-2">
            <h3 style="font-weight: 800; font-size: 1.2rem; color: #1a2e2b">
              본인 정보 입력
            </h3>
            <p style="font-size: 0.8rem; color: #6b8c87; margin-top: 4px">
              가입 시 등록한 정보를 입력하세요.
            </p>
          </div>

          <div class="flex flex-col gap-3 pt-1">
            <!-- 이름 -->
            <div class="flex flex-col gap-1">
              <label :style="labelStyle">이름</label>
              <div class="relative">
                <User
                  :size="14"
                  color="#B2E4DC"
                  style="
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                  "
                />
                <input
                  v-model="realName"
                  :style="`${inputStyle}padding-left:36px;`"
                  placeholder="홍길동"
                />
              </div>
            </div>

            <!-- 생년월일 -->
            <div class="flex flex-col gap-1">
              <label :style="labelStyle">생년월일</label>
              <div class="relative">
                <Calendar
                  :size="14"
                  color="#B2E4DC"
                  style="
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                  "
                />
                <input
                  v-model="birthDate"
                  type="date"
                  :style="`${inputStyle}padding-left:36px;`"
                />
              </div>
            </div>

            <!-- 핸드폰번호 -->
            <div class="flex flex-col gap-1">
              <label :style="labelStyle">핸드폰번호</label>
              <div class="relative">
                <Phone
                  :size="14"
                  color="#B2E4DC"
                  style="
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                  "
                />
                <input
                  v-model="phone"
                  type="tel"
                  :style="`${inputStyle}padding-left:36px;`"
                  placeholder="01012345678"
                />
              </div>
            </div>

            <!-- 에러 메시지 -->
            <div
              v-if="modalError"
              class="flex items-center gap-1.5"
              style="color: #ff4d4f; font-size: 0.78rem; font-weight: 500"
            >
              <AlertCircle :size="13" /> {{ modalError }}
            </div>

            <button
              @click="handleFindId"
              :disabled="isLoading"
              style="
                width: 100%;
                padding: 13px;
                border-radius: 12px;
                background: linear-gradient(135deg, #b2e4dc, #3db89e);
                color: #fff;
                font-weight: 700;
                font-size: 0.92rem;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(61, 184, 158, 0.25);
                margin-top: 4px;
              "
              :style="isLoading ? 'opacity:0.7;cursor:default' : ''"
            >
              {{ isLoading ? "조회 중..." : "아이디 찾기" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
