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
import {
  getMyNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from '../../services/notification.service'
import GlobalSearch from './GlobalSearch'

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

// Icon theo loại thông báo (type lưu ở BE: APPROVED/REJECTED...). Mặc định 🔔.
const NOTIF_ICON: Record<string, string> = {
  APPROVED: '✅',
  REJECTED: '❌',
}

function notifRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffMin = Math.floor((Date.now() - then) / 60000)
  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} giờ trước`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

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
  const [showSettings, setShowSettings] = useState(false)
  const [enabled, setEnabled] = useState<boolean>(() => isNotificationsEnabled())
  const [mutedLabel, setMutedLabel] = useState<string | null>(null)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => subscribeNotifPref(setEnabled), [])

  // Đếm số chưa đọc khi mount + định kỳ 60s để badge tự cập nhật.
  useEffect(() => {
    const refresh = () => getUnreadCount().then(setUnreadCount).catch(() => {})
    refresh()
    const timer = window.setInterval(refresh, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  // Tải danh sách thông báo mỗi khi mở dropdown (ở chế độ xem danh sách).
  useEffect(() => {
    if (!isOpen || showSettings) return
    setLoading(true)
    getMyNotifications()
      .then((data) => {
        setItems(data)
        setUnreadCount(data.filter((n) => !n.isRead).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, showSettings])

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

  const handleItemClick = (item: NotificationItem) => {
    if (item.isRead) return
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
    markNotificationRead(item.id).catch(() => {})
  }

  const handleMarkAll = () => {
    if (unreadCount === 0) return
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    markAllNotificationsRead().catch(() => {})
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        className="relative flex size-10 items-center justify-center rounded-lg text-text-soft transition-colors hover:bg-surface-soft hover:text-text"
        onClick={() => {
          setIsOpen((c) => !c)
          setShowSettings(false)
        }}
        type="button"
      >
        <BellIcon muted={!enabled} />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-12 z-20 w-80 rounded-card border border-border bg-surface p-2 shadow-card"
          role="menu"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-semibold text-text">
              {showSettings ? 'Cài đặt thông báo' : 'Thông báo'}
            </span>
            <div className="flex items-center gap-2">
              {!showSettings && unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
                >
                  Đánh dấu đã đọc
                </button>
              ) : null}
              <button
                type="button"
                aria-label={showSettings ? 'Xem thông báo' : 'Cài đặt'}
                onClick={() => setShowSettings((s) => !s)}
                className="flex size-6 items-center justify-center rounded-md text-text-soft transition-colors hover:bg-surface-soft hover:text-text"
              >
                {showSettings ? (
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="h-px bg-border" />

          {showSettings ? (
            <SettingsPanel
              enabled={enabled}
              mutedLabel={mutedLabel}
              onEnable={enableNotifications}
              onMute={muteNotifications}
            />
          ) : (
            <div className="mt-1 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="px-3 py-8 text-center text-sm text-text-soft">Đang tải…</p>
              ) : items.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-text-soft">Chưa có thông báo nào.</p>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={[
                      'flex w-full gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-soft',
                      item.isRead ? '' : 'bg-primary-soft/40',
                    ].join(' ')}
                  >
                    <span className="mt-0.5 text-base leading-none">
                      {NOTIF_ICON[item.type] ?? '🔔'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-text">{item.title}</span>
                      {item.message ? (
                        <span className="mt-0.5 block text-xs text-text-soft line-clamp-2">
                          {item.message}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[11px] text-text-soft">
                        {notifRelativeTime(item.createdAt)}
                      </span>
                    </span>
                    {!item.isRead ? (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

type SettingsPanelProps = {
  enabled: boolean
  mutedLabel: string | null
  onEnable: () => void
  onMute: (label: string, durationMs: number | null) => void
}

function SettingsPanel({ enabled, mutedLabel, onEnable, onMute }: SettingsPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold text-text">Thông báo đẩy</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => (enabled ? onMute('Cho đến khi tôi bật lại', null) : onEnable())}
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
              onClick={() => onMute(option.label, option.durationMs)}
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
            onClick={onEnable}
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
          >
            Bật lại thông báo
          </button>
        </div>
      )}
    </>
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
