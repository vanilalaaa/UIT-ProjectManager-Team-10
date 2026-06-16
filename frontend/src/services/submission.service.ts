import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Submission,
  SubmissionUpdateRequest,
} from '../types/api/submission'

export const listProjectSubmissions = (
  projectId: number | string,
): Promise<ApiResponse<Submission[]>> =>
  axiosClient
    .get<ApiResponse<Submission[]>>(`/projects/${projectId}/submissions`)
    .then((r) => r.data)

export const createSubmissionFormData = (
  projectId: number | string,
  formData: FormData,
): Promise<ApiResponse<Submission>> =>
  axiosClient
    .post<ApiResponse<Submission>>(`/projects/${projectId}/submissions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((r) => r.data)
    
export const updateSubmission = (
  submissionId: number | string,
  payload: SubmissionUpdateRequest,
): Promise<ApiResponse<Submission>> =>
  axiosClient
    .put<ApiResponse<Submission>>(`/submissions/${submissionId}`, payload)
    .then((r) => r.data)

export const deleteSubmission = (
  submissionId: number | string,
): Promise<ApiResponse<void>> =>
  axiosClient.delete<ApiResponse<void>>(`/submissions/${submissionId}`).then((r) => r.data)