import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Task,
  TaskCreateRequest,
  TaskStatusPatch,
  TaskUpdateRequest,
} from '../types/api/task'
import type { Group, User } from '../mocks/types'
import { mockProjects } from '../mocks/projects.mock'
import { mockTasks, mockMyGroupMap, mockCourseMembersMap } from '../mocks/tasks.mock'

// Mock fallback (PROJECT_RULES §3): Kanban cần Task giàu + group + currentUser.
// TODO(BE): thay bằng listProjectTasks khi BE bọc ApiResponse và trả assignee/group đầy đủ.
export type ProjectBoard = { tasks: Task[]; currentUser: User | null; currentGroup: Group | null }

export const getProjectBoard = (projectId: number | string): Promise<ProjectBoard> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const project = mockProjects.find((p) => p.projectId === Number(projectId))
      const courseId = project?.course?.courseId || 1
      const group = mockMyGroupMap[courseId] || null
      const members = mockCourseMembersMap[courseId] || []
      const currentUser = members.length > 0 ? members[0] : null
      const groupTasks = group ? mockTasks.filter((t) => t.group.groupId === group.groupId) : []
      resolve(structuredClone({ tasks: groupTasks, currentUser, currentGroup: group }))
    }, 300),
  )

export const listProjectTasks = (
  projectId: number | string,
  params: { assignee?: number; status?: string } = {},
): Promise<ApiResponse<Task[]>> =>
  axiosClient
    .get<ApiResponse<Task[]>>(`/api/projects/${projectId}/tasks`, { params })
    .then((r) => r.data)

export const createTask = (
  projectId: number | string,
  payload: TaskCreateRequest,
): Promise<ApiResponse<Task>> =>
  axiosClient
    .post<ApiResponse<Task>>(`/api/projects/${projectId}/tasks`, payload)
    .then((r) => r.data)

export const updateTask = (
  taskId: number | string,
  payload: TaskUpdateRequest,
): Promise<ApiResponse<Task>> =>
  axiosClient.put<ApiResponse<Task>>(`/api/tasks/${taskId}`, payload).then((r) => r.data)

export const updateTaskStatus = (
  taskId: number | string,
  payload: TaskStatusPatch,
): Promise<ApiResponse<Task>> =>
  axiosClient.patch<ApiResponse<Task>>(`/api/tasks/${taskId}/status`, payload).then((r) => r.data)

export const deleteTask = (taskId: number | string): Promise<ApiResponse<void>> =>
  axiosClient.delete<ApiResponse<void>>(`/api/tasks/${taskId}`).then((r) => r.data)
