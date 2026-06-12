import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../types/api/project'
import { mockCourseRequirements } from '../mocks/tasks.mock'
import type { CourseRequirement } from '../mocks/tasks.mock'
import type { ProjectResource } from '../components/ui/student/ProjectResourcesCard'

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

// ----- Mock — activity/resources chưa có BE, giữ tới slice sau -----

export const getProjectActivities = (_projectId: number | string): Promise<ProjectActivity[]> => {
  void _projectId
  return resolveMock(MOCK_ACTIVITIES)
}

export const getCourseRequirements = (
  courseId: number | string,
): Promise<CourseRequirement | null> =>
  resolveMock(mockCourseRequirements[Number(courseId)] ?? null)

export const getProjectResources = (_projectId: number | string): Promise<ProjectResource[]> => {
  void _projectId
  return resolveMock(MOCK_RESOURCES)
}
