// Yêu cầu đồ án của 1 lớp: loại đồ án (category do admin quản lý) + mô tả +
// hạn nộp + barem tiêu chí chấm điểm. Lưu client (localStorage) — seam cho BE.
// TODO(BE): /courses/{id}/requirement (category, criteria[]) + chấm điểm theo rubric.
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

const key = (courseId: number | string) => `app.requirement.${courseId}`

export const getRequirement = (courseId: number | string): ProjectRequirement => {
  if (typeof window === 'undefined') return EMPTY_REQUIREMENT
  try {
    const raw = localStorage.getItem(key(courseId))
    return raw ? (JSON.parse(raw) as ProjectRequirement) : EMPTY_REQUIREMENT
  } catch {
    return EMPTY_REQUIREMENT
  }
}

export const saveRequirement = (courseId: number | string, req: ProjectRequirement): void => {
  localStorage.setItem(key(courseId), JSON.stringify(req))
}

export const newCriterion = (): RubricCriterion => ({
  id: `crit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  name: '',
  maxScore: 10,
})
