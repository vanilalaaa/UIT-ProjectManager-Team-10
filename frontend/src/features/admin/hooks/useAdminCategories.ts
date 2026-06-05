import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  createCategory,
  listCategories,
  patchCategoryStatus,
  updateCategory,
} from '../../../services/admin/category.service'
import type { ApiError } from '../../../lib/api/axiosClient'
import type { Page } from '../../../types/api/common'
import type {
  AdminCategoryCreateRequest,
  AdminCategoryQuery,
  AdminCategoryUpdateRequest,
  Category,
} from '../../../types/api/category'

const DEFAULT_SIZE = 10

export function useAdminCategories() {
  const [query, setQueryState] = useState<AdminCategoryQuery>({
    page: 0,
    size: DEFAULT_SIZE,
    search: '',
    isActive: '',
  })
  const [data, setData] = useState<Page<Category> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await listCategories(query)
      setData(res.data)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr?.message ?? 'Không tải được danh mục.')
    } finally {
      setIsLoading(false)
    }
  }, [query])

  useEffect(() => {
    refetch()
  }, [refetch])

  const setQuery = useCallback((patch: Partial<AdminCategoryQuery>) => {
    setQueryState((prev) => {
      const next = { ...prev, ...patch }
      if (!('page' in patch)) next.page = 0
      return next
    })
  }, [])

  const create = useCallback(
    async (payload: AdminCategoryCreateRequest) => {
      await createCategory(payload)
      toast.success('Đã tạo danh mục.')
      await refetch()
    },
    [refetch],
  )

  const update = useCallback(
    async (id: number, payload: AdminCategoryUpdateRequest) => {
      await updateCategory(id, payload)
      toast.success('Đã cập nhật danh mục.')
      await refetch()
    },
    [refetch],
  )

  const toggleStatus = useCallback(
    async (id: number, isActive: boolean) => {
      await patchCategoryStatus(id, { isActive })
      toast.success('Đã cập nhật trạng thái.')
      await refetch()
    },
    [refetch],
  )

  return { data, isLoading, error, query, setQuery, refetch, create, update, toggleStatus }
}
