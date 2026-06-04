import type { Course, User } from '../../mocks/types'

export type { Course }

export type AdminCourseListItem = {
  courseId: number
  name: string
  lecturer: User | null
  lecturerId?: number | null
  maxStudents: number
  startDate: string
  endDate: string
}

export type AdminCourseQuery = {
  page?: number
  size?: number
  search?: string
  lecturerId?: number | ''
}

export type AdminCourseCreateRequest = {
  name: string
  lecturerId: number
  maxStudents: number
  startDate: string
  endDate: string
}

export type AdminCourseUpdateRequest = Partial<AdminCourseCreateRequest>

export type JoinCourseRequest = {
  courseId: number
  note?: string
}

export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type JoinRequestPatch = {
  status: 'APPROVED' | 'REJECTED'
  note?: string
}
