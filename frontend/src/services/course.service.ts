import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse, Page } from '../types/api/common'
import type {
  AdminCourseCreateRequest,
  AdminCourseListItem,
  AdminCourseQuery,
  AdminCourseUpdateRequest,
  Course,
  JoinCourseRequest,
  JoinRequestPatch,
} from '../types/api/course'

const BASE = '/courses'

function cleanParams(query: AdminCourseQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '' || value === null) continue
    params[key] = value as string | number | boolean
  }
  return params
}

export const listCourses = (
  query: AdminCourseQuery = {},
): Promise<ApiResponse<Page<AdminCourseListItem>>> =>
  axiosClient
    .get<ApiResponse<Page<AdminCourseListItem>>>(BASE, { params: cleanParams(query) })
    .then((r) => r.data)

export const getCourseById = (id: number | string): Promise<ApiResponse<Course>> =>
  axiosClient.get<ApiResponse<Course>>(`${BASE}/${id}`).then((r) => r.data)

export const createCourse = (
  payload: AdminCourseCreateRequest,
): Promise<ApiResponse<AdminCourseListItem>> =>
  axiosClient.post<ApiResponse<AdminCourseListItem>>(BASE, payload).then((r) => r.data)

export const updateCourse = (
  id: number | string,
  payload: AdminCourseUpdateRequest,
): Promise<ApiResponse<AdminCourseListItem>> =>
  axiosClient.put<ApiResponse<AdminCourseListItem>>(`${BASE}/${id}`, payload).then((r) => r.data)

export const deleteCourse = (id: number | string): Promise<ApiResponse<void>> =>
  axiosClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data)

export const joinCourse = (payload: JoinCourseRequest): Promise<ApiResponse<void>> =>
  axiosClient.post<ApiResponse<void>>(`${BASE}/join`, payload).then((r) => r.data)

export const patchCourseJoinRequest = (
  courseId: number | string,
  studentId: number | string,
  payload: JoinRequestPatch,
): Promise<ApiResponse<void>> =>
  axiosClient
    .patch<ApiResponse<void>>(`/course/${courseId}/join-requests/${studentId}`, payload)
    .then((r) => r.data)
