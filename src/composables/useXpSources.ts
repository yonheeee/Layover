import { ref } from 'vue'
import { getMyPosts } from '@/api/community'
import { fetchUser, fetchUserActivity } from '@/api/user'

/**
 * 경험치 계산에 들어가는 수치를 서버에서 받아 온다.
 *
 * 화면마다 각자 다른 곳에서 숫자를 긁어오면 같은 계정인데 레벨이 다르게 보인다.
 * 실제로 스탬프 투어 헤더는 localStorage 의 엽서 개수로, 마이페이지는 서버
 * `user.stampCount` 로 계산하고 있어서 두 화면의 LV 가 서로 달랐다.
 * 기기를 바꾸면 투어 화면 레벨만 떨어지기도 했다.
 *
 * 마이페이지처럼 이미 같은 데이터를 받아 두는 화면은 이걸 쓸 필요가 없고,
 * 자기 수치가 없는 화면(스탬프 투어)이 쓴다.
 */
export function useXpSources() {
  const stampCount = ref(0)
  const courseCount = ref(0)
  const postCount = ref(0)

  /** 하나가 실패해도 나머지는 반영한다. 레벨 표시 때문에 화면이 막히면 안 된다. */
  async function loadXpSources() {
    const [user, activity, posts] = await Promise.allSettled([
      fetchUser(),
      fetchUserActivity(),
      getMyPosts(),
    ])

    if (user.status === 'fulfilled') stampCount.value = user.value.stampCount ?? 0
    if (activity.status === 'fulfilled') courseCount.value = activity.value.myCourses.length
    if (posts.status === 'fulfilled') postCount.value = posts.value.length
  }

  return { stampCount, courseCount, postCount, loadXpSources }
}
