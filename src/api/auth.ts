import { httpGet, httpPost, httpPut } from './http'
import type { ApiResponse } from './http'

export interface LoginData {
  accessToken: string
  refreshToken: string
}

export interface FindIdData {
  maskedEmail: string
  createdAt: string
}

export interface RefreshData {
  accessToken: string
}

export function checkEmail(email: string): Promise<ApiResponse<null>> {
  return httpPost('/api/signup/check-email', { email })
}

export function sendEmailCode(email: string): Promise<ApiResponse<null>> {
  return httpPost('/api/signup/email/send', { email })
}

export function verifyEmailCode(email: string, code: string): Promise<ApiResponse<null>> {
  return httpPost('/api/signup/email/verify', { email, code })
}

export function signup(
  email: string,
  password: string,
  name: string,
  birthDate: string,
  phone: string,
): Promise<ApiResponse<null>> {
  return httpPost('/api/signup', { email, password, name, birthDate, phone })
}

export function login(email: string, password: string): Promise<ApiResponse<LoginData>> {
  return httpPost('/api/login', { email, password })
}

export function findId(
  realName: string,
  birthDate: string,
  phone: string,
): Promise<ApiResponse<FindIdData>> {
  return httpPost('/api/find/id', { realName, birthDate, phone })
}

export function sendPasswordResetCode(email: string): Promise<ApiResponse<null>> {
  return httpPost('/api/find/password/email/send', { email })
}

export function verifyPasswordResetCode(email: string, code: string): Promise<ApiResponse<null>> {
  return httpPost('/api/find/password/email/verify', { email, code })
}

export function resetPassword(email: string, newPassword: string): Promise<ApiResponse<null>> {
  return httpPut('/api/find/password', { email, newPassword })
}

export function refreshAccessToken(refreshToken: string): Promise<ApiResponse<RefreshData>> {
  return httpPost('/api/auth/refresh', { refreshToken })
}

export function getKakaoAuthUrl(): Promise<ApiResponse<string>> {
  return httpGet('/api/login/kakao')
}

export function updateKakaoProfile(
  name: string,
  birthDate: string,
  phone: string,
): Promise<ApiResponse<null>> {
  return httpPut('/api/user/profile', { name, birthDate, phone })
}
