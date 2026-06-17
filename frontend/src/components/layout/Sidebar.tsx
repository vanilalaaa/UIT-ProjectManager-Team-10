import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { NavLinkRenderProps } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { NAV_ITEMS } from '../../lib/constants/menu'
import ConfirmDialog from '../ui/ConfirmDialog'

const navLinkClass = ({ isActive }: NavLinkRenderProps) =>
  [
    'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-soft text-primary'
      : 'text-text-soft hover:bg-surface-soft hover:text-text',
  ].join(' ')

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

function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {open ? <path d="M6 18 18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
    </svg>
  )
}

function Sidebar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  if (!currentUser) return null

  const navItems = NAV_ITEMS[currentUser.role]
  const closeMobile = () => setMobileOpen(false)

  const handleLogout = () => {
    closeMobile()
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="shrink-0 border-b border-border bg-surface px-4 py-4 shadow-soft lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-b-0 lg:border-r lg:py-6">
      <div className="flex items-center justify-between">
        <div className="px-2">
          <NavLink
            className="block text-2xl font-semibold tracking-normal text-primary"
            to="/"
            onClick={closeMobile}
          >
            Project Management
          </NavLink>
        </div>

        <button
          aria-controls="sidebar-nav"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          className="rounded-lg p-1.5 text-text-soft transition-colors hover:bg-surface-soft hover:text-text lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          type="button"
        >
          <MenuToggleIcon open={mobileOpen} />
        </button>
      </div>

      <span className="mx-2 mt-3 hidden w-fit rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary lg:inline-block">
        {currentUser.role}
      </span>

      <div
        className={`${mobileOpen ? 'flex' : 'hidden'} mt-4 flex-1 flex-col lg:mt-6 lg:flex lg:min-h-0`}
        id="sidebar-nav"
      >
        <nav aria-label="Điều hướng chính" className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              className={navLinkClass}
              end={item.to === '/'}
              key={item.to}
              onClick={closeMobile}
              to={item.to}
            >
              <NavIcon path={item.iconPath} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          className="mt-4 flex shrink-0 items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-text-soft transition-colors hover:bg-surface-soft hover:text-text"
          onClick={() => setConfirmLogout(true)}
          type="button"
        >
          <LogoutIcon />
          <span>Đăng xuất</span>
        </button>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
        confirmLabel="Đăng xuất"
        cancelLabel="Huỷ"
        destructive
        onConfirm={handleLogout}
        onClose={() => setConfirmLogout(false)}
      />
    </aside>
  )
}

export default Sidebar
