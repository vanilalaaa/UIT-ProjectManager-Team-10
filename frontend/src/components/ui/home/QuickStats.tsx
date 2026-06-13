export default function QuickStats({ role, stats }: { role: string, stats: any }) {
  const items = role === 'TEACHER' 
    ? [
        { label: 'Bài chờ chấm', val: stats.pendingGrades, color: 'text-primary', bg: 'bg-primary-soft', icon: '✎' },
        { label: 'Tổng đồ án', val: stats.totalProjects, color: 'text-secondary', bg: 'bg-secondary-soft', icon: '✓' },
        { label: 'Chờ duyệt', val: stats.pendingRequests, color: 'text-primary', bg: 'bg-primary-soft', icon: '✉' },
        { label: 'Sắp đến hạn', val: stats.upcomingDeadlines, color: 'text-red-500', bg: 'bg-red-100', icon: '⚠' }
      ]
    : [
        { label: 'Completed', val: stats.completed, color: 'text-secondary', bg: 'bg-secondary-soft', icon: '✓' },
        { label: 'Updated', val: stats.updated, color: 'text-primary', bg: 'bg-primary-soft', icon: '↻' },
        { label: 'Created', val: stats.created, color: 'text-secondary', bg: 'bg-secondary-soft', icon: '+' },
        { label: 'Due Soon', val: stats.dueSoon, color: 'text-red-500', bg: 'bg-red-100', icon: '⚠' }
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <div key={i} className="glass-panel rounded-[var(--radius-card)] p-5">
          <p className="text-text-soft font-medium text-sm">{item.label}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-bold text-text">{item.val}</span>
            <div className={`size-6 rounded-full ${item.bg} flex items-center justify-center ${item.color} text-[13px]`}>{item.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}