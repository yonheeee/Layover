<script setup lang="ts">
import SilentImage from "@/components/common/SilentImage.vue";

defineProps<{
  /** 표시할 사진 URL. 호출부에서 resolveMediaUrl 을 거친 값. null이면 닫는다. */
  src: string | null;
  /** 사진 아래 제목. 보통 "이모지 장소명" */
  title?: string;
  /** 제목 아래 작은 글씨. 보통 캐릭터나 날짜 */
  subtitle?: string;
}>();

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div
    v-if="src"
    class="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm"
    @click="emit('close')"
  >
    <div
      class="relative max-w-lg max-h-[80vh] p-2 bg-white rounded-2xl shadow-2xl mx-4"
      @click.stop
    >
      <SilentImage :src="src" class="w-full h-auto max-h-[70vh] object-contain rounded-xl" />

      <!--
        사진 제목은 이미지 위에 태우지 않고 여기에 둔다. 캔버스에 그려 넣으면
        저장된 파일에 영구히 남아서 나중에 지울 수가 없다.
      -->
      <div v-if="title" class="text-center px-2 pt-3">
        <p class="text-sm font-bold text-[#1a2e2b] truncate">{{ title }}</p>
        <p v-if="subtitle" class="text-[0.72rem] text-gray-400 mt-0.5">{{ subtitle }}</p>
      </div>

      <div class="text-center mt-3">
        <button
          type="button"
          class="px-4 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold"
          @click="emit('close')"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>
