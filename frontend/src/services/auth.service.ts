/**
 * auth.service.ts
 *
 * Single source of truth for auth API calls.
 * - While the backend is not yet integrated, this service uses mock data.
 * - To switch to real API: uncomment the Axios block at the bottom and delete the mock block.
 *
 * Flow: UI → Hook → auth.service.ts → Mock / axiosClient
 */
import {
  MOCK_CREDENTIALS,
  MOCK_LOGIN_RESPONSES,
  MOCK_ME_RESPONSES,
} from '../mocks/auth.mock'
import type { ApiResponse, AuthResponse, LoginRequest, UserDto } from '../mocks/types'

export type { ApiResponse, AuthResponse, LoginRequest, UserDto }

// ── Mock utilities ───────────────────────────────────────────────────────────

const MOCK_NETWORK_LATENCY = 800

/**
 * Simulates network latency and returns a deep-cloned copy of the response.
 * Uses structuredClone() per PROJECT_RULES §3 — never JSON.parse(JSON.stringify()).
 */
const resolveMock = <T>(response: ApiResponse<T>): Promise<ApiResponse<T>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(structuredClone(response))
    }, MOCK_NETWORK_LATENCY)
  })

const rejectMock = <T>(response: ApiResponse<T>): Promise<ApiResponse<T>> =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(structuredClone(response))
    }, MOCK_NETWORK_LATENCY)
  })

// ── Mock Auth Service ────────────────────────────────────────────────────────

export const login = (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  const account = MOCK_CREDENTIALS[credentials.email]

  // Validate email + password against mock accounts
  if (!account || account.password !== credentials.password) {
    const errorResponse: ApiResponse<AuthResponse> = {
      status: 'error',
      message: 'Email hoặc mật khẩu không đúng.',
      data: null as unknown as AuthResponse,
      errorCode: '401',
      timestamp: new Date().toISOString(),
    }
    return rejectMock(errorResponse)
  }

  return resolveMock(MOCK_LOGIN_RESPONSES[credentials.email])
}

export const getCurrentUser = (email: string): Promise<ApiResponse<UserDto>> => {
  const meResponse = MOCK_ME_RESPONSES[email]
  if (!meResponse) {
    const errorResponse: ApiResponse<UserDto> = {
      status: 'error',
      message: 'Không tìm thấy người dùng.',
      data: null as unknown as UserDto,
      errorCode: '404',
      timestamp: new Date().toISOString(),
    }
    return rejectMock(errorResponse)
  }
  return resolveMock(meResponse)
}

// ── Real API (uncomment when Spring Boot backend is ready) ───────────────────
// import axiosClient from '../lib/api/axiosClient'
//
// export const login = (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
//   axiosClient.post('/api/auth/login', credentials).then((res) => res.data)
//
// export const getCurrentUser = (_email?: string): Promise<ApiResponse<UserDto>> =>
//   axiosClient.get('/api/auth/me').then((res) => res.data)
