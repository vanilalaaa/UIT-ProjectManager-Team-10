import type { TaskPriority } from '../models'

export type { TaskPriority }

export type UserLite = {
  id: number
  name: string
  avatar: string | null
}

// Task phẳng theo BE TaskResponse. priority là field UI-only (BE chưa lưu).
export type Task = {
  taskId: number
  title: string
  description: string
  status: string
  assignee: UserLite | null
  createdBy: UserLite | null
  groupId: number | null
  deadline: string | null
  createdAt: string
  updatedAt: string | null
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
  priority: TaskPriority
}

export type TaskCreateRequest = {
  title: string
  description: string
  assignedToId: number
  groupId: number
  deadline: string
}

export type TaskUpdateRequest = Partial<TaskCreateRequest> & {
  status?: string
}

export type TaskStatusPatch = { status: string }
