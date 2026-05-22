/**
 * AuthContext.tsx
 *
 * Global auth state — the single source of truth for the logged-in user.
 *
 * Rules (PROJECT_RULES §2):
 * - Only AuthContext may hold currentUser / auth state.
 * - Components/hooks consume via useAuth(); never import context object directly.
 * - login() stores the token so axiosClient interceptor can attach it automatically.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { getCurrentUser } from '../../services/auth.service'
import type { AuthResponse, UserDto } from '../../mocks/types'

// ── Keys ─────────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'accessToken'
const EMAIL_KEY = 'authEmail'

// ── Context shape ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  /** The currently authenticated user, or null when logged-out / loading. */
  currentUser: UserDto | null
  /** True while the initial session is being restored from localStorage. */
  isLoading: boolean
  /**
   * Called after a successful login API response.
   * Persists the token + email, then fetches the full UserDto from /me.
   */
  login: (response: AuthResponse) => Promise<void>
  /** Clears localStorage and resets state → triggers redirect via ProtectedRoute. */
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount if a token already exists in localStorage.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const email = localStorage.getItem(EMAIL_KEY)

    if (!token || !email) {
      setIsLoading(false)
      return
    }

    getCurrentUser(email)
      .then((res) => setCurrentUser(res.data))
      .catch(() => {
        // Token is stale / invalid — clean up silently.
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EMAIL_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (response: AuthResponse) => {
    // Persist token first so the axiosClient interceptor can use it immediately.
    localStorage.setItem(TOKEN_KEY, response.accessToken)
    localStorage.setItem(EMAIL_KEY, response.email)

    // Fetch the canonical UserDto from the /me endpoint (or mock).
    const meRes = await getCurrentUser(response.email)
    setCurrentUser(meRes.data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    setCurrentUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
