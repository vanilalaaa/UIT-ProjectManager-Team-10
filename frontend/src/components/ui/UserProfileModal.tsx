import type { User } from '../../mocks/types'

interface UserProfileModalProps {
  user: User | null
  onClose: () => void
  showInviteButton?: boolean
}

export default function UserProfileModal({ user, onClose, showInviteButton = false }: UserProfileModalProps) {
  if (!user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm bg-surface rounded-2xl shadow-xl border border-border p-6 animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-text-soft hover:text-text hover:bg-surface-soft rounded-full transition-colors"
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <img 
            src={user.userProfile?.avatarUrl || 'https://ui-avatars.com/api/?name=${member?.name}&background=random'} 
            alt={user.name}
            className="size-24 rounded-full object-cover border-4 border-surface shadow-soft ring-1 ring-border mb-4"
          />
          <h2 className="text-xl font-bold text-text">{user.name}</h2>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-surface-soft text-text font-semibold text-xs px-2.5 py-1 rounded border border-border">
              {user.uid}
            </span>
            <span className="text-xs text-text-soft">{user.email}</span>
          </div>

          <div className="mt-5 pt-5 border-t border-border w-full">
            <p className="text-sm text-text-soft leading-relaxed">
              {user.userProfile?.summary || 'Thành viên này chưa cập nhật giới thiệu bản thân.'}
            </p>
          </div>

          {showInviteButton && (
            <button 
              type="button"
              className="mt-6 w-full bg-primary hover:bg-primary/95 text-surface font-bold py-2.5 rounded-lg shadow-soft transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                alert(`Đã gửi lời mời vào nhóm đến ${user.name}!`)
                onClose()
              }}
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 19.5v-15m0 0H3m15 0h3m-15 4.5h3m-3 4.5h3m-3 4.5h3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Invite to Team
            </button>
          )}
        </div>
      </div>
    </div>
  )
}