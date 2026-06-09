import Avatar from '../../ui/Avatar'
import type { User } from '../../../mocks/types'

interface UserProfilePopoverProps {
  user: User
  onClose: () => void
  showInviteButton?: boolean
}

export default function UserProfilePopover({ user, onClose, showInviteButton = false }: UserProfilePopoverProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-2xl shadow-2xl border border-border p-5 z-30 text-left animate-fade-in">
      <button 
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-4 p-1 text-text-soft hover:text-text hover:bg-surface-soft rounded-lg transition-colors border border-transparent hover:border-border"
      >
        <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col items-center text-center">
        <Avatar 
          name={user.name}
          avatarUrl={user.userProfile?.avatarUrl}
          sizeClass="size-16 mb-3"
          className="shadow-md"
        />

        <h4 className="font-bold truncate text-text/90 text-sm group-hover:text-primary transition-colors">{user.name}</h4>
        
        <div className="flex flex-col items-center gap-1.5 mt-2 w-full px-1">
          <span className="text-[10px] font-bold text-text bg-surface-soft px-2 py-0.5 rounded border border-border">
            MSSV: {user.uid}
          </span>
          <span className="text-xs text-text-soft truncate w-full">{user.email}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 w-full">
          <p className="text-xs text-text-soft leading-relaxed line-clamp-3 font-medium bg-surface-soft/40 p-2.5 rounded-xl border border-border/40">
            {user.userProfile?.summary || 'Thành viên này chưa cập nhật giới thiệu cá nhân.'}
          </p>
        </div>

        {showInviteButton && (
          <button 
            type="button"
            className="mt-4 w-full bg-primary hover:bg-primary/95 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation()
              alert(`Đã gửi lời mời vào nhóm đến ${user.name}!`)
              onClose()
            }}
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Invite to Team
          </button>
        )}
      </div>
    </div>
  )
}