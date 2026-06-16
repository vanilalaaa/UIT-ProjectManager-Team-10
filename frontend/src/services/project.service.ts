import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../types/api/project'
import type { ProjectResource, ResourceType } from '../components/ui/student/ProjectResourcesCard'

type ProjectResourceDto = { id: number; type: string; label: string; url: string }

const toResource = (x: ProjectResourceDto): ProjectResource => ({
  id: String(x.id),
  type: x.type as ResourceType,
  label: x.label,
  url: x.url,
})

export type ProjectActivity = {
  id: number
  user: { name: string; avatarUrl: string | null }
  action: string
  target: string
  time: string
}

const MOCK_ACTIVITIES: ProjectActivity[] = [
  { id: 1, user: { name: 'Sinh viên Trần', avatarUrl: null }, action: 'đã nộp tệp đính kèm', target: 'srs-v1.pdf', time: '2 giờ trước' },
  { id: 2, user: { name: 'Nguyễn Minh An', avatarUrl: null }, action: 'đã chuyển trạng thái đồ án task', target: 'IN_PROGRESS', time: '1 ngày trước' },
  { id: 3, user: { name: 'Lê Hoàng Vy', avatarUrl: null }, action: 'đã chuyển trạng thái Task', target: 'Website quản lý đồ án môn SE330', time: '3 ngày trước' },
  { id: 4, user: { name: 'Sinh viên Trần', avatarUrl: null }, action: 'đã tạo task cho Lê Hoàng Vy', target: 'Thiết kế API danh sách đồ án', time: '2 giờ trước' },
]

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

// ----- Mock — activity chưa có BE, giữ tới slice sau -----

export const getProjectActivities = (_projectId: number | string): Promise<ProjectActivity[]> => {
  void _projectId
  return resolveMock(MOCK_ACTIVITIES)
}
