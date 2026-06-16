import { useCallback, useEffect, useState, type ReactNode } from 'react'

import { getCurrentUser, logout as logoutApi } from '../../services/auth.service'
import type { AuthResponse, UserDto } from '../../types/api/auth'
import { AuthContext, TOKEN_KEY } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(
    () => typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY),
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    let alive = true
    getCurrentUser()
      .then((res) => {
        if (alive) setCurrentUser(res.data)
      })
      .catch(() => {
        if (alive) setCurrentUser(null)
      })
      .finally(() => {
        if (alive) setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  const login = useCallback(async (response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.accessToken)
    const me = await getCurrentUser()
    setCurrentUser(me.data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // BE có thể 401/network — vẫn dọn session phía FE.
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      setCurrentUser(null)
    }
  }, [])

  const updateSessionUser = useCallback((user: UserDto) => {
    setCurrentUser(user)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, updateSessionUser }}>
      {children}
    </AuthContext.Provider>
  )
}
