// Project phẳng theo BE ProjectResponse: course/category/lecturer là tên,
// nhóm nhận đề tài thành groupId/groupName + members, kèm submissions.
export type ProjectMember = {
  id: number
  name: string
  avatar: string | null
}

export type ProjectSubmissionLite = {
  submissionId: number
  status: string
  submittedAt: string | null
  filePath: string | null
  groupId: number | null
  groupName: string | null
  submittedById: number | null
  submittedByName: string | null
  submittedByUid: string | null
  submittedByEmail: string | null
}

export type Project = {
  projectId: number
  title: string
  description: string
  status: string
  startDate: string | null
  endDate: string | null
  courseId: number | null
  courseName: string | null
  lecturerName: string | null
  categoryId: number | null
  categoryName: string | null
  groupId: number | null
  groupName: string | null
  members: ProjectMember[]
  submissions: ProjectSubmissionLite[]
  memberCount: number
  submissionCount: number
  submissionLocked?: boolean
}

export type ProjectCreateRequest = {
  title: string
  description: string
  categoryId: number
  startDate: string
  endDate: string
}

export type ProjectUpdateRequest = Partial<ProjectCreateRequest> & {
  status?: string
}
