<script setup lang="ts">
import { ref } from "vue";
import { CheckCircle, Smartphone, Train, X } from "lucide-vue-next";

type Step = "intro" | "result";
const step = ref<Step>("intro");
const foundId = ref("");

// 🌟 [추가] 가상 본인인증 팝업(모달) 제어 상태
const isModalOpen = ref(false);
const modalStep = ref<"carrier" | "success">("carrier"); // carrier: 통신사 선택, success: 인증완료 완료단계
const selectedCarrier = ref("");

// 1. 본인인증 시작 버튼 클릭 시
const openAuthModal = () => {
  isModalOpen.value = true;
  modalStep.value = "carrier";
  selectedCarrier.value = "";
};

// 2. 가상 통신사 선택 및 인증 완료 시뮬레이션
const completeAuth = (carrier: string) => {
  selectedCarrier.value = carrier;
  modalStep.value = "success";

  // 1.5초 뒤 모달이 닫히면서 아이디 찾기 결과 화면으로 전환
  setTimeout(() => {
    isModalOpen.value = false;
    foundId.value = "hong***@email.com";
    step.value = "result";
  }, 1500);
};

const inputStyle =
  "width:100%;padding:12px 16px;border-radius:14px;border:1.5px solid rgba(178,228,220,0.5);background:#ffffff;color:#1a2e2b;font-size:0.92rem;outline:none";
const labelStyle =
  "font-size:0.8rem;font-weight:600;color:#6b8c87;letter-spacing:0.03em";
const carrierBtnStyle =
  "width:100%; padding:14px; border-radius:12px; border:1.5px solid rgba(178,228,220,0.4); background:#ffffff; font-weight:700; color:#1a2e2b; text-align:left; cursor:pointer; transition:all 0.2s;";
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
                  {{ foundId }}
                </p>
              </div>
              <p style="font-size: 0.78rem; color: #6b8c87; padding-top: 4px">
                가입일: 2025년 03월 12일
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
              안전한 서비스 이용을 위해<br />본인인증을 진행해주세요.
            </p>
            <p style="font-size: 0.82rem; color: #6b8c87; margin-top: 6px">
              고객님의 명의로 가입된 휴대폰을 통해 인증합니다.
            </p>
          </div>

          <button
            @click="openAuthModal"
            style="width:100%; padding:14px; border-radius:14px; background:linear-gradient(135deg,#B2E4DC,#3db89e); color:#fff; font-weight:700; font-size:1rem; border:none; cursor:pointer; box-shadow:0 4px 14px rgba(61,184,158,0.3); display:flex; items-center; justify-content:center; gap:8px;"
          >
            <Smartphone :size="18" />
            휴대폰 본인인증하기
          </button>

          <div class="flex justify-center gap-4 style='margin-top:10px;'">
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
          class="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
          style="background: none; border: none; cursor: pointer"
        >
          <X :size="20" color="#6b8c87" />
        </button>

        <div v-if="modalStep === 'carrier'" class="flex flex-col gap-4">
          <div class="pt-2">
            <h3 style="font-weight: 800; font-size: 1.2rem; color: #1a2e2b">
              통신사 선택
            </h3>
            <p style="font-size: 0.8rem; color: #6b8c87; margin-top: 4px">
              인증을 진행할 통신사를 선택하세요.
            </p>
          </div>

          <div class="flex flex-col gap-2.5 pt-2">
            <button
              @click="completeAuth('SKT')"
              :style="carrierBtnStyle"
              class="hover:bg-gray-50"
            >
              <span style="color: #e52d2d; margin-right: 6px">SKT</span>
              <span style="font-size: 0.85rem; font-weight: 500; color: #6b8c87"
                >PASS로 인증하기</span
              >
            </button>
            <button
              @click="completeAuth('KT')"
              :style="carrierBtnStyle"
              class="hover:bg-gray-50"
            >
              <span style="color: #1c86ee; margin-right: 6px">KT</span>
              <span style="font-size: 0.85rem; font-weight: 500; color: #6b8c87"
                >PASS로 인증하기</span
              >
            </button>
            <button
              @click="completeAuth('LGU+')"
              :style="carrierBtnStyle"
              class="hover:bg-gray-50"
            >
              <span style="color: #e0115f; margin-right: 6px">LGU+</span>
              <span style="font-size: 0.85rem; font-weight: 500; color: #6b8c87"
                >PASS로 인증하기</span
              >
            </button>
            <button
              @click="completeAuth('알뜰폰')"
              :style="carrierBtnStyle"
              class="hover:bg-gray-50"
            >
              <span style="color: #3db89e; margin-right: 6px">알뜰폰</span>
              <span style="font-size: 0.85rem; font-weight: 500; color: #6b8c87"
                >PASS로 인증하기</span
              >
            </button>
          </div>
        </div>

        <div
          v-else-if="modalStep === 'success'"
          class="flex flex-col items-center justify-center py-8 gap-4 text-center"
        >
          <div
            class="animate-spin w-10 h-10 border-4 border-t-transparent rounded-full"
            style="border-color: #3db89e; border-t-color: transparent"
          ></div>
          <div>
            <h4 style="font-weight: 700; font-size: 1.05rem; color: #1a2e2b">
              [{{ selectedCarrier }}] 본인인증 완료 중
            </h4>
            <p style="font-size: 0.82rem; color: #6b8c87; margin-top: 4px">
              잠시 후 아이디 찾기 결과로 이동합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 회전 스피너를 위한 임시 CSS keyframe 코드 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
