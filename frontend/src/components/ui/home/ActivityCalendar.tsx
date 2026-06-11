import { useMemo } from 'react';
import { getHeatmapData, mockTeacherActivities } from '../../../mocks/home.mock';

export default function ActivityCalendar({ role, selectedMonth, onMonthChange, selectedDate, onDateSelect }: any) {
  const monthsList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  const heatmapData = useMemo(() => {
    const counts: Record<number, number> = {};

    if (role === 'TEACHER') {
        mockTeacherActivities.forEach(act => {
            const d = new Date(act.createdAt);
            if (d.getMonth() + 1 === selectedMonth) {
                const day = d.getDate();
                counts[day] = (counts[day] || 0) + 1;
            }
        });
    } else {
        return getHeatmapData(selectedMonth);
    }
    return counts;
  }, [selectedMonth, role]);

  const getHeatmapClass = (day: number) => {
    const count = heatmapData[day] || 0;
    if (count === 0) return 'bg-surface-soft';
    if (count <= 1) return 'bg-[#dff5ff]';
    if (count <= 2) return 'bg-[#8cd3ff]';
    return 'bg-[#3bb8ff]';
  };

  return (
    <div className="glass-panel rounded-[var(--radius-card)] p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-text">{role === 'TEACHER' ? 'Lịch báo cáo' : 'Hoạt động'}</h3>
        <span className="text-sm text-text-soft">Tháng {selectedMonth}, 2026</span>
      </div>
      <div className="flex flex-1">
        <div className="flex flex-col justify-between pr-4 border-r border-border-soft mr-4 py-2">
          {monthsList.map((m) => (
            <span key={m} onClick={() => onMonthChange(m)} className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-xs ${selectedMonth === m ? 'bg-[#3bb8ff] text-white font-bold' : 'hover:text-primary'}`}>{m}</span>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 gap-2 text-center text-sm">
          {['CN','T2','T3','T4','T5','T6','T7'].map(d => <div key={d} className="text-xs text-text-soft">{d}</div>)}
          {Array.from({length: 30}).map((_, i) => (
            <div key={i} onClick={() => onDateSelect(selectedDate === i + 1 ? null : i + 1)} className="aspect-square flex items-center justify-center cursor-pointer">
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${selectedDate === i + 1 ? 'bg-primary text-white' : getHeatmapClass(i + 1)}`}>{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-4 text-[11px] text-text-soft">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[3px] bg-surface-soft border border-border-soft"></div>
        <div className="w-3 h-3 rounded-[3px] bg-[#dff5ff]"></div>
        <div className="w-3 h-3 rounded-[3px] bg-[#8cd3ff]"></div>
        <div className="w-3 h-3 rounded-[3px] bg-[#3bb8ff]"></div>
        <span>More</span>
      </div>
    </div>
  );
}