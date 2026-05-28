type BadgeProps = {
  status: string
}

export default function StatusBadge({ status }: BadgeProps) {
  const config: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PLANNING: 'bg-purple-100 text-purple-700 border-purple-200',
    OVERDUE: 'bg-red-100 text-red-700 border-red-200',
  }

  const style = config[status] || 'bg-surface-soft text-text-soft border-border'

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border uppercase tracking-wider ${style}`}>
      {status}
    </span>
  )
}