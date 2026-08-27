import { characterCodes, resolveCharacterImage } from './characterImages'

/**
 * 캐릭터 도감 카탈로그.
 *
 * 147장의 전체 목록은 `collection/` 폴더에서 그대로 유도한다. 서버는
 * "이 유저가 무엇을 몇 장 가졌는지"만 내려주면 되고, 도감 그리드에 무엇이
 * 존재하는지는 프론트가 안다.
 *
 * 파일명 규칙
 *   solo_char01_001.png        → SOLO,  base 'char01'
 *   duo_char01_char02_01.png   → DUO,   base 'char01+char02'
 *   theme_char01_birthday.png  → THEME, base 'char01', theme 'BIRTHDAY'
 */

export type CharacterKind = 'SOLO' | 'DUO' | 'THEME'
export type CharacterTheme = 'BIRTHDAY' | 'EXPO'

export interface CatalogCharacter {
  /** 파일명 stem. DB의 characters.code 와 같은 값 */
  code: string
  kind: CharacterKind
  /** 도감 그룹 키. duo는 'char01+char02' */
  baseChar: string
  theme: CharacterTheme | null
  /** 파일명 끝 일련번호 (테마는 0) */
  index: number
  /** 표시용 이름 */
  name: string
  /** 번들 이미지 URL. 폴더에 파일이 없으면 null */
  imageUrl: string | null
}

/** charNN → 꿈씨패밀리 멤버 */
export const CHAR_NAMES: Record<string, string> = {
  char01: '꿈돌이',
  char02: '꿈순이',
  char03: '꿈빛이',
  char04: '꿈결이',
  char06: '꿈별이',
  char07: '꿈달이',
  char08: '몽몽',
  char51: '꿈동이',
  char61: '네브',
  char62: '도르',
}

export interface CharMeta {
  /**
   * 이름 바로 아래 초록 한 줄. 선택.
   *
   * 듀오처럼 이름('꿈돌이·꿈순이')이 이미 누구인지 다 말해 주는 경우에는
   * 비워 둔다. 그러면 그 줄이 아예 렌더되지 않는다.
   */
  role?: string
  description: string
  /**
   * 소개 아래에 핀 아이콘과 함께 붙는 한 줄. 선택.
   *
   * "거기 가면 뭔가 더 있다"는 귀띔용이다. 미획득 테마 카드에 붙는
   * `themeHint` 와 역할이 다르다. 그쪽은 잠긴 카드를 여는 방법이고,
   * 이건 이미 만난 캐릭터를 보다가 다음 목적지를 떠올리게 하는 쪽이다.
   */
  hint?: string
}

/**
 * 캐릭터 소개. 도감 상세 모달과 획득 팝업이 쓴다.
 *
 * 키는 세 가지 단위를 모두 받는다. `resolveCharMeta()` 가 좁은 쪽부터 찾는다.
 *
 *   1. code       'theme_char01_birthday', 'solo_char01_007' — 그림 한 장 전용
 *   2. baseChar   'char01', 'char01+char02'                  — 캐릭터/듀오 단위
 *   3. 듀오의 앞쪽 캐릭터                                      — 마지막 폴백
 *
 * 듀오와 테마는 폴백에 기대면 어색해진다. 예를 들어 꿈돌이·꿈순이가 함께
 * 나온 그림에 "꿈씨패밀리의 아빠" 소개가 붙는다. 아래 듀오·테마 항목을
 * 채우면 그 그림에만 맞는 문구가 나간다.
 */
export const CHAR_META: Record<string, CharMeta> = {
  // 꿈돌이·꿈순이는 가족 내 위치('아빠', '엄마')로 부르지 않는다.
  // 두 사람의 부모님도 각각 캐릭터가 있어서, 그 호칭을 여기 써 버리면
  // 나중에 그분들이 들어올 때 누가 '아빠'인지 어긋난다.
  char01: {
    role: '대전의 마스코트',
    description:
      '1993년 대전엑스포의 마스코트로 태어나 지금은 대전광역시를 대표한다. 과학과 평화의 도시 대전을 누구보다 사랑하고, 요즘 가장 큰 관심사는 대전의 발전과 가족의 안녕.',
    // 도감에서 가장 자주 열리는 카드가 꿈돌이(63장)라 여기에 둔다.
    // 잠긴 '특별' 카드 안에 넣으면 이미 아는 사람만 보게 된다.
    hint: '엑스포에 방문하면 엑스포꿈돌이를 발견할지도?',
  },
  char02: {
    role: '꿈돌이의 짝',
    description: '오랜 시간 함께해 온 꿈돌이와 가정을 꾸렸다. 가족의 웃음을 가장 소중히 여긴다.',
  },
  char03: {
    role: '첫째',
    description: '과학을 정말 좋아해, 폭탄 질문으로 꿈부부를 언제나 당황하게 한다.',
  },
  char04: {
    role: '둘째',
    description: '가만히 앉아 골똘히 생각하는 것이 취미다.',
  },
  char06: {
    role: '막내',
    description: '꿈달이와 쌍둥이. 잠을 잘 때도, 사고를 칠 때도 언제나 함께한다.',
  },
  char07: {
    role: '막내',
    description: '꿈별이와 쌍둥이. 잠을 잘 때도, 사고를 칠 때도 언제나 함께한다.',
  },
  char08: {
    role: '꿈씨 가족의 반려견',
    description: '원래는 긴 꼬리가 멋진 혜성 늑대였지만 지구에 오면서 작은 강아지가 되었다.',
  },
  char51: {
    role: '꿈돌이의 동생',
    description: "최근에는 '좋은 꿈'이라는 주제로 우주 논문을 작성하고 있다.",
  },
  char61: {
    role: '외계 행성 대표',
    description: '데네브 별에서 온 대표자. 꿈돌이의 고향별과 활발히 교류하고 있다.',
  },
  char62: {
    role: '소꿉친구',
    description: '사드르 별에서 온 꿈부부의 오랜 소꿉친구. 어릴 적부터 알고 지낸 막역한 사이다.',
  },

  // ── 듀오 (2명이 함께 나오는 그림) ─────────────────────
  // 이름이 '꿈돌이·꿈순이'로 이미 나오므로 role 은 두지 않는다.
  'char01+char02': { description: '사이좋은 꿈부부♥' }, // 4장 공용
  'char06+char07': { description: '언제나 귀여운 쌍둥이 막내들♥' },

  // ── 테마 (조건이 맞을 때만 나오는 특별 카드) ──────────
  theme_char01_expo: {
    role: '1993 오리지널 꿈돌이',
    description:
      '1993 대전 엑스포 마스코트인 오리지널 꿈돌이. 과학 기술, 산업의 발전을 통한 인류의 평화와 공존 공영의 미래상을 제시하고 미래 주인공인 학생들과 젊은이들에게 꿈과 희망을 주자는 취지에서 우주 아기 요정의 모습으로 디자인되었다.',
  },
  theme_char01_birthday: {
    role: '대전의 마스코트',
    description: '생일 축하드립니다 ♥',
  },
  theme_char06_birthday: {
    role: '쌍둥이 막내',
    description: '생일 축하해요 ♥',
  },
}

/**
 * 이 그림에 붙일 소개를 찾는다.
 *
 * code → baseChar → 듀오의 앞쪽 캐릭터 순으로 좁은 것부터 본다.
 * `CatalogCharacter` 와 서버 `CharacterResponse` 둘 다 받는다.
 */
export function resolveCharMeta(
  character: { code?: string | null; baseChar?: string | null } | null,
): CharMeta | null {
  if (!character) return null
  const base = character.baseChar ?? ''
  return (
    (character.code ? CHAR_META[character.code] : undefined) ??
    CHAR_META[base] ??
    CHAR_META[base.split('+')[0]] ??
    null
  )
}

/**
 * 배경이 불투명한 '장면' 그림.
 *
 * 나머지 146장은 배경이 투명한 캐릭터 컷이라 미획득 처리에 `brightness(0)` 만
 * 걸면 알파가 그대로 남아 검은 실루엣이 된다. 이 그림들은 배경까지 꽉 차 있어서
 * 같은 필터를 걸면 그냥 검은 네모가 된다. 그래서 흐림 처리로 대신한다.
 *
 * 배경을 투명하게 다시 내보내거나 캐릭터만 잘라내면 여기서 빼면 된다.
 */
export const SCENE_CODES = new Set<string>(['theme_char01_birthday'])

export function isSceneArt(code: string): boolean {
  return SCENE_CODES.has(code)
}

/** 탭 노출 순서 */
const BASE_ORDER = [
  'char01', 'char02', 'char03', 'char04', 'char06',
  'char07', 'char08', 'char51', 'char61', 'char62',
]

export const THEME_LABELS: Record<CharacterTheme, string> = {
  BIRTHDAY: '생일',
  EXPO: '엑스포',
}

function displayName(kind: CharacterKind, baseChar: string, theme: CharacterTheme | null): string {
  const names = baseChar.split('+').map((c) => CHAR_NAMES[c] ?? c)
  if (kind === 'THEME' && theme) return `${names.join('·')} (${THEME_LABELS[theme]})`
  return names.join('·')
}

function parse(code: string): CatalogCharacter | null {
  let m = /^theme_(char\d+)_(birthday|expo)$/.exec(code)
  if (m) {
    const theme = m[2].toUpperCase() as CharacterTheme
    return {
      code, kind: 'THEME', baseChar: m[1], theme, index: 0,
      name: displayName('THEME', m[1], theme),
      imageUrl: resolveCharacterImage(code),
    }
  }

  m = /^duo_(char\d+)_(char\d+)_(\d+)$/.exec(code)
  if (m) {
    const baseChar = `${m[1]}+${m[2]}`
    return {
      code, kind: 'DUO', baseChar, theme: null, index: Number(m[3]),
      name: displayName('DUO', baseChar, null),
      imageUrl: resolveCharacterImage(code),
    }
  }

  m = /^solo_(char\d+)_(\d+)$/.exec(code)
  if (m) {
    return {
      code, kind: 'SOLO', baseChar: m[1], theme: null, index: Number(m[2]),
      name: displayName('SOLO', m[1], null),
      imageUrl: resolveCharacterImage(code),
    }
  }

  // 규칙에 맞지 않는 파일은 도감에서 제외한다 (조용히 깨지는 것보다 낫다)
  console.warn(`[characterCatalog] 파일명 규칙에 맞지 않아 건너뜁니다: ${code}`)
  return null
}

export const characterCatalog: CatalogCharacter[] = characterCodes
  .map(parse)
  .filter((c): c is CatalogCharacter => c !== null)

export const characterByCode = new Map(characterCatalog.map((c) => [c.code, c]))

export const TOTAL_CHARACTER_COUNT = characterCatalog.length

export interface CatalogGroup {
  key: string
  label: string
  items: CatalogCharacter[]
}

/** 탭 구성: 캐릭터 10명 + 함께(DUO) + 특별(THEME) */
export const catalogGroups: CatalogGroup[] = (() => {
  const groups: CatalogGroup[] = []

  for (const base of BASE_ORDER) {
    const items = characterCatalog
      .filter((c) => c.kind === 'SOLO' && c.baseChar === base)
      .sort((a, b) => a.index - b.index)
    if (items.length) groups.push({ key: base, label: CHAR_NAMES[base] ?? base, items })
  }

  const duo = characterCatalog
    .filter((c) => c.kind === 'DUO')
    .sort((a, b) => a.baseChar.localeCompare(b.baseChar) || a.index - b.index)
  if (duo.length) groups.push({ key: 'duo', label: '함께', items: duo })

  const theme = characterCatalog
    .filter((c) => c.kind === 'THEME')
    .sort((a, b) => a.code.localeCompare(b.code))
  if (theme.length) groups.push({ key: 'theme', label: '특별', items: theme })

  return groups
})()
