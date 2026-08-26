/**
 * 계정에 묶인 로컬 저장소 키 관리.
 *
 * 이 모듈은 아무것도 import 하지 않는다. 로그아웃 처리는 http 인터셉터와
 * auth 스토어 양쪽에서 부르는데, 둘 중 하나라도 스토어를 거치면
 * http -> utils -> stores/auth -> api/auth -> http 순환 참조가 된다.
 */

/**
 * 로그아웃할 때 지워야 하는 키.
 *
 * 로그아웃 경로가 두 곳(사용자 로그아웃 / 토큰 만료 리다이렉트)이라 지우는
 * 항목이 서로 달랐다. 특히 레벨업 축하 이력은 어느 쪽에서도 지워지지 않아
 * 계정을 바꿔도 이미 축하받은 레벨로 남았다.
 */
const USER_SCOPED_KEYS = [
  'accessToken',
  'refreshToken',
  'stamp_photos',
  'stamp_active_course',
  'generated_courses',
  'last_request',
  'layover_celebrated_levels',
  'course_confirmed', // 더 이상 쓰지 않지만 예전 버전이 남긴 값 정리
]

export function clearUserScopedStorage() {
  USER_SCOPED_KEYS.forEach((key) => localStorage.removeItem(key))
}
