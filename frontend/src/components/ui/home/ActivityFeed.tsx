import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../ui/Avatar';
import type { HomeFeedItem } from '../../../services/home.service';
import type { Role } from '../../../types/models';

interface ActivityFeedProps {
  activities: HomeFeedItem[];
  selectedMonth: number;
  selectedDate: number | null;
  role: Role;
}

type ProjectFeedType = 'TASK' | 'SUBMISSION' | 'PROJECT';

const STUDENT_TAB: Record<ProjectFeedType, string> = {
  TASK: 'kanban',
  SUBMISSION: 'submit',
  PROJECT: 'overview',
};

const TEACHER_TAB: Record<ProjectFeedType, string> = {
  TASK: 'projectdetail',
  SUBMISSION: 'grades',
  PROJECT: 'projectdetail',
};

const ICON: Record<HomeFeedItem['type'], string> = {
  TASK: '📝',
  SUBMISSION: '📄',
  PROJECT: '📁',
  GROUP_REQUEST: '🙋',
  PROJECT_PROPOSAL: '📌',
  PROJECT_RESULT: '📣',
};

const feedItemHref = (act: HomeFeedItem, role: Role): string | null => {
  // Thông báo dạng yêu cầu cần xử lý → mở thẳng trang xử lý tương ứng.
  if (act.type === 'GROUP_REQUEST') {
    return act.courseId ? `/my-course/${act.courseId}/my-team` : null;
  }
  if (act.type === 'PROJECT_PROPOSAL') {
    return act.courseId ? `/teacher/my-course/${act.courseId}/project-list` : null;
  }
  // Kết quả duyệt/từ chối → mở modal nhận xét (xử lý ở onRowClick), không điều hướng.
  if (act.type === 'PROJECT_RESULT') return null;
  if (!act.projectId) return null;
  if (role === 'TEACHER') {
    if (!act.courseId) return null;
    return `/teacher/my-course/${act.courseId}/project-list/${act.projectId}/${TEACHER_TAB[act.type]}`;
  }
  return `/my-project/${act.projectId}/${STUDENT_TAB[act.type]}`;
};

export default function ActivityFeed({ activities, selectedMonth, selectedDate, role }: ActivityFeedProps) {
  const navigate = useNavigate();
  const [noteItem, setNoteItem] = useState<HomeFeedItem | null>(null);

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
          activities.map((act) => {
            const isResult = act.type === 'PROJECT_RESULT';
            const href = feedItemHref(act, role);
            const clickable = isResult || !!href;
            const onRowClick = () => {
              if (isResult) setNoteItem(act);
              else if (href) navigate(href);
            };
            return (
            <div
              key={`${act.type}-${act.referenceId}`}
              onClick={clickable ? onRowClick : undefined}
              className={`grid grid-cols-12 gap-4 items-center py-4 border-b border-border-soft last:border-0 transition-colors rounded-xl px-3 ${
                clickable ? 'hover:bg-surface-soft cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="col-span-5 flex items-center gap-3 text-text">
                <span className="text-lg opacity-80">{ICON[act.type]}</span>
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
                {isResult ? 'Xem nhận xét' : act.projectTitle || '—'}
              </div>
            </div>
            );
          })
        )}
      </div>

      {noteItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setNoteItem(null)}
        >
          <div
            className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text mb-1">
              {noteItem.actorName} {noteItem.title}
            </h3>
            <p className="text-xs text-text-soft mb-4">{getRelativeTime(noteItem.timestamp)}</p>
            <div className="bg-surface-soft rounded-xl p-4 text-sm text-text whitespace-pre-line">
              {noteItem.description || 'Giảng viên không để lại nhận xét.'}
            </div>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={() => setNoteItem(null)}
                className="px-4 py-2 bg-primary text-surface rounded-lg text-sm font-semibold hover:opacity-90"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
