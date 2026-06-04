import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse, Page, PageQuery } from '../types/api/common'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../types/api/project'

function cleanParams(query: PageQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '' || value === null) continue
    params[key] = value as string | number | boolean
  }
  return params
}

export const listCourseProjects = (
  courseId: number | string,
  query: PageQuery = {},
): Promise<ApiResponse<Page<Project>>> =>
  axiosClient
    .get<ApiResponse<Page<Project>>>(`/courses/${courseId}/projects`, {
      params: cleanParams(query),
    })
    .then((r) => r.data)

export const createCourseProject = (
  courseId: number | string,
  payload: ProjectCreateRequest,
): Promise<ApiResponse<Project>> =>
  axiosClient
    .post<ApiResponse<Project>>(`/courses/${courseId}/projects`, payload)
    .then((r) => r.data)

export const updateCourseProject = (
  courseId: number | string,
  projectId: number | string,
  payload: ProjectUpdateRequest,
): Promise<ApiResponse<Project>> =>
  axiosClient
    .put<ApiResponse<Project>>(`/courses/${courseId}/projects/${projectId}`, payload)
    .then((r) => r.data)

export const deleteCourseProject = (
  courseId: number | string,
  projectId: number | string,
): Promise<ApiResponse<void>> =>
  axiosClient
    .delete<ApiResponse<void>>(`/courses/${courseId}/projects/${projectId}`)
    .then((r) => r.data)

export const getProjectById = (
  projectId: number | string,
): Promise<ApiResponse<Project>> =>
  axiosClient.get<ApiResponse<Project>>(`/projects/${projectId}`).then((r) => r.data)

export const listMyProjects = (): Promise<ApiResponse<Project[]>> =>
  axiosClient.get<ApiResponse<Project[]>>('/students/me/projects').then((r) => r.data)
