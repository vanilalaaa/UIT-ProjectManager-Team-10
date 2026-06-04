import { useEffect, useState } from 'react'

import { listUsers } from '../../../services/admin/user.service'
import type { ApiError } from '../../../lib/api/axiosClient'
import type { AdminUserListItem } from '../../../types/api/user'

export function useTeacherOptions(enabled: boolean) {
  const [options, setOptions] = useState<AdminUserListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let alive = true
    setIsLoading(true)
    setError(null)
    listUsers({ role: 'TEACHER', size: 200, page: 0 })
      .then((res) => {
        if (alive) setOptions(res.data.content)
      })
      .catch((err) => {
        if (!alive) return
        const apiErr = err as ApiError
        setError(apiErr?.message ?? 'Không tải được danh sách giảng viên.')
      })
      .finally(() => {
        if (alive) setIsLoading(false)
      })
    return () => {
      alive = false
    }
  }, [enabled])

  return { options, isLoading, error }
}
