import axiosClient from '../../lib/api/axiosClient'
import type { ApiResponse, Page } from '../../types/api/common'
import type {
  AdminCategoryCreateRequest,
  AdminCategoryQuery,
  AdminCategoryStatusPatch,
  AdminCategoryUpdateRequest,
  Category,
} from '../../types/api/category'

const BASE = '/api/admin/categories'

function cleanParams(query: AdminCategoryQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '' || value === null) continue
    params[key] = value as string | number | boolean
  }
  return params
}

export const listCategories = (
  query: AdminCategoryQuery = {},
): Promise<ApiResponse<Page<Category>>> =>
  axiosClient
    .get<ApiResponse<Page<Category>>>(BASE, { params: cleanParams(query) })
    .then((r) => r.data)

// Đọc danh mục cho mọi role (TEACHER gán loại đồ án) — không dùng endpoint admin.
export const listActiveCategories = (): Promise<Category[]> =>
  axiosClient.get<ApiResponse<Category[]>>('/categories').then((r) => r.data.data)

export const createCategory = (
  payload: AdminCategoryCreateRequest,
): Promise<ApiResponse<Category>> =>
  axiosClient.post<ApiResponse<Category>>(BASE, payload).then((r) => r.data)

export const updateCategory = (
  id: number | string,
  payload: AdminCategoryUpdateRequest,
): Promise<ApiResponse<Category>> =>
  axiosClient.put<ApiResponse<Category>>(`${BASE}/${id}`, payload).then((r) => r.data)

export const patchCategoryStatus = (
  id: number | string,
  payload: AdminCategoryStatusPatch,
): Promise<ApiResponse<Category>> =>
  axiosClient.patch<ApiResponse<Category>>(`${BASE}/${id}/status`, payload).then((r) => r.data)

export const getCategoryById = (id: number | string): Promise<ApiResponse<Category>> =>
  axiosClient.get<ApiResponse<Category>>(`${BASE}/${id}`).then((r) => r.data)
