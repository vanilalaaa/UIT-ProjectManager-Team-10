import { useState, useEffect } from 'react'
import { groupPhoenix } from '../../../mocks/tasks.mock'
import type { Group } from '../../../mocks/types'
import MemberRow from '../../../components/ui/MemberRow'
import UserProfilePopover from '../../../components/ui/UserProfilePopover' 

export default function ProjectMembers() {
  const [group, setGroup] = useState<Group | null>(null)
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null)

  useEffect(() => {
    setGroup(groupPhoenix)
  }, [])

  if (!group) return null

  const leader = group.leader
  const regularMembers = group.members.filter(
    (member) => member.userId !== leader.userId
  )

  return (
    <div className="max-w-4xl">
      <div className="bg-surface p-6 md:p-8 rounded-[20px] border border-border shadow-soft">
        
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-text">
            {group.name}
          </h2>
          <span className="px-4 py-1.5 bg-surface-soft text-text-soft font-bold text-sm rounded-full border border-border">
            {group.members.length} / 5 Members
          </span>
        </div>

        <hr className="border-border mb-6" />

        <div className="mb-8 border border-primary/30 rounded-xl bg-primary-soft/10">
          <MemberRow 
            member={leader} 
            roleLabel="Leader" 
            onViewProfile={(user) => setActivePopoverId(activePopoverId === user.userId ? null : user.userId)}
          >
            {activePopoverId === leader.userId && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72">
                <UserProfilePopover user={leader} onClose={() => setActivePopoverId(null)} />
              </div>
            )}
          </MemberRow>
        </div>

        {regularMembers.length > 0 && (
          <div>
            <h3 className="text-[13px] font-bold text-text uppercase tracking-wider mb-4">
              Thành viên ({regularMembers.length})
            </h3>
            
            <div className="border border-border rounded-xl bg-surface divide-y divide-border shadow-sm">
              {regularMembers.map((member) => (
                <MemberRow 
                  key={member.userId}
                  member={member} 
                  onViewProfile={(user) => setActivePopoverId(activePopoverId === user.userId ? null : user.userId)}
                >
                  {activePopoverId === member.userId && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-72">
                      <UserProfilePopover user={member} onClose={() => setActivePopoverId(null)} />
                    </div>
                  )}
                </MemberRow>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}