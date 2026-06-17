interface DueDateCardProps {
  dueDate: string
  timeRemaining: string
  status?: 'active' | 'submitted' | 'overdue'
}

export default function DueDateCard({ dueDate, timeRemaining, status = 'active' }: DueDateCardProps) {
  const isOverdue = status === 'overdue'
  const isSubmitted = status === 'submitted'
  const accentClass = isOverdue
    ? 'bg-red-100 text-red-600'
    : isSubmitted
      ? 'bg-secondary-soft text-secondary'
      : 'bg-primary-soft text-primary'
  const timeClass = isOverdue ? 'text-red-600' : isSubmitted ? 'text-secondary' : 'text-primary'

  return (
    <div className="bg-surface border border-border rounded-[18px] p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${accentClass}`}>
          <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-bold text-text-soft uppercase tracking-wider mb-0.5">Hạn nộp</p>
          <p className="font-bold text-text text-base">{dueDate}</p>
        </div>
      </div>

      <div className="sm:text-right">
        <p className="text-[11px] font-bold text-text-soft uppercase tracking-wider mb-0.5">Thời gian còn lại</p>
        <p className={`font-bold text-xl ${timeClass}`}>{timeRemaining}</p>
      </div>
    </div>
  )
}
