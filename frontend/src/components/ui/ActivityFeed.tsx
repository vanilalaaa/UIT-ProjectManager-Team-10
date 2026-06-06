import { mockStudentActivities, mockTeacherActivities } from '../../mocks/home.mock';

export default function ActivityFeed({ role, selectedMonth, selectedDate }: any) {
  const sourceActivities = role === 'TEACHER' ? mockTeacherActivities : mockStudentActivities;

  const displayedActivities = sourceActivities.filter(act => {
    const dateObj = new Date(act.createdAt);
    return dateObj.getMonth() + 1 === selectedMonth && (selectedDate ? dateObj.getDate() === selectedDate : true);
  });

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date('2026-06-06T12:00:00');
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1 && diffInHours > 0) return `${Math.floor(diffInHours * 60)}m ago`;
    if (diffInHours < 24 && diffInHours >= 1) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours >= 24 && diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-panel rounded-[var(--radius-card)] p-6">
      <h3 className="font-bold text-text flex items-center gap-2 text-lg mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {role === 'TEACHER' ? 'Hoạt động' : 'Hoạt động'}
      </h3>
      <div className="grid grid-cols-12 gap-4 text-xs font-medium text-text-soft border-b border-border-soft pb-3 mb-2 px-3">
        <div className="col-span-5">Nội dung</div><div className="col-span-3">Chủ nhân</div><div className="col-span-2">Thời gian</div><div className="col-span-2">Project</div>
      </div>
      <div className="flex flex-col">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-text-soft text-sm">Không có hoạt động nào trong tháng {selectedMonth}.</div>
        ) : (
          displayedActivities.map((act) => (
            <div key={act.activityId} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border-soft last:border-0 hover:bg-surface-soft transition-colors rounded-xl px-3 cursor-pointer">
              <div className="col-span-5 flex items-center gap-3 text-text">
                <span className="text-lg opacity-80">{act.action === 'MENTION' ? '💬' : '📄'}</span>
                <span className="text-[13px] truncate"><span className="font-medium">{act.actor.name}</span> <span className="text-text-soft">{act.content}</span></span>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <img src={act.actor.userProfile?.avatarUrl} alt="avatar" className="size-6 rounded-full bg-white border border-border-soft" />
                <span className="text-[13px] font-medium truncate">{act.actor.name}</span>
              </div>
              <div className="col-span-2 text-[13px] text-text-soft">{getRelativeTime(act.createdAt)}</div>
              <div className="col-span-2 text-[13px] text-primary hover:underline font-medium truncate">{act.project?.course?.name?.split('-')[0] || act.targetName}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}