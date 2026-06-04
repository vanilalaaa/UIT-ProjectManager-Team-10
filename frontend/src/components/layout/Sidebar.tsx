/**
 * Sidebar.tsx
 *
 * Renders navigation based on currentUser.role from AuthContext.
 * Menu items are driven by NAV_ITEMS config (lib/constants/menu.ts)
 * so role logic is never duplicated here.
 */
import { NavLink, useNavigate } from 'react-router-dom'
import type { NavLinkRenderProps } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { NAV_ITEMS } from '../../lib/constants/menu'

// ── Shared link class helpers ─────────────────────────────────────────────────
const navLinkClass = ({ isActive }: NavLinkRenderProps) =>
  [
    'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-soft text-primary'
      : 'text-text-soft hover:bg-surface-soft hover:text-text',
  ].join(' ')

// ── SVG icon wrapper ──────────────────────────────────────────────────────────
function NavIcon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d={path} />
    </svg>
  )
}

// ── Logout icon ───────────────────────────────────────────────────────────────
function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  // While loading (currentUser === null inside a ProtectedRoute) show skeleton.
  if (!currentUser) return null

  const navItems = NAV_ITEMS[currentUser.role]

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex shrink-0 flex-col border-b border-border bg-surface px-4 py-4 shadow-soft lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:py-6">
      {/* Brand */}
      <div className="px-2">
        <NavLink className="block text-2xl font-semibold tracking-normal text-primary" to="/">
          EduCollaborate
        </NavLink>
        <p className="mt-1 hidden text-sm text-text-soft lg:block">Academic Workspace</p>
      </div>

      {/* Role badge */}
      <span className="mx-2 mt-3 hidden w-fit rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary lg:inline-block">
        {currentUser.role}
      </span>

      {/* Nav links — driven by role config */}
      <nav aria-label="Điều hướng chính" className="mt-4 flex flex-1 flex-col gap-1 lg:mt-6">
        {navItems.map((item) => (
          <NavLink
            className={navLinkClass}
            end={item.to === '/'}
            key={item.to}
            to={item.to}
          >
            <NavIcon path={item.iconPath} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout — bottom of sidebar */}
      <button
        className="mt-4 flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-text-soft transition-colors hover:bg-surface-soft hover:text-text"
        onClick={handleLogout}
        type="button"
      >
        <LogoutIcon />
        <span>Đăng xuất</span>
      </button>
    </aside>
  )
}

export default Sidebar
