import axiosClient from '../../lib/api/axiosClient'
import type { ApiResponse, Page } from '../../types/api/common'
import type {
  AdminUserCreateRequest,
  AdminUserListItem,
  AdminUserPatchRequest,
  AdminUserQuery,
  AdminUserUpdateRequest,
} from '../../types/api/user'

const BASE = '/api/admin/users'

function cleanParams(query: AdminUserQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '' || value === null) continue
    params[key] = value as string | number | boolean
  }
  return params
}

export const listUsers = (
  query: AdminUserQuery = {},
): Promise<ApiResponse<Page<AdminUserListItem>>> =>
  axiosClient
    .get<ApiResponse<Page<AdminUserListItem>>>(BASE, { params: cleanParams(query) })
    .then((r) => r.data)

export const createUser = (
  payload: AdminUserCreateRequest,
): Promise<ApiResponse<AdminUserListItem>> =>
  axiosClient.post<ApiResponse<AdminUserListItem>>(BASE, payload).then((r) => r.data)

export const updateUser = (
  id: number | string,
  payload: AdminUserUpdateRequest,
): Promise<ApiResponse<AdminUserListItem>> =>
  axiosClient.put<ApiResponse<AdminUserListItem>>(`${BASE}/${id}`, payload).then((r) => r.data)

export const patchUser = (
  id: number | string,
  payload: AdminUserPatchRequest,
): Promise<ApiResponse<AdminUserListItem>> =>
  axiosClient
    .patch<ApiResponse<AdminUserListItem>>(`${BASE}/${id}/status`, payload)
    .then((r) => r.data)

export const getUserById = (id: number | string): Promise<ApiResponse<AdminUserListItem>> =>
  axiosClient.get<ApiResponse<AdminUserListItem>>(`${BASE}/${id}`).then((r) => r.data)
