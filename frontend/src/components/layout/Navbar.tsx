import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../../services/auth.service'
import type { UserDto } from '../../services/auth.service'

type SearchRoute = {
  label: string
  path: string
  category: string
}

type NotificationOption = {
  label: string
  value: string
}

const searchableRoutes: SearchRoute[] = [
  { label: 'Trang chủ', path: '/', category: 'Điều hướng' },
  { label: 'Quản lý Đồ án', path: '/projects', category: 'Đồ án' },
  { label: 'Website quản lý đồ án', path: '/projects/1', category: 'Đồ án' },
  { label: 'Điểm danh lớp học QR', path: '/projects/2', category: 'Đồ án' },
  { label: 'Dashboard tiến độ', path: '/projects/5', category: 'Đồ án' },
  { label: 'Tạo đồ án mới', path: '/projects/new', category: 'Đồ án' },
  { label: 'Môn học', path: '/courses', category: 'Môn học' },
  { label: 'SE330 - Công nghệ phần mềm', path: '/courses/1', category: 'Môn học' },
  { label: 'PM301 - Quản lý dự án', path: '/courses/2', category: 'Môn học' },
  { label: 'Cài đặt hồ sơ', path: '/profile', category: 'Tài khoản' },
]

const notificationOptions: NotificationOption[] = [
  { label: 'Trong 1 giờ', value: '1h' },
  { label: 'Trong 12 giờ', value: '12h' },
  { label: 'Trong 24 giờ', value: '24h' },
  { label: 'Cho đến khi tôi bật lại', value: 'forever' },
]

function getPageTitle(pathname: string) {
  if (pathname === '/') {
    return 'Trang chủ'
  }

  if (pathname === '/projects') {
    return 'Quản lý Đồ án'
  }

  if (pathname === '/projects/new') {
    return 'Tạo Đồ án mới'
  }

  if (pathname.startsWith('/projects/')) {
    return 'Chi tiết Đồ án'
  }

  if (pathname === '/courses') {
    return 'Môn học'
  }

  if (pathname.startsWith('/courses/')) {
    return 'Chi tiết Môn học'
  }

  if (pathname === '/profile') {
    return 'Cài đặt Hồ sơ'
  }

  return 'EduCollaborate'
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 text-text-soft"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
    </svg>
  )
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

function GlobalSearch() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredRoutes = normalizedQuery
    ? searchableRoutes.filter((route) =>
        `${route.label} ${route.category}`.toLowerCase().includes(normalizedQuery),
      )
    : []

  const handleSelect = (path: string) => {
    navigate(path)
    setSearchQuery('')
    setIsSearchOpen(false)
  }

  return (
    <div className="relative hidden sm:block">
      <label className="flex items-center gap-2 rounded-full bg-surface-soft px-3 py-2">
        <SearchIcon />
        <span className="sr-only">Tìm kiếm toàn cục</span>
        <input
          className="w-48 bg-transparent text-sm text-text outline-none placeholder:text-text-soft md:w-64"
          onBlur={() => {
            window.setTimeout(() => setIsSearchOpen(false), 120)
          }}
          onChange={(event) => {
            setSearchQuery(event.target.value)
            setIsSearchOpen(true)
          }}
          onFocus={() => setIsSearchOpen(searchQuery.trim().length > 0)}
          placeholder="Tìm kiếm..."
          type="search"
          value={searchQuery}
        />
      </label>

      {isSearchOpen && searchQuery.trim().length > 0 ? (
        <div className="absolute right-0 top-12 z-20 w-80 rounded-card border border-border bg-surface p-2 shadow-card">
          {filteredRoutes.length > 0 ? (
            <div className="space-y-1">
              {filteredRoutes.map((route) => (
                <button
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-soft"
                  key={route.path}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(route.path)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-text">
                      {route.label}
                    </span>
                    <span className="block text-xs text-text-soft">{route.category}</span>
                  </span>
                  <span className="ml-3 shrink-0 text-xs text-text-soft">{route.path}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-text-soft">Không tìm thấy kết quả phù hợp.</p>
          )}
        </div>
      ) : null}
    </div>
  )
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
        onClick={() => setIsOpen((current) => !current)}
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

function UserProfileLink({
  currentUser,
  isLoading,
}: {
  currentUser: UserDto | null
  isLoading: boolean
}) {
  const displayName = currentUser?.name ?? 'Người dùng'
  const studentCode = currentUser?.uid ?? 'Chưa có MSSV'
  const initials = getInitials(displayName) || 'U'

  return (
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
  )
}

function Navbar() {
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getCurrentUser()
      .then((response) => {
        if (isMounted) {
          setCurrentUser(response.data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setCurrentUser(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-text-soft">Không gian học tập</p>
        <h1 className="truncate text-lg font-semibold tracking-normal text-primary md:text-xl">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <GlobalSearch />
        <NotificationDropdown />
        <UserProfileLink currentUser={currentUser} isLoading={isLoading} />
      </div>
    </header>
  )
}

export default Navbar
