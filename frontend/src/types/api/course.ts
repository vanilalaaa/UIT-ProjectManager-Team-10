import type { Course } from '../../mocks/types'

export type { Course }

export type CourseResponse = {
  courseId: number
  code: string
  name: string
  lecturer: number | null
  lecturerName: string | null
  maxStudents: number
  startDate: string
  endDate: string
}

export type AdminCourseListItem = CourseResponse

export type CourseCardResponse = {
  courseId: number
  code: string
  name: string
  lecturerName: string
  membersCount: number
  projectsCount: number
  maxStudents: number
  startDate: string
  endDate: string
}

export type AdminCourseQuery = {
  page?: number
  size?: number
  search?: string
}

export type AdminCourseCreateRequest = {
  name: string
  // Optional: admin chọn giảng viên; teacher tự tạo lớp -> BE gán chính họ.
  lecturerId?: number
  maxStudents: number
  startDate: string
  endDate: string
}

export type AdminCourseUpdateRequest = AdminCourseCreateRequest

export type JoinCourseRequest = {
  code: string
}

export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
