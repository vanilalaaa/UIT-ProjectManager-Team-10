/**
 * auth.mock.ts
 *
 * Mock data for authentication, organised per role.
 * Used by auth.service.ts while the real backend is not yet integrated.
 *
 * Rules (PROJECT_RULES §3):
 * - Simulate network delay
 * - Use structuredClone() — never JSON.parse(JSON.stringify())
 * - Data must match the shape of the backend DTOs exactly
 */
import type { ApiResponse, AuthResponse, UserDto } from './types'

// ── Mock Accounts ────────────────────────────────────────────────────────────
// Three pre-defined accounts, one per role.
// Password is NOT stored here; the service layer validates it against this map.

export const MOCK_CREDENTIALS: Record<string, { password: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT' }> = {
  'admin@gmail.com':   { password: 'admin123',   role: 'ADMIN'   },
  'teacher@gmail.com': { password: 'teacher123', role: 'TEACHER' },
  'student@gmail.com': { password: 'student123', role: 'STUDENT' },
}

// ── Mock Login Responses (one per role) ──────────────────────────────────────

export const MOCK_LOGIN_RESPONSES: Record<string, ApiResponse<AuthResponse>> = {
  'admin@gmail.com': {
    status: 'success',
    message: 'Call API success.',
    data: {
      accessToken: 'mock-token-admin-se330',
      tokenType: 'Bearer',
      expiresIn: 86400,
      uid: 'AD001',
      email: 'admin@gmail.com',
      name: 'Admin Hệ thống',
      role: 'ADMIN',
    },
    errorCode: null,
    timestamp: '2026-05-22T10:00:00',
  },

  'teacher@gmail.com': {
    status: 'success',
    message: 'Call API success.',
    data: {
      accessToken: 'mock-token-teacher-se330',
      tokenType: 'Bearer',
      expiresIn: 86400,
      uid: 'GV001',
      email: 'teacher@gmail.com',
      name: 'Giảng viên Nguyễn',
      role: 'TEACHER',
    },
    errorCode: null,
    timestamp: '2026-05-22T10:00:00',
  },

  'student@gmail.com': {
    status: 'success',
    message: 'Call API success.',
    data: {
      accessToken: 'mock-token-student-se330',
      tokenType: 'Bearer',
      expiresIn: 86400,
      uid: 'SV22520001',
      email: 'student@gmail.com',
      name: 'Sinh viên Trần',
      role: 'STUDENT',
    },
    errorCode: null,
    timestamp: '2026-05-22T10:00:00',
  },
}

// ── Mock /me Responses (one per role) ────────────────────────────────────────

export const MOCK_ME_RESPONSES: Record<string, ApiResponse<UserDto>> = {
  'admin@gmail.com': {
    status: 'success',
    message: 'Call API success.',
    data: {
      id: 1,
      uid: 'AD001',
      email: 'admin@gmail.com',
      name: 'Admin Hệ thống',
      role: 'ADMIN',
      isActive: true,
    },
    errorCode: null,
    timestamp: '2026-05-22T10:00:00',
  },

  'teacher@gmail.com': {
    status: 'success',
    message: 'Call API success.',
    data: {
      id: 2,
      uid: 'GV001',
      email: 'teacher@gmail.com',
      name: 'Giảng viên Nguyễn',
      role: 'TEACHER',
      isActive: true,
    },
    errorCode: null,
    timestamp: '2026-05-22T10:00:00',
  },

  'student@gmail.com': {
    status: 'success',
    message: 'Call API success.',
    data: {
      id: 3,
      uid: 'SV22520001',
      email: 'student@gmail.com',
      name: 'Sinh viên Trần',
      role: 'STUDENT',
      isActive: true,
    },
    errorCode: null,
    timestamp: '2026-05-22T10:00:00',
  },
}
