<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

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
 * 바꿀 필요가 없다. 래퍼 요소를 두지 않는 이유가 이것이다.
 *
 * `settled` 는 성공이든 실패든 "더 기다릴 필요가 없어진" 시점에 한 번 오른다.
 * 호출부가 그 전까지 '로딩중...' 자리표시를 띄우는 데 쓴다.
 */
const props = defineProps<{ src?: string | null }>()

const emit = defineEmits<{
  load: []
  error: []
  settled: []
}>()

const failed = ref(false)
const imgRef = ref<HTMLImageElement | null>(null)

// src 가 바뀌면 실패 상태를 푼다. 그러지 않으면 한 번 깨진 자리가
// 정상 이미지로 교체돼도 계속 빈칸으로 남는다.
watch(() => props.src, () => (failed.value = false))

function onLoad() {
  emit('load')
  emit('settled')
}

function onError() {
  failed.value = true
  emit('error')
  emit('settled')
}

// 캐시에 있던 이미지는 리스너가 붙기 전에 완료돼 load 이벤트가 오지 않을 수 있다.
onMounted(() => {
  if (imgRef.value?.complete && imgRef.value.naturalWidth > 0) onLoad()
})
</script>

<template>
  <img
    v-if="props.src && !failed"
    ref="imgRef"
    :src="props.src"
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
    @load="onLoad"
    @error="onError"
  />
  <!-- 실패 시 렌더 없음 -->
</template>
