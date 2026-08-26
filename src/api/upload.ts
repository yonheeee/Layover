import axios from 'axios'
import type { ApiResponse } from './http'

/**
 * 이미지 업로드 공통 처리.
 *
 * multipart 요청이라 http.ts의 JSON 인터셉터를 타지 않고 axios를 직접 쓴다.
 */
async function uploadImage(path: string, file: File, label: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('accessToken')
  const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

  const res = await axios.post<ApiResponse<string>>(`${baseURL}${path}`, formData, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.data.success) {
    throw new Error(res.data.message || `${label} 업로드에 실패했습니다.`)
  }
  return res.data.data
}

/**
 * 스탬프 인증 사진(엽서) 업로드.
 *
 * 스탬프 저장보다 먼저 호출한다. 파일 저장은 트랜잭션 롤백에 참여하지 못하므로
 * 순서를 뒤집으면 사진 없는 도감 항목이 생길 수 있다.
 */
export async function uploadStampPhoto(file: File): Promise<string> {
  return uploadImage('/api/upload/stamp-photo', file, '인증 사진')
}

/** canvas dataURL을 업로드 가능한 File로 바꾼다. */
export function dataUrlToFile(dataUrl: string, filename = 'stamp.jpg'): File {
  const [header, body] = dataUrl.split(',')
  const mime = /:(.*?);/.exec(header)?.[1] ?? 'image/jpeg'
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}
