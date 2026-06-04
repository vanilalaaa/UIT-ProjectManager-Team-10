import { useEffect, useState } from 'react'

interface Invitation {
  id: number
  teamName: string
  sender: string
}

interface InviteListModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InviteListModal({ isOpen, onClose }: InviteListModalProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let isMounted = true
    setLoading(true)

    setTimeout(() => {
      if (isMounted) {
        setInvitations([])
        setLoading(false)
      }
    }, 300)

    return () => { isMounted = false }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface p-6 rounded-2xl w-full max-w-md shadow-xl border border-border">
        <h3 className="text-lg font-bold mb-4 text-text">Lời mời tham gia nhóm</h3>
        
        {loading ? (
          <div className="text-center py-6 text-sm text-text-soft">Đang tải lời mời...</div>
        ) : (
          <div className="space-y-3">
            {invitations.map(inv => (
              <div key={inv.id} className="p-3 border border-border rounded-xl flex justify-between items-center bg-surface">
                <div>
                  <p className="font-bold text-sm text-text">{inv.teamName}</p>
                  <p className="text-xs text-text-soft">Leader: {inv.sender}</p>
                </div>
                <button className="text-xs font-bold bg-primary text-surface px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
                  Accept
                </button>
              </div>
            ))}
            {invitations.length === 0 && (
              <div className="text-center py-8 text-sm text-text-soft/80 flex flex-col items-center justify-center gap-2">
                <svg className="size-8 text-text-soft/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <span>Không có lời mời nào gần đây</span>
              </div>
            )}
          </div>
        )}
        
        <button onClick={onClose} className="mt-4 w-full py-2 text-sm font-medium text-text-soft hover:text-text transition-colors">
          Đóng
        </button>
      </div>
    </div>
  )
}