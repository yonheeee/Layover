import { httpGet, httpPost } from './http'

export interface StampResponse {
  id: string
  placeId: string
  placeName: string
  photoUrl: string
  visitedAt: string
  stampCount: number
  newCharacter: { id: string; name: string; imageUrl: string; requiredStamps: number } | null
}

export async function saveStamp(placeId: string): Promise<StampResponse> {
  const res = await httpPost<StampResponse>('/api/stamps', { placeId, photoUrl: '' })
  return res.data
}

export async function getMyStamps(): Promise<StampResponse[]> {
  const res = await httpGet<StampResponse[]>('/api/stamps/my')
  return res.data
}
