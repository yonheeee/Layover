<script setup lang="ts">
import { ref } from "vue";
import { User, Calendar, Phone, Train } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { updateKakaoProfile } from "@/api/auth";

const router = useRouter();

const name = ref("");
const birthDate = ref("");
const phone = ref("");
const errorMsg = ref("");
const isSubmitting = ref(false);

const handleSave = async () => {
  if (!name.value || !birthDate.value || !phone.value) {
    errorMsg.value = "모든 항목을 입력해주세요.";
    return;
  }
  errorMsg.value = "";
  isSubmitting.value = true;
  try {
    const res = await updateKakaoProfile(name.value, birthDate.value, phone.value);
    if (!res.success) throw new Error(res.message);
    router.replace("/");
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.";
  } finally {
    isSubmitting.value = false;
  }
};

const handleSkip = () => {
  router.replace("/");
};
</script>

<template>
  <div
    class="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12"
    style="
      background: linear-gradient(155deg, #e8f8f5 0%, #ffffff 60%, #f0faf8 100%);
    "
  >
    <div class="w-full" style="max-width: 400px">
      <!-- 헤더 -->
      <div class="pb-8 flex flex-col items-center justify-center gap-3">
        <div
          class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
          style="background: linear-gradient(135deg, #b2e4dc, #3db89e)"
        >
          <Train :size="18" color="#fff" />
        </div>
        <div class="text-center">
          <h2
            style="
              font-weight: 800;
              font-size: 1.6rem;
              color: #1a2e2b;
              letter-spacing: -0.02em;
            "
          >
            추가 정보 입력
          </h2>
          <p style="font-size: 0.85rem; color: #6b8c87; margin-top: 6px">
            서비스 이용을 위해 기본 정보를 입력해주세요.
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <!-- 이름 -->
        <div class="flex flex-col gap-1.5">
          <label style="font-size: 0.8rem; font-weight: 600; color: #6b8c87; letter-spacing: 0.03em">
            이름
          </label>
          <div class="relative">
            <User
              :size="15"
              color="#B2E4DC"
              style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)"
            />
            <input
              v-model="name"
              type="text"
              placeholder="실명을 입력해주세요"
              style="
                width: 100%;
                padding: 12px 16px 12px 40px;
                border-radius: 14px;
                border: 1.5px solid rgba(178, 228, 220, 0.5);
                background: #ffffff;
                color: #1a2e2b;
                font-size: 0.92rem;
                outline: none;
                transition: border-color 0.2s;
                box-sizing: border-box;
              "
            />
          </div>
        </div>

        <!-- 생년월일 -->
        <div class="flex flex-col gap-1.5">
          <label style="font-size: 0.8rem; font-weight: 600; color: #6b8c87; letter-spacing: 0.03em">
            생년월일
          </label>
          <div class="relative">
            <Calendar
              :size="15"
              color="#B2E4DC"
              style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)"
            />
            <input
              v-model="birthDate"
              type="date"
              style="
                width: 100%;
                padding: 12px 16px 12px 40px;
                border-radius: 14px;
                border: 1.5px solid rgba(178, 228, 220, 0.5);
                background: #ffffff;
                color: #1a2e2b;
                font-size: 0.92rem;
                outline: none;
                transition: border-color 0.2s;
                box-sizing: border-box;
              "
            />
          </div>
        </div>

        <!-- 핸드폰번호 -->
        <div class="flex flex-col gap-1.5">
          <label style="font-size: 0.8rem; font-weight: 600; color: #6b8c87; letter-spacing: 0.03em">
            핸드폰 번호
          </label>
          <div class="relative">
            <Phone
              :size="15"
              color="#B2E4DC"
              style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)"
            />
            <input
              v-model="phone"
              type="tel"
              placeholder="010-0000-0000"
              style="
                width: 100%;
                padding: 12px 16px 12px 40px;
                border-radius: 14px;
                border: 1.5px solid rgba(178, 228, 220, 0.5);
                background: #ffffff;
                color: #1a2e2b;
                font-size: 0.92rem;
                outline: none;
                transition: border-color 0.2s;
                box-sizing: border-box;
              "
            />
          </div>
        </div>

        <!-- 에러 메시지 -->
        <p
          v-if="errorMsg"
          style="font-size: 0.82rem; color: #ff4d4f; font-weight: 500; margin: -8px 0 0 4px"
        >
          {{ errorMsg }}
        </p>

        <!-- 저장 버튼 -->
        <button
          @click="handleSave"
          :disabled="isSubmitting"
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
            opacity: 1;
            transition: opacity 0.2s;
          "
          :style="{ opacity: isSubmitting ? 0.7 : 1 }"
        >
          {{ isSubmitting ? "저장 중..." : "저장하기" }}
        </button>

        <!-- 건너뛰기 -->
        <button
          @click="handleSkip"
          style="
            width: 100%;
            padding: 12px;
            border-radius: 14px;
            background: transparent;
            color: #6b8c87;
            font-weight: 600;
            font-size: 0.88rem;
            border: 1.5px solid rgba(178, 228, 220, 0.5);
            cursor: pointer;
            transition: background 0.2s;
          "
        >
          나중에 입력하기
        </button>

        <p
          class="text-center"
          style="font-size: 0.78rem; color: #6b8c87; line-height: 1.5"
        >
          건너뛰어도 마이페이지에서 언제든지 입력할 수 있어요.
        </p>
      </div>
    </div>
  </div>
</template>
