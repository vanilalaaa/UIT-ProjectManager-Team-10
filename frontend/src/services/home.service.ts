import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'

export type HomeQuickStats = Record<string, number>

export type HomeFeedItem = {
  type: 'TASK' | 'SUBMISSION' | 'PROJECT' | 'GROUP_REQUEST' | 'PROJECT_PROPOSAL' | 'PROJECT_RESULT'
  referenceId: number
  title: string
  description?: string | null
  status?: string | null
  projectId?: number | null
  courseId?: number | null
  projectTitle?: string | null
  actorName: string
  actorAvatar?: string | null
  timestamp: string
}

export type ChartStats = { todo: number; inProgress: number; readyForTest: number; total: number }

type HomeStatsResponse = { quickStats: HomeQuickStats }

export const getHomeStats = (): Promise<HomeQuickStats> =>
  axiosClient
    .get<ApiResponse<HomeStatsResponse>>('/home/stats')
    .then((r) => r.data.data.quickStats ?? {})

export const getHomeFeed = (limit = 50): Promise<HomeFeedItem[]> =>
  axiosClient
    .get<ApiResponse<HomeFeedItem[]>>('/home/feed', { params: { limit } })
    .then((r) => r.data.data ?? [])

// Tính chart/heatmap/lọc từ feed ở client để giữ nguyên tương tác calendar.
export const filterFeedByMonthDate = (
  items: HomeFeedItem[],
  month: number,
  date: number | null,
): HomeFeedItem[] =>
  items.filter((i) => {
    const d = new Date(i.timestamp)
    return d.getMonth() + 1 === month && (date ? d.getDate() === date : true)
  })

export const computeChart = (items: HomeFeedItem[], role: string): ChartStats => {
  if (role === 'TEACHER') {
    const subs = items.filter((i) => i.type === 'SUBMISSION')
    const graded = subs.filter((i) => i.status === 'GRADED').length
    return { todo: 0, inProgress: subs.length - graded, readyForTest: graded, total: subs.length }
  }
  const tasks = items.filter((i) => i.type === 'TASK')
  const todo = tasks.filter((i) => i.status === 'TODO').length
  const inProgress = tasks.filter((i) => i.status === 'IN_PROGRESS').length
  const readyForTest = tasks.filter((i) => i.status === 'DONE').length
  return { todo, inProgress, readyForTest, total: todo + inProgress + readyForTest }
}

export const computeHeatmap = (items: HomeFeedItem[], month: number): Record<number, number> => {
  const counts: Record<number, number> = {}
  items.forEach((i) => {
    const d = new Date(i.timestamp)
    if (d.getMonth() + 1 === month) counts[d.getDate()] = (counts[d.getDate()] || 0) + 1
  })
  return counts
}
