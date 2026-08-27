/**
 * 캐릭터 도감 이미지 로더.
 *
 * `src/assets/characters/collection/` 안의 PNG를 전부 자동으로 잡아
 * "파일명(확장자 제외) → 번들 URL" 맵을 만든다. 147장을 하나씩 import 하지
 * 않아도 되고, 이미지를 추가하면 폴더에 넣는 것만으로 반영된다.
 *
 * DB에는 이 파일명(code)만 저장한다. 빌드 후 실제 파일명에는 해시가 붙으므로
 * `/src/assets/...` 같은 경로 문자열을 DB에 저장하면 배포 시 전부 깨진다.
 */
const modules = import.meta.glob<string>(
  '../assets/characters/collection/*.png',
  { eager: true, import: 'default' },
)

/** 'solo_char01_001' → '/assets/solo_char01_001-a1b2c3d4.png' */
export const characterImages: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [
    path.split('/').pop()!.replace(/\.png$/, ''),
    url,
  ]),
)

/**
 * code 에 해당하는 번들 이미지 URL. 없으면 null.
 *
 * 예전에는 못 찾으면 빈 문자열을 돌려줬다. 그런데 `<img src="">` 는 브라우저가
 * 현재 문서 URL을 이미지로 읽으려다 실패해 곧바로 alt 텍스트를 띄우고,
 * `new Image().src = ''` 도 같은 이유로 onerror 를 탄다. 호출부가 "없음"을
 * 명시적으로 구분할 수 있도록 null 을 돌려준다.
 */
export function resolveCharacterImage(code: string): string | null {
  return characterImages[code] ?? null
}

/** 폴더에 실제로 존재하는 캐릭터 code 목록 (파일명 오름차순) */
export const characterCodes: string[] = Object.keys(characterImages).sort()
