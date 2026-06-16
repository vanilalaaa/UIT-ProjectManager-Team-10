// Key của từng ô thống kê ở QuickStats (khớp với `type` của backend /home/stats/detail)
export type StatDetailType =
  // Giảng viên
  | 'pendingGrades'
  | 'totalProjects'
  | 'pendingRequests'
  | 'upcomingDeadlines'
  // Sinh viên
  | 'completed'
  | 'updated'
  | 'created'
  | 'dueSoon'

export type StatDetailKind = 'TASK' | 'PROJECT' | 'SUBMISSION' | 'REQUEST'

export type StatDetailItem = {
  id: number
  type: StatDetailKind
  title: string
  subtitle: string | null
  status: string | null
  timestamp: string | null
}
