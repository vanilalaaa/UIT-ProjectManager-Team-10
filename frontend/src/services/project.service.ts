import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../types/api/project'
import { mockProjects } from '../mocks/projects.mock'
import { groupPhoenix, groupAster, groupNimbus, groupOrion } from '../mocks/tasks.mock'

// Mock fallback (PROJECT_RULES §3): các màn list/detail cần Project dạng giàu
// (course.name, registrations, submissions, member profile). BE hiện trả
// ProjectResponse phẳng (id-only) nên chưa đủ dữ liệu render card/detail.
// TODO(BE): enrich ProjectResponse rồi thay các hàm dưới bằng listMyProjects/
// listCourseProjects/getProjectDetail (đã có sẵn ở trên).
const MOCK_DELAY = 300
const resolveMock = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), MOCK_DELAY))

export const getMyProjects = (): Promise<Project[]> => resolveMock(mockProjects)

export const getCourseProjects = (courseId: number | string): Promise<Project[]> =>
  resolveMock(mockProjects.filter((p) => p.course?.courseId === Number(courseId)))

export const getProjectById = (projectId: number | string): Promise<Project | null> =>
  resolveMock(mockProjects.find((p) => p.projectId === Number(projectId)) ?? null)

export type ProjectWithGroup = Project & { groupName?: string }

export const getCourseProjectsWithGroup = (
  courseId: number | string,
): Promise<ProjectWithGroup[]> => {
  const allGroups = [groupPhoenix, groupAster, groupNimbus, groupOrion]
  const enriched = mockProjects
    .filter((p) => p.course?.courseId === Number(courseId))
    .map((p) => {
      const reg = p.registrations?.[0]
      const group = reg ? allGroups.find((g) => g.groupId === reg.groupId) : null
      return { ...p, groupName: group?.name }
    })
  return resolveMock(enriched)
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
