import { useState } from 'react'
import Avatar from '../Avatar'
import MemberRow from './MemberRow'
import UserProfilePopover from './UserProfilePopover'
import type { User, Group } from '../../../mocks/types'

interface TeamInfoCardProps {
  myGroup: Group
  currentUser: User
  isCurrentUserLeader: boolean
  onLeaveClick: () => void
  onDeleteClick: () => void
  onKickMember: (id: number) => void
}

export default function TeamInfoCard({
  myGroup,
  currentUser,
  isCurrentUserLeader,
  onLeaveClick,
  onDeleteClick,
  onKickMember
}: TeamInfoCardProps) {
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null)

  const leader = myGroup.leader
  const regularMembers = (myGroup.members as User[]).filter((m) => m.userId !== leader?.userId)
  const currentMemberCount = myGroup.members?.length || 0
  const maxMembers = 5

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-soft space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">{myGroup.name}</h2>
          <div className="mt-2 text-xs font-bold text-text-soft bg-surface-soft px-3 py-1.5 inline-flex items-center rounded-full border border-border">
            <span className="size-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
            {currentMemberCount} / {maxMembers} Members
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onLeaveClick} 
            className="bg-brand-gradient text-white px-4 py-2 text-xs font-bold rounded-xl shadow-md hover:opacity-90 hover:shadow-lg active:scale-95 transition-all"
          >
            Rời nhóm
          </button>
          
          {isCurrentUserLeader && (
            <button 
              onClick={onDeleteClick} 
              className="bg-danger-gradient text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:opacity-95 hover:shadow-lg active:scale-95 transition-all"
            >
               Xóa nhóm
            </button>
          )}
        </div>
      </div>

      {leader && (
        <div className="rounded-xl border border-primary/30 bg-primary-soft/10 p-4 shadow-sm flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <Avatar 
              name={leader.name}
              avatarUrl={leader.userProfile?.avatarUrl}
              sizeClass="size-12"
              className="border border-primary/30"
            />
            <div>
              <h3 className="text-sm font-bold text-text">{leader.name} <span className="bg-primary text-surface text-[10px] px-2 py-0.5 rounded-full uppercase">Leader</span></h3>
              <p className="text-xs text-text-soft">{leader.uid} • {leader.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setActivePopoverId(activePopoverId === leader.userId ? null : leader.userId)} 
            className="text-xs font-semibold text-primary px-4 py-1.5 border border-primary/30 rounded-full hover:bg-primary-soft"
          >
            Xem hồ sơ
          </button>
          {activePopoverId === leader.userId && <UserProfilePopover user={leader} onClose={() => setActivePopoverId(null)} />}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-3">Thành viên ({regularMembers.length})</h3>
        <div className="border border-border rounded-xl bg-surface divide-y divide-border shadow-sm">
          {regularMembers.map((member) => (
            <MemberRow 
              key={member.userId} 
              member={member} 
              onViewProfile={(user) => setActivePopoverId(activePopoverId === user.userId ? null : user.userId)}
            >
              {isCurrentUserLeader && member.userId !== currentUser.userId && (
                <button 
                  onClick={() => onKickMember(member.userId)}
                  className="ml-2 p-1.5 text-error hover:bg-error/10 rounded-full transition-colors"
                  title="Xóa thành viên"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              {activePopoverId === member.userId && <UserProfilePopover user={member} onClose={() => setActivePopoverId(null)} />}
            </MemberRow>
          ))}
        </div>
      </div>
    </div>
  )
}