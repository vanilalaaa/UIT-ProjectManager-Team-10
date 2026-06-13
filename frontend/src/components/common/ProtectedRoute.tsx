/**
 * ProtectedRoute.tsx
 *
 * Route guard based on auth state and RBAC role list.
 *
 * Behaviour (PROJECT_RULES §2):
 * - While session is loading → render nothing (prevents flash-redirect).
 * - No currentUser          → redirect to /login (replace history entry).
 * - User role not allowed   → redirect to /403.
 * - Otherwise               → render the protected <Outlet />.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import type { Role } from '../../mocks/types'

type ProtectedRouteProps = {
  /** Roles that are permitted to access the child routes. */
  allowedRoles: Role[]
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser, isLoading } = useAuth()

  // Wait for the session-restore effect to finish before making a decision.
  if (isLoading) return null

  if (!currentUser) {
    return <Navigate replace to="/login" />
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate replace to="/403" />
  }

  return <Outlet />
}

export default ProtectedRoute
