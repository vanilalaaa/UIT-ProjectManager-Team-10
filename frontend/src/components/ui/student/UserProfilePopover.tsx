// src/components/ui/student/UserProfilePopover.tsx
import Avatar from '../../ui/Avatar'
import type { TeamMember } from '../../../types/api/team'

interface UserProfilePopoverProps {
  user: TeamMember
  onClose: () => void
  showInviteButton?: boolean
  onInvite?: () => void 
  isTeacherView?: boolean 
  onDelete?: () => void   
}

export default function UserProfilePopover({ 
  user, 
  onClose, 
  showInviteButton = false,
  onInvite,
  isTeacherView = false,
  onDelete
}: UserProfilePopoverProps) {
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
          avatarUrl={user.avatar}
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
            {user.summary || 'Thành viên này chưa cập nhật giới thiệu cá nhân.'}
          </p>
        </div>

        {isTeacherView ? (
          <button 
            type="button"
            className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-rose-100 transition-all flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation()
              if (onDelete) onDelete()
              onClose()
            }}
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove from Team
          </button>
        ) : (
          showInviteButton && (
            <button 
              type="button"
              className="mt-4 w-full bg-primary hover:bg-primary/95 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5"
              onClick={(e) => {
                e.stopPropagation()
                if (onInvite) {
                  onInvite() 
                } else {
                  onClose()
                }
              }}
            >
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Invite to Team
            </button>
          )
        )}
      </div>
    </div>
  )
}