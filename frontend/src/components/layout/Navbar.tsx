/**
 * Navbar.tsx
 *
 * Top navigation bar. Reads currentUser from AuthContext — no local fetch.
 * This eliminates the duplicate API call that the old implementation made.
 */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import GlobalSearch from './GlobalSearch'

type NotificationOption = {
  label: string
  value: string
}

const notificationOptions: NotificationOption[] = [
  { label: 'Trong 1 giờ', value: '1h' },
  { label: 'Trong 12 giờ', value: '12h' },
  { label: 'Trong 24 giờ', value: '24h' },
  { label: 'Cho đến khi tôi bật lại', value: 'forever' },
]

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Trang chủ'
  if (pathname.startsWith('/my-project')) return 'Đồ án của tôi'
  if (pathname.startsWith('/my-course')) return 'Lớp học của tôi'
  if (pathname.startsWith('/admin/users')) return 'Quản lý người dùng'
  if (pathname.startsWith('/admin/categories')) return 'Quản lý danh mục'
  if (pathname.startsWith('/admin/courses')) return 'Quản lý lớp học'
  if (pathname === '/profile') return 'Cài đặt hồ sơ'
  return 'EduCollaborate'
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
  )
}

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Thông báo"
        className="flex size-10 items-center justify-center rounded-lg text-text-soft transition-colors hover:bg-surface-soft hover:text-text"
        onClick={() => setIsOpen((c) => !c)}
        type="button"
      >
        <BellIcon />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-12 z-20 w-64 rounded-card border border-border bg-surface p-2 shadow-card"
          role="menu"
        >
          <p className="px-3 py-2 text-sm font-semibold text-text">Tắt thông báo đẩy</p>
          <div className="space-y-1">
            {notificationOptions.map((option) => (
              <button
                className={[
                  'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  selectedOption === option.value
                    ? 'bg-primary-soft text-primary'
                    : 'text-text-soft hover:bg-surface-soft hover:text-text',
                ].join(' ')}
                key={option.value}
                onClick={() => {
                  setSelectedOption(option.value)
                  setIsOpen(false)
                }}
                role="menuitem"
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Navbar() {
  const location = useLocation()
  // Use AuthContext — single source of truth, no extra API call.
  const { currentUser, isLoading } = useAuth()

  const displayName = currentUser?.name ?? 'Người dùng'
  const studentCode = currentUser?.uid ?? ''
  const initials = getInitials(displayName) || 'U'

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-normal text-primary md:text-xl">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <GlobalSearch />
        <NotificationDropdown />

        <Link
          className="flex items-center gap-3 rounded-lg border-l border-border pl-3 transition-colors hover:bg-surface-soft md:pl-4"
          to="/profile"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
            {isLoading ? '' : initials}
          </div>

          <div className="hidden min-w-0 flex-col pr-3 sm:flex">
            {isLoading ? (
              <span className="text-sm font-medium text-text-soft">Đang tải...</span>
            ) : (
              <>
                <span className="truncate text-sm font-semibold text-text">{displayName}</span>
                <span className="text-xs text-text-soft">{studentCode}</span>
              </>
            )}
          </div>
        </Link>
      </div>
    </header>
  )
}

export default Navbar
