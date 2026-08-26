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

/** 위치 인증에 쓰는 좌표. accuracy는 측위 오차 반경(m). */
export interface StampCoords {
  latitude: number
  longitude: number
  accuracy?: number
}

/**
 * 촬영 직전 위치 확인.
 *
 * 거리 판정을 서버에 맡긴다. 예전에는 프론트가 반경 100m를 하드코딩해
 * 따로 판정했는데, 서버 설정과 어긋나면 촬영을 다 마친 뒤에야 거부당했다.
 * 통과하지 못하면 서버 메시지를 담아 예외가 올라온다.
 */
export async function verifyStampLocation(placeId: string, coords: StampCoords): Promise<void> {
  await httpPost<null>('/api/stamps/verify-location', {
    placeId,
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? null,
  })
}

/**
 * 스탬프를 저장한다. 도감이 해금되는 유일한 지점이다.
 *
 * @param characterId 촬영 시 뽑아 둔 캐릭터. 다시 찍었다면 마지막으로 뽑은 값.
 * @param photoUrl    업로드가 끝난 엽서 사진 URL
 */
export async function saveStamp(
  placeId: string,
  coords?: StampCoords | null,
  characterId?: string | null,
  photoUrl?: string | null,
): Promise<StampResponse> {
  const res = await httpPost<StampResponse>('/api/stamps', {
    placeId,
    characterId: characterId ?? null,
    photoUrl: photoUrl ?? null,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    accuracy: coords?.accuracy ?? null,
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
