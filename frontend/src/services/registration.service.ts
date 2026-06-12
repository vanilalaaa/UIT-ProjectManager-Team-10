import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type { PendingRegistration } from '../types/api/registration'

// Nhóm đề xuất đề tài (tên + mô tả) → GV duyệt sẽ tạo đồ án.
export const proposeProject = (
  courseId: number | string,
  groupId: number | string,
  payload: { title: string; description: string },
): Promise<ApiResponse<PendingRegistration>> =>
  axiosClient
    .post<ApiResponse<PendingRegistration>>(
      `/courses/${courseId}/groups/${groupId}/project-requests`,
      payload,
    )
    .then((r) => r.data)

export const getPendingRegistrations = (
  courseId: number | string,
): Promise<PendingRegistration[]> =>
  axiosClient
    .get<ApiResponse<PendingRegistration[]>>(`/courses/${courseId}/registrations`)
    .then((r) => r.data.data)

export const approveRegistration = (
  registrationId: number | string,
  note?: string,
): Promise<ApiResponse<PendingRegistration>> =>
  axiosClient
    .patch<ApiResponse<PendingRegistration>>(`/registrations/${registrationId}/approve`, { note })
    .then((r) => r.data)

export const rejectRegistration = (
  registrationId: number | string,
  note?: string,
): Promise<ApiResponse<PendingRegistration>> =>
  axiosClient
    .patch<ApiResponse<PendingRegistration>>(`/registrations/${registrationId}/reject`, { note })
    .then((r) => r.data)
