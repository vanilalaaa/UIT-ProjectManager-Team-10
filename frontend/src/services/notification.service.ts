import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'

// Một thông báo gửi riêng cho user (vd GV duyệt/từ chối đề tài) — hiển thị ở chuông.
export type NotificationItem = {
  id: number
  type: string
  title: string
  message?: string | null
  courseId?: number | null
  projectId?: number | null
  isRead: boolean
  createdAt: string
}

export const getMyNotifications = (): Promise<NotificationItem[]> =>
  axiosClient
    .get<ApiResponse<NotificationItem[]>>('/notifications')
    .then((r) => r.data.data ?? [])

export const getUnreadCount = (): Promise<number> =>
  axiosClient
    .get<ApiResponse<number>>('/notifications/unread-count')
    .then((r) => r.data.data ?? 0)

export const markNotificationRead = (id: number): Promise<void> =>
  axiosClient.patch<ApiResponse<void>>(`/notifications/${id}/read`).then(() => undefined)

export const markAllNotificationsRead = (): Promise<void> =>
  axiosClient.patch<ApiResponse<void>>('/notifications/read-all').then(() => undefined)
