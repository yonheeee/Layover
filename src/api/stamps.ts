import { httpGet, httpPost } from './http'
import type { CharacterResponse } from './characters'

export interface StampResponse {
  id: string
  placeId: string
  placeName: string
  photoUrl: string
  visitedAt: string
  stampCount: number
  /** 이번 저장으로 확정된 캐릭터 */
  newCharacter: CharacterResponse | null
}

/** GET /api/stamps/my 가 돌려주는 스탬프 한 건 */
export interface MyStamp {
  id: string
  placeId: string
  placeName: string
  photoUrl: string
  visitedAt: string
}

/**
 * 스탬프를 저장한다. 도감이 해금되는 유일한 지점이다.
 *
 * @param characterId 촬영 시 뽑아 둔 캐릭터. 다시 찍었다면 마지막으로 뽑은 값.
 * @param photoUrl    업로드가 끝난 엽서 사진 URL
 */
export async function saveStamp(
  placeId: string,
  coords?: { latitude: number; longitude: number } | null,
  characterId?: string | null,
  photoUrl?: string | null,
): Promise<StampResponse> {
  const res = await httpPost<StampResponse>('/api/stamps', {
    placeId,
    characterId: characterId ?? null,
    photoUrl: photoUrl ?? null,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
  })
  return res.data
}

export async function getMyStamps(): Promise<MyStamp[]> {
  const res = await httpGet<MyStamp[]>('/api/stamps/my')
  return res.data ?? []
}

/**
 * 오늘 이미 스탬프를 찍은 장소 id 집합.
 *
 * 서버는 같은 장소를 하루 한 번만 받아준다. 화면이 코스 단위 로컬 기록으로
 * 판정하면 새 코스에서 "미방문"으로 보여 촬영까지 마친 뒤에야 409를 받는다.
 * 서버 기록을 기준으로 삼아 그 헛걸음을 막는다.
 */
export async function getTodayStampedPlaceIds(): Promise<Set<string>> {
  const stamps = await getMyStamps()
  const today = new Date()
  return new Set(
    stamps
      .filter((s) => {
        const d = new Date(s.visitedAt)
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        )
      })
      .map((s) => String(s.placeId)),
  )
}
