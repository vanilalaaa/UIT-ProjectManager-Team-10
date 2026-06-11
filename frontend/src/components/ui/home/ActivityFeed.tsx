import Avatar from '../../ui/Avatar';
import type { HomeFeedItem } from '../../../services/home.service';

interface ActivityFeedProps {
  activities: HomeFeedItem[];
  selectedMonth: number;
  selectedDate: number | null;
}

export default function ActivityFeed({ activities, selectedMonth, selectedDate }: ActivityFeedProps) {
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
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
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        Hoạt động
      </h3>

      <div className="grid grid-cols-12 gap-4 text-xs font-medium text-text-soft border-b border-border-soft pb-3 mb-2 px-3">
        <div className="col-span-5">Nội dung</div>
        <div className="col-span-3">Chủ nhân</div>
        <div className="col-span-2">Thời gian</div>
        <div className="col-span-2">Project</div>
      </div>

      <div className="flex flex-col">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-text-soft text-sm">
            Không có hoạt động nào trong tháng {selectedMonth}{selectedDate ? `, ngày ${selectedDate}` : ''}.
          </div>
        ) : (
          activities.map((act) => (
            <div key={`${act.type}-${act.referenceId}`} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border-soft last:border-0 hover:bg-surface-soft transition-colors rounded-xl px-3 cursor-pointer">
              <div className="col-span-5 flex items-center gap-3 text-text">
                <span className="text-lg opacity-80">{act.type === 'SUBMISSION' ? '📄' : '📝'}</span>
                <span className="text-[13px] truncate">
                  <span className="font-medium">{act.actorName}</span>{' '}
                  <span className="text-text-soft">{act.title}</span>
                </span>
              </div>

              <div className="col-span-3 flex items-center gap-2">
                <Avatar
                  name={act.actorName}
                  avatarUrl={act.actorAvatar ?? undefined}
                  sizeClass="size-10"
                  className="border border-border shrink-0"
                />
                <span className="text-[13px] font-medium truncate">{act.actorName}</span>
              </div>

              <div className="col-span-2 text-[13px] text-text-soft">
                {getRelativeTime(act.timestamp)}
              </div>

              <div className="col-span-2 text-[13px] text-primary hover:underline font-medium truncate">
                {act.projectTitle || '—'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
