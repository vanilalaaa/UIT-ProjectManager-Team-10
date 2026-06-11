// Mock fallback (PROJECT_RULES §3): BE có /home/feed + /home/stats nhưng shape
// chưa đủ cho dashboard (quick stats theo role, chart theo status, heatmap,
// activity feed lọc theo tháng/ngày). Service là seam — khi BE enrich, chỉ sửa
// file này, không sửa component.
// TODO(BE): /home/stats trả quick-stats + chart theo role; /home/feed trả
// activities có createdAt + action để lọc.
export {
  getStudentQuickStats,
  getTeacherQuickStats,
  getStudentChartStats,
  getTeacherChartStats,
  getHeatmapData,
  mockStudentActivities,
  mockTeacherActivities,
} from '../mocks/home.mock'

export type { Activity, ActivityAction } from '../mocks/home.mock'
