import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  GroupTaskReport,
  Submission,
  SubmissionUpdateRequest,
} from '../types/api/submission'

// Lưu ý: SubmissionController trả thẳng entity/list (KHÔNG bọc trong ApiResponse),
// nên các hàm dưới đây trả luôn body thô từ BE.
export const listProjectSubmissions = (
  projectId: number | string,
): Promise<Submission[]> =>
  axiosClient
    .get<Submission[]>(`/projects/${projectId}/submissions`)
    .then((r) => r.data ?? [])

export const createSubmissionFormData = (
  projectId: number | string,
  formData: FormData,
): Promise<Submission[]> =>
  axiosClient
    .post<Submission[]>(`/projects/${projectId}/submissions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((r) => r.data)

export const updateSubmission = (
  submissionId: number | string,
  payload: SubmissionUpdateRequest,
): Promise<Submission> =>
  axiosClient
    .put<Submission>(`/submissions/${submissionId}`, payload)
    .then((r) => r.data)

export const deleteSubmission = (
  submissionId: number | string,
): Promise<ApiResponse<void>> =>
  axiosClient.delete<ApiResponse<void>>(`/submissions/${submissionId}`).then((r) => r.data)

// Báo cáo công việc theo nhóm/thành viên — endpoint này bọc trong ApiResponse.
export const getSubmissionReport = (
  projectId: number | string,
): Promise<GroupTaskReport[]> =>
  axiosClient
    .get<ApiResponse<GroupTaskReport[]>>(`/projects/${projectId}/submissions/report`)
    .then((r) => r.data.data ?? [])
