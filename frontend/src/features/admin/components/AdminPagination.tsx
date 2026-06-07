type AdminPaginationProps = {
  page: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function AdminPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: AdminPaginationProps) {
  const first = totalElements === 0 ? 0 : page * pageSize + 1
  const last = Math.min((page + 1) * pageSize, totalElements)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-text-soft">
      <span>
        Hiển thị <span className="font-semibold text-text">{first}</span>–
        <span className="font-semibold text-text">{last}</span> / {totalElements}
      </span>
      <div className="flex items-center gap-2">
        <button
          className="rounded-md border border-border px-3 py-1 disabled:opacity-50"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          Trước
        </button>
        <span className="px-2">
          Trang <span className="font-semibold text-text">{page + 1}</span> / {Math.max(totalPages, 1)}
        </span>
        <button
          className="rounded-md border border-border px-3 py-1 disabled:opacity-50"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          Sau
        </button>
      </div>
    </div>
  )
}
