import { mockTasks } from '../mocks/tasks.mock'

const MOCK_NETWORK_LATENCY = 800
const MOCK_API_TIMESTAMP = '2026-05-17T10:00:00'

const createApiResponse = (data) => ({
  status: 'success',
  message: 'Call API success.',
  data,
  errorCode: null,
  timestamp: MOCK_API_TIMESTAMP,
})

const resolveMock = (data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(createApiResponse(JSON.parse(JSON.stringify(data))))
    }, MOCK_NETWORK_LATENCY)
  })

export const getTasks = () => {
  return resolveMock(mockTasks)
}

export const getTaskById = (taskId) => {
  const task = mockTasks.find((item) => item.taskId === Number(taskId)) ?? null

  return resolveMock(task)
}

export const getTasksByGroupId = (groupId) => {
  const tasks = mockTasks.filter((item) => item.group.groupId === Number(groupId))

  return resolveMock(tasks)
}

// Real API version (uncomment when the Spring Boot backend is ready):
// import axios from 'axios'
//
// export const getTasks = () => {
//   return axios.get('/api/tasks').then((response) => response.data)
// }
//
// export const getTaskById = (taskId) => {
//   return axios.get(`/api/tasks/${taskId}`).then((response) => response.data)
// }
//
// export const getTasksByGroupId = (groupId) => {
//   return axios.get(`/api/groups/${groupId}/tasks`).then((response) => response.data)
// }
