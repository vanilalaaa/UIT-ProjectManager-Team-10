import type { ReactNode } from 'react'

type AdminToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  createLabel?: string
  onCreate?: () => void
  filters?: ReactNode
}

export default function AdminToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm…',
  createLabel,
  onCreate,
  filters,
}: AdminToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-soft">
      <div className="relative flex-1 min-w-[200px]">
        <svg
          aria-hidden
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-soft"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
        </svg>
        <input
          className="w-full rounded-lg border border-border bg-surface px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={search}
        />
      </div>

      {filters}

      {createLabel && onCreate ? (
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface shadow-soft hover:opacity-90"
          onClick={onCreate}
          type="button"
        >
          + {createLabel}
        </button>
      ) : null}
    </div>
  )
}
