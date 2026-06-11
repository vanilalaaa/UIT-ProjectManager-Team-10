import axiosClient from '../lib/api/axiosClient'
import type { CourseCardData } from '../components/ui/student/CourseCard'
import type { ApiResponse } from '../types/api/common'
import type {
  AdminCourseCreateRequest,
  AdminCourseListItem,
  AdminCourseUpdateRequest,
  CourseCardResponse,
  CourseResponse,
  JoinCourseRequest,
} from '../types/api/course'

const BASE = '/courses'

const toCourseCard = (c: CourseCardResponse): CourseCardData => ({
  id: c.courseId,
  code: c.code,
  name: c.name,
  lecturer: c.lecturerName,
  semester: '',
  projectsCount: c.projectsCount,
  membersCount: c.membersCount,
  memberAvatars: [],
  extraMembers: 0,
  maxStudents: c.maxStudents,
  startDate: c.startDate,
  endDate: c.endDate,
})

export const listStudentCourseCards = (): Promise<CourseCardData[]> =>
  axiosClient
    .get<ApiResponse<CourseCardResponse[]>>('/students/me/courses')
    .then((r) => r.data.data.map(toCourseCard))

export const listTeacherCourseCards = (): Promise<CourseCardData[]> =>
  axiosClient
    .get<ApiResponse<CourseCardResponse[]>>(`${BASE}/teaching`)
    .then((r) => r.data.data.map(toCourseCard))
export const listCourses = (): Promise<ApiResponse<AdminCourseListItem[]>> =>
  axiosClient.get<ApiResponse<AdminCourseListItem[]>>(BASE).then((r) => r.data)

export const getCourseById = (id: number | string): Promise<ApiResponse<CourseResponse>> =>
  axiosClient.get<ApiResponse<CourseResponse>>(`${BASE}/${id}`).then((r) => r.data)

export const createCourse = (
  payload: AdminCourseCreateRequest,
): Promise<ApiResponse<CourseResponse>> =>
  axiosClient.post<ApiResponse<CourseResponse>>(BASE, payload).then((r) => r.data)

export const updateCourse = (
  id: number | string,
  payload: AdminCourseUpdateRequest,
): Promise<ApiResponse<CourseResponse>> =>
  axiosClient.put<ApiResponse<CourseResponse>>(`${BASE}/${id}`, payload).then((r) => r.data)

export const deleteCourse = (id: number | string): Promise<ApiResponse<void>> =>
  axiosClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data)

export const requestJoinCourse = (payload: JoinCourseRequest): Promise<ApiResponse<void>> =>
  axiosClient.post<ApiResponse<void>>(`${BASE}/join-requests`, payload).then((r) => r.data)

export const approveCourseJoinRequest = (
  courseId: number | string,
  studentId: number | string,
): Promise<ApiResponse<void>> =>
  axiosClient
    .patch<ApiResponse<void>>(`${BASE}/${courseId}/join-requests/${studentId}`)
    .then((r) => r.data)
