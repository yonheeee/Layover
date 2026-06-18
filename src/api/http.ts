import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const http = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── 재발급 중복 방지 ───────────────────────────────────────────────────────
let isRefreshing = false
type FailedQueueItem = {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}
let failedQueue: FailedQueueItem[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((item) => {
    if (error) item.reject(error)
    else item.resolve(token!)
  })
  failedQueue = []
}

// ─── Request Interceptor: accessToken 자동 첨부 ──────────────────────────────
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return config
})

// ─── Response Interceptor: 401 감지 → refresh 재시도 ─────────────────────────
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        clearTokensAndRedirect()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // 이미 재발급 중이면 큐에 넣고 대기
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((newToken) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          return http(originalRequest)
        })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken },
        )
        const newAccessToken = data.data.accessToken
        localStorage.setItem('accessToken', newAccessToken)
        processQueue(null, newAccessToken)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokensAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 401 외 4xx/5xx는 그대로 throw
    return Promise.reject(error)
  },
)

function clearTokensAndRedirect() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  window.location.href = '/login'
}

export async function httpGet<T>(path: string): Promise<ApiResponse<T>> {
  const res = await http.get<ApiResponse<T>>(path)
  return res.data
}

export async function httpPost<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  const res = await http.post<ApiResponse<T>>(path, body)
  return res.data
}

export async function httpPut<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  const res = await http.put<ApiResponse<T>>(path, body)
  return res.data
}
