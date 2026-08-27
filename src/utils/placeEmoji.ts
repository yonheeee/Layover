/**
 * 장소 카테고리 → 이모지.
 *
 * 스탬프 투어의 안내와 마이페이지의 인증 사진 목록이 같은 기호를 쓰도록
 * 한 곳에 모아 둔다. 예전에는 투어 화면에서 고른 이모지를 사진과 함께
 * localStorage 에 저장해 두고 마이페이지가 그걸 읽었는데, 목록이 서버로
 * 옮겨가면서 저장할 자리가 없어졌다. 카테고리만 알면 매번 다시 구할 수 있다.
 */
export function placeEmoji(category?: string | null): string {
  switch (category) {
    case 'FOOD':    return '🍽️'
    case 'CAFE':    return '☕'
    case 'NATURE':  return '🌿'
    case 'CULTURE': return '🏛️'
    default:        return '📍'
  }
}
