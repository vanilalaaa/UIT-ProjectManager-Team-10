import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'

export type GlobalSearchResult = {
  id: string
  label: string
  description?: string
  path: string
  category: string
  keywords: string
}

export const searchGlobal = (query: string): Promise<GlobalSearchResult[]> =>
  axiosClient
    .get<ApiResponse<GlobalSearchResult[]>>('/search', { params: { query } })
    .then((r) => r.data.data)
