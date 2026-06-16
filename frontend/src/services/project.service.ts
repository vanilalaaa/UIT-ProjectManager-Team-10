import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../types/api/project'
import type { ResourceType } from '../components/ui/student/ProjectResourcesCard'

type ProjectResourceDto = { id: number; type: string; label: string; url: string }

const toResource = (x: ProjectResourceDto): ProjectResource => ({
  id: String(x.id),
  type: x.type as ResourceType,
  label: x.label,
  url: x.url,
})
import type { ProjectResource } from '../components/ui/student/ProjectResourcesCard'
import type { HomeFeedItem } from './home.service'

// Hoạt động gần đây của đồ án dùng chung shape FeedItemResponse với home feed.
export type ProjectActivity = HomeFeedItem

const MOCK_DELAY = 300
const resolveMock = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), MOCK_DELAY))

export const listMyProjects = (): Promise<ApiResponse<Project[]>> =>
  axiosClient.get<ApiResponse<Project[]>>('/students/me/projects').then((r) => r.data)

export const listCourseProjects = (
  courseId: number | string,
): Promise<ApiResponse<Project[]>> =>
  axiosClient
    .get<ApiResponse<Project[]>>(`/courses/${courseId}/projects`)
    .then((r) => r.data)

export const getMyProjects = (): Promise<Project[]> =>
  listMyProjects().then((r) => r.data)

export const getCourseProjects = (courseId: number | string): Promise<Project[]> =>
  listCourseProjects(courseId).then((r) => r.data)

export type ProjectWithGroup = Project

export const getCourseProjectsWithGroup = (
  courseId: number | string,
): Promise<ProjectWithGroup[]> => getCourseProjects(courseId)

export const createCourseProject = (
  courseId: number | string,
  payload: ProjectCreateRequest,
): Promise<ApiResponse<Project>> =>
  axiosClient
    .post<ApiResponse<Project>>(`/courses/${courseId}/projects`, payload)
    .then((r) => r.data)

export const getProjectDetail = (
  courseId: number | string,
  projectId: number | string,
): Promise<ApiResponse<Project>> =>
  axiosClient
    .get<ApiResponse<Project>>(`/courses/${courseId}/projects/${projectId}`)
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

export const getProjectById = (projectId: number | string): Promise<Project | null> =>
  axiosClient
    .get<ApiResponse<Project>>(`/projects/${projectId}`)
    .then((r) => r.data.data)
    .catch(() => null)

export const getProjectResources = (projectId: number | string): Promise<ProjectResource[]> =>
  axiosClient
    .get<ApiResponse<ProjectResourceDto[]>>(`/projects/${projectId}/resources`)
    .then((r) => (r.data.data ?? []).map(toResource))

export const createProjectResource = (
  projectId: number | string,
  payload: { type: ResourceType; label: string; url: string },
  file?: File,
): Promise<ProjectResource> => {
  const fd = new FormData()
  fd.append('type', payload.type)
  if (payload.label) fd.append('label', payload.label)
  if (payload.url) fd.append('url', payload.url)
  if (file) fd.append('file', file)
  return axiosClient
    .post<ApiResponse<ProjectResourceDto>>(`/projects/${projectId}/resources`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => toResource(r.data.data))
}

export const deleteProjectResource = (
  projectId: number | string,
  resourceId: number | string,
): Promise<void> =>
  axiosClient.delete(`/projects/${projectId}/resources/${resourceId}`).then(() => undefined)

export const getProjectActivities = (
  courseId: number | string,
  projectId: number | string,
  limit = 10,
): Promise<ProjectActivity[]> =>
  axiosClient
    .get<ApiResponse<ProjectActivity[]>>(
      `/courses/${courseId}/projects/${projectId}/activities`,
      { params: { limit } },
    )
    .then((r) => r.data.data ?? [])
