import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../types/api/project'
import { mockProjects, mockProjectRequests } from '../mocks/projects.mock'
import type { ProjectApprovalRequest } from '../mocks/projects.mock'
import {
  groupPhoenix,
  groupAster,
  groupNimbus,
  groupOrion,
  mockCourseRequirements,
} from '../mocks/tasks.mock'
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

// Mock fallback (PROJECT_RULES §3): các màn list/detail cần Project dạng giàu
// (course.name, registrations, submissions, member profile). BE hiện trả
// ProjectResponse phẳng (id-only) nên chưa đủ dữ liệu render card/detail.
// TODO(BE): enrich ProjectResponse rồi thay các hàm dưới bằng listMyProjects/
// listCourseProjects/getProjectDetail (đã có sẵn ở trên).
const MOCK_DELAY = 300
const resolveMock = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), MOCK_DELAY))

// Đề tài đã được GV duyệt + request đã xử lý — lưu client (localStorage) cho tới
// khi BE có pipeline đăng ký/duyệt project thật. TODO(BE).
const APPROVED_KEY = (courseId: number | string) => `app.approvedProjects.${courseId}`
const HANDLED_KEY = (courseId: number | string) => `app.handledRequests.${courseId}`

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const readApprovedProjects = (courseId: number | string): Project[] =>
  readJson<Project[]>(APPROVED_KEY(courseId), [])

export const addApprovedProject = (courseId: number | string, project: Project): void => {
  localStorage.setItem(
    APPROVED_KEY(courseId),
    JSON.stringify([project, ...readApprovedProjects(courseId)]),
  )
}

export const markRequestHandled = (courseId: number | string, requestId: number): void => {
  const handled = readJson<number[]>(HANDLED_KEY(courseId), [])
  if (!handled.includes(requestId)) {
    localStorage.setItem(HANDLED_KEY(courseId), JSON.stringify([...handled, requestId]))
  }
}

export const getMyProjects = (): Promise<Project[]> => resolveMock(mockProjects)

export const getCourseProjects = (courseId: number | string): Promise<Project[]> => {
  const base = mockProjects.filter((p) => p.course?.courseId === Number(courseId))
  return resolveMock([...readApprovedProjects(courseId), ...base])
}

export const getProjectById = (projectId: number | string): Promise<Project | null> =>
  resolveMock(mockProjects.find((p) => p.projectId === Number(projectId)) ?? null)

export const getProjectActivities = (_projectId: number | string): Promise<ProjectActivity[]> => {
  void _projectId
  return resolveMock(MOCK_ACTIVITIES)
}

export const getCourseApprovalRequests = (
  courseId: number | string,
): Promise<ProjectApprovalRequest[]> => {
  const handled = readJson<number[]>(HANDLED_KEY(courseId), [])
  return resolveMock(mockProjectRequests.filter((r) => !handled.includes(r.requestId)))
}

export const getCourseRequirements = (
  courseId: number | string,
): Promise<CourseRequirement | null> =>
  resolveMock(mockCourseRequirements[Number(courseId)] ?? null)

export const getProjectResources = (_projectId: number | string): Promise<ProjectResource[]> => {
  void _projectId
  return resolveMock(MOCK_RESOURCES)
}

export type ProjectWithGroup = Project & { groupName?: string }

export const getCourseProjectsWithGroup = (
  courseId: number | string,
): Promise<ProjectWithGroup[]> => {
  const allGroups = [groupPhoenix, groupAster, groupNimbus, groupOrion]
  const withGroup = (p: Project): ProjectWithGroup => {
    const reg = p.registrations?.[0]
    const group = reg ? allGroups.find((g) => g.groupId === reg.groupId) : null
    return { ...p, groupName: group?.name }
  }
  const base = mockProjects.filter((p) => p.course?.courseId === Number(courseId)).map(withGroup)
  const approved = readApprovedProjects(courseId).map(withGroup)
  return resolveMock([...approved, ...base])
}

export const listCourseProjects = (
  courseId: number | string,
): Promise<ApiResponse<Project[]>> =>
  axiosClient
    .get<ApiResponse<Project[]>>(`/courses/${courseId}/projects`)
    .then((r) => r.data)

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

export const listMyProjects = (): Promise<ApiResponse<Project[]>> =>
  axiosClient.get<ApiResponse<Project[]>>('/students/me/projects').then((r) => r.data)
