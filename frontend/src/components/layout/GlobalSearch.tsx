import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type SearchRoute = {
  label: string
  path: string
  category: string
}

// MOCK DATA
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

export default function GlobalSearch() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // LOGIC TÌM KIẾM MOCK TẠM
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