// src/types/api/auth.ts

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export type UserDto = {
  id: number
  uid: string
  email: string
  name: string
  role: Role
  isActive: boolean
  avatarUrl?: string | null 
}

export type AuthResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
  uid: string
  email: string
  name: string
  role: Role
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  password: string
  name: string
  role?: Role
}

export type VerifyEmailQuery = { 
  token: string 
}

export type ForgotPasswordRequest = { 
  email: string 
}

export type ResetPasswordRequest = {
  token: string
  newPassword: string
}

export type UpdateMeRequest = {
  name?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string | null
  phoneNumber?: string
  birthday?: string
  summary?: string
}

export type UpdatePasswordRequest = {
  oldPassword: string
  newPassword: string
}