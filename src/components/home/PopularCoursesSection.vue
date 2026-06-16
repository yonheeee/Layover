<script setup lang="ts">
import { Star, Heart, ChevronRight } from "lucide-vue-next";
import { useCheckLogin } from "@/utils/auth";

const { checkLogin } = useCheckLogin();

function handlePlanCourse(courseType: string) {
  if (!checkLogin()) return;
  alert(`${courseType} 기반으로 새 일정을 구성합니다.`);
}
</script>

<template>
  <section style="max-width: 1440px; margin: 0 auto; padding: 0 2rem 6rem">
    <div class="flex flex-col mb-8 space-y-2">
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm self-start"
        style="background: #e8f8f5; color: #3db89e; font-weight: 600"
      >
        <Star :size="13" fill="#3db89e" /> 실시간 인기 코스
      </div>
      <h2
        style="
          font-weight: 700;
          font-size: clamp(1.4rem, 2.5vw, 2rem);
          color: &quot;#1a2e2b&quot;;
          letter-spacing: &quot;-0.02em&quot;;
        "
      >
        다른 여행자들이 가장 많이 선택한 일정
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div
        class="p-8 rounded-3xl flex flex-col justify-between"
        style="
          background: #ffffff;
          border: 1px solid rgba(178, 228, 220, 0.4);
          box-shadow: 0 4px 24px rgba(178, 228, 220, 0.15);
        "
      >
        <div>
          <div class="flex items-center justify-between mb-6">
            <h3
              style="font-weight: 700; font-size: 1.15rem; color: #1a2e2b"
              class="flex items-center gap-2"
            >
              🤖 AI 추천 최다 픽 코스
            </h3>
            <span
              style="
                font-size: 0.8rem;
                color: #3db89e;
                font-weight: 600;
                background: #e8f8f5;
              "
              class="px-2.5 py-1 rounded-md"
            >
              이번 주 1,240회 생성
            </span>
          </div>
          <div
            class="space-y-4 relative pl-4 border-l-2 border-dashed mb-8"
            style="border-color: rgba(61, 184, 158, 0.3)"
          >
            <div class="relative space-y-1">
              <span
                class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full"
                style="
                  background: #3db89e;
                  border: 2px solid #ffffff;
                  box-shadow: 0 0 0 2px #3db89e;
                "
              ></span>
              <div class="font-bold text-sm text-gray-800">대전역 출발</div>
              <div class="text-xs text-gray-500">환승 대기 시작</div>
            </div>
            <div class="relative space-y-1">
              <span
                class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full"
                style="background: #3db89e"
              ></span>
              <div class="font-bold text-sm text-gray-800">
                성심당 본점
                <span style="color: #3db89e" class="text-xs ml-1"
                  >🍞 도보 10분</span
                >
              </div>
              <div class="text-xs text-gray-600">
                명물 튀김소보로 구매 및 베이커리 투어 (40분 소요)
              </div>
            </div>
            <div class="relative space-y-1">
              <span
                class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full"
                style="background: #3db89e"
              ></span>
              <div class="font-bold text-sm text-gray-800">
                중앙시장 먹자골목
                <span style="color: #3db89e" class="text-xs ml-1"
                  >🍜 도보 5분</span
                >
              </div>
              <div class="text-xs text-gray-600">
                대전식 바비큐 떡볶이와 전통시장 주전부리 공략 (50분 소요)
              </div>
            </div>
            <div class="relative space-y-1">
              <span
                class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full"
                style="
                  background: #3db89e;
                  border: 2px solid #ffffff;
                  box-shadow: 0 0 0 2px #3db89e;
                "
              ></span>
              <div class="font-bold text-sm text-gray-800">대전역 복귀</div>
              <div class="text-xs text-gray-500">총 2시간 소요 컴팩트 코스</div>
            </div>
          </div>
        </div>
        <button
          @click="handlePlanCourse('AI 최다 픽 코스')"
          class="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 border hover:bg-[#3db89e] hover:text-white group cursor-pointer"
          style="border-color: #3db89e; color: #3db89e; background: #ffffff"
        >
          이 코스로 여행 계획 세우기
          <ChevronRight
            :size="15"
            class="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <div
        class="p-8 rounded-3xl flex flex-col justify-between"
        style="
          background: #ffffff;
          border: 1px solid rgba(178, 228, 220, 0.4);
          box-shadow: 0 4px 24px rgba(178, 228, 220, 0.15);
        "
      >
        <div>
          <div class="flex items-center justify-between mb-6">
            <h3
              style="font-weight: 700; font-size: 1.15rem; color: #1a2e2b"
              class="flex items-center gap-2"
            >
              ❤️ 유저 선정 베스트 힐링 코스
            </h3>
            <div
              class="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md"
            >
              <Heart :size="12" fill="#f43f5e" stroke="none" /> 3,450 찜
            </div>
          </div>
          <div
            class="space-y-4 relative pl-4 border-l-2 border-dashed mb-8"
            style="border-color: rgba(61, 184, 158, 0.3)"
          >
            <div class="relative space-y-1">
              <span
                class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full"
                style="
                  background: #3db89e;
                  border: 2px solid #ffffff;
                  box-shadow: 0 0 0 2px #3db89e;
                "
              ></span>
              <div class="font-bold text-sm text-gray-800">대전역 출발</div>
              <div class="text-xs text-gray-500">
                여유로운 3시간 레이오버전용
              </div>
            </div>
            <div class="relative space-y-1">
              <span
                class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full"
                style="background: #3db89e"
              ></span>
              <div class="font-bold text-sm text-gray-800">
                한밭수목원
                <span style="color: #3db89e" class="text-xs ml-1"
                  >🌿 버스 20분</span
                >
              </div>
              <div class="text-xs text-gray-600">
                도심 속 대형 수목원에서 힐링 산책 및 포토존 이용 (80분 소요)
              </div>
            </div>
            <div class="relative space-y-1">
              <span
                class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full"
                style="background: #3db89e"
              ></span>
              <div class="font-bold text-sm text-gray-800">
                둔산동 감성카페 거리
                <span style="color: #3db89e" class="text-xs ml-1"
                  >☕ 도보 10분</span
                >
              </div>
              <div class="text-xs text-gray-600">
                수목원 근처 로컬 로스터리 카페에서 시그니처 음료 타임 (40분
                소요)
              </div>
            </div>
            <div class="relative space-y-1">
              <span
                class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full"
                style="
                  background: #3db89e;
                  border: 2px solid #ffffff;
                  box-shadow: 0 0 0 2px #3db89e;
                "
              ></span>
              <div class="font-bold text-sm text-gray-800">대전역 복귀</div>
              <div class="text-xs text-gray-500">지하철/택시 연동 원활</div>
            </div>
          </div>
        </div>
        <button
          @click="handlePlanCourse('유저 베스트 힐링 코스')"
          class="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 border hover:bg-[#3db89e] hover:text-white group cursor-pointer"
          style="border-color: #3db89e; color: #3db89e; background: #ffffff"
        >
          이 코스로 여행 계획 세우기
          <ChevronRight
            :size="15"
            class="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  </section>
</template>
