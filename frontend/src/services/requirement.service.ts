// Yêu cầu đồ án của 1 lớp: loại đồ án (category do admin quản lý) + mô tả +
// hạn nộp + barem tiêu chí chấm điểm. Nguồn sự thật: BE GET/PUT
// /courses/{id}/requirement (thay cho localStorage cũ).
import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'

export type RubricCriterion = {
  id: string
  name: string
  maxScore: number
  files?: RequirementFile[]
}

export type SubmissionRequirement = {
  id: string
  content: string
  files?: RequirementFile[]
}

export type ProjectRequirement = {
  categoryId: number | null
  categoryName: string
  description: string
  deadline: string
  criteria: RubricCriterion[]
  submissionRequirements: SubmissionRequirement[]
}

export const EMPTY_REQUIREMENT: ProjectRequirement = {
  categoryId: null,
  categoryName: '',
  description: '',
  deadline: '',
  criteria: [],
  submissionRequirements: [],
}

// Shape BE trả về (criterion.id là số sau khi persist).
type RubricCriterionResponse = { id: number; name: string; maxScore: number; files?: RequirementFileResponse[] | null }
type RequirementResponse = {
  categoryId: number | null
  categoryName: string
  description: string
  deadline: string
  criteria: RubricCriterionResponse[]
  submissionRequirements?: SubmissionRequirementResponse[] | null
}
type SubmissionRequirementResponse = {
  id: number
  content: string
  files?: RequirementFileResponse[] | null
}

const fromResponse = (r: RequirementResponse): ProjectRequirement => ({
  categoryId: r.categoryId ?? null,
  categoryName: r.categoryName ?? '',
  description: r.description ?? '',
  deadline: r.deadline ?? '',
  criteria: (r.criteria ?? []).map((c) => ({
    id: String(c.id),
    name: c.name,
    maxScore: c.maxScore,
    files: (c.files ?? []).map(fromFileResponse),
  })),
  submissionRequirements: (r.submissionRequirements ?? []).map((item) => ({
    id: String(item.id),
    content: item.content,
    files: (item.files ?? []).map(fromFileResponse),
  })),
})

// Gửi kèm id (số) của tiêu chí cũ để BE cập nhật TẠI CHỖ, không sinh criterion_id
// mới -> điểm đã chấm (tham chiếu criterion_id) không bị mất khi sửa deadline/barem.
// Tiêu chí mới (id dạng "crit_...") không có id số nên BE sẽ tạo mới.
const toRequest = (req: ProjectRequirement) => ({
  categoryId: req.categoryId,
  description: req.description,
  deadline: req.deadline,
  submissionRequirements: req.submissionRequirements
    .map((item) => ({ ...item, content: item.content.trim() }))
    .filter((item) => item.content)
    .map((item) => {
      const numericId = Number(item.id)
      const hasNumericId = item.id !== '' && Number.isInteger(numericId)
      return hasNumericId ? { id: numericId, content: item.content } : { content: item.content }
    }),
  criteria: req.criteria.map((c) => {
    const numericId = Number(c.id)
    const hasNumericId = c.id !== '' && Number.isInteger(numericId)
    return hasNumericId
      ? { id: numericId, name: c.name, maxScore: c.maxScore }
      : { name: c.name, maxScore: c.maxScore }
  }),
})

export const getRequirement = (courseId: number | string): Promise<ProjectRequirement> =>
  axiosClient
    .get<ApiResponse<RequirementResponse>>(`/courses/${courseId}/requirement`)
    .then((r) => fromResponse(r.data.data))

export const saveRequirement = (
  courseId: number | string,
  req: ProjectRequirement,
): Promise<ProjectRequirement> =>
  axiosClient
    .put<ApiResponse<RequirementResponse>>(`/courses/${courseId}/requirement`, toRequest(req))
    .then((r) => fromResponse(r.data.data))

export const newCriterion = (): RubricCriterion => ({
  id: `crit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  name: '',
  maxScore: 10,
  files: [],
})

export const newSubmissionRequirement = (): SubmissionRequirement => ({
  id: `submission_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  content: '',
  files: [],
})

// ----- Tài liệu yêu cầu (tệp GV tải lên cho SV tải về) -----

export type RequirementFile = {
  id: number
  criterionId: number | null
  submissionRequirementId: number | null
  label: string
  url: string
}
type RequirementFileResponse = {
  id: number
  criterionId?: number | null
  submissionRequirementId?: number | null
  label: string
  url: string
}

const fromFileResponse = (f: RequirementFileResponse): RequirementFile => ({
  id: f.id,
  criterionId: f.criterionId ?? null,
  submissionRequirementId: f.submissionRequirementId ?? null,
  label: f.label,
  url: f.url,
})

export const listRequirementFiles = (courseId: number | string): Promise<RequirementFile[]> =>
  axiosClient
    .get<ApiResponse<RequirementFileResponse[]>>(`/courses/${courseId}/requirement/files`)
    .then((r) => (r.data.data ?? []).map(fromFileResponse))

export const uploadRequirementFile = (
  courseId: number | string,
  file: File,
  label?: string,
  criterionId?: number | string | null,
  submissionRequirementId?: number | string | null,
): Promise<RequirementFile> => {
  const fd = new FormData()
  fd.append('file', file)
  if (label) fd.append('label', label)
  if (criterionId != null) fd.append('criterionId', String(criterionId))
  if (submissionRequirementId != null) fd.append('submissionRequirementId', String(submissionRequirementId))
  return axiosClient
    .post<ApiResponse<RequirementFileResponse>>(`/courses/${courseId}/requirement/files`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => fromFileResponse(r.data.data))
}

export const createRequirementLink = (
  courseId: number | string,
  payload: {
    label?: string
    url: string
    criterionId?: number | string | null
    submissionRequirementId?: number | string | null
  },
): Promise<RequirementFile> =>
  axiosClient
    .post<ApiResponse<RequirementFileResponse>>(`/courses/${courseId}/requirement/links`, payload)
    .then((r) => fromFileResponse(r.data.data))

export const deleteRequirementFile = (
  courseId: number | string,
  fileId: number | string,
): Promise<void> =>
  axiosClient.delete(`/courses/${courseId}/requirement/files/${fileId}`).then(() => undefined)
