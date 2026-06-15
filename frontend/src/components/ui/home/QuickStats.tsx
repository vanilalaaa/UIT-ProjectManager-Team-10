import { useState } from 'react';
import { getStatDetailMock as getStatDetail } from '../../../mocks/home.mock';
import type { StatDetailItem, StatDetailType } from '../../../types/api/home';

type StatItem = {
  key: StatDetailType;
  label: string;
  val: number;
  color: string;
  bg: string;
  icon: string;
};

// Dịch trạng thái sang nhãn tiếng Việt ngắn gọn để hiển thị badge
const STATUS_LABELS: Record<string, string> = {
  TODO: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  DONE: 'Hoàn thành',
  BLOCKED: 'Bị chặn',
  AVAILABLE: 'Còn trống',
  ALLOCATED: 'Đã giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  SUBMITTED: 'Đã nộp',
  LATE: 'Nộp trễ',
  GRADED: 'Đã chấm',
  PENDING: 'Chờ duyệt',
};

const statusLabel = (s: string) => STATUS_LABELS[s] ?? s;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function QuickStats({ role, stats }: { role: string; stats: any }) {
  const items: StatItem[] = role === 'TEACHER'
    ? [
        { key: 'pendingGrades', label: 'Bài chờ chấm', val: stats.pendingGrades, color: 'text-primary', bg: 'bg-primary-soft', icon: '✎' },
        { key: 'totalProjects', label: 'Tổng đồ án', val: stats.totalProjects, color: 'text-secondary', bg: 'bg-secondary-soft', icon: '✓' },
        { key: 'pendingRequests', label: 'Chờ duyệt', val: stats.pendingRequests, color: 'text-primary', bg: 'bg-primary-soft', icon: '✉' },
        { key: 'upcomingDeadlines', label: 'Sắp đến hạn', val: stats.upcomingDeadlines, color: 'text-red-500', bg: 'bg-red-100', icon: '⚠' },
      ]
    : [
        { key: 'completed', label: 'Completed', val: stats.completed, color: 'text-secondary', bg: 'bg-secondary-soft', icon: '✓' },
        { key: 'updated', label: 'Updated', val: stats.updated, color: 'text-primary', bg: 'bg-primary-soft', icon: '↻' },
        { key: 'created', label: 'Created', val: stats.created, color: 'text-secondary', bg: 'bg-secondary-soft', icon: '+' },
        { key: 'dueSoon', label: 'Due Soon', val: stats.dueSoon, color: 'text-red-500', bg: 'bg-red-100', icon: '⚠' },
      ];

  const [expanded, setExpanded] = useState<StatDetailType | null>(null);
  const [details, setDetails] = useState<StatDetailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (key: StatDetailType) => {
    if (expanded === key) {
      setExpanded(null);
      return;
    }
    setExpanded(key);
    setLoading(true);
    setError(null);
    setDetails([]);
    try {
      const res = await getStatDetail(key);
      setDetails(res.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được chi tiết.');
    } finally {
      setLoading(false);
    }
  };

  const activeLabel = items.find((i) => i.key === expanded)?.label;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleClick(item.key)}
            className={`glass-panel rounded-[var(--radius-card)] p-5 text-left transition cursor-pointer ${
              expanded === item.key ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
          >
            <p className="text-text-soft font-medium text-sm flex items-center justify-between">
              {item.label}
              <span className={`text-text-soft transition-transform ${expanded === item.key ? 'rotate-180' : ''}`}>⌄</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold text-text">{item.val}</span>
              <div className={`size-6 rounded-full ${item.bg} flex items-center justify-center ${item.color} text-[13px]`}>{item.icon}</div>
            </div>
          </button>
        ))}
      </div>

      {expanded && (
        <div className="glass-panel rounded-[var(--radius-card)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text">Chi tiết: {activeLabel}</h3>
            <button
              type="button"
              onClick={() => setExpanded(null)}
              className="text-text-soft text-sm hover:text-text cursor-pointer"
            >
              Đóng ✕
            </button>
          </div>

          {loading && <p className="text-text-soft text-sm">Đang tải...</p>}
          {!loading && error && <p className="text-red-500 text-sm">{error}</p>}
          {!loading && !error && details.length === 0 && (
            <p className="text-text-soft text-sm">Không có dữ liệu.</p>
          )}
          {!loading && !error && details.length > 0 && (
            <ul className="divide-y divide-black/5">
              {details.map((d) => (
                <li key={`${d.type}-${d.id}`} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-text font-medium truncate">{d.title}</p>
                    {d.subtitle && <p className="text-text-soft text-xs mt-0.5 truncate">{d.subtitle}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    {d.status && (
                      <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-primary-soft text-primary">
                        {statusLabel(d.status)}
                      </span>
                    )}
                    {d.timestamp && <p className="text-text-soft text-xs mt-1">{formatDate(d.timestamp)}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
