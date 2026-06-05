import type { ReactNode } from 'react'

export function AdminLoading({ message = 'Đang tải…' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-text-soft">
      <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
      </svg>
      {message}
    </div>
  )
}

export function AdminError({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="space-y-3 py-16 text-center text-text-soft">
      <p className="font-medium text-red-500">{message}</p>
      {onRetry ? (
        <button
          className="rounded-md border border-border px-4 py-1.5 text-sm hover:bg-surface-soft"
          onClick={onRetry}
          type="button"
        >
          Thử lại
        </button>
      ) : null}
    </div>
  )
}

export function AdminEmpty({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="space-y-3 py-16 text-center">
      <p className="font-semibold text-text">{title}</p>
      {hint ? <p className="text-sm text-text-soft">{hint}</p> : null}
      {action}
    </div>
  )
}
