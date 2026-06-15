import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type { StatDetailItem, StatDetailType } from '../types/api/home'

// GET /home/stats/detail?type=... - chi tiết phía sau từng ô thống kê (sổ xuống khi click)
export const getStatDetail = (
  type: StatDetailType,
): Promise<ApiResponse<StatDetailItem[]>> =>
  axiosClient
    .get<ApiResponse<StatDetailItem[]>>('/home/stats/detail', { params: { type } })
    .then((r) => r.data)
