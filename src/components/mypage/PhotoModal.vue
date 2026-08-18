<script setup lang="ts">
defineProps<{
  /** 표시할 사진 URL. null이면 모달을 닫는다. */
  src: string | null;
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
      <img :src="src" class="w-full h-auto max-h-[70vh] object-contain rounded-xl" />
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
