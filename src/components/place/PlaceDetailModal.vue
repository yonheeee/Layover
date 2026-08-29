<script setup lang="ts">
import PlaceDetailContent from "@/views/place/PlaceDetailContents.vue";

defineProps<{
  placeId: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-modal">
      <div
        v-if="placeId"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="emit('close')"
      >
        <div
          class="place-detail-modal bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col p-6"
          style="max-height: calc(100dvh - 2rem)"
          @click.stop
        >
          <div
            class="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 flex-shrink-0"
          >
            <h3 class="text-base font-bold text-gray-800">장소 상세 정보</h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer transition-colors"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>
          <div class="flex-1 min-h-0 overflow-y-auto pr-1">
            <PlaceDetailContent :id="placeId" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.25s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>
