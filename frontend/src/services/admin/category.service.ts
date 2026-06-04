import axiosClient from '../../lib/api/axiosClient'
import type { ApiResponse, Page } from '../../types/api/common'
import type {
  AdminCategoryCreateRequest,
  AdminCategoryQuery,
  AdminCategoryUpdateRequest,
  Category,
} from '../../types/api/category'

const BASE = '/admin/categories'

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

export const createCategory = (
  payload: AdminCategoryCreateRequest,
): Promise<ApiResponse<Category>> =>
  axiosClient.post<ApiResponse<Category>>(BASE, payload).then((r) => r.data)

export const updateCategory = (
  id: number | string,
  payload: AdminCategoryUpdateRequest,
): Promise<ApiResponse<Category>> =>
  axiosClient.put<ApiResponse<Category>>(`${BASE}/${id}`, payload).then((r) => r.data)

export const patchCategory = (
  id: number | string,
  payload: AdminCategoryUpdateRequest,
): Promise<ApiResponse<Category>> =>
  axiosClient.patch<ApiResponse<Category>>(`${BASE}/${id}`, payload).then((r) => r.data)
