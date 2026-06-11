// Sở thích bật/tắt thông báo, chia sẻ giữa Navbar và list hoạt động ở Home.
// Lưu localStorage + phát CustomEvent để các component đồng bộ realtime.
const NOTIF_KEY = 'notif.enabled'
const EVENT = 'notif-pref-changed'

export const isNotificationsEnabled = (): boolean =>
  typeof window === 'undefined' ? true : localStorage.getItem(NOTIF_KEY) !== 'false'

export const setNotificationsEnabled = (enabled: boolean): void => {
  localStorage.setItem(NOTIF_KEY, enabled ? 'true' : 'false')
  window.dispatchEvent(new CustomEvent(EVENT, { detail: enabled }))
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
