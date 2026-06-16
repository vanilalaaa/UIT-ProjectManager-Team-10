
import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'

export type CriterionScore = {
  criterionId: number | null
  name: string
  maxScore: number
  score: number
  note: string
}

export type Grade = {
  id: number
  submissionId: number | null
  projectId: number | null
  groupId: number | null
  score: number | null
  maxScore: number | null
  feedback: string
  gradedAt: string | null
  gradedById: number | null
  gradedByName: string | null
  criterionScores: CriterionScore[]
}

// Payload từng tiêu chí gửi lên BE (criterionId có thể null nếu barem chưa persist).
export type CriterionScorePayload = {
  criterionId: number | null
  name: string
  maxScore: number
  score: number
  note: string
}

export type GradePayload = {
  submissionId?: number
  feedback: string
  criterionScores: CriterionScorePayload[]
}

type CriterionScoreResponse = {
  criterionId: number | null
  name: string | null
  maxScore: number | null
  score: number | null
  note: string | null
}

type GradeResponse = {
  id: number
  submissionId: number | null
  projectId: number | null
  groupId: number | null
  score: number | null
  maxScore: number | null
  feedback: string | null
  gradedAt: string | null
  gradedById: number | null
  gradedByName: string | null
  criterionScores: CriterionScoreResponse[] | null
}

const fromResponse = (r: GradeResponse): Grade => ({
  id: r.id,
  submissionId: r.submissionId ?? null,
  projectId: r.projectId ?? null,
  groupId: r.groupId ?? null,
  score: r.score ?? null,
  maxScore: r.maxScore ?? null,
  feedback: r.feedback ?? '',
  gradedAt: r.gradedAt ?? null,
  gradedById: r.gradedById ?? null,
  gradedByName: r.gradedByName ?? null,
  criterionScores: (r.criterionScores ?? []).map((c) => ({
    criterionId: c.criterionId ?? null,
    name: c.name ?? '',
    maxScore: c.maxScore ?? 0,
    score: c.score ?? 0,
    note: c.note ?? '',
  })),
})

// Sinh viên: lấy điểm nhóm mình. Trả null khi chưa được chấm (BE trả 404/EntityNotFound).
export const getMyGrade = (projectId: number | string): Promise<Grade | null> =>
  axiosClient
    .get<ApiResponse<GradeResponse>>(`/projects/${projectId}/grades/me`)
    .then((r) => fromResponse(r.data.data))
    .catch(() => null)

// Giảng viên: lấy điểm hiện tại của 1 bài nộp (null nếu chưa chấm).
export const getGradeBySubmission = (
  submissionId: number | string,
): Promise<Grade | null> =>
  axiosClient
    .get<ApiResponse<GradeResponse | null>>(`/submissions/${submissionId}/grade`)
    .then((r) => (r.data.data ? fromResponse(r.data.data) : null))
    .catch(() => null)

// Giảng viên: tạo điểm mới cho 1 bài nộp.
export const createGrade = (
  projectId: number | string,
  payload: GradePayload,
): Promise<Grade> =>
  axiosClient
    .post<ApiResponse<GradeResponse>>(`/projects/${projectId}/grades`, payload)
    .then((r) => fromResponse(r.data.data))

// Giảng viên: cập nhật điểm/nhận xét đã có.
export const updateGrade = (
  gradeId: number | string,
  payload: Omit<GradePayload, 'submissionId'>,
): Promise<Grade> =>
  axiosClient
    .put<ApiResponse<GradeResponse>>(`/grades/${gradeId}`, payload)
    .then((r) => fromResponse(r.data.data))
