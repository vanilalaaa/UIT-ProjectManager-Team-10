import type { User } from '../../mocks/types'

interface UserProfilePopoverProps {
  user: User
  onClose: () => void
  showInviteButton?: boolean
}

export default function UserProfilePopover({ user, onClose, showInviteButton = false }: UserProfilePopoverProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-xl shadow-xl border border-border p-4 z-30 text-left">
      <button 
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-3 right-3 p-1 text-text-soft hover:text-text hover:bg-surface-soft rounded-full transition-colors"
      >
        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col items-center text-center">
        <img 
          src={user.userProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
          alt={user.name}
          className="size-16 rounded-full object-cover border-2 border-border shadow-sm mb-2"
        />
        <h4 className="text-sm font-bold text-text">{user.name}</h4>
        <div className="flex flex-col items-center text-[11px] text-text-soft mt-1 w-full px-2">
          <span className="font-semibold text-text bg-surface-soft px-1.5 py-0.5 rounded border border-border">{user.uid}</span>
          <span className="truncate w-full mt-1">{user.email}</span>
        </div>

        <div className="mt-3 pt-3 border-t border-border w-full">
          <p className="text-xs text-text-soft leading-relaxed line-clamp-3">
            {user.userProfile?.summary || 'Thành viên này chưa cập nhật giới thiệu.'}
          </p>
        </div>

        {showInviteButton && (
          <button 
            type="button"
            className="mt-3 w-full bg-primary hover:bg-primary/95 text-surface text-xs font-bold py-2 rounded-lg shadow-soft transition-colors flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation()
              alert(`Đã gửi lời mời vào nhóm đến ${user.name}!`)
              onClose()
            }}
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 19.5v-15m0 0H3m15 0h3m-15 4.5h3m-3 4.5h3m-3 4.5h3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Invite to Team
          </button>
        )}
      </div>
    </div>
  )
}