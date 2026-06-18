import type { TaskPriority } from '../models'

export type { TaskPriority }

export type UserLite = {
  id: number
  name: string
  avatar: string | null
}

// Tài nguyên đính kèm task: tệp tải lên (FILE) hoặc liên kết ngoài (LINK/DRIVE/GITHUB).
export type TaskResource = {
  id: number
  type: string
  label: string
  url: string
  createdAt: string | null
}

// Task phẳng theo BE TaskResponse. priority là field UI-only (BE chưa lưu).
// validator = người kiểm tra, comment = nhận xét của người kiểm tra/leader.
export type Task = {
  taskId: number
  title: string
  description: string
  status: string
  assignee: UserLite | null
  validator: UserLite | null
  createdBy: UserLite | null
  groupId: number | null
  deadline: string | null
  createdAt: string
  updatedAt: string | null
  resources?: TaskResource[]
  comment?: string | null
  priority?: TaskPriority
}

export type BoardGroup = {
  groupId: number
  name: string
  leaderId: number | null
  members: UserLite[]
}

export type ProjectBoard = {
  tasks: Task[]
  currentUser: UserLite | null
  group: BoardGroup | null
}

// Form tạo task ở FE; deadline đã ở dạng ISO LocalDateTime cho BE.
export type NewTaskInput = {
  title: string
  description: string
  deadline: string
  assignedToId: number
  validatorId?: number | null
  priority: TaskPriority
}

export type TaskCreateRequest = {
  title: string
  description: string
  assignedToId: number
  validatorId?: number | null
  groupId: number
  deadline: string
}

export type TaskUpdateRequest = Partial<TaskCreateRequest> & {
  status?: string
  comment?: string
}

export type TaskStatusPatch = { status: string }
