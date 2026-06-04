import { mockTasks, mockTeamRequests } from '../mocks/tasks.mock'
import type { ApiResponse, Task, User } from '../mocks/types'

const MOCK_NETWORK_LATENCY = 800
const MOCK_API_TIMESTAMP = '2026-05-17T10:00:00'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const createApiResponse = <T>(data: T): ApiResponse<T> => ({
  status: 'success',
  message: 'Call API success.',
  data,
  errorCode: null,
  timestamp: MOCK_API_TIMESTAMP,
})

const resolveMock = <T>(data: T): Promise<ApiResponse<T>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(createApiResponse(clone(data)))
    }, MOCK_NETWORK_LATENCY)
  })

export const getTasks = (): Promise<ApiResponse<Task[]>> => {
  return resolveMock(mockTasks)
}

export const getTaskById = (taskId: number | string): Promise<ApiResponse<Task | null>> => {
  const task = mockTasks.find((item) => item.taskId === Number(taskId)) ?? null

  return resolveMock(task)
}

export const getTasksByGroupId = (groupId: number | string): Promise<ApiResponse<Task[]>> => {
  const tasks = mockTasks.filter((item) => item.group.groupId === Number(groupId))

  return resolveMock(tasks)
}

export const getTeamRequests = (): Promise<ApiResponse<User[]>> => {
  return resolveMock(mockTeamRequests)
}

// Real API version (uncomment when the Spring Boot backend is ready):
// import axios from 'axios'
//
// export const getTasks = (): Promise<ApiResponse<Task[]>> => {
//   return axios.get('/api/tasks').then((response) => response.data)
// }
//
// export const getTaskById = (taskId: number | string): Promise<ApiResponse<Task>> => {
//   return axios.get(`/api/tasks/${taskId}`).then((response) => response.data)
// }
//
// export const getTasksByGroupId = (groupId: number | string): Promise<ApiResponse<Task[]>> => {
//   return axios.get(`/api/groups/${groupId}/tasks`).then((response) => response.data)
// }
