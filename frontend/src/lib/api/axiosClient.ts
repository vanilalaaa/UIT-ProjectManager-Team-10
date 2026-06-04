import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'

export const TOKEN_KEY = 'accessToken'

export interface ApiError {
  status: number
  code: string | null
  message: string
  fieldErrors?: Record<string, string>
}

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

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

    if (apiError.status === 401) {
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
