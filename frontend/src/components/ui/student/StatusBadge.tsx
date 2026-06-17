type BadgeProps = {
  status: string
}

export default function StatusBadge({ status }: BadgeProps) {
  const config: Record<string, string> = {
    APPROVED: 'bg-secondary-soft text-secondary border-secondary/20',
    COMPLETED: 'bg-secondary-soft text-secondary border-secondary/20',
    GRADED: 'bg-secondary-soft text-secondary border-secondary/20',
    IN_PROGRESS: 'bg-primary-soft text-primary border-primary/20',
    PENDING: 'bg-warning-soft text-warning border-warning/20',
    PLANNING: 'bg-surface-soft text-text-soft border-border',
    OVERDUE: 'bg-warning-soft text-warning border-warning/20',
  }

  const style = config[status] || 'bg-surface-soft text-text-soft border-border'

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border uppercase tracking-wider ${style}`}>
      {status}
    </span>
  )
}