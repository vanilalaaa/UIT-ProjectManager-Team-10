import type { Submission } from '../models'

export type { Submission }

export type SubmissionCreateRequest = {
  groupId: number
  filePath: string
  note?: string
}

export type SubmissionUpdateRequest = Partial<SubmissionCreateRequest>

// Báo cáo công việc của giảng viên (hiển thị dưới danh sách bài nộp).
export type MemberTaskReport = {
  userId: number
  name: string | null
  avatar: string | null
  uid: string | null
  email: string | null
  leader: boolean
  assignedTasks: number
  completedTasks: number
  completionRate: number
  avgCompletionDays: number | null
}

export type GroupTaskReport = {
  groupId: number
  groupName: string | null
  totalTasks: number
  completedTasks: number
  completionRate: number
  memberCount: number
  members: MemberTaskReport[]
}
