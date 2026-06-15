// Sở thích bật/tắt thông báo, chia sẻ giữa Navbar (chuông) và feed hoạt động ở Home.
// Lưu localStorage + phát CustomEvent để các component đồng bộ realtime.
// Giá trị NOTIF_KEY: không có = đang bật; 'forever' = tắt tới khi bật lại;
// một số = mốc epoch(ms) hết hạn tắt (qua mốc đó tự bật lại).
const NOTIF_KEY = 'notif.mutedUntil'
const EVENT = 'notif-pref-changed'

export const isNotificationsEnabled = (): boolean => {
  if (typeof window === 'undefined') return true
  const v = localStorage.getItem(NOTIF_KEY)
  if (!v) return true
  if (v === 'forever') return false
  const until = Number(v)
  if (Number.isNaN(until)) return true
  if (Date.now() >= until) {
    localStorage.removeItem(NOTIF_KEY)
    return true
  }
  return false
}

export const enableNotifications = (): void => {
  localStorage.removeItem(NOTIF_KEY)
  window.dispatchEvent(new CustomEvent(EVENT))
}

// durationMs = null → tắt cho tới khi bật lại; ngược lại tắt trong khoảng đó rồi tự bật.
export const muteNotifications = (durationMs: number | null): void => {
  localStorage.setItem(NOTIF_KEY, durationMs === null ? 'forever' : String(Date.now() + durationMs))
  window.dispatchEvent(new CustomEvent(EVENT))
}

export const subscribeNotifPref = (cb: (enabled: boolean) => void): (() => void) => {
  const handler = () => cb(isNotificationsEnabled())
  window.addEventListener(EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}
