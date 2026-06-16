import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import type { Role } from '../../types/models'

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
