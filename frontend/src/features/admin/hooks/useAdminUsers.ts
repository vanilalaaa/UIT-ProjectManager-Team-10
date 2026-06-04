import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  createUser,
  listUsers,
  patchUser,
  updateUser,
} from '../../../services/admin/user.service'
import type { ApiError } from '../../../lib/api/axiosClient'
import type { Page } from '../../../types/api/common'
import type {
  AdminUserCreateRequest,
  AdminUserListItem,
  AdminUserPatchRequest,
  AdminUserQuery,
  AdminUserUpdateRequest,
} from '../../../types/api/user'

const DEFAULT_SIZE = 10

export function useAdminUsers() {
  const [query, setQueryState] = useState<AdminUserQuery>({
    page: 0,
    size: DEFAULT_SIZE,
    search: '',
    role: '',
    isActive: '',
  })
  const [data, setData] = useState<Page<AdminUserListItem> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await listUsers(query)
      setData(res.data)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr?.message ?? 'Không tải được danh sách người dùng.')
    } finally {
      setIsLoading(false)
    }
  }, [query])

  useEffect(() => {
    refetch()
  }, [refetch])

  const setQuery = useCallback((patch: Partial<AdminUserQuery>) => {
    setQueryState((prev) => {
      const next = { ...prev, ...patch }
      if (!('page' in patch)) next.page = 0
      return next
    })
  }, [])

  const create = useCallback(
    async (payload: AdminUserCreateRequest) => {
      await createUser(payload)
      toast.success('Đã tạo người dùng.')
      await refetch()
    },
    [refetch],
  )

  const update = useCallback(
    async (id: number | string, payload: AdminUserUpdateRequest) => {
      await updateUser(id, payload)
      toast.success('Đã cập nhật người dùng.')
      await refetch()
    },
    [refetch],
  )

  const patch = useCallback(
    async (id: number | string, payload: AdminUserPatchRequest) => {
      await patchUser(id, payload)
      toast.success('Đã cập nhật.')
      await refetch()
    },
    [refetch],
  )

  return { data, isLoading, error, query, setQuery, refetch, create, update, patch }
}
