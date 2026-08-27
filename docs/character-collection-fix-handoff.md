# 캐릭터 도감 수정 인수인계

> 작성 2026-08-26 · 대상 `Layover`(FE) / `Layover_Backend`(BE)
> 선행 문서: `docs/character-collection-plan.md` (설계), `docs/stamp-location-verification.md`
> 이 문서는 **147종 도감 반영 이후 남은 수정 작업**만 다룹니다. 위에서부터 순서대로 하면 됩니다.

---

## 0. 시작하기 전에

### 0-1. 환경

```bash
# 프론트
cd Layover
git pull
npm install
npm run dev            # http://localhost:5173

# 백엔드
cd ../Layover_Backend
git pull
./mvnw spring-boot:run # http://localhost:8080  (기본 프로필 local)
```

`Layover/.env` 에 `VITE_API_BASE_URL=http://localhost:8080` 이 있어야 합니다.

### 0-2. DB 마이그레이션이 적용됐는지 먼저 확인

아직 안 돌렸다면 **반드시 이 순서**입니다. 뒤집으면 147행이 전부 거부됩니다
(`schema.sql`의 `characters.required_stamps`가 `int NOT NULL`인데 시드가 그 컬럼을 넣지 않기 때문. `character_collection.sql`이 `DEFAULT NULL`로 완화합니다).

```bash
mysql -u root -p daejeon_layover < src/main/resources/db/character_collection.sql
mysql -u root -p daejeon_layover < src/main/resources/db/character_seed.sql
```

```sql
-- 확인
SELECT COUNT(*) FROM characters;                      -- 147
SELECT kind, COUNT(*) FROM characters GROUP BY kind;  -- SOLO 139 / DUO 5 / THEME 3
SHOW INDEX FROM stamps WHERE Key_name = 'uq_stamps_user_place_day';  -- 1행
SHOW INDEX FROM user_characters WHERE Key_name = 'uq_user_character'; -- 0행 (제거됨)
```

두 가지 주의:

- `character_collection.sql` 앞부분에 `DELETE FROM user_characters; DELETE FROM characters;` 가 있습니다. **기존 도감 기록이 전부 지워집니다.** 팀 공용 DB면 백업 먼저.
- `ALTER TABLE user_characters DROP INDEX uq_user_character, ADD KEY idx_uc_user_char ...` 가 **errno 150**으로 실패할 수 있습니다. `uq_user_character`가 FK `fk_uc_user`의 인덱스를 겸하고 있어서입니다. 실패하면 두 문장으로 쪼개서 ADD를 먼저 실행하세요.

```sql
ALTER TABLE user_characters ADD KEY idx_uc_user_char (user_id, character_id);
ALTER TABLE user_characters DROP INDEX uq_user_character;
```

### 0-3. 브랜치

```bash
git switch -c fix/character-dex
```

---

## 1. [P0] 이미지를 못 불러올 때 아무것도 띄우지 않기

**요구**: 사진을 불러올 수 없을 때 글씨를 띄우지 말고 아무것도 안 띄운다.
**현재**: 적용된 곳이 한 군데도 없습니다. `alt`에 한글이 들어 있으면 이미지가 깨졌을 때 브라우저가 그 글씨를 그립니다.

### 1-1. 대상 목록

| 파일 | 줄 | 현재 | 깨졌을 때 |
|---|---|---|---|
| `views/mypage/CharactersView.vue` | 163~168 | `:alt="isObtained(...) ? character.name : '미획득 캐릭터'"` | 147칸에 "미획득 캐릭터" |
| `views/mypage/CharactersView.vue` | 195 | `:alt="selected.name"` | 모달에 캐릭터 이름 |
| `views/stamp/StampTourView.vue` | 921 | `alt="인증 사진"` | 결과 화면에 "인증 사진" |
| `views/stamp/StampTourView.vue` | 925 | `:alt="drawnCharacter.name"` | 뱃지에 이름 |
| `views/stamp/StampTourView.vue` | 997 | `:alt="newCharacterPopup.name"` | 획득 팝업에 이름 중복 |
| `views/mypage/MypageView.vue` | 1510 | `:alt="char.imageAlt"` | 캐릭터 그리드에 이름 |
| `components/mypage/CharacterDetailModal.vue` | — | `:alt="character.imageAlt \|\| character.name"`, `alt="함께 찍은 인증 사진"` | 모달 두 곳 |

### 1-2. 공용 컴포넌트 신설

`src/components/common/SilentImage.vue` (신규)

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * 로드에 실패하면 아무것도 남기지 않는 이미지.
 *
 * alt에 텍스트를 넣으면 이미지가 깨졌을 때 브라우저가 그 글씨를 그린다.
 * 도감은 카드 아래에 이름(미획득은 '???')이 이미 텍스트로 있어 alt가 없어도
 * 정보 손실이 없다. 실패 시에는 요소 자체를 치워 깨진 아이콘도 안 보이게 한다.
 */
const props = defineProps<{ src?: string | null; class?: string }>()
const failed = ref(false)

// src가 바뀌면 실패 상태를 초기화한다. 안 그러면 한 번 깨진 뒤
// 정상 이미지로 교체돼도 계속 빈칸으로 남는다.
watch(() => props.src, () => (failed.value = false))
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    alt=""
    aria-hidden="true"
    :class="props.class"
    loading="lazy"
    decoding="async"
    @error="failed = true"
  />
  <span v-else :class="props.class" aria-hidden="true" />
</template>
```

`v-else`의 `<span>`이 같은 class를 받으므로 그리드 칸 크기가 무너지지 않습니다.

### 1-3. `resolveCharacterImage`가 빈 문자열을 돌려주지 않게

`src/data/characterImages.ts`

```diff
-export function resolveCharacterImage(code: string, fallback = ''): string {
-  return characterImages[code] ?? fallback
+/**
+ * 못 찾으면 null. 빈 문자열을 돌려주면 <img src=""> 가 현재 문서 URL을
+ * 이미지로 읽으려다 실패해 곧바로 alt를 띄운다.
+ */
+export function resolveCharacterImage(code: string): string | null {
+  return characterImages[code] ?? null
 }
```

`src/data/characterCatalog.ts` 의 `CatalogCharacter.imageUrl` 타입을 `string | null` 로 바꿉니다. `parse()` 안 세 곳은 그대로 두면 됩니다(값이 null로 흐를 뿐).

### 1-4. 엽서에 '꿈' 글자를 그리는 코드 제거 ★

`views/stamp/StampTourView.vue` 502~508. **이건 alt와 달리 저장된 사진에 영구히 남습니다.**

```diff
 const size = Math.round(canvas.width * 0.18)
 const padding = Math.round(size * 0.18)
 const badgeX = canvas.width - size - padding
 const badgeY = canvas.height - size - padding
-ctx.save()
-try {
-  const characterImage = await loadCanvasImage(resolveCharacterImage(character?.code ?? ''))
-  const nw = characterImage.naturalWidth
-  const nh = characterImage.naturalHeight
-  if (nw === 0 || nh === 0) throw new Error('빈 이미지')
-  const scale = Math.min(size / nw, size / nh)
-  const drawW = nw * scale
-  const drawH = nh * scale
-  ctx.drawImage(characterImage, badgeX + (size - drawW) / 2, badgeY + (size - drawH), drawW, drawH)
-} catch {
-  ctx.font = `${Math.round(size * 0.42)}px serif`
-  ctx.textAlign = 'center'
-  ctx.textBaseline = 'middle'
-  ctx.fillStyle = '#3db89e'
-  ctx.fillText('꿈', badgeX + size / 2, badgeY + size / 2)
-}
-ctx.restore()
+
+// 캐릭터 이미지를 못 얹으면 배지 없이 사진만 남긴다.
+// 예전에는 여기서 '꿈' 글자를 그렸는데, 저장된 엽서에 영구히 남는다.
+const badgeUrl = character ? resolveCharacterImage(character.code) : null
+if (badgeUrl) {
+  ctx.save()
+  try {
+    const badge = await loadCanvasImage(badgeUrl)
+    const nw = badge.naturalWidth
+    const nh = badge.naturalHeight
+    // 0×0이면 NaN이 drawImage에 들어가 조용히 사라진다 → 그냥 건너뛴다.
+    if (nw > 0 && nh > 0) {
+      const scale = Math.min(size / nw, size / nh)
+      const drawW = nw * scale
+      const drawH = nh * scale
+      // 가로 중앙, 세로는 하단 기준 — 솔로/듀오가 섞여도 발 위치가 맞는다
+      ctx.drawImage(badge, badgeX + (size - drawW) / 2, badgeY + (size - drawH), drawW, drawH)
+    }
+  } catch {
+    // 배지 생략
+  }
+  ctx.restore()
+}
```

상단 인증 밴드의 `ctx.fillText('✓ ...')`는 **이미지 실패와 무관한 의도된 텍스트**이므로 그대로 둡니다.

### 1-5. `<img>` 교체

각 파일에 `import SilentImage from '@/components/common/SilentImage.vue'` 추가 후 태그만 바꿉니다. 예:

```diff
-<img
-  :src="character.imageUrl"
-  :alt="isObtained(character.code) ? character.name : '미획득 캐릭터'"
-  loading="lazy"
-  decoding="async"
-/>
+<SilentImage :src="character.imageUrl" />
```

`CharactersView.vue`의 실루엣 CSS는 셀렉터가 `.dex-card--locked .dex-card__thumb img` 이므로 그대로 동작합니다. `.dex-modal__thumb img` 도 마찬가지.

`StampTourView.vue` 921의 결과 사진은 클래스를 넘겨야 합니다.

```diff
-<img :src="resultImageUrl" alt="인증 사진" class="w-full h-full object-contain" />
+<SilentImage :src="resultImageUrl" class="w-full h-full object-contain" />
```

### 1-6. `ImageWithFallback.vue`

`src/components/ImageWithFallback.vue`도 실패 시 깨진 이미지 SVG와 `alt="Error loading image"`를 띄웁니다. 도감 경로에서는 안 쓰이지만 정책이 어긋나므로 사용처를 확인한 뒤 `SilentImage`로 통일하거나 삭제하세요.

```bash
grep -rn "ImageWithFallback" src/
```

### 1-7. 확인

- DevTools → Network → `*.png` 를 Block request URL 로 막고 도감을 새로고침 → **147칸이 전부 빈칸, 글씨 없음**
- 같은 상태로 촬영 → 엽서에 '꿈' 글자가 안 찍힘
- 차단 해제 후 새로고침 → 정상 표시 (`watch`가 실패 상태를 푸는지 확인)

---

## 2. [P0] 촬영 시 원본 비율

**요구**: 사진을 찍었을 때 가로세로 변화 없이 원본 비율대로 나온다.
**현재**: 캡처 계산 자체는 왜곡이 없습니다. 문제는 두 가지입니다.

### 2-1. 미리보기와 결과물이 다르다

`views/stamp/StampTourView.vue:878`

```html
<video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover" />
```

`object-cover`는 화면을 채우려고 프레임의 위아래(또는 좌우)를 **잘라서** 보여줍니다. 반면 저장되는 건 잘리지 않은 전체 프레임입니다. 세로로 든 폰에서 카메라가 16:9를 주면 미리보기는 가운데만 보이는데 결과는 훨씬 넓게 나옵니다. 결과 화면은 `object-contain`(`:921`)이라 여기서 위아래 검정 여백이 갑자기 생기고, 이게 "비율이 변했다"는 체감으로 이어집니다.

### 2-2. 실제로 찌그러지는 경로

`views/stamp/StampTourView.vue:447~449`

```ts
canvas.width  = videoRef.value.videoWidth  || 640
canvas.height = videoRef.value.videoHeight || 480
ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)
```

메타데이터 로드 전에 셔터를 누르면 `videoWidth`가 0이라 **640×480 캔버스에 실제 프레임을 억지로 늘려 그립니다.** 셔터 버튼에 `disabled` 조건이 없고 `loadedmetadata`를 기다리지도 않습니다.

### 2-3. 수정

**(a) 준비 상태 게이트** — 필수

```diff
+const videoReady = ref(false)
```

```diff
 async function openCamera() {
   currentStep.value = 'camera'
+  videoReady.value = false
   await nextTick()
```

```diff
-<video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover" />
+<video
+  ref="videoRef"
+  autoplay
+  playsinline
+  muted
+  class="w-full h-full object-contain"
+  @loadedmetadata="videoReady = true"
+/>
```

```diff
 <button @click="capturePhoto"
+  :disabled="!videoReady"
-  class="w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-90"
+  class="w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40"
   style="background:linear-gradient(135deg,#B2E4DC,#3db89e);box-shadow:0 0 0 4px rgba(178,228,220,0.4)">
```

```diff
 async function capturePhoto() {
   if (!videoRef.value || !canvasRef.value || currentPlaceIdx.value === null) return
+  const vw = videoRef.value.videoWidth
+  const vh = videoRef.value.videoHeight
+  // 0이면 아직 프레임이 없다. 폴백 크기로 그리면 실제로 찌그러진다.
+  if (!vw || !vh) return
   const place = places.value[currentPlaceIdx.value]
   const canvas = canvasRef.value
   const ctx = canvas.getContext('2d')!

-  canvas.width = videoRef.value.videoWidth || 640
-  canvas.height = videoRef.value.videoHeight || 480
+  canvas.width = vw
+  canvas.height = vh
   ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)
```

**(b) 미리보기와 결과 일치** — 둘 중 하나를 고르세요.

- **A안 (권장, 위 diff에 포함됨)**: `<video>`를 `object-contain`으로. 미리보기에도 레터박스가 그대로 보여서 화면 = 결과가 됩니다. 카메라 화면이 꽉 차 보이지 않는 대신 구도가 정확히 일치합니다. 컨테이너 배경이 이미 `#000`이라 어색하지 않습니다.
- **B안**: `object-cover`를 유지하고 캔버스를 화면에 보이는 영역만큼 크롭합니다. 꽉 찬 카메라 UI를 지키고 싶을 때.

```ts
// B안 — object-cover와 동일한 계산으로 표시 영역만 잘라낸다
const box = videoRef.value.getBoundingClientRect()
const scale = Math.max(box.width / vw, box.height / vh)
const sw = box.width / scale
const sh = box.height / scale
const sx = (vw - sw) / 2
const sy = (vh - sh) / 2

canvas.width = Math.round(sw)
canvas.height = Math.round(sh)
ctx.drawImage(videoRef.value, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
```

`composePostcard()`는 `frame.width/height`를 그대로 쓰므로 어느 쪽을 골라도 손댈 필요가 없습니다.

### 2-4. 확인

- 실기기 세로 / 가로로 각각 촬영 → 미리보기 구도와 저장본이 같은지
- 가이드 모달이 닫히자마자 셔터 연타 → 버튼이 비활성이고 찌그러진 사진이 안 나오는지
- 도감·모달·팝업·마이페이지는 전부 `object-contain`이라 정지 이미지 쪽은 손댈 곳 없음

---

## 3. [P1] 마이페이지 도감을 서버 기준으로

**요구**: 유저별로 마이페이지에 실루엣 처리된 모든 사진이 있다.
**현재**: `/mypage/characters`는 요구대로 동작합니다. **마이페이지 본체가 아직 옛날 코드입니다.**

### 3-1. 무엇이 문제인가

`views/mypage/MypageView.vue:365` `postcardCharacters`가 `stampStore.photos` = localStorage `stamp_photos`에서 파생됩니다.

- 실루엣이 없습니다. 획득한 것만 나오고 147칸 도감이 아닙니다.
- 기기 로컬 기록이라 **다른 브라우저·다른 기기로 같은 계정에 로그인하면 비어 있습니다.** "유저별"의 근거가 서버가 아니라 브라우저입니다.
- `StampTourView.vue:597`이 `characterImageUrl`에 **빌드 해시가 붙은 번들 URL을 통째로 저장**합니다. 재배포하면 해시가 바뀌어 저장된 URL이 전부 404 → 마이페이지 캐릭터가 한꺼번에 깨집니다.
- `/mypage/characters`로 가는 링크가 마이페이지에 없습니다. 유일한 진입점이 스탬프 투어 완료 화면(`StampTourView.vue:795`)뿐입니다.

> 계정 전환 시 이전 계정 도감이 남던 문제는 이미 해결돼 있습니다. 로그아웃 두 경로 모두 `clearUserScopedStorage()`를 부르고 목록에 `stamp_photos`가 들어 있습니다 (`utils/storage.ts`).

### 3-2. 수정

1. `views/mypage/CharactersView.vue`의 **진행 요약 + 탭 + 그리드 + 상세 모달**을 `src/components/mypage/CharacterDex.vue`로 추출합니다. `<script setup>`의 `owned` / `loadOwned()` / `catalogGroups` 로직이 통째로 옮겨갑니다. `CharactersView`는 헤더와 뒤로가기만 남기고 `<CharacterDex />`를 렌더합니다.
2. `MypageView.vue`의 스탬프 탭에서 `postcardCharacters` 블록(`:1478~1520` 근처)을 `<CharacterDex />`로 교체하고, `postcardCharacters` computed와 `isCharacterPhoto`, `PostcardCharacter` 타입을 삭제합니다.
3. `CharacterDetailModal.vue`가 `postcardCharacters` 전용이면 함께 정리합니다. `CharacterDex`의 상세 모달이 이미 같은 역할을 합니다.
4. `stores/stamp.ts`의 `StampPhoto`에서 `characterImageUrl` / `characterImageAlt`를 제거하고 `characterCode`만 남깁니다. 표시 시점에 `resolveCharacterImage(code)`로 해석합니다.

```diff
 // StampTourView.vue confirmResult()
 stampStore.addPhoto({
   ...
   characterCode: finalCharacter?.code,
   characterDescription: finalCharacter?.description,
-  characterImageUrl: characterImage(finalCharacter),
-  characterImageAlt: finalCharacter?.name,
   ...
 })
```

5. 마이페이지 스탬프 탭 상단에 도감 링크를 둡니다 (인라인 도감으로 교체했다면 생략 가능).

### 3-3. 확인

- 계정 A로 몇 장 모으고 **명시적 로그아웃** → 계정 B 로그인 시 도감이 비어 있음
- **다른 브라우저**에서 A로 로그인 → 도감이 그대로 보임 (여기가 핵심)
- `npm run build && npm run preview` 후에도 마이페이지 캐릭터가 안 깨짐

---

## 4. [P1] 사진 저장 경로 / S3

**요구**: 사진 저장이 S3에 제대로 되고 있는지.
**현재**: **로컬에서는 S3로 가지 않습니다. 설정이 그렇게 돼 있습니다.**

### 4-1. 설정 확인 (읽기만 — 수정하지 말 것)

| 파일 | 값 | 효과 |
|---|---|---|
| `application.properties:13` | `spring.profiles.active=${SPRING_PROFILES_ACTIVE:local}` | 기본 프로필 local |
| `application.properties:71` | `storage.type=${STORAGE_TYPE:local}` | 기본 local |
| `application-local.properties` | `storage.type=local` | 로컬에서 **다시 못 박음** |
| `application-prod.properties` | `storage.type=s3` | 배포에서만 S3 |

`application-local.properties`에 `aws.s3.bucket`이 적혀 있어 S3로 가는 것처럼 보이지만, 바로 아래 줄 `storage.type=local`이 이깁니다. `aws.s3.public-base-url`은 로컬에 아예 없습니다(배포는 `Layover_Backend/docs/cloud-run-env.example:14`에서 환경변수로 주입).

**즉 "로컬에서 찍었는데 S3에 안 올라간다"면 버그가 아니라 정상입니다.**

### 4-2. 로컬에서 S3를 검증하고 싶다면

설정 파일을 고치지 않고 커맨드라인 인자로 덮어씁니다. 프로필 properties가 `${STORAGE_TYPE}` 치환보다 우선순위가 높으므로 환경변수만으로는 안 됩니다.

```bash
AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... \
./mvnw spring-boot:run -Dspring-boot.run.arguments="\
--storage.type=s3 \
--aws.s3.bucket=layover-community-image-storage-989142032322-ap-northeast-2-an \
--aws.s3.public-base-url=https://layover-community-image-storage-989142032322-ap-northeast-2-an.s3.ap-northeast-2.amazonaws.com"
```

촬영 → 저장 후 버킷의 `stamps/photos/` 에 객체가 생기는지, 응답 `photoUrl`이 절대 URL인지 확인합니다.

### 4-3. 로컬 저장일 때 따라오는 프론트 문제 세 가지

**(a) 상대 경로가 해석되지 않는다**

로컬 저장은 `/uploads/...` 같은 상대 경로를 돌려주는데 프론트가 `photo.url`을 그대로 `<img src>`에 넣습니다. 개발 서버는 `vite.config.ts`의 `/uploads` 프록시 덕에 뜨지만 빌드 후엔 404입니다. 이미 `utils/media.ts`에 `resolveMediaUrl()`이 있는데 프로필 이미지에만 쓰입니다.

교체 대상:

- `MypageView.vue:258` — 지도 오버레이 `<img src="${photo.url}">`
- `MypageView.vue:1463` — 인증 사진 그리드
- `MypageView.vue` `activePhotoModal` → `PhotoModal.vue`

```diff
+import { resolveMediaUrl } from '@/utils/media'   // 이미 import 되어 있음 (:37)
-<img :src="photo.url" ... />
+<SilentImage :src="resolveMediaUrl(photo.url)" ... />
```

**(b) dataURL 폴백이 localStorage를 채운다** ★

`StampTourView.vue:588`

```diff
 stampStore.addPhoto({
   id: `${place.id}_${Date.now()}`,
-  url: res.photoUrl || resultImageUrl.value,
+  // 서버가 URL을 안 주면 저장하지 않는다. 예전에는 엽서 dataURL이 통째로
+  // localStorage에 들어가 15~20장이면 QuotaExceededError로 도감이 멈췄다.
+  url: res.photoUrl ?? '',
```

`res.photoUrl`이 빈 값이면 `addPhoto` 자체를 건너뛰는 편이 더 안전합니다. 백엔드 업로드가 정상이면 항상 채워집니다.

**(c) 업로드가 토큰 갱신을 못 탄다**

`api/upload.ts`가 multipart 때문에 `http` 인스턴스 대신 axios를 직접 씁니다. 401 리프레시 인터셉터를 안 타므로 토큰이 만료된 상태로 저장을 누르면 재발급 없이 그냥 실패합니다.

```diff
-import axios from 'axios'
-import type { ApiResponse } from './http'
+import { http, type ApiResponse } from './http'

 async function uploadImage(path: string, file: File, label: string): Promise<string> {
   const formData = new FormData()
   formData.append('file', file)

-  const token = localStorage.getItem('accessToken')
-  const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''
-  const res = await axios.post<ApiResponse<string>>(`${baseURL}${path}`, formData, {
-    headers: token ? { Authorization: `Bearer ${token}` } : {},
-  })
+  // http 인스턴스를 쓰면 Authorization 첨부와 401 리프레시를 그대로 탄다.
+  // Content-Type은 undefined로 덮어써야 axios가 boundary를 직접 채운다.
+  const res = await http.post<ApiResponse<string>>(path, formData, {
+    headers: { 'Content-Type': undefined },
+  })
```

`http`는 현재 named export입니다(`export const http = axios.create(...)`). `ApiResponse`도 같은 파일에 있습니다.

### 4-4. 확인

- 저장 후 DevTools → Network에서 `POST /api/upload/stamp-photo` 가 200이고 응답 `data`가 URL인지
- `POST /api/stamps` 요청 본문에 그 URL이 실려 있는지
- 마이페이지 인증 사진이 뜨는지, localStorage `stamp_photos`에 `data:image/...` 문자열이 **없는지**
- 20장 이상 저장 후에도 `QuotaExceededError`가 안 나는지

---

## 5. [P2] 백엔드 확인 항목

`Layover_Backend/src/main/java/com/ssafy/layover/` 아래는 아직 검증하지 못했습니다. 열어서 아래를 확인하세요.

| 파일 | 확인할 것 |
|---|---|
| `character/CharacterDrawService.java` | `draw()`가 **아무것도 INSERT 하지 않는지**. 테마 확률 `character.theme.probability`, 엑스포 반경 판정, 생일 판정이 `ZoneId.of("Asia/Seoul")`인지 |
| `stamp/StampService.java` | `insertUserCharacter`가 `saveStamp` 트랜잭션 안에서 **정확히 1회**만 호출되는지. `Stamp.create()`의 시각이 KST인지 |
| `common/GlobalExceptionHandler.java` | `DataIntegrityViolationException` / `DuplicateKeyException` → 409 매핑이 있는지 (없으면 더블클릭 시 500) |
| `common/config/FileUploadController.java` | `POST /api/upload/stamp-photo` 가 실제로 있는지, 이미지 MIME/용량 검증 |
| `common/config/S3FileStorageService.java` | `aws.s3.public-base-url`이 비었을 때 어떤 URL을 돌려주는지 |
| `common/security/SecurityConfig.java` | `/api/upload/**` 가 인증 필요로 열려 있는지 |
| `stamp/StampController.java` | `getMyStamps()` 반환 타입. 프론트 `api/stamps.ts`는 `MyStamp[]`(`placeName` 포함)를 기대합니다. 엔티티 `Stamp`를 그대로 내보내면 `getTodayStampedPlaceIds()`가 어긋납니다 |

`user_characters`의 UNIQUE 제약이 사라졌으므로 **실수로 두 번 INSERT해도 DB가 막아주지 않습니다.** 이 확인은 건너뛰지 마세요.

---

## 6. [P3] 나중에 해도 되는 것

- **획득 팝업 설명이 항상 비어 있음** — `character_seed.sql`이 `description`을 채우지 않아 NULL입니다. `StampTourView.vue:1005`의 `v-if="newCharacterPopup.description"`이 항상 거짓입니다. 시드에 설명을 넣거나, 팝업이 프론트 `CHAR_META[baseChar]`를 쓰도록 바꾸세요(도감 상세 모달은 이미 그렇게 합니다).
- **도감 초기 로딩** — 원본 총 17MB, 최대 `theme_char01_birthday.png` 1.4MB. "전체" 탭은 147칸을 한 번에 그립니다. `loading="lazy"`가 있어도 첫 화면 20여 장이 3~4MB입니다. 썸네일(webp 256px)을 따로 만들면 약 1.5MB로 줄어듭니다.

  ```bash
  cd Layover/src/assets/characters/collection
  mkdir -p ../collection-thumb
  for f in *.png; do convert "$f" -resize 256x256 -strip "../collection-thumb/${f%.png}.webp"; done
  ```

  그리드는 썸네일, 상세 모달과 엽서 합성은 원본을 씁니다.
- **`dreamCharacters.ts` 정리** — 뽑기 로직이 서버로 옮겨가 참조가 끊겼습니다. 다만 `dream/character_dream.png`(홈 배너·도감 아이콘)와 `dream_family_02.png`(프로필 기본 이미지, `MypageView.vue:35`)는 계속 씁니다. 나머지 10장만 정리 대상입니다.
- **XP 기준** — `useXp`의 `xpMissionCards`가 아직 `stampStore.photos.length`(localStorage)를 씁니다. 총 XP 계산은 서버 `stampCount`를 쓰고 있어 미션 카드 숫자와 어긋납니다.

---

## 7. 작업 체크리스트

```
[ ] 0-2  DB 마이그레이션 적용 + COUNT 147 확인
[ ] 1-2  SilentImage.vue 신설
[ ] 1-3  resolveCharacterImage → string | null
[ ] 1-4  composePostcard의 '꿈' 폴백 제거          ★ 저장물에 남는 문제
[ ] 1-5  <img> 7곳 교체
[ ] 1-6  ImageWithFallback 정리
[ ] 1-7  이미지 차단 상태로 도감/촬영 확인

[ ] 2-3a videoReady 게이트 + 폴백 크기 제거
[ ] 2-3b object-contain(A안) 또는 크롭 캡처(B안)
[ ] 2-4  실기기 세로/가로 촬영 대조

[ ] 3-2  CharacterDex.vue 추출
[ ] 3-2  MypageView의 postcardCharacters 제거
[ ] 3-2  StampPhoto에서 characterImageUrl 제거
[ ] 3-3  다른 브라우저 로그인 시 도감 유지 확인

[ ] 4-3a resolveMediaUrl 적용 (3곳)
[ ] 4-3b dataURL 폴백 제거                        ★ localStorage 한도
[ ] 4-3c api/upload.ts를 http 인스턴스로
[ ] 4-2  S3 업로드 1회 실검증

[ ] 5    백엔드 7개 항목 확인
```

★ 두 개는 데이터에 흔적이 남는 문제라 먼저 처리하세요.
