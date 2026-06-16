import type { Train, StationOption } from '@/types/train'
import { mockTrains, stationOptions } from '@/mocks/trains'
// import { httpGet } from './http'

export async function fetchTrains(): Promise<Record<string, Train[]>> {
  // TODO(백엔드 연동): return httpGet<Record<string, Train[]>>('/api/trains')
  return Promise.resolve(mockTrains)
}

export async function fetchStationOptions(): Promise<StationOption[]> {
  // TODO(백엔드 연동): return httpGet<StationOption[]>('/api/stations')
  return Promise.resolve(stationOptions)
}
