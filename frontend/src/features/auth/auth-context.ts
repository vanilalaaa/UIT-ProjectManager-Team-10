import { createContext } from 'react'
import type { AuthResponse, UserDto } from '../../types/api/auth'

export interface AuthContextValue {
  currentUser: UserDto | null
  isLoading: boolean
  login: (response: AuthResponse) => Promise<void>
  logout: () => Promise<void>
  updateSessionUser: (user: UserDto) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const TOKEN_KEY = 'accessToken'
