import { mockProjects } from '../mocks/projects.mock'

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

export const getProjects = () => {
  return resolveMock(mockProjects)
}

export const getProjectById = (projectId) => {
  const project = mockProjects.find((item) => item.projectId === Number(projectId)) ?? null

  return resolveMock(project)
}

// Real API version (uncomment when the Spring Boot backend is ready):
// import axios from 'axios'
//
// export const getProjects = () => {
//   return axios.get('/api/projects').then((response) => response.data)
// }
//
// export const getProjectById = (projectId) => {
//   return axios.get(`/api/projects/${projectId}`).then((response) => response.data)
// }
