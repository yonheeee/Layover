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

export function resolveCharacterImage(code: string, fallback = ''): string {
  return characterImages[code] ?? fallback
}

/** 폴더에 실제로 존재하는 캐릭터 code 목록 (파일명 오름차순) */
export const characterCodes: string[] = Object.keys(characterImages).sort()
