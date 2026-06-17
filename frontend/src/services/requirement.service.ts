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

// Gửi kèm id (số) của tiêu chí cũ để BE cập nhật TẠI CHỖ, không sinh criterion_id
// mới -> điểm đã chấm (tham chiếu criterion_id) không bị mất khi sửa deadline/barem.
// Tiêu chí mới (id dạng "crit_...") không có id số nên BE sẽ tạo mới.
const toRequest = (req: ProjectRequirement) => ({
  categoryId: req.categoryId,
  description: req.description,
  deadline: req.deadline,
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
})
