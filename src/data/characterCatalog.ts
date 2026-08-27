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

/** 캐릭터별 소개. 도감 상세 모달에서 사용 */
export const CHAR_META: Record<string, { role: string; description: string }> = {
  char01: {
    role: '꿈씨패밀리의 아빠',
    description: '과학과 평화의 도시 대전을 누구보다 사랑한다. 요즘 가장 큰 관심사는 대전의 발전과 가족의 안녕.',
  },
  char02: {
    role: '꿈씨패밀리의 엄마',
    description: '꿈돌이와 함께 대전을 지키는 든든한 짝. 가족의 웃음을 가장 소중히 여긴다.',
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
