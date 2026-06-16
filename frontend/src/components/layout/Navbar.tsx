import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../features/auth/useAuth'
import {
  enableNotifications as enablePref,
  isNotificationsEnabled,
  muteNotifications as mutePref,
  subscribeNotifPref,
} from '../../lib/notificationPrefs'
import GlobalSearch from './GlobalSearch'
import Avatar from '../ui/Avatar'

const HOUR = 60 * 60 * 1000

type NotificationOption = {
  label: string
  durationMs: number | null
}

const notificationOptions: NotificationOption[] = [
  { label: 'Trong 1 giờ', durationMs: HOUR },
  { label: 'Trong 12 giờ', durationMs: 12 * HOUR },
  { label: 'Trong 24 giờ', durationMs: 24 * HOUR },
  { label: 'Cho đến khi tôi bật lại', durationMs: null },
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

function BellIcon({ muted = false }: { muted?: boolean }) {
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
      {muted ? <path d="M3 3l18 18" /> : null}
    </svg>
  )
}

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [enabled, setEnabled] = useState<boolean>(() => isNotificationsEnabled())
  const [mutedLabel, setMutedLabel] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => subscribeNotifPref(setEnabled), [])

  useEffect(() => {
    if (!isOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [isOpen])

  const enableNotifications = () => {
    setMutedLabel(null)
    enablePref()
    toast.success('Đã bật lại thông báo.')
  }

  const muteNotifications = (label: string, durationMs: number | null) => {
    setMutedLabel(label)
    mutePref(durationMs)
    toast.success(`Đã tắt cập nhật hoạt động (${label.toLowerCase()}).`)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={enabled ? 'Thông báo đang bật' : 'Thông báo đang tắt'}
        className="flex size-10 items-center justify-center rounded-lg text-text-soft transition-colors hover:bg-surface-soft hover:text-text"
        onClick={() => setIsOpen((c) => !c)}
        type="button"
      >
        <BellIcon muted={!enabled} />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-12 z-20 w-64 rounded-card border border-border bg-surface p-2 shadow-card"
          role="menu"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-semibold text-text">Thông báo đẩy</span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => (enabled ? muteNotifications('Cho đến khi tôi bật lại', null) : enableNotifications())}
              className={[
                'relative h-5 w-9 rounded-full transition-colors',
                enabled ? 'bg-primary' : 'bg-border',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 size-4 rounded-full bg-surface shadow transition-all',
                  enabled ? 'left-[18px]' : 'left-0.5',
                ].join(' ')}
              />
            </button>
          </div>

          <div className="h-px bg-border" />

          {enabled ? (
            <div className="mt-1 space-y-1">
              <p className="px-3 py-1 text-xs font-medium text-text-soft">Tạm tắt thông báo trong</p>
              {notificationOptions.map((option) => (
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-soft transition-colors hover:bg-surface-soft hover:text-text"
                  key={option.label}
                  onClick={() => {
                    muteNotifications(option.label, option.durationMs)
                    setIsOpen(false)
                  }}
                  role="menuitem"
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-1 space-y-2 px-3 py-2">
              <p className="text-sm text-text-soft">
                Đang tắt thông báo{mutedLabel ? ` · ${mutedLabel.toLowerCase()}` : ''}.
              </p>
              <button
                type="button"
                onClick={() => {
                  enableNotifications()
                  setIsOpen(false)
                }}
                className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
              >
                Bật lại thông báo
              </button>
            </div>
          )}
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
          <Avatar 
            name={displayName} 
            avatarUrl={currentUser?.avatarUrl} 
            sizeClass="size-10 shrink-0" 
            textClass="text-sm font-semibold"
          />

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
