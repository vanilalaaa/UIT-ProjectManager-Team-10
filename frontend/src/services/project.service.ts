import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../types/api/project'
import type { ProjectResource } from '../components/ui/student/ProjectResourcesCard'
import type { HomeFeedItem } from './home.service'

// Hoạt động gần đây của đồ án dùng chung shape FeedItemResponse với home feed.
export type ProjectActivity = HomeFeedItem

const MOCK_RESOURCES: ProjectResource[] = [
  { id: 'r1', type: 'GITHUB', label: 'repo nhóm', url: 'https://github.com/example/se330-project' },
  { id: 'r2', type: 'DRIVE', label: 'Tài liệu chung', url: 'https://drive.google.com/drive/folders/example' },
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

// ----- Mock — resources chưa có BE, giữ tới slice sau -----

export const getProjectResources = (_projectId: number | string): Promise<ProjectResource[]> => {
  void _projectId
  return resolveMock(MOCK_RESOURCES)
}
