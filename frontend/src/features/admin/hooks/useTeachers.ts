import { useEffect, useState } from 'react'

import { listTeachers } from '../../../services/admin/user.service'
import type { ApiError } from '../../../lib/api/axiosClient'
import type { AdminUserListItem } from '../../../types/api/user'

export function useTeachers(enabled: boolean) {
  const [teachers, setTeachers] = useState<AdminUserListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let active = true
    setIsLoading(true)
    setError(null)
    listTeachers()
      .then((list) => {
        if (active) setTeachers(list)
      })
      .catch((err) => {
        if (active) setError((err as ApiError)?.message ?? 'Không tải được danh sách giảng viên.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [enabled])

  return { teachers, isLoading, error }
}
