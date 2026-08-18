<script setup lang="ts">
export interface CharacterDetail {
  name: string;
  imageUrl?: string;
  imageAlt?: string;
  role?: string;
  placeName?: string;
  photoUrl?: string;
  description: string;
}

defineProps<{
  character: CharacterDetail | null;
}>();

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div
    v-if="character"
    class="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
    @click.self="emit('close')"
  >
    <div
      class="mypage-dialog mypage-dialog--sm bg-white p-6 rounded-2xl w-[340px] shadow-xl border border-teal-50 flex flex-col items-center gap-4"
    >
      <img
        v-if="character.imageUrl"
        :src="character.imageUrl"
        :alt="character.imageAlt || character.name"
        class="w-28 h-28 object-contain mt-2"
      />
      <div class="text-center w-full">
        <h3 class="font-bold text-base text-[#1a2e2b] mb-1">{{ character.name }}</h3>
        <p v-if="character.role" class="text-[0.72rem] text-teal-600 font-bold mb-2">
          {{ character.role }}
        </p>
        <p class="text-xs text-gray-500 leading-relaxed px-2 break-all">
          {{ character.description }}
        </p>
      </div>

      <div class="w-full bg-teal-50/50 p-3 rounded-xl border border-teal-100/50">
        <p class="text-[0.68rem] text-teal-700 font-bold mb-2 text-center">
          함께 찍은 인증 장소
        </p>
        <div class="flex items-center gap-3">
          <img
            v-if="character.photoUrl"
            :src="character.photoUrl"
            alt="함께 찍은 인증 사진"
            class="w-14 h-14 rounded-xl object-cover border border-white shadow-sm"
          />
          <div class="min-w-0 text-left">
            <p class="text-xs font-bold text-[#1a2e2b] truncate">
              {{ character.placeName }}
            </p>
            <p class="text-[0.68rem] text-gray-400 mt-1">
              이 장소에서 함께 인증했어요.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors text-white text-xs font-bold"
        @click="emit('close')"
      >
        확인
      </button>
    </div>
  </div>
</template>
