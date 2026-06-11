import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom'; // Thêm import này
import { useAuth } from '../auth/AuthContext';
import { getStudentQuickStats, getTeacherQuickStats, getStudentChartStats, getTeacherChartStats } from '../../services/home.service';
import QuickStats from '../../components/ui/home/QuickStats';
import StatusChart from '../../components/ui/home/StatusChart';
import ActivityCalendar from '../../components/ui/home/ActivityCalendar';
import ActivityFeed from '../../components/ui/home/ActivityFeed';

export default function HomePage() {
  const { currentUser, isLoading } = useAuth(); 
  const [stats, setStats] = useState<any>(null);
  const [chartStats, setChartStats] = useState({ todo: 0, inProgress: 0, readyForTest: 0, total: 0 });
  const [selectedMonth, setSelectedMonth] = useState(6);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setStats(currentUser.role === 'TEACHER' ? getTeacherQuickStats() : getStudentQuickStats(currentUser.id));
    const statsFunc = currentUser.role === 'TEACHER' ? getTeacherChartStats : getStudentChartStats;
    setChartStats(statsFunc(selectedMonth, selectedDate));
    setSelectedStatus(null);
  }, [selectedMonth, selectedDate, currentUser]);

  if (isLoading) return <div>Loading...</div>;

  if (currentUser?.role === 'ADMIN') {
    return <Navigate to="/admin/users" replace />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Welcome back, {currentUser?.name?.split(' ').pop()}</h1>
      {stats && <QuickStats role={currentUser?.role || 'STUDENT'} stats={stats} />}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StatusChart role={currentUser?.role} chartStats={chartStats} selectedStatus={selectedStatus} onToggle={setSelectedStatus} />
        <ActivityCalendar role={currentUser?.role} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      </div>
      <ActivityFeed role={currentUser?.role} selectedMonth={selectedMonth} selectedDate={selectedDate} />
    </div>
  );
}