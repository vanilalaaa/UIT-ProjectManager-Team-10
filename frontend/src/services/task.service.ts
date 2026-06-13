import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Task,
  TaskCreateRequest,
  TaskStatusPatch,
  TaskUpdateRequest,
} from '../types/api/task'

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
