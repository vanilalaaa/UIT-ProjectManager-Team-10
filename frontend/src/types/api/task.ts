import type { Task } from '../../mocks/types'

export type { Task }

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
