import { useEffect, useState } from 'react'
import type { Role } from '../../../mocks/types'
import { getActivities, subscribeActivities, type FeedActivity } from '../../../services/activity.service'
import { isNotificationsEnabled, subscribeNotifPref } from '../../../lib/notificationPrefs'

const formatTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
}

export default function ActivityNotifications({ role }: { role: Role }) {
  const [enabled, setEnabled] = useState(isNotificationsEnabled())
  const [activities, setActivities] = useState<FeedActivity[]>(() => getActivities(role))
  const [selected, setSelected] = useState<FeedActivity | null>(null)

  useEffect(() => subscribeNotifPref(setEnabled), [])

  // Tắt thông báo = tạm dừng cập nhật list hoạt động (không subscribe khi off).
  useEffect(() => {
    if (!enabled) return
    setActivities(getActivities(role))
    return subscribeActivities(() => setActivities(getActivities(role)))
  }, [enabled, role])

  return (
    <div className="bg-surface rounded-2xl shadow-soft border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-text">Hoạt động &amp; Thông báo</h3>
        {!enabled && (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Đang tạm dừng
          </span>
        )}
      </div>

      {!enabled ? (
        <p className="text-sm text-text-soft py-6 text-center">
          Đã tắt cập nhật hoạt động. Bật lại ở chuông thông báo trên thanh điều hướng.
        </p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-text-soft py-6 text-center">Chưa có hoạt động nào.</p>
      ) : (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {activities.map((a) => {
            const clickable = a.kind === 'APPROVAL' && !!a.note
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => (clickable ? setSelected(a) : undefined)}
                className={`w-full text-left flex gap-3 rounded-xl border border-border p-3 transition-colors ${
                  clickable ? 'hover:border-primary cursor-pointer' : 'cursor-default'
                }`}
              >
                <span className={`mt-1 size-2 rounded-full shrink-0 ${a.kind === 'APPROVAL' ? 'bg-primary' : 'bg-text-soft'}`} />
                <div className="min-w-0">
                  <p className="text-sm text-text font-medium leading-snug">{a.title}</p>
                  <p className="text-[11px] text-text-soft mt-0.5">
                    {a.actorName} · {formatTime(a.createdAt)}
                    {clickable ? ' · Xem nhận xét' : ''}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text mb-1">{selected.title}</h3>
            <p className="text-xs text-text-soft mb-4">
              {selected.actorName} · {formatTime(selected.createdAt)}
            </p>
            <div className="bg-surface-soft rounded-xl p-4 text-sm text-text whitespace-pre-line">{selected.note}</div>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-primary text-surface rounded-lg text-sm font-semibold hover:opacity-90"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
