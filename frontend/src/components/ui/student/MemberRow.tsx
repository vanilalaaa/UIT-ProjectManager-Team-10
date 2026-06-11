import Avatar from '../../ui/Avatar'
import type { User } from '../../../mocks/types'

type MemberRowProps = {
  member: User
  roleLabel?: string
  onViewProfile?: (user: User) => void
  children?: React.ReactNode 
}

export default function MemberRow({ member, roleLabel, onViewProfile, children }: MemberRowProps) {
  return (
    <div className="flex items-center justify-between p-4 transition-all group relative border-b border-border/50 last:border-b-0 hover:bg-surface-soft/40">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative shrink-0">
          <Avatar 
            name={member.name}
            avatarUrl={member.userProfile?.avatarUrl}
            sizeClass="size-10" 
            className="group-hover:border-primary/40 shadow-sm transition-colors"
          />
          <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-surface rounded-full z-10"></span>
        </div>
        
        <div className="flex flex-col min-w-0 gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold truncate text-text/90 text-sm group-hover:text-primary transition-colors">
              {member.name}
            </h3>
            {roleLabel && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border bg-primary-soft text-primary border-primary/20">
                {roleLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-text-soft min-w-0">
            <span className="font-semibold text-text/80 shrink-0">{member.uid}</span>
            <span className="text-border text-[10px]">•</span>
            <span className="truncate max-w-[120px] sm:max-w-[200px]">{member.email}</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center shrink-0">
        {onViewProfile && (
          <button 
            type="button"
            onClick={() => onViewProfile(member)}
            className="ml-4 px-4 py-1.5 text-xs font-bold rounded-full transition-all shadow-sm text-primary border border-primary/20 hover:bg-primary hover:text-white"
          >
            Xem hồ sơ
          </button>
        )}
        
        {children}
      </div>
    </div>
  )
}