import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import QuickStats from '../../components/ui/home/QuickStats';
import StatusChart from '../../components/ui/home/StatusChart';
import ActivityCalendar from '../../components/ui/home/ActivityCalendar';
import ActivityFeed from '../../components/ui/home/ActivityFeed';
import { isNotificationsEnabled, subscribeNotifPref } from '../../lib/notificationPrefs';
import {
  getHomeStats,
  getHomeFeed,
  filterFeedByMonthDate,
  computeChart,
  computeHeatmap,
  type HomeFeedItem,
  type HomeQuickStats,
} from '../../services/home.service';

export default function HomePage() {
  const { currentUser, isLoading } = useAuth();
  const [stats, setStats] = useState<HomeQuickStats>({});
  const [feed, setFeed] = useState<HomeFeedItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(isNotificationsEnabled());

  useEffect(() => subscribeNotifPref(setNotifEnabled), []);

  useEffect(() => {
    if (!currentUser) return;
    getHomeStats().then(setStats).catch(() => setStats({}));
    getHomeFeed().then(setFeed).catch(() => setFeed([]));
  }, [currentUser]);

  const role = currentUser?.role || 'STUDENT';
  const filtered = useMemo(
    () => filterFeedByMonthDate(feed, selectedMonth, selectedDate),
    [feed, selectedMonth, selectedDate],
  );
  const chartStats = useMemo(() => computeChart(filtered, role), [filtered, role]);
  const heatmap = useMemo(() => computeHeatmap(feed, selectedMonth), [feed, selectedMonth]);

  useEffect(() => {
    setSelectedStatus(null);
  }, [selectedMonth, selectedDate]);

  if (isLoading) return <div>Loading...</div>;

  if (currentUser?.role === 'ADMIN') {
    return <Navigate to="/admin/users" replace />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Welcome back, {currentUser?.name?.split(' ').pop()}</h1>
      <QuickStats role={role} stats={stats} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StatusChart role={role} chartStats={chartStats} selectedStatus={selectedStatus} onToggle={setSelectedStatus} />
        <ActivityCalendar
          role={role}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          heatmap={heatmap}
        />
      </div>
      {notifEnabled ? (
        <ActivityFeed role={role} selectedMonth={selectedMonth} selectedDate={selectedDate} activities={filtered} />
      ) : (
        <div className="glass-panel rounded-[var(--radius-card)] p-6 text-center text-sm text-text-soft">
          Đã tạm tắt thông báo. Bật lại ở chuông 🔔 trên thanh điều hướng để xem hoạt động.
        </div>
      )}
    </div>
  );
}
