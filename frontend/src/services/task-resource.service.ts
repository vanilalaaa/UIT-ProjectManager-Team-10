// Tài nguyên đính kèm cho task (BE: /tasks/{taskId}/resources). Người thực hiện,
// người kiểm tra hoặc leader có thể tải tệp lên hoặc gắn liên kết để đưa vào review.
import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type { TaskResource } from '../types/api/task'

export type { TaskResource } from '../types/api/task'

export const listTaskResources = (taskId: number | string): Promise<TaskResource[]> =>
  axiosClient
    .get<ApiResponse<TaskResource[]>>(`/tasks/${taskId}/resources`)
    .then((r) => r.data.data ?? [])

export const uploadTaskFile = (
  taskId: number | string,
  file: File,
): Promise<TaskResource> => {
  const fd = new FormData()
  fd.append('file', file)
  return axiosClient
    .post<ApiResponse<TaskResource>>(`/tasks/${taskId}/resources`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)
}

// type mặc định "LINK"; BE còn nhận DRIVE/GITHUB nếu muốn phân loại liên kết.
export const addTaskLink = (
  taskId: number | string,
  url: string,
  label?: string,
  type?: string,
): Promise<TaskResource> =>
  axiosClient
    .post<ApiResponse<TaskResource>>(`/tasks/${taskId}/resources/link`, null, {
      params: { url, label, type },
    })
    .then((r) => r.data.data)

export const deleteTaskResource = (
  taskId: number | string,
  resourceId: number | string,
): Promise<void> =>
  axiosClient.delete(`/tasks/${taskId}/resources/${resourceId}`).then(() => undefined)
