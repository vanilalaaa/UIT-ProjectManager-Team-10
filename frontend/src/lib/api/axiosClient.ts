import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'

import { mockAdapter } from '../../mocks/adapter'

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080/api'

export const TOKEN_KEY = 'accessToken'

export interface ApiError {
  status: number
  code: string | null
  message: string
  fieldErrors?: Record<string, string>
}

// Các public auth endpoint — 401 ở đây có nghĩa "sai credentials", KHÔNG phải
// "phiên hết hạn"; không được redirect/clear localStorage.
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
]

const isPublicAuthRequest = (url?: string): boolean => {
  if (!url) return false
  return PUBLIC_AUTH_PATHS.some((p) => url.includes(p))
}

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Mock mode: chặn mọi request và trả dữ liệu mock (mocks/adapter.ts) khi chưa
// có backend. Bật mặc định; đặt VITE_USE_MOCK='false' để gọi backend thật.
const USE_MOCK = (import.meta.env.VITE_USE_MOCK as string | undefined) !== 'false'
if (USE_MOCK) {
  axiosClient.defaults.adapter = mockAdapter
}

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

function normalizeError(error: AxiosError): ApiError {
  if (!error.response) {
    return { status: 0, code: 'NETWORK_ERROR', message: 'Không kết nối được server.' }
  }
  const { status, data } = error.response
  const body = (data ?? {}) as {
    message?: string
    errorCode?: string | null
    fieldErrors?: Record<string, string>
  }
  return {
    status,
    code: body.errorCode ?? null,
    message: body.message ?? error.message ?? 'Có lỗi xảy ra.',
    fieldErrors: body.fieldErrors,
  }
}

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const apiError = normalizeError(error)
    const requestUrl = error.config?.url
    const isPublicAuth = isPublicAuthRequest(requestUrl)

    if (apiError.status === 401 && !isPublicAuth) {
      localStorage.clear()
      toast.error('Phiên đã hết hạn. Vui lòng đăng nhập lại.')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (apiError.status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này.')
    } else if (apiError.status === 0) {
      toast.error(apiError.message)
    }

    return Promise.reject(apiError)
  },
)

export default axiosClient
