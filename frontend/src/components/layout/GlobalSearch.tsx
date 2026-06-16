import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../features/auth/useAuth'
import { NAV_ITEMS } from '../../lib/constants/menu'
import { searchGlobal } from '../../services/search.service'
import type { Role } from '../../types/api/auth'

type SearchResult = {
  id: string
  label: string
  description?: string
  path: string
  category: string
  keywords: string
}

const MAX_RESULTS = 8

const baseResultsByRole: Record<Role, SearchResult[]> = {
  STUDENT: [
    createResult('student-profile', 'Cài đặt hồ sơ', '/profile', 'Tài khoản'),
  ],
  TEACHER: [
    createResult('teacher-profile', 'Cài đặt hồ sơ', '/profile', 'Tài khoản'),
  ],
  ADMIN: [
    createResult('admin-profile', 'Cài đặt hồ sơ', '/profile', 'Tài khoản'),
  ],
}

function createResult(
  id: string,
  label: string,
  path: string,
  category: string,
  description = '',
  keywords = '',
): SearchResult {
  return {
    id,
    label,
    path,
    category,
    description,
    keywords: `${label} ${description} ${category} ${path} ${keywords}`,
  }
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

function ResultIcon() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
      <SearchIcon />
    </span>
  )
}

export default function GlobalSearch() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const role = currentUser?.role
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [dynamicResults, setDynamicResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!role || !searchQuery.trim()) {
      setDynamicResults([])
      setIsLoading(false)
      setLoadError(null)
      return
    }

    let alive = true
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true)
      setLoadError(null)

      searchGlobal(searchQuery.trim())
        .then((results) => {
          if (alive) setDynamicResults(results)
        })
        .catch(() => {
          if (alive) {
            setDynamicResults([])
            setLoadError('Chưa tải được dữ liệu tìm kiếm.')
          }
        })
        .finally(() => {
          if (alive) setIsLoading(false)
        })
    }, 250)

    return () => {
      alive = false
      window.clearTimeout(timeoutId)
    }
  }, [role, searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allResults = useMemo(() => {
    if (!role) return []

    const menuResults = NAV_ITEMS[role].map((item) =>
      createResult(`nav-${item.to}`, item.label, item.to, 'Điều hướng'),
    )

    return dedupeResults([...menuResults, ...baseResultsByRole[role], ...dynamicResults])
  }, [dynamicResults, role])

  const filteredResults = useMemo(() => {
    const normalizedQuery = normalize(searchQuery.trim())
    if (!normalizedQuery) return []

    return allResults
      .filter((result) => normalize(result.keywords).includes(normalizedQuery))
      .slice(0, MAX_RESULTS)
  }, [allResults, searchQuery])

  const handleSelect = (path: string) => {
    navigate(path)
    setSearchQuery('')
    setIsSearchOpen(false)
    inputRef.current?.blur()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const firstResult = filteredResults[0]
    if (firstResult) handleSelect(firstResult.path)
  }

  const shouldShowDropdown = isSearchOpen && searchQuery.trim().length > 0

  return (
    <div className="relative hidden sm:block" ref={wrapperRef}>
      <form
        className="flex items-center gap-2 rounded-full bg-surface-soft px-3 py-2"
        onSubmit={handleSubmit}
        role="search"
      >
        <SearchIcon />
        <span className="sr-only">Tìm kiếm toàn cục</span>
        <input
          ref={inputRef}
          className="w-48 bg-transparent text-sm text-text outline-none placeholder:text-text-soft md:w-64"
          onChange={(event) => {
            setSearchQuery(event.target.value)
            setIsSearchOpen(true)
          }}
          onFocus={() => setIsSearchOpen(searchQuery.trim().length > 0)}
          placeholder="Tìm kiếm..."
          type="search"
          value={searchQuery}
        />
      </form>

      {shouldShowDropdown ? (
        <div className="absolute right-0 top-12 z-20 w-96 max-w-[calc(100vw-2rem)] rounded-card border border-border bg-surface p-2 shadow-card">
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-text-soft">Đang tải dữ liệu tìm kiếm...</p>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-1">
              {filteredResults.map((result) => (
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-soft"
                  key={result.id}
                  onClick={() => handleSelect(result.path)}
                  type="button"
                >
                  <ResultIcon />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-text">
                      {result.label}
                    </span>
                    <span className="block truncate text-xs text-text-soft">
                      {result.description || result.category}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-surface-soft px-2 py-0.5 text-[11px] font-medium text-text-soft">
                    {result.category}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1 px-3 py-2">
              <p className="text-sm text-text-soft">Không tìm thấy kết quả phù hợp.</p>
              {loadError ? <p className="text-xs text-red-500">{loadError}</p> : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function dedupeResults(results: SearchResult[]) {
  const seen = new Set<string>()
  return results.filter((result) => {
    const key = `${result.category}-${result.path}-${result.label}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
