import type { User } from '../../mocks/types'

type MemberRowProps = {
  member: User
  roleLabel?: string
  onViewProfile?: (user: User) => void
  children?: React.ReactNode 
}

export default function MemberRow({ member, roleLabel, onViewProfile, children }: MemberRowProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-surface-soft/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <img 
            src={member.userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} 
            alt={member.name}
            className="size-12 rounded-full object-cover border border-border"
          />
          <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-surface rounded-full"></span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text">{member.name}</h3>
            {roleLabel && (
              <span className="bg-primary-soft text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {roleLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-text-soft">
            <span className="font-semibold text-text">{member.uid}</span>
            <span>•</span>
            <span className="truncate">{member.email}</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center">
        {onViewProfile && (
          <button 
            type="button"
            onClick={() => onViewProfile(member)}
            className="shrink-0 ml-4 px-4 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-full hover:bg-primary-soft/50 hover:border-primary transition-colors"
          >
            Xem hồ sơ
          </button>
        )}
        
        {children}
      </div>
    </div>
  )
}