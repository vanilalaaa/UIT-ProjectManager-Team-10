import { mockLoginResponse, mockMeResponse } from '../mocks/auth.mock'
import type { ApiResponse, AuthResponse, LoginRequest, UserDto } from '../mocks/types'

export type { ApiResponse, AuthResponse, LoginRequest, UserDto }

const MOCK_NETWORK_LATENCY = 800

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const resolveMock = <T>(response: ApiResponse<T>): Promise<ApiResponse<T>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(clone(response))
    }, MOCK_NETWORK_LATENCY)
  })

export const login = (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  void credentials

  return resolveMock(mockLoginResponse)
}

export const getCurrentUser = (): Promise<ApiResponse<UserDto>> => {
  return resolveMock(mockMeResponse)
}

// Real API version (uncomment when the Spring Boot backend is ready):
// import axios from 'axios'
//
// export const login = (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
//   return axios.post('/api/auth/login', credentials).then((response) => response.data)
// }
//
// export const getCurrentUser = (): Promise<ApiResponse<UserDto>> => {
//   return axios.get('/api/auth/me').then((response) => response.data)
// }
