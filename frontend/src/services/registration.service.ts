import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type { PendingRegistration } from '../types/api/registration'

export const registerForProject = (
  courseId: number | string,
  projectId: number | string,
): Promise<ApiResponse<PendingRegistration>> =>
  axiosClient
    .post<ApiResponse<PendingRegistration>>(`/courses/${courseId}/projects/${projectId}/registrations`)
    .then((r) => r.data)

export const getPendingRegistrations = (
  courseId: number | string,
): Promise<PendingRegistration[]> =>
  axiosClient
    .get<ApiResponse<PendingRegistration[]>>(`/courses/${courseId}/registrations`)
    .then((r) => r.data.data)

export const approveRegistration = (
  registrationId: number | string,
): Promise<ApiResponse<PendingRegistration>> =>
  axiosClient
    .patch<ApiResponse<PendingRegistration>>(`/registrations/${registrationId}/approve`)
    .then((r) => r.data)

export const rejectRegistration = (
  registrationId: number | string,
): Promise<ApiResponse<PendingRegistration>> =>
  axiosClient
    .patch<ApiResponse<PendingRegistration>>(`/registrations/${registrationId}/reject`)
    .then((r) => r.data)
