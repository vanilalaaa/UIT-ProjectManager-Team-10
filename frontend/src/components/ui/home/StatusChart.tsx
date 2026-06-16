import { Link } from 'react-router-dom';
import type { ChartStats } from '../../../services/home.service';

interface StatusChartProps {
  role: string;
  chartStats: ChartStats;
  selectedStatus: string | null;
  onToggle: (status: string | null) => void;
}

export default function StatusChart({ role, chartStats, selectedStatus, onToggle }: StatusChartProps) {
  const isTeacher = role === 'TEACHER';
  const labels = isTeacher 
    ? { todo: 'Chưa nộp', inProgress: 'Đã nộp', readyForTest: 'Đã chấm' }
    : { todo: 'To Do', inProgress: 'In Progress', readyForTest: 'Ready for Test' };

  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const todoPct = chartStats.total === 0 ? 0 : chartStats.todo / chartStats.total;
  const inProgPct = chartStats.total === 0 ? 0 : chartStats.inProgress / chartStats.total;
  const readyPct = chartStats.total === 0 ? 0 : chartStats.readyForTest / chartStats.total;

  return (
    <div className="glass-panel rounded-[var(--radius-card)] p-6 flex flex-col">
      <h3 className="font-bold text-text mb-6">{isTeacher ? 'Tỉ lệ nộp bài của sinh viên' : 'Status overview'}</h3>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative size-40 flex items-center justify-center">
          <svg className="size-full -rotate-90">
            <circle cx="80" cy="80" r={radius} stroke="#e2e8f0" strokeWidth={selectedStatus === 'todo' ? 24 : 16} fill="none" className="transition-all duration-300 cursor-pointer" opacity={!selectedStatus || selectedStatus === 'todo' ? 1 : 0.25} onClick={() => onToggle('todo')} />
            <circle cx="80" cy="80" r={radius} stroke="#34d399" strokeWidth={selectedStatus === 'inProgress' ? 24 : 16} fill="none" strokeDasharray={`${inProgPct * circumference} ${circumference}`} strokeDashoffset={-todoPct * circumference} className="transition-all duration-300 cursor-pointer" opacity={!selectedStatus || selectedStatus === 'inProgress' ? 1 : 0.25} onClick={() => onToggle('inProgress')} />
            <circle cx="80" cy="80" r={radius} stroke="#3bb8ff" strokeWidth={selectedStatus === 'readyForTest' ? 24 : 16} fill="none" strokeDasharray={`${readyPct * circumference} ${circumference}`} strokeDashoffset={-(todoPct + inProgPct) * circumference} className="transition-all duration-300 cursor-pointer" opacity={!selectedStatus || selectedStatus === 'readyForTest' ? 1 : 0.25} onClick={() => onToggle('readyForTest')} />
          </svg>
          <div className="absolute flex flex-col items-center pointer-events-none">
            <span className="text-4xl font-extrabold text-text">{chartStats.total}</span>
            <span className="text-xs text-text-soft mt-1">Total</span>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-8 text-sm text-text-soft">
          {['todo', 'inProgress', 'readyForTest'].map((s) => (
            <div key={s} className={`flex items-center gap-2 cursor-pointer ${selectedStatus && selectedStatus !== s ? 'opacity-40' : ''}`} onClick={() => onToggle(s === selectedStatus ? null : s)}>
              <div className={`size-3 rounded-full ${s === 'todo' ? 'bg-[#e2e8f0]' : s === 'inProgress' ? 'bg-[#34d399]' : 'bg-[#3bb8ff]'}`} />
              {labels[s as keyof typeof labels]} ({chartStats[s as keyof typeof chartStats]})
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-6">
        <Link to={isTeacher ? '/teacher/my-course/1/project-list/1/submit' : '/my-project'} className="text-sm font-bold text-primary hover:underline">View all work items</Link>
      </div>
    </div>
  );
}