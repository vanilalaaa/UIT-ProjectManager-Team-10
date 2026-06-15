import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateMeRequest,
  UpdatePasswordRequest,
  UserDto,
} from '../types/api/auth'

export type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  UpdateMeRequest,
  UpdatePasswordRequest,
  UserDto,
}

export const login = (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
  axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials).then((r) => r.data)

export const register = (payload: RegisterRequest): Promise<ApiResponse<UserDto>> =>
  axiosClient.post<ApiResponse<UserDto>>('/auth/register', payload).then((r) => r.data)

export const verifyEmail = (token: string): Promise<ApiResponse<void>> =>
  axiosClient
    .get<ApiResponse<void>>('/auth/verify-email', { params: { token } })
    .then((r) => r.data)

export const forgotPassword = (payload: ForgotPasswordRequest): Promise<ApiResponse<void>> =>
  axiosClient.post<ApiResponse<void>>('/auth/forgot-password', payload).then((r) => r.data)

export const resetPassword = (payload: ResetPasswordRequest): Promise<ApiResponse<void>> =>
  axiosClient.post<ApiResponse<void>>('/auth/reset-password', payload).then((r) => r.data)

export const logout = (): Promise<ApiResponse<void>> =>
  axiosClient.post<ApiResponse<void>>('/auth/logout').then((r) => r.data)

export const getCurrentUser = (_email?: string): Promise<ApiResponse<UserDto>> => {
  void _email
  return axiosClient.get<ApiResponse<UserDto>>('/auth/me').then((r) => r.data)
}

export const updateMe = (payload: UpdateMeRequest): Promise<ApiResponse<UserDto>> =>
  axiosClient.put<ApiResponse<UserDto>>('/auth/me', payload).then((r) => r.data)

export const updatePassword = (payload: UpdatePasswordRequest): Promise<ApiResponse<void>> =>
  axiosClient.put<ApiResponse<void>>('/auth/me/password', payload).then((r) => r.data)
