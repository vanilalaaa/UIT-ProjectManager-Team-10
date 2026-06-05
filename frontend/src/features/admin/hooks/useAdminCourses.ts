import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
} from '../../../services/course.service'
import type { ApiError } from '../../../lib/api/axiosClient'
import type {
  AdminCourseCreateRequest,
  AdminCourseListItem,
  AdminCourseUpdateRequest,
} from '../../../types/api/course'

export function useAdminCourses() {
  const [data, setData] = useState<AdminCourseListItem[] | null>(null)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await listCourses()
      setData(res.data)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr?.message ?? 'Không tải được danh sách lớp học.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

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

  const filtered =
    data && search
      ? data.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      : data

  return { data: filtered, isLoading, error, search, setSearch, refetch, create, update, remove }
}
