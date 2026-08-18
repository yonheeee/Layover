import { httpGet, httpPost } from './http'

export interface StampResponse {
  id: string
  placeId: string
  placeName: string
  photoUrl: string
  visitedAt: string
  stampCount: number
  newCharacter: {
    id: string
    name: string
    imageUrl: string
    requiredStamps: number
    description: string
    obtained: boolean
  } | null
}

/**
 * 스탬프를 저장한다.
 *
 * 서버도 좌표 반경을 검증하므로 위치 인증 때 얻은 좌표를 함께 보낸다.
 * 화면에서만 검증하면 API를 직접 호출해 우회할 수 있다.
 */
export async function saveStamp(
  placeId: string,
  coords?: { latitude: number; longitude: number } | null,
): Promise<StampResponse> {
  const res = await httpPost<StampResponse>('/api/stamps', {
    placeId,
    photoUrl: '',
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
  })
  return res.data
}

export async function getMyStamps(): Promise<StampResponse[]> {
  const res = await httpGet<StampResponse[]>('/api/stamps/my')
  return res.data
}
