<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * 로드에 실패하면 아무것도 남기지 않는 이미지.
 *
 * `alt`에 텍스트를 넣으면 이미지가 깨졌을 때 브라우저가 그 글씨를 대신 그린다.
 * 도감·팝업·모달은 모두 바로 옆이나 아래에 이름이 이미 텍스트로 있어서
 * `alt`가 없어도 정보가 사라지지 않는다. 그래서 `alt=""`(장식용 선언)로 두고,
 * 실패하면 요소 자체를 걷어내 깨진 이미지 아이콘까지 보이지 않게 한다.
 *
 * class / style 은 fallthrough 로 <img> 에 그대로 붙는다. 부모의 scoped CSS
 * (예: `.dex-card__thumb img`) 도 자식 루트 노드에는 적용되므로 셀렉터를
 * 바꿀 필요가 없다.
 */
const props = defineProps<{ src?: string | null }>()

const failed = ref(false)

// src 가 바뀌면 실패 상태를 푼다. 그러지 않으면 한 번 깨진 자리가
// 정상 이미지로 교체돼도 계속 빈칸으로 남는다.
watch(() => props.src, () => (failed.value = false))
</script>

<template>
  <img
    v-if="props.src && !failed"
    :src="props.src"
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
    @error="failed = true"
  />
  <!-- 실패 시 렌더 없음 -->
</template>
