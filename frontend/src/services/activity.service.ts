import type { Role } from '../mocks/types'

// Store hoạt động/thông báo phía client (localStorage + pub/sub). Đây là seam:
// khi BE có /home/feed + websocket, thay read/write bằng API, giữ nguyên UI.
export type ActivityScope = 'STUDENT' | 'TEACHER' | 'ALL'

export type FeedActivity = {
  id: string
  kind: 'INFO' | 'APPROVAL'
  title: string
  note?: string
  actorName: string
  createdAt: string
  scope: ActivityScope
}

const STORE_KEY = 'app.activities'
const EVENT = 'activity-changed'

const read = (): FeedActivity[] => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') as FeedActivity[]
  } catch {
    return []
  }
}

const write = (list: FeedActivity[]) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(list))
  window.dispatchEvent(new CustomEvent(EVENT))
}

export const getActivities = (role?: Role): FeedActivity[] => {
  const list = read()
  if (!role) return list
  return list.filter((a) => a.scope === 'ALL' || a.scope === role)
}

export const addActivity = (input: Omit<FeedActivity, 'id' | 'createdAt'>): void => {
  const item: FeedActivity = {
    ...input,
    id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  }
  write([item, ...read()].slice(0, 50))
}

export const subscribeActivities = (cb: () => void): (() => void) => {
  const handler = () => cb()
  window.addEventListener(EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}
