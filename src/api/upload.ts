import { http, type ApiResponse } from './http'

/**
 * 이미지 업로드 공통 처리.
 *
 * http 인스턴스를 그대로 쓴다. 예전에는 multipart 라는 이유로 axios 를 직접
 * 호출했는데, 그러면 401 리프레시 인터셉터를 타지 않아서 토큰이 만료된 채로
 * 저장을 누르면 재발급 없이 그냥 실패했다.
 *
 * Content-Type 은 반드시 지워야 한다. 인스턴스 기본값이 application/json 이라
 * 그대로 두면 axios 가 FormData 를 JSON 으로 직렬화해 버린다. undefined 를 주면
 * 헤더가 빠지고 브라우저가 boundary 를 포함한 multipart 헤더를 직접 붙인다.
 */
async function uploadImage(path: string, file: File, label: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await http.post<ApiResponse<string>>(path, formData, {
    headers: { 'Content-Type': undefined },
  })

  if (!res.data.success || !res.data.data) {
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
