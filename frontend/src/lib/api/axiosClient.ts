/**
 * axiosClient.ts
 *
 * Singleton Axios instance used by all real API calls.
 * - baseURL: Spring Boot backend running on port 8080
 * - Request interceptor: injects Bearer token from localStorage
 * - Response interceptor: on 401, clears localStorage and redirects to /login
 *   (avoids circular dependency with React Router by using window.location)
 */
import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'

const BASE_URL = 'http://localhost:8080'

// Key used to persist the JWT in localStorage (must match auth.service.ts)
const TOKEN_KEY = 'accessToken'

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request Interceptor ──────────────────────────────────────────────────────
// Attach the stored JWT as a Bearer token on every outgoing request.
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

// ── Response Interceptor ─────────────────────────────────────────────────────
// On 401 Unauthorized: token is invalid/expired → clear session and redirect.
// We use window.location.href to avoid importing React Router here, which
// would create a circular dependency with services that import axiosClient.
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default axiosClient
