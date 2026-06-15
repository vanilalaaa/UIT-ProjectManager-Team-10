import { userSinhVienTran, userLeHoangVy, mockTasks } from './tasks.mock';
import { mockProjects } from './projects.mock';
import type { Project, User, DateTimeString } from './types';
import type { ApiResponse } from '../types/api/common';
import type { StatDetailItem, StatDetailType } from '../types/api/home';

export type ActivityAction = 'UPDATE_TASK' | 'SUBMIT_FILE' | 'APPROVE_TOPIC' | 'MENTION';

export type Activity = {
  activityId: number;
  action: ActivityAction;
  content: string;
  actor: User;
  targetName: string;
  project: Project | null;
  createdAt: DateTimeString;
};

export const mockStudentActivities: Activity[] = [
  { 
    activityId: 1, 
    action: 'UPDATE_TASK', 
    content: 'đã đổi trạng thái sang IN PROGRESS', 
    actor: userLeHoangVy, 
    targetName: 'Thiết kế API danh sách đồ án', 
    project: mockProjects[0], 
    createdAt: '2026-06-08T10:30:00' 
  },
  { 
    activityId: 2, 
    action: 'SUBMIT_FILE', 
    content: 'vừa nộp tài liệu SRS', 
    actor: userSinhVienTran, 
    targetName: 'Website quản lý đồ án môn SE330', 
    project: mockProjects[0], 
    createdAt: '2026-06-09T15:45:00' 
  },
  { 
    activityId: 3, 
    action: 'MENTION', 
    content: 'đã nhắc đến bạn trong comment', 
    actor: userLeHoangVy, 
    targetName: 'Hoàn thiện luồng đăng nhập mock', 
    project: mockProjects[0], 
    createdAt: '2026-06-09T09:15:00' 
    },
  {
    activityId: 4, 
    action: 'APPROVE_TOPIC', 
    content: 'đã chốt phạm vi dự án', 
    actor: userLeHoangVy, 
    targetName: 'Website quản lý đồ án môn SE330', 
    project: mockProjects[0], 
    createdAt: '2026-06-10T14:20:00' 
  },
  {
    activityId: 5, 
    action: 'UPDATE_TASK', 
    content: 'cập nhật task giao diện HomePage', 
    actor: userSinhVienTran, 
    targetName: 'Hoàn thiện luồng đăng nhập mock', 
    project: mockProjects[0], 
    createdAt: '2026-06-10T09:00:00'
  },
  { 
    activityId: 6, 
    action: 'SUBMIT_FILE', 
    content: 'nộp báo cáo tiến độ tuần 1', 
    actor: userSinhVienTran, 
    targetName: 'Website quản lý đồ án môn SE330', 
    project: mockProjects[0], 
    createdAt: '2026-06-15T11:00:00' 
  },
  { 
    activityId: 7, 
    action: 'UPDATE_TASK', 
    content: 'hoàn thành API', 
    actor: userLeHoangVy, 
    targetName: 'Thiết kế API danh sách đồ án', 
    project: mockProjects[0], 
    createdAt: '2026-06-15T15:00:00' 
  },
  { 
    activityId: 8, 
    action: 'MENTION', 
    content: 'nhắc bạn review code', 
    actor: userLeHoangVy, 
    targetName: 'Viết test case quản lý task', 
    project: mockProjects[0], 
    createdAt: '2026-06-22T09:00:00'
  },
  { 
    activityId: 9, 
    action: 'UPDATE_TASK', 
    content: 'chuyển task sang REVIEW', 
    actor: userSinhVienTran, 
    targetName: 'Hoàn thiện luồng đăng nhập mock', 
    project: mockProjects[0], 
    createdAt: '2026-06-04T10:00:00'
  },
  { 
    activityId: 10, 
    action: 'UPDATE_TASK', 
    content: 'đã đổi trạng thái sang TODO', 
    actor: userSinhVienTran, 
    targetName: 'Viết test case quản lý task', 
    project: mockProjects[0], 
    createdAt: '2026-06-05T10:00:00'
  },
  { 
    activityId: 11, 
    action: 'UPDATE_TASK', 
    content: 'cập nhật database schema', 
    actor: userLeHoangVy, 
    targetName: 'Thiết kế API', 
    project: mockProjects[0], 
    createdAt: '2026-06-06T14:00:00' 
    },
];

export const getTeacherQuickStats = () => {
  return {
    pendingGrades: 12,    
    totalProjects: 24,    
    pendingRequests: 5,   
    upcomingDeadlines: 3  
  };
};

export const mockTeacherActivities: Activity[] = [
  { 
    activityId: 101, 
    action: 'SUBMIT_FILE', 
    content: 'đã nộp đồ án cuối kỳ', 
    actor: userSinhVienTran, 
    targetName: 'Đồ án SE330', 
    project: mockProjects[0], 
    createdAt: '2026-06-06T10:00:00' 
  },
  { 
    activityId: 102, 
    action: 'SUBMIT_FILE', 
    content: 'đã nộp báo cáo tuần 2', 
    actor: userLeHoangVy, 
    targetName: 'Đồ án SE330', 
    project: mockProjects[0], 
    createdAt: '2026-06-06T14:30:00'
  },
];

export const getStudentQuickStats = (userId: number) => {
  const myTasks = mockTasks.filter(t => t.assignedTo.userId === userId);
  return { completed: myTasks.filter(t => t.status === 'DONE').length, updated: myTasks.filter(t => t.updatedAt !== t.createdAt).length, created: myTasks.filter(t => t.createdBy.userId === userId).length, dueSoon: myTasks.filter(t => t.status !== 'DONE').length, total: myTasks.length };
};

export const getStudentChartStats = (month: number, date: number | null) => {
  const filteredActs = mockStudentActivities.filter(act => {
    const d = new Date(act.createdAt);
    return d.getMonth() + 1 === month && (date ? d.getDate() === date : true);
  });
  return { todo: filteredActs.filter(a => a.action === 'MENTION').length, inProgress: filteredActs.filter(a => a.action === 'UPDATE_TASK').length, readyForTest: filteredActs.filter(a => a.action === 'SUBMIT_FILE' || a.action === 'APPROVE_TOPIC').length, total: filteredActs.length };
};

export const getTeacherChartStats = (month: number, date: number | null) => {
  const filteredActs = mockTeacherActivities.filter(act => {
    const d = new Date(act.createdAt);
    return d.getMonth() + 1 === month && (date ? d.getDate() === date : true);
  });
  return { todo: 0, inProgress: filteredActs.length, readyForTest: 0, total: filteredActs.length };
};

// Mock chi tiết cho từng ô thống kê ở QuickStats (sổ xuống khi click).
// Khớp với type `StatDetailType` + shape `StatDetailItem` của backend.
const mockStatDetails: Record<StatDetailType, StatDetailItem[]> = {
  // ===== Giảng viên =====
  pendingGrades: [
    { id: 1, type: 'SUBMISSION', title: 'Báo cáo cuối kỳ - Nhóm 10', subtitle: 'Đồ án quản lý đồ án SE330', status: 'SUBMITTED', timestamp: '2026-06-12T09:30:00' },
    { id: 2, type: 'SUBMISSION', title: 'SRS - Nhóm 03', subtitle: 'Website thương mại điện tử', status: 'LATE', timestamp: '2026-06-13T23:50:00' },
    { id: 3, type: 'SUBMISSION', title: 'Bản thiết kế DB - Nhóm 07', subtitle: 'Ứng dụng đặt lịch khám', status: 'SUBMITTED', timestamp: '2026-06-14T08:10:00' },
  ],
  totalProjects: [
    { id: 11, type: 'PROJECT', title: 'Website quản lý đồ án môn SE330', subtitle: 'Nhóm 10 · 4 thành viên', status: 'IN_PROGRESS', timestamp: '2026-05-01T08:00:00' },
    { id: 12, type: 'PROJECT', title: 'Website thương mại điện tử', subtitle: 'Nhóm 03 · 5 thành viên', status: 'IN_PROGRESS', timestamp: '2026-05-02T08:00:00' },
    { id: 13, type: 'PROJECT', title: 'Ứng dụng đặt lịch khám', subtitle: 'Nhóm 07 · 3 thành viên', status: 'COMPLETED', timestamp: '2026-04-20T08:00:00' },
  ],
  pendingRequests: [
    { id: 21, type: 'REQUEST', title: 'Yêu cầu duyệt đề tài: Hệ thống chấm công', subtitle: 'Nhóm 12 gửi', status: 'PENDING', timestamp: '2026-06-14T16:00:00' },
    { id: 22, type: 'REQUEST', title: 'Yêu cầu gia hạn nộp báo cáo', subtitle: 'Nhóm 05 gửi', status: 'PENDING', timestamp: '2026-06-15T07:30:00' },
  ],
  upcomingDeadlines: [
    { id: 31, type: 'TASK', title: 'Hạn nộp báo cáo tiến độ tuần 3', subtitle: 'Áp dụng cho tất cả các nhóm', status: 'TODO', timestamp: '2026-06-18T23:59:00' },
    { id: 32, type: 'TASK', title: 'Hạn phản biện đồ án', subtitle: 'Nhóm 03, 07, 10', status: 'TODO', timestamp: '2026-06-20T23:59:00' },
  ],

  // ===== Sinh viên =====
  completed: [
    { id: 41, type: 'TASK', title: 'Thiết kế API danh sách đồ án', subtitle: 'Website quản lý đồ án môn SE330', status: 'DONE', timestamp: '2026-06-08T10:30:00' },
    { id: 42, type: 'TASK', title: 'Hoàn thiện luồng đăng nhập mock', subtitle: 'Website quản lý đồ án môn SE330', status: 'DONE', timestamp: '2026-06-09T09:15:00' },
  ],
  updated: [
    { id: 51, type: 'TASK', title: 'Cập nhật task giao diện HomePage', subtitle: 'Website quản lý đồ án môn SE330', status: 'IN_PROGRESS', timestamp: '2026-06-10T09:00:00' },
    { id: 52, type: 'TASK', title: 'Chuyển task sang REVIEW', subtitle: 'Website quản lý đồ án môn SE330', status: 'IN_PROGRESS', timestamp: '2026-06-04T10:00:00' },
  ],
  created: [
    { id: 61, type: 'TASK', title: 'Viết test case quản lý task', subtitle: 'Website quản lý đồ án môn SE330', status: 'TODO', timestamp: '2026-06-05T10:00:00' },
    { id: 62, type: 'TASK', title: 'Thiết kế database schema', subtitle: 'Website quản lý đồ án môn SE330', status: 'TODO', timestamp: '2026-06-06T14:00:00' },
  ],
  dueSoon: [
    { id: 71, type: 'TASK', title: 'Nộp báo cáo tiến độ tuần 3', subtitle: 'Còn 3 ngày', status: 'TODO', timestamp: '2026-06-18T23:59:00' },
    { id: 72, type: 'TASK', title: 'Hoàn thiện module thống kê', subtitle: 'Còn 5 ngày', status: 'IN_PROGRESS', timestamp: '2026-06-20T23:59:00' },
  ],
};

// Mock thay cho getStatDetail() trong home.service.ts (gọi backend /home/stats/detail).
// Trả về cùng shape ApiResponse để component dùng y hệt như API thật.
export const getStatDetailMock = (
  type: StatDetailType,
): Promise<ApiResponse<StatDetailItem[]>> =>
  Promise.resolve({
    status: 'success',
    message: 'OK (mock)',
    data: mockStatDetails[type] ?? [],
    errorCode: null,
    timestamp: '2026-06-15T12:00:00',
  });

export const getHeatmapData = (month: number, role: string = 'STUDENT') => {
  const counts: Record<number, number> = {};
  const source = role === 'TEACHER' ? mockTeacherActivities : mockStudentActivities;
  source.forEach(act => {
    const d = new Date(act.createdAt);
    if (d.getMonth() + 1 === month) {
      const day = d.getDate();
      counts[day] = (counts[day] || 0) + 1;
    }
  });
  return counts;
};
