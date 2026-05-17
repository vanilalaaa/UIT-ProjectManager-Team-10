import { mockLoginResponse, mockMeResponse } from '../mocks/auth.mock'

const MOCK_NETWORK_LATENCY = 800

const resolveMock = (response) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(response)))
    }, MOCK_NETWORK_LATENCY)
  })

export const login = (credentials) => {
  return resolveMock(mockLoginResponse)
}

export const getCurrentUser = () => {
  return resolveMock(mockMeResponse)
}

// Real API version (uncomment when the Spring Boot backend is ready):
// import axios from 'axios'
//
// export const login = (credentials) => {
//   return axios.post('/api/auth/login', credentials).then((response) => response.data)
// }
//
// export const getCurrentUser = () => {
//   return axios.get('/api/auth/me').then((response) => response.data)
// }
