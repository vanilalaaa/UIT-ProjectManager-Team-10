import { mockProjects } from '../mocks/projects.mock'
import type { ApiResponse, Project } from '../mocks/types'

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

export const getProjects = (): Promise<ApiResponse<Project[]>> => {
  return resolveMock(mockProjects)
}

export const getProjectById = (projectId: number | string): Promise<ApiResponse<Project | null>> => {
  const project = mockProjects.find((item) => item.projectId === Number(projectId)) ?? null

  return resolveMock(project)
}

// Real API version (uncomment when the Spring Boot backend is ready):
// import axios from 'axios'
//
// export const getProjects = (): Promise<ApiResponse<Project[]>> => {
//   return axios.get('/api/projects').then((response) => response.data)
// }
//
// export const getProjectById = (projectId: number | string): Promise<ApiResponse<Project>> => {
//   return axios.get(`/api/projects/${projectId}`).then((response) => response.data)
// }
