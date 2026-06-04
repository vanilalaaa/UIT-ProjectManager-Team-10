import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
} from '../../../services/course.service'
import type { ApiError } from '../../../lib/api/axiosClient'
import type { Page } from '../../../types/api/common'
import type {
  AdminCourseCreateRequest,
  AdminCourseListItem,
  AdminCourseQuery,
  AdminCourseUpdateRequest,
} from '../../../types/api/course'

const DEFAULT_SIZE = 10

export function useAdminCourses() {
  const [query, setQueryState] = useState<AdminCourseQuery>({
    page: 0,
    size: DEFAULT_SIZE,
    search: '',
  })
  const [data, setData] = useState<Page<AdminCourseListItem> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await listCourses(query)
      setData(res.data)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr?.message ?? 'Không tải được danh sách lớp học.')
    } finally {
      setIsLoading(false)
    }
  }, [query])

  useEffect(() => {
    refetch()
  }, [refetch])

  const setQuery = useCallback((patch: Partial<AdminCourseQuery>) => {
    setQueryState((prev) => {
      const next = { ...prev, ...patch }
      if (!('page' in patch)) next.page = 0
      return next
    })
  }, [])

  const create = useCallback(
    async (payload: AdminCourseCreateRequest) => {
      await createCourse(payload)
      toast.success('Đã tạo lớp học.')
      await refetch()
    },
    [refetch],
  )

  const update = useCallback(
    async (id: number, payload: AdminCourseUpdateRequest) => {
      await updateCourse(id, payload)
      toast.success('Đã cập nhật lớp học.')
      await refetch()
    },
    [refetch],
  )

  const remove = useCallback(
    async (id: number) => {
      await deleteCourse(id)
      toast.success('Đã xoá lớp học.')
      await refetch()
    },
    [refetch],
  )

  return { data, isLoading, error, query, setQuery, refetch, create, update, remove }
}
