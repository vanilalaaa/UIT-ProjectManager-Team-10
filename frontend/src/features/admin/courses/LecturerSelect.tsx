import { useMemo, useState } from 'react'

import type { AdminUserListItem } from '../../../types/api/user'

type Props = {
  teachers: AdminUserListItem[]
  loading?: boolean
  value: number
  selectedName: string
  onSelect: (id: number, name: string) => void
}

export default function LecturerSelect({ teachers, loading, value, selectedName, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return teachers
    return teachers.filter(
      (t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q),
    )
  }, [teachers, query])

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? query : selectedName}
        placeholder={loading ? 'Đang tải giảng viên…' : 'Tìm theo tên hoặc email…'}
        onFocus={() => {
          setQuery('')
          setOpen(true)
        }}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
      />

      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface shadow-card">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-text-soft">
              {loading ? 'Đang tải…' : 'Không tìm thấy giảng viên.'}
            </li>
          ) : (
            filtered.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onSelect(t.id, t.name)
                    setOpen(false)
                  }}
                  className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-surface-soft ${
                    t.id === value ? 'bg-surface-soft' : ''
                  }`}
                >
                  <span className="font-medium text-text">{t.name}</span>
                  <span className="text-xs text-text-soft">{t.email}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
