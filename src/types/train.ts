export interface Train {
  trainNo: string
  departTime: string
  arriveTime: string
  destination: string
  stationName: string
  stationCode: string
  mrntNm?: string
  trainName?: string
  trainGrade?: string
  trainKind?: string
  kndNm?: string
}

export interface StationOption {
  value: string
  label: string
}
