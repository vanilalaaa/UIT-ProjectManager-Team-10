// Yêu cầu đồ án của 1 lớp: loại đồ án (category do admin quản lý) + mô tả +
// hạn nộp + barem tiêu chí chấm điểm. Nguồn sự thật: BE GET/PUT
// /courses/{id}/requirement (thay cho localStorage cũ).
import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'

export type RubricCriterion = {
  id: string
  name: string
  maxScore: number
}

export type ProjectRequirement = {
  categoryId: number | null
  categoryName: string
  description: string
  deadline: string
  criteria: RubricCriterion[]
}

export const EMPTY_REQUIREMENT: ProjectRequirement = {
  categoryId: null,
  categoryName: '',
  description: '',
  deadline: '',
  criteria: [],
}

// Shape BE trả về (criterion.id là số sau khi persist).
type RubricCriterionResponse = { id: number; name: string; maxScore: number }
type RequirementResponse = {
  categoryId: number | null
  categoryName: string
  description: string
  deadline: string
  criteria: RubricCriterionResponse[]
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
  })),
})

// PUT thay toàn bộ barem nên không gửi id (BE tự sinh lại).
const toRequest = (req: ProjectRequirement) => ({
  categoryId: req.categoryId,
  description: req.description,
  deadline: req.deadline,
  criteria: req.criteria.map((c) => ({ name: c.name, maxScore: c.maxScore })),
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
})

// ----- Tài liệu yêu cầu (tệp GV tải lên cho SV tải về) -----

export type RequirementFile = { id: number; label: string; url: string }

export const listRequirementFiles = (courseId: number | string): Promise<RequirementFile[]> =>
  axiosClient
    .get<ApiResponse<RequirementFile[]>>(`/courses/${courseId}/requirement/files`)
    .then((r) => r.data.data ?? [])

export const uploadRequirementFile = (
  courseId: number | string,
  file: File,
  label?: string,
): Promise<RequirementFile> => {
  const fd = new FormData()
  fd.append('file', file)
  if (label) fd.append('label', label)
  return axiosClient
    .post<ApiResponse<RequirementFile>>(`/courses/${courseId}/requirement/files`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)
}

export const deleteRequirementFile = (
  courseId: number | string,
  fileId: number | string,
): Promise<void> =>
  axiosClient.delete(`/courses/${courseId}/requirement/files/${fileId}`).then(() => undefined)
