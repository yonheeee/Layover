import type { Train, StationOption } from '@/types/train'

export const mockTrains: Record<string, Train[]> = {
  daejeon: [
    { id: 'ktx-101', name: 'KTX 101', depart: '10:32', arrive: '12:18', seats: 24 },
    { id: 'ktx-103', name: 'KTX 103', depart: '12:05', arrive: '13:51', seats: 7 },
    { id: 'ktx-107', name: 'KTX 107', depart: '14:20', arrive: '16:06', seats: 31 },
    { id: 'sts-201', name: 'SRT 201', depart: '15:48', arrive: '17:34', seats: 3 },
  ],
  'seo-daejeon': [
    { id: 'ktx-201', name: 'KTX 201', depart: '09:15', arrive: '11:02', seats: 18 },
    { id: 'ktx-205', name: 'KTX 205', depart: '11:40', arrive: '13:28', seats: 12 },
    { id: 'sts-301', name: 'SRT 301', depart: '13:55', arrive: '15:43', seats: 5 },
  ],
  sintanjin: [
    { id: 'itx-101', name: 'ITX-마음 101', depart: '10:15', arrive: '12:00', seats: 15 },
    { id: 'itx-105', name: '무궁화호 105', depart: '13:20', arrive: '15:10', seats: 42 },
  ],
}

export const stationOptions: StationOption[] = [
  { value: 'daejeon', label: '대전역' },
  { value: 'seo-daejeon', label: '서대전역' },
  { value: 'sintanjin', label: '신탄진역' },
]
