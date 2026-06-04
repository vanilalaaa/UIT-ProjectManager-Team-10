import type { AuthResponse, LoginRequest, Role, UserDto } from '../../mocks/types'

export type { AuthResponse, LoginRequest, Role, UserDto }

export type RegisterRequest = {
  email: string
  password: string
  name: string
  role?: Role
}

export type VerifyEmailQuery = { token: string }

export type ForgotPasswordRequest = { email: string }

export type ResetPasswordRequest = {
  token: string
  newPassword: string
}

export type UpdateMeRequest = {
  name?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  phoneNumber?: string
  birthday?: string
  summary?: string
}

export type UpdatePasswordRequest = {
  currentPassword: string
  newPassword: string
}
