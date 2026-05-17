import { useEffect, useState } from 'react'
import { Link, useLocation} from 'react-router-dom'
import { getCurrentUser } from '../../services/auth.service'
import type { UserDto } from '../../services/auth.service'
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
