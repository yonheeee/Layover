# 엽서 캐릭터 · 도감 랜덤 뽑기 — 최종 구현 계획

> 대상: `Layover`(FE) / `Layover_Backend`(BE) · 최종 갱신 2026-08-21
> 목표: 사진 촬영 시 147종 중 랜덤 1종 · 리롤 허용 · 저장 시 해금 · 중복 허용 · 유저별 도감 · 생일/엑스포 테마 가중

## 확정 사항

| # | 결정 | 근거 |
|---|---|---|
| 1 | 이미지는 `src/assets/characters/collection/` **(배치 완료)** | 번들 해시로 캐시 안전, 빌드 타임 검증 |
| 2 | DB에는 경로가 아니라 **`code`(파일명 stem)** 저장 | DB가 프론트 배포 경로를 몰라야 함 |
| 3 | 스탬프 제한 **장소당 평생 1회 → 하루 1회** | 정상 재방문이 영구히 막히는 문제 |
| 4 | **촬영할 때마다 리롤 허용** | 마음에 들 때까지 다시 찍는 건 유저 권한 |
| 5 | **도감 해금은 "저장" 시점에만** | 버린 사진의 캐릭터가 도감에 들어가면 안 됨 |
| 6 | 뽑기 주체는 **백엔드 단일화** | 현재 FE/BE가 각자 캐릭터를 정하고 서로 불일치 |
| 7 | 도감 저장소 **localStorage → 서버** | "유저별 도감"의 실제 해결점 |
| 8 | **S3에는 유저가 만든 사진만** (엽서·커뮤니티·프로필) | 캐릭터 원본은 정적 에셋, 프론트 번들이 적합 |
| 9 | **전체 147종 목록은 프론트가 폴더에서 유도**, 서버는 보유분만 반환 | 프론트가 이미 파일을 다 갖고 있음. 서버는 뽑기용 풀만 DB로 관리 |

---

## 1. 현재 상태 진단

### 1-1. 엽서 캐릭터와 서버 캐릭터가 서로 다른 시스템입니다

- **엽서에 합성되는 캐릭터** → `StampTourView.vue`의 `rewardCharacterForStampIndex(idx)` = `collectibleDreamCharacters[idx % 11]`. 코스 내 방문 **순번**으로 결정. 랜덤 아님
- **"새 캐릭터 획득!" 팝업** → 서버 `POST /api/stamps` 응답의 `newCharacter`. `required_stamps`가 누적 스탬프 수와 정확히 일치할 때만 지급

사용자는 A와 찍은 사진을 보면서 B를 획득했다는 팝업을 봅니다.

### 1-2. 백엔드 흐름

```
POST /api/stamps  (StampService.saveStamp)  @Transactional
  ├─ existsByUserIdAndPlaceId → true면 409          ← 날짜 조건 없음 = 평생 1회
  ├─ verifyLocation (반경 100m)
  ├─ stamps INSERT
  ├─ users.stamp_count++ → newCount
  ├─ findByRequiredStamps(newCount) → 미보유면 user_characters INSERT
  └─ StampResponse
```

```sql
characters      (id, name, image_url, required_stamps NOT NULL, description)
user_characters (id, user_id, character_id, obtained_at,
                 UNIQUE KEY uq_user_character (user_id, character_id))   -- 중복 불가
stamps          (id, user_id, place_id, photo_url, visited_at)
users           (…, birth_date date, stamp_count int, …)                 -- 생일 정보 이미 있음
```

### 1-3. 프론트 촬영 흐름

```
timeline → startVerify(idx) [FE 100m 검증] → showGuide() [2초]
         → openCamera() → capturePhoto() [프레임 + 캐릭터 배지 + 상단 밴드 합성]
         → result 화면 ["스탬프 받기 🎉" 버튼 하나뿐 — 다시 찍기 없음]
         → confirmResult() [saveStamp → localStorage → 팝업]
```

### 1-4. 도감 화면이 두 개, 데이터 소스도 두 개

| 화면 | 데이터 |
|---|---|
| `/mypage/characters` (`CharactersView.vue`) | 서버 `/api/characters` (required_stamps 진행바) |
| 마이페이지 "스탬프" 탭 (`MypageView.vue`) | **localStorage** `stamp_photos` |

---

## 2. 이미지 배치 — 완료

```
Layover/src/assets/characters/
├── dream/         ← 기존 12장, 그대로 유지
└── collection/    ← 147장 배치 완료 ✅
```

**실측 결과**

| 항목 | 값 |
|---|---|
| 파일 수 | 147 (일반 144 + 테마 3) |
| 총 용량 | 17 MB |
| 파일 크기 | 최소 21KB / 중앙값 63KB / 최대 1.4MB |
| 4KB 미만 | 0개 → **`assetsInlineLimit` 조정 불필요** |
| 해상도 | 1250×1250 23장, 나머지는 400~950px 제각각 |

### 2-1. 이미지 URL 해석기 (필수)

```ts
// src/data/characterImages.ts
const modules = import.meta.glob<string>(
  '../assets/characters/collection/*.png',
  { eager: true, import: 'default' },
)

/** 'solo_char01_001' → 번들된 이미지 URL */
export const characterImages: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [
    path.split('/').pop()!.replace('.png', ''), url,
  ]),
)

export function resolveCharacterImage(code: string, fallback = '') {
  return characterImages[code] ?? fallback
}
```

이 파일 하나로 147장이 자동으로 잡힙니다. 나중에 이미지를 추가해도 폴더에 넣기만 하면 됩니다.

**절대 하지 말 것** — DB에 `/src/assets/characters/collection/x.png` 같은 문자열 경로 저장. `npm run dev`에서는 되고 `npm run build` 후에 전부 깨집니다. `src/`는 번들 대상이라 빌드 후 파일명에 해시가 붙기 때문입니다.

### 2-2. 이미지 최적화 (선택, 도감 UI 만들 때)

147칸 그리드에 원본 17MB를 쓰면 초기 로딩이 무겁습니다. `lazy` 로딩만으로도 견딜 만하지만, 썸네일을 따로 두면 확실합니다. ImageMagick이 이미 설치돼 있으니 한 줄입니다.

```bash
cd src/assets/characters/collection
mkdir -p ../collection-thumb
for f in *.png; do convert "$f" -resize 256x256 -strip "../collection-thumb/${f%.png}.webp"; done
# 17MB → 약 1.5MB
```

도감 그리드는 썸네일, 상세 모달과 엽서 합성은 원본을 쓰면 됩니다. `resolveCharacterImage(code, { thumb: true })` 식으로 확장하세요.

### 2-3. `dream/` 12장

| 파일 | 쓰이는 곳 | 처리 |
|---|---|---|
| `character_dream.png` | 홈 스탬프 배너, 도감 헤더 아이콘, 이미지 fallback | **유지 필요** |
| `dream_family_02.png` | 프로필 기본 이미지 (`MypageView.vue:79`) | **유지 필요** |
| 나머지 10장 | `dreamCharacters.ts` → 뽑기 로직 전용 | 참조 끊김. 지워도 되고 둬도 번들에 안 들어감 |

뽑기 로직을 제거하면 `dreamCharacters.ts`를 아무도 import 하지 않게 되어 트리 셰이킹으로 빠집니다. **정리는 교체 작업이 끝나고 화면 동작을 확인한 뒤에 하세요.**

---

## 3. 데이터 모델

파일명에서 세 가지 정보를 파싱합니다.

| 필드 | 예 | 용도 |
|---|---|---|
| `code` | `solo_char01_001` | 파일명 stem, 자연키 |
| `kind` | `SOLO` / `DUO` / `THEME` | 분류 |
| `base_char` | `char01`, `char01+char02` | 도감 그룹 (147장을 10명으로 묶기) |
| `theme` | `NULL` / `BIRTHDAY` / `EXPO` | 뽑기 가중 |

**실제 분포 (폴더 실측)**

```
solo_char01  63    solo_char08   8    duo_char01_char02  4
solo_char02  14    solo_char51   8    duo_char06_char07  1
solo_char03   8    solo_char61   9    theme_char01_birthday  1
solo_char04   8    solo_char62   7    theme_char01_expo      1
solo_char06   7    ──────────────     theme_char06_birthday  1
solo_char07   7    solo 합계 139      ─────────── 총 147
```

### 3-1. `charNN` 매핑 (확정)

| 코드 | 이름 | 장수 | | 코드 | 이름 | 장수 |
|---|---|---|---|---|---|---|
| `char01` | 꿈돌이 | 63 | | `char07` | 꿈달이 | 7 |
| `char02` | 꿈순이 | 14 | | `char08` | 몽몽 | 8 |
| `char03` | 꿈빛이 | 8 | | `char51` | 꿈동이 | 8 |
| `char04` | 꿈결이 | 8 | | `char61` | 네브 | 9 |
| `char06` | 꿈별이 | 7 | | `char62` | 도르 | 7 |

`char05`, `char09`~`char50` 등 빠진 번호는 의도된 것입니다.

듀오는 자연스럽게 짝이 맞습니다 — `duo_char01_char02` = 꿈돌이·꿈순이(부부), `duo_char06_char07` = 꿈별이·꿈달이(쌍둥이 막내).

147장에 설명을 147번 쓸 필요는 없습니다. `solo_char01_001`~`_063`은 전부 같은 꿈돌이의 포즈 변형이니, 설명은 `base_char` 단위로 한 번만 두고 화면에서 붙입니다. → `src/data/characterCatalog.ts`의 `CHAR_NAMES` / `CHAR_META` **(작성 완료)**

> `dreamCharacters.ts`에서 텍스트를 가져올 때 **그 파일을 import 하면 안 됩니다.** 파일 맨 위 12줄이 `import ...png`라서 텍스트만 필요한데 이미지 12장이 통째로 번들에 딸려 들어갑니다. 그래서 `characterCatalog.ts`는 텍스트를 복사해 두고 `dreamCharacters.ts`를 참조하지 않습니다.

### 3-2. 전체 목록은 프론트가 유도합니다

`collection/` 폴더에 147장이 있으므로 **도감 그리드에 무엇이 존재하는지는 프론트가 압니다.** 서버는 "이 유저가 무엇을 몇 장 가졌는지"만 내려주면 됩니다.

```
characterCatalog (FE, 147종)  ×  GET /api/characters/my (보유분)  →  도감 화면
characters 테이블 (DB, 147행)                                     →  서버 뽑기 풀
```

DB 시드와 폴더가 어긋나면(파일은 추가했는데 시드를 안 넣은 경우) 도감에 영원히 못 얻는 칸이 생깁니다. 이미지 추가 시 시드 스크립트를 다시 돌리세요.

---

## 4. 구현 계획

### 4-1. DB 스키마

```sql
-- 캐릭터 마스터
ALTER TABLE characters
  ADD COLUMN code      varchar(80)  NOT NULL AFTER id,
  ADD COLUMN kind      varchar(10)  NOT NULL DEFAULT 'SOLO',
  ADD COLUMN theme     varchar(20)  DEFAULT NULL,
  ADD COLUMN base_char varchar(30)  DEFAULT NULL,
  MODIFY COLUMN required_stamps int NULL,      -- 삭제하지 말 것 (CharactersView가 참조 중)
  MODIFY COLUMN image_url varchar(500) NULL,   -- 더 이상 사용 안 함
  ADD UNIQUE KEY uq_characters_code (code),
  ADD KEY idx_characters_theme (theme);

-- 도감: 중복 허용 + 출처 기록
ALTER TABLE user_characters
  DROP INDEX uq_user_character,                -- ★ 핵심
  ADD COLUMN stamp_id  char(36)     DEFAULT NULL,
  ADD COLUMN place_id  char(36)     DEFAULT NULL,
  ADD COLUMN photo_url varchar(500) DEFAULT NULL,
  ADD KEY idx_uc_user_char (user_id, character_id);

-- 하루 1회를 DB 레벨에서 보장 (7-3 참고)
ALTER TABLE stamps
  ADD COLUMN visited_on date GENERATED ALWAYS AS (DATE(visited_at)) STORED,
  ADD UNIQUE KEY uq_stamps_user_place_day (user_id, place_id, visited_on);
```

`user_characters`가 "보유 목록"에서 **"뽑기 로그"** 로 성격이 바뀝니다.

```sql
-- 도감 조회 (중복 카운트 포함) — 기존 2쿼리 방식을 대체
SELECT c.*, COUNT(uc.id) AS obtained_count, MIN(uc.obtained_at) AS first_obtained_at
FROM characters c
LEFT JOIN user_characters uc ON uc.character_id = c.id AND uc.user_id = #{userId}
GROUP BY c.id
ORDER BY c.base_char, c.code;
```

### 4-2. 147행 시드 생성 스크립트

폴더에서 직접 SQL을 뽑습니다. 프로젝트 루트에서 실행하세요.

```python
# scripts/gen_character_seed.py
import re, pathlib

SRC = pathlib.Path("src/assets/characters/collection")
rows = []

for p in sorted(SRC.glob("*.png")):
    code = p.stem
    if code.startswith("theme_"):
        m = re.match(r"theme_(char\d+)_(\w+)", code)
        kind, base, theme = "THEME", m.group(1), m.group(2).upper()
    elif code.startswith("duo_"):
        m = re.match(r"duo_(char\d+)_(char\d+)_\d+", code)
        kind, base, theme = "DUO", f"{m.group(1)}+{m.group(2)}", None
    else:
        m = re.match(r"solo_(char\d+)_\d+", code)
        kind, base, theme = "SOLO", m.group(1), None
    t = "NULL" if theme is None else f"'{theme}'"
    rows.append(f"(UUID(), '{code}', '{kind}', {t}, '{base}')")

print("INSERT INTO characters (id, code, kind, theme, base_char) VALUES")
print(",\n".join(rows) + ";")
```

```bash
python3 scripts/gen_character_seed.py > src/main/resources/db/character_seed.sql
```

`name`/`description`은 NULL로 두고 화면에서 `CHAR_META[base_char]`로 붙이거나, DB에 넣고 싶으면 스크립트에 이름 맵을 추가하세요.

### 4-3. 뽑기 서비스 — 리롤 지원

리롤을 허용하므로 **뽑기(비영속)와 해금(영속)을 분리**합니다.

```
POST /api/characters/draw  { placeId }  →  { character }     ← DB 기록 없음, 몇 번이든 호출 가능
POST /api/stamps  { placeId, characterId, photoUrl, coords } ← 이때만 user_characters INSERT
```

```java
@Service
@RequiredArgsConstructor
public class CharacterDrawService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final CharacterMapper characterMapper;
    private final UserRepository userRepository;

    @Value("${character.theme.probability:0.7}")
    private double themeProbability;

    /** 뽑기만 한다. 저장하지 않는다. */
    public Character draw(String userId, Place place) {
        List<String> themes = activeThemes(userId, place);
        var rnd = ThreadLocalRandom.current();

        if (!themes.isEmpty() && rnd.nextDouble() < themeProbability) {
            List<Character> themed = characterMapper.findByThemes(themes);
            if (!themed.isEmpty()) return themed.get(rnd.nextInt(themed.size()));
        }
        List<Character> pool = characterMapper.findDrawPool();   // theme IS NULL → 144종
        return pool.get(rnd.nextInt(pool.size()));
    }

    /** 저장 시점 검증: 클라이언트가 보낸 캐릭터가 지금 획득 가능한 것인지 */
    public void validate(String userId, Place place, Character chosen) {
        if (chosen.getTheme() == null) return;      // 일반 144종은 서로 등가 → 검증 불필요
        if (!activeThemes(userId, place).contains(chosen.getTheme())) {
            throw new IllegalArgumentException("지금은 획득할 수 없는 테마 캐릭터입니다.");
        }
    }

    public List<String> activeThemes(String userId, Place place) {
        List<String> themes = new ArrayList<>();
        if (isBirthday(userId)) themes.add("BIRTHDAY");
        if (isExpo(place))      themes.add("EXPO");
        return themes;
    }
}
```

**`validate()`가 이 정도로 충분한 이유.** 클라이언트가 `characterId`를 보내므로 원리상 원하는 캐릭터를 지정할 수 있습니다. 그런데 일반 144종은 전부 같은 확률·같은 가치라 그중 하나를 골라 봐야 얻는 게 없습니다. 값이 있는 건 테마 3장뿐이고 그건 위 검증으로 막힙니다. 리롤이 허용된 이상 더 조일 실익이 없습니다.

**2단계 추첨을 쓰는 이유.** "테마 활성이면 70%로 테마 카드, 아니면 144종 균등"이 가중치 컬럼 방식보다 튜닝과 검증이 쉽습니다.

- 생일 → 테마 2장 중 균등 = 각 35%
- 엑스포 → 테마 1장 = 70%
- 생일 ∧ 엑스포 → 3장 균등 = 각 23.3%
- **평소에는 테마 3장이 풀에서 제외** (`WHERE theme IS NULL`)

```xml
<select id="findDrawPool" resultMap="CharacterResultMap">
    SELECT * FROM characters WHERE theme IS NULL ORDER BY code
</select>
<select id="findByThemes" resultMap="CharacterResultMap">
    SELECT * FROM characters WHERE theme IN
    <foreach item="t" collection="themes" open="(" separator="," close=")">#{t}</foreach>
    ORDER BY code
</select>
```

> 성능: `findDrawPool()`은 리롤할 때마다 147행을 읽습니다. 마스터 데이터라 거의 안 바뀌므로 `@PostConstruct` 메모리 캐시 또는 `@Cacheable`을 권합니다.

**생일 판정** — `users.birth_date` 활용

```java
private boolean isBirthday(String userId) {
    LocalDate birth = userRepository.findBirthDate(userId);   // 신규 메서드
    if (birth == null) return false;
    LocalDate today = LocalDate.now(SEOUL);
    if (birth.getMonthValue() == today.getMonthValue()
        && birth.getDayOfMonth() == today.getDayOfMonth()) return true;
    // 2/29 생일은 평년에 3/1로 인정
    return birth.getMonthValue() == 2 && birth.getDayOfMonth() == 29
        && today.getMonthValue() == 3 && today.getDayOfMonth() == 1 && !today.isLeapYear();
}
```

**엑스포 판정**

| 방식 | 장점 | 주의 |
|---|---|---|
| **(권장) 좌표 반경** — 엑스포과학공원 중심 + 반경 1.5km | DB 변경 없음, TourAPI 동기화 영향 없음, 한빛탑·엑스포다리·신세계 아트앤사이언스가 자연히 포함 | 반경 튜닝 |
| `places.theme_tag` 컬럼 | 원하는 장소만 정확히 지정 | `PlaceSyncScheduler`가 매일 03:00 `upsertPlace`로 덮어씀 → `PlaceMapper.xml`의 upsert 컬럼에 없는지 확인 |

```properties
character.theme.probability=0.7
character.theme.expo.latitude=36.3746
character.theme.expo.longitude=127.3894
character.theme.expo.radius-meters=1500
```

`StampService.distanceMeters()`를 그대로 재사용하세요.

### 4-4. `StampService.saveStamp` 교체

```java
@Transactional
public StampResponse saveStamp(String userId, SaveStampRequest req) {
    LocalDate today = LocalDate.now(SEOUL);
    if (stampMapper.existsByUserIdAndPlaceIdBetween(
            userId, req.getPlaceId(), today.atStartOfDay(), today.plusDays(1).atStartOfDay())) {
        throw new DuplicateException("오늘 이미 방문한 장소입니다.");
    }

    Place place = verifyLocation(req);        // Place 반환하도록 변경 → 중복 조회 제거

    Character chosen = (req.getCharacterId() != null)
            ? characterMapper.findById(req.getCharacterId()) : null;
    if (chosen == null) chosen = characterDrawService.draw(userId, place);   // draw 미호출 대비
    characterDrawService.validate(userId, place, chosen);

    Stamp stamp = Stamp.create(userId, req.getPlaceId(), req.getPhotoUrl());
    try {
        stampMapper.insert(stamp);
    } catch (DuplicateKeyException e) {       // 동시 요청 방어 (7-3)
        throw new DuplicateException("오늘 이미 방문한 장소입니다.");
    }

    userRepository.incrementStampCount(userId);
    characterMapper.insertUserCharacter(UserCharacter.of(
            userId, chosen.getId(), stamp.getId(), place.getId(), req.getPhotoUrl()));

    return StampResponse.of(stamp, userRepository.getStampCount(userId),
                            CharacterResponse.of(chosen, true));
}
```

```xml
<select id="existsByUserIdAndPlaceIdBetween" resultType="boolean">
    SELECT COUNT(*) > 0 FROM stamps
    WHERE user_id = #{userId} AND place_id = #{placeId}
      AND visited_at &gt;= #{from} AND visited_at &lt; #{to}
</select>
```

> `DATE(visited_at) = CURDATE()`는 쓰지 마세요. 컬럼에 함수를 씌우면 인덱스를 못 타고, `CURDATE()`는 DB 세션 타임존을 따르므로 DB가 UTC면 "오늘"이 한국 시간 오전 9시에 바뀝니다.

### 4-5. API / DTO

프론트는 이미 아래 계약에 맞춰 작성되어 있습니다 (`src/api/characters.ts`). 백엔드를 여기에 맞춰 주세요.

**`GET /api/characters/my` — 응답 형태가 바뀝니다**

```jsonc
// 기존: CharacterResponse[] (전체 필드)
// 변경: 보유분만, 중복 횟수 포함
[
  { "code": "solo_char01_007", "count": 3, "firstObtainedAt": "2026-08-20T14:02:11" },
  { "code": "theme_char01_expo", "count": 1, "firstObtainedAt": "2026-08-21T10:30:00" }
]
```

```sql
SELECT c.code,
       COUNT(uc.id)       AS count,
       MIN(uc.obtained_at) AS first_obtained_at
FROM user_characters uc
JOIN characters c ON c.id = uc.character_id
WHERE uc.user_id = #{userId}
GROUP BY c.code
ORDER BY first_obtained_at;
```

**`POST /api/characters/draw` — 신규**

```jsonc
// 요청
{ "placeId": "…" }
// 응답 (ApiResponse 봉투 안)
{ "id": "…", "code": "solo_char01_007", "name": "꿈돌이",
  "kind": "SOLO", "theme": null, "baseChar": "char01", "description": "…" }
```

**나머지**

```java
// SaveStampRequest 에 추가
private String characterId;      // /draw 로 뽑은 캐릭터. null이면 서버가 즉석 추첨

// CharacterResponse 에 추가 (StampResponse.newCharacter 로도 나감)
private String code;             // ★ 프론트가 이걸로 이미지를 해석
private String kind;
private String theme;
private String baseChar;
```

- `image_url`은 응답에서 빼도 됩니다. 프론트가 `code`로 번들 이미지를 찾습니다
- `GET /api/characters`(전체 목록)는 이제 프론트가 안 씁니다. 관리용으로 남기거나 제거하세요
- `CharacterMapper.findAll()`의 `ORDER BY required_stamps ASC` → `ORDER BY base_char, code`
- `StampController.getMyStamps()`가 엔티티 `Stamp`를 그대로 반환 중 → 조회 DTO로 교체 (6-3)

### 4-6. 엽서 사진 S3 업로드

지금 `api/stamps.ts`가 `photoUrl: ''`을 보내고, 엽서 원본은 dataURL로 localStorage에 쌓입니다. **장당 300~500KB에 localStorage 한도가 5~10MB라 15~20장이면 `QuotaExceededError`가 납니다.** 그 시점부터 도감이 조용히 멈춥니다.

인프라는 이미 다 있습니다 — `FileStorageService` / `S3FileStorageService`(UUID 키, immutable 캐시 헤더) / `FileUploadController`. 엔드포인트 하나만 추가하면 됩니다.

```java
// FileUploadController
@PostMapping("/stamp-photo")
public ResponseEntity<ApiResponse<String>> uploadStampPhoto(@RequestParam("file") MultipartFile file) {
    var invalid = validateImage(file);
    if (invalid != null) return invalid;
    return upload(file, "stamps/photos", "인증 사진");
}
```

```ts
// confirmResult() — 저장 누를 때만 업로드
const blob = await new Promise<Blob>((r) =>
  canvasRef.value!.toBlob((b) => r(b!), 'image/jpeg', 0.85))
const photoUrl = await uploadStampPhoto(new File([blob], 'stamp.jpg', { type: 'image/jpeg' }))
const res = await saveStamp(place.id, verifiedCoords.value, drawnCharacter.value?.id, photoUrl)

stampStore.addPhoto({ url: photoUrl, … })   // dataURL 대신 URL만 저장
```

- **순서는 업로드 먼저.** 파일 저장은 트랜잭션 롤백에 참여할 수 없습니다. 스탬프 저장이 실패하면 고아 파일이 남지만, 사진 없는 도감 항목은 유저가 바로 봅니다. S3 lifecycle rule로 정리하세요
- 품질 `0.92 → 0.85`, 폭 1080px 리사이즈면 장당 150KB 안쪽
- `S3FileStorageService`는 `aws.s3.public-base-url` 기준 **공개 URL**을 반환합니다. 키가 UUID라 추측은 불가능하지만 URL을 아는 사람은 볼 수 있습니다. 커뮤니티 공유를 생각하면 이대로가 편하고, 비공개가 필요하면 presigned URL로 바꿔야 합니다

**캐릭터 원본 147장은 S3에 올리지 마세요.** 다른 origin 이미지를 canvas에 그리면 canvas가 tainted 되어 `toDataURL()`이 `SecurityError`를 던집니다. `loadCanvasImage`의 `try/catch`로는 못 잡습니다 — 에러 지점이 `drawImage`가 아니라 `toDataURL`이라 `capturePhoto()` 전체가 터집니다.

### 4-7. `StampTourView.vue` — 촬영·리롤 (수정량 최대)

**제거**

```ts
const collectibleDreamCharacters = …          // 삭제
function rewardCharacterForStampIndex(…) {}   // 삭제
const currentRewardCharacter = computed(…)    // → drawnCharacter ref 로 대체
const nextCharacters / nextCharacter          // required_stamps 기반, 무의미해짐
import { dreamCharacters } from '@/data/dreamCharacters'   // 삭제
```

**새 흐름**

```
카메라 → capturePhoto()
           ├─ 프레임 캡처 → rawFrameUrl
           ├─ await drawCharacter(placeId)          ← 서버 뽑기 (미영속)
           └─ composePostcard(...) → resultImageUrl
         ↓
result 미리보기 (캐릭터 합성된 엽서)
   ├─ [다시 찍기] → retake() → openCamera()         ← 캐릭터도 새로 뽑힘
   └─ [스탬프 받기 🎉] → confirmResult()
         ↓  사진 업로드 → saveStamp(characterId, photoUrl)
       서버 응답 newCharacter로 최종 확정 + 획득 팝업
```

```ts
const rawFrameUrl = ref('')
const drawnCharacter = ref<CharacterResponse | null>(null)

async function capturePhoto() {
  if (!videoRef.value || !canvasRef.value || currentPlaceIdx.value === null) return
  const place = places.value[currentPlaceIdx.value]

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')!
  canvas.width = videoRef.value.videoWidth || 640
  canvas.height = videoRef.value.videoHeight || 480
  ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)
  rawFrameUrl.value = canvas.toDataURL('image/jpeg', 0.92)

  drawnCharacter.value = await drawCharacter(place.id)          // 서버 뽑기
  resultImageUrl.value = await composePostcard(rawFrameUrl.value, place, drawnCharacter.value)
  stopCamera()
  currentStep.value = 'result'
}

function retake() {
  rawFrameUrl.value = ''
  resultImageUrl.value = ''
  drawnCharacter.value = null
  openCamera()          // showGuide() 건너뛰고 바로 카메라
}
```

`composePostcard()`는 지금 `capturePhoto()` 뒷부분(캐릭터 배지 + 상단 밴드 + 텍스트)을 함수로 빼면 됩니다. 캐릭터 이미지는 `resolveCharacterImage(character.code)`로 얻습니다 — same-origin이라 CORS 문제 없습니다.

**결과 화면 템플릿** — "다시 찍기" 추가 + 중복 클릭 방어

```html
<div class="flex gap-3">
  <button @click="retake" :disabled="isSavingStamp" class="flex-1 py-4 rounded-2xl font-bold">
    다시 찍기
  </button>
  <button @click="confirmResult" :disabled="isSavingStamp"
          class="flex-[2] py-4 rounded-2xl font-bold text-white">
    {{ isSavingStamp ? '저장 중…' : '스탬프 받기 🎉' }}
  </button>
</div>
```

문구도 바꿔야 합니다. 지금 `{{ currentRewardCharacter.name }}와 함께한 …`이 저장 전에 나옵니다.

### 4-8. 도감 화면 — 작성 완료

`src/views/mypage/CharactersView.vue`를 새로 썼습니다 (`/mypage/characters`).

- **전체 147종을 항상 표시**하고, 미획득은 **검정 실루엣**, 획득분만 원래 색
- 상단 진행 요약 — "N / 147종", 퍼센트 바, "중복 포함 K장"
- 캐릭터별 탭 (가로 스크롤 칩) — 꿈돌이 12/63 처럼 그룹별 진행률 표시. `함께`(듀오 5) / `특별`(테마 3) 탭 별도
- 중복 보유 시 카드 우측 하단 `×3` 뱃지
- 상세 모달 — 획득분은 소개·획득 횟수·처음 만난 날, 미획득은 `???` + 테마 카드면 획득 힌트("생일 당일에 사진을 찍으면…")
- `loading="lazy"` + `decoding="async"` (원본 총 17MB)
- API 실패 시에도 실루엣 도감은 그대로 렌더 (백엔드 작업 전에도 화면 확인 가능)

**실루엣 처리** — 147장 모두 배경이 투명한 PNG(`srgba`, 모서리 알파 0)라 CSS 필터 한 줄로 됩니다. 별도 실루엣 이미지가 필요 없습니다.

```css
.dex-card--locked .dex-card__thumb img {
  filter: brightness(0);   /* 알파는 그대로, RGB만 0 → 검정 실루엣 */
  opacity: 0.72;
}
```

**`MypageView.vue` 스탬프 탭** (별도 작업) — `postcardCharacters`가 아직 localStorage 파생입니다. 여기는 "함께 찍은 인증 사진"이 붙는 화면이라 사진 서버 이전(4-6)과 함께 처리하는 게 맞습니다. 도감 전체 보기는 `/mypage/characters`로 링크하세요.

---

## 5. localStorage 감사

| 키 | 담긴 것 | 판정 |
|---|---|---|
| `accessToken` / `refreshToken` | JWT | 유지 |
| `stamp_photos` | **엽서 사진 dataURL + 캐릭터 정보** | **★ 서버 이전 필수** (용량 한계도 있음, 4-6) |
| `stamp_active_course` | 진행 중 코스 | 서버 이전 권장 + 최소한 로그아웃 시 삭제 |
| `generated_courses` / `last_request` | AI 코스 후보 | 유지 가능 (휘발성 캐시) — 로그아웃 시 삭제 필요 |
| `layover_celebrated_levels` | 레벨업 축하 이력 | 계정 전환 시 오작동 → 삭제 대상 |
| `layover-tour-*` | 튜토리얼 완료 | 유지 (기기별이 자연스러움) |
| `course_confirmed` | — | **죽은 키**. `course.ts`가 `ref`로 바뀌면서 아무도 안 씀 |

### 발견된 버그 — 계정 전환 시 데이터가 남습니다

로그아웃 경로가 **두 개**인데 지우는 항목이 다릅니다.

```ts
// api/http.ts — 401 refresh 실패 시에만
localStorage.removeItem("accessToken"); removeItem("refreshToken");
localStorage.removeItem("course_confirmed"); removeItem("stamp_photos");

// stores/auth.ts — 사용자가 직접 로그아웃할 때
localStorage.removeItem("accessToken"); removeItem("refreshToken");
// ← stamp_photos 를 안 지웁니다
```

**명시적 로그아웃 후 다른 계정으로 로그인하면 이전 계정의 엽서 도감이 그대로 보입니다.** `stamp_active_course`, `generated_courses`, `last_request`, `layover_celebrated_levels`는 어느 경로로도 안 지워집니다.

```ts
// utils/auth.ts
const USER_SCOPED_KEYS = [
  'accessToken', 'refreshToken', 'stamp_photos', 'stamp_active_course',
  'generated_courses', 'last_request', 'layover_celebrated_levels',
]
export function clearUserScopedStorage() {
  USER_SCOPED_KEYS.forEach((k) => localStorage.removeItem(k))
}
```

`auth.ts` 로그아웃과 `http.ts`의 `clearTokensAndRedirect()` 양쪽에서 호출하세요.

---

## 6. 프론트/백엔드 충돌 지점

### 6-1. 방문 판정 기준이 다릅니다 (가장 위험)

| | 기준 |
|---|---|
| FE `isPlaceStamped()` | `photo.courseId === courseId` — **코스 단위 localStorage** |
| BE `existsByUserIdAndPlaceId()` | 유저+장소 — 평생 1회 (→ 하루 1회로 변경) |

새 코스를 만들면 FE는 "미방문"으로 표시해 인증 버튼을 열어주지만, 촬영을 마친 뒤 서버가 409를 던집니다. **하루 1회로 바꾼 뒤에도 FE가 코스 기준이면 같은 문제가 남습니다.**

```ts
const todayStamped = new Set(
  (await getMyStamps())
    .filter((s) => isSameDay(new Date(s.visitedAt), new Date()))
    .map((s) => s.placeId),
)
// toTourPlaces() 의 visited 판정에 사용
```

### 6-2. 위치 검증이 이중으로, 서로 다르게

| | 값 |
|---|---|
| FE | `dist <= 100` **하드코딩**, `import.meta.env.DEV`면 무조건 통과 |
| BE | `stamp.verification.radius-meters:100`, `enabled:true` |

개발 모드에서 FE는 통과시키는데 BE는 그대로 거부합니다. 촬영을 다 하고 400을 받죠. → 반경을 한 곳으로 모으고, 로컬은 `STAMP_VERIFICATION_ENABLED=false`를 세트로 쓰세요.

### 6-3. `getMyStamps()` 타입 불일치

```java
public ResponseEntity<ApiResponse<List<Stamp>>> getMyStamps(…)   // 엔티티 그대로
```
```ts
export async function getMyStamps(): Promise<StampResponse[]>     // 실제와 다름
```

`Stamp`에는 `stampCount`도 `newCharacter`도 없습니다. 6-1에서 이 API를 쓰기 시작하면 바로 걸립니다.

### 6-4. 캐릭터 결정 주체 이중화

1-1의 문제. **이번 작업의 본체**입니다.

### 6-5. 진행률 계산 기준이 다름

`completedCount`는 현재 코스 안에서만 세고, `CharactersView`의 `myStamps`는 서버 `user.stampCount`입니다. 화면마다 다른 숫자가 보입니다.

### 6-6. XP가 localStorage 기반

`useXp.ts`가 `XP_PER_STAMP = 100`을 `stampStore`(localStorage) 기준으로 계산합니다. 도감을 서버로 옮기면 XP도 서버 `stampCount` 기준으로 맞춰야 합니다.

### 6-7. `stamp_count`의 의미 변경

하루 1회로 완화하면 "방문한 장소 수"가 아니라 **"총 인증 횟수"** 가 됩니다. `CharactersView` 문구, XP 계산, 레벨 임계값을 함께 점검하세요.

---

## 7. 트랜잭션 · 동시성 · 정합성

### 7-1. JPA와 MyBatis 혼용 — 확인 결과 안전합니다

`saveStamp()` 안에서 `StampMapper`/`CharacterMapper`(MyBatis)와 `UserRepository`(JPA)를 함께 씁니다. `MyBatisConfig`가 **자동 구성된 `DataSource`를 그대로 주입받고 별도 `TransactionManager`를 정의하지 않으므로**, MyBatis의 `SqlSessionTemplate`이 `DataSourceUtils`를 통해 `JpaTransactionManager`가 연 커넥션에 올라탑니다. 하나의 트랜잭션으로 원자적으로 동작합니다.

> 나중에 누군가 MyBatis 전용 `DataSourceTransactionManager`를 추가하면 이 보장이 조용히 깨집니다. `MyBatisConfig`에 주석을 남겨두세요.

`incrementStampCount()`는 `@Modifying` 벌크 UPDATE라 영속성 컨텍스트를 갱신하지 않습니다. 지금은 바로 뒤 `getStampCount()`가 DB를 다시 읽으므로 문제없습니다.

### 7-2. 새 설계의 트랜잭션 경계

```
[트랜잭션 밖]  POST /api/characters/draw     ← 읽기만. 100번 호출해도 DB 상태 불변
[트랜잭션 밖]  POST /api/upload/stamp-photo  ← 파일 저장은 롤백 불가. 먼저 끝내고 URL만 전달
[트랜잭션 안]  POST /api/stamps
                 stamps INSERT
                 users.stamp_count++
                 user_characters INSERT
```

**리롤이 트랜잭션에 아무 영향을 주지 않는 게 이 설계의 핵심입니다.**

### 7-3. 하루 1회는 애플리케이션 검사만으로 부족합니다

두 요청이 **동시에** 도착하면 둘 다 `exists` 검사를 통과합니다(READ COMMITTED에서 상대가 아직 커밋 전). 저장 버튼 더블클릭, 모바일 재시도로 재현됩니다. 결과는 스탬프 2개 + 도감 2장.

→ **DB 유니크 제약이 진짜 방어선** (4-1의 `uq_stamps_user_place_day`). `DuplicateKeyException`을 잡아 409로 변환하고, `GlobalExceptionHandler`에 `DataIntegrityViolationException` 핸들러를 추가하세요.

### 7-4. `user_characters` UNIQUE 제거 = 안전망 제거

지금까지는 실수로 두 번 INSERT해도 DB가 막아줬습니다. 중복 허용으로 바꾸면 그 보호가 사라지므로 **`user_characters` INSERT는 오직 `saveStamp` 트랜잭션 안에서 정확히 1회**여야 합니다.

### 7-5. 프론트 에러 처리 구멍

```ts
if (status && status !== 401) { …; return }
// ← status가 undefined(네트워크 오류)면 여기로 빠져나와 아래로 계속 진행
…
stampStore.addPhoto({ … })        // 저장 실패해도 실행됨
places.value[idx].visited = true
```

**네트워크 오류로 저장이 실패해도 UI는 "인증 완료"로 바뀌고 로컬에 사진이 남습니다.** 새로고침하면 사라집니다.

```ts
let res
try {
  res = await saveStamp(place.id, verifiedCoords.value, drawnCharacter.value?.id, photoUrl)
} catch (err: any) {
  const status = err?.response?.status
  if (status === 409)      toast.info(err.response.data?.message ?? '오늘 이미 방문한 장소입니다.')
  else if (status === 400) toast.error(err.response.data?.message ?? '위치를 확인할 수 없습니다.')
  else if (status !== 401) toast.error('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
  return                            // ★ 어떤 경우에도 아래로 흘러가지 않음
} finally {
  isSavingStamp.value = false
}
// 여기부터 저장 성공 확정
```

### 7-6. 타임존 — 배포 시 터질 수 있습니다

`Stamp.create()`가 `LocalDateTime.now()`(JVM 기본 타임존)를 씁니다. JDBC URL에 `serverTimezone=Asia/Seoul`이 있어 드라이버는 그대로 보내므로, **배포 서버 JVM이 UTC면 저장 시각이 9시간 이릅니다.** 하루 경계 판정과 `visited_on` 생성 컬럼이 전부 어긋납니다.

→ 코드에서 항상 `LocalDateTime.now(ZoneId.of("Asia/Seoul"))`를 명시하세요. 생일 판정도 같은 존을 써야 일관됩니다.

### 7-7. 트랜잭션 안에서 외부 호출 금지

뽑기는 DB 조회뿐이라 괜찮습니다. 나중에 "획득 알림 푸시" 같은 걸 넣으려면 `TransactionSynchronization.afterCommit`으로 빼세요.

---

## 8. 최종 작업 목록

### A. 데이터 준비 — 완료

- [x] `src/assets/characters/collection/`에 147장 배치
- [x] `src/data/characterImages.ts` — `import.meta.glob` URL 해석기 (2-1)
- [x] `src/data/characterCatalog.ts` — 147종 카탈로그 + `CHAR_NAMES` / `CHAR_META` (3-1)
- [x] `db/character_seed.sql` — 147행 INSERT 생성 완료 (SOLO 139 / DUO 5 / THEME 3)

### B. DB 마이그레이션

- [ ] `characters`에 `code` / `kind` / `theme` / `base_char` 추가, `required_stamps` NULL 허용
- [ ] `user_characters`에서 `uq_user_character` **제거**, `stamp_id` / `place_id` / `photo_url` 추가
- [ ] `stamps`에 `visited_on` 생성 컬럼 + `uq_stamps_user_place_day` 유니크
- [ ] 147행 시드 INSERT 적용

### C. 백엔드

- [ ] `CharacterMapper` — `findDrawPool` / `findByThemes` / `findById` / 도감 집계 쿼리
- [ ] `CharacterMapper.findAll()` 정렬 `required_stamps` → `base_char, code`
- [ ] `CharacterDrawService` 신설 — `draw()` / `validate()` / 생일 / 엑스포
- [ ] `UserRepository.findBirthDate()` 추가
- [ ] `POST /api/characters/draw` 엔드포인트
- [ ] `StampService.saveStamp` 교체 — 하루 1회 + 뽑기 + `DuplicateKeyException` 처리
- [ ] `verifyLocation()`이 `Place`를 반환하도록 변경 (중복 조회 제거)
- [ ] `CharacterResponse`에 `code` / `kind` / `theme` / `baseChar`
- [ ] **`GET /api/characters/my` 응답을 `[{code, count, firstObtainedAt}]` 로 변경** (4-5) — 프론트가 이미 이 형태를 기다립니다
- [ ] `SaveStampRequest`에 `characterId`
- [ ] `POST /api/upload/stamp-photo` 엔드포인트
- [ ] `StampController.getMyStamps()` 반환 타입을 조회 DTO로 교체
- [ ] `GlobalExceptionHandler`에 `DataIntegrityViolationException` → 409
- [ ] 타임존 `ZoneId.of("Asia/Seoul")` 명시
- [ ] `application.properties`에 `character.theme.*` 설정 추가

### D. 프론트엔드

- [x] `api/characters.ts` — `drawCharacter()` / `getMyCharacters()`, 새 타입 반영
- [x] `CharactersView` — 147종 실루엣 도감 (그룹 탭 / lazy / 중복 뱃지 / 상세 모달)
- [ ] `api/stamps.ts` — `saveStamp(placeId, coords, characterId, photoUrl)` 시그니처 변경
- [ ] `api/upload.ts` — `uploadStampPhoto()` 추가
- [ ] `StampTourView` — 로컬 뽑기 제거, `capturePhoto` 분리, `retake()` 추가, `composePostcard()` 추출
- [ ] `StampTourView` — 결과 화면에 "다시 찍기" 버튼 + `:disabled="isSavingStamp"`
- [ ] `StampTourView` — 에러 처리 구멍 수정 (7-5)
- [ ] `toTourPlaces()`의 `visited` 판정을 서버 "오늘 방문" 기준으로 (6-1)
- [ ] `stampStore.addPhoto`에 dataURL 대신 S3 URL 저장
- [ ] `MypageView` 스탬프 탭 → 서버 API 기반 (사진 이전과 함께)
- [ ] `utils/auth.ts`에 `clearUserScopedStorage()` + 로그아웃 두 경로에서 호출 (5절)
- [ ] `useXp` 스탬프 수를 서버 `stampCount` 기준으로

### E. 정리 (동작 확인 후)

- [ ] `dreamCharacters.ts` 참조 정리 — 텍스트만 쓸 거면 이미지 import와 분리 (2-3)
- [ ] `dream_family_01`, `03`~`11` 삭제 여부 결정
- [ ] `course_confirmed` 죽은 키 제거
- [ ] 도감 썸네일 생성 (2-2)

---

## 9. 검증 체크리스트

**뽑기 확률**
- [ ] 생일 계정으로 20회 뽑아 테마:일반 ≈ 7:3
- [ ] 엑스포 반경 안/밖 장소에서 테마 발동 여부
- [ ] 평소에 테마 3장이 절대 안 나오는지
- [ ] `characterId`를 임의의 테마 카드로 조작해 호출 → 거부되는지

**리롤**
- [ ] 다시 찍기 10번 → `user_characters` 행이 늘지 않음
- [ ] 저장을 눌러야만 도감 반영
- [ ] 다시 찍을 때 캐릭터가 실제로 바뀜

**하루 1회**
- [ ] 같은 장소 연속 저장 → "오늘 이미 방문한 장소입니다."
- [ ] `visited_at`을 어제로 수동 변경 후 재시도 → 통과
- [ ] 저장 버튼 더블클릭 / 동시 요청 2건 → 스탬프 1개만 생성

**유저별 분리**
- [ ] 계정 A로 모으고 **명시적 로그아웃** → 계정 B 로그인 시 도감이 비어 있음
- [ ] 다른 브라우저에서 A 로그인 → 도감이 그대로 보임

**정합성**
- [ ] 네트워크를 끊고 저장 → UI가 "인증 완료"로 바뀌지 않음
- [ ] 같은 캐릭터 두 번 저장 → 500 없이 `×2`로 집계
- [ ] JVM 타임존 UTC에서 밤 11시·새벽 1시 저장 → 날짜 경계가 KST 기준

**성능**
- [ ] 도감 147칸 초기 로딩 시간 (원본 17MB — lazy 적용 확인)
- [ ] 리롤 연타 시 `/draw` 응답 속도 (풀 캐싱 여부)
- [ ] 엽서 20장 이상 저장 후 localStorage 용량 (dataURL 제거 확인)

---

## 부록: 함께 손보면 좋은 것

- `Character.java`가 `java.lang.Character`와 이름 충돌. `CollectibleCharacter` 등으로 개명 고려
- `CharacterService.getAllCharacters()`가 2쿼리 후 메모리 병합 → 4-1의 `LEFT JOIN` 한 방
- `MyBatisConfig`에 "별도 TransactionManager를 정의하지 말 것" 주석 (7-1)
