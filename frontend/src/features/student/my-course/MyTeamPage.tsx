import { useEffect, useState } from 'react'
import { getTasksByGroupId } from '../../../services/task.service'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import MemberRow from '../../../components/ui/MemberRow'
import UserProfilePopover from '../../../components/ui/UserProfilePopover'
import InviteListModal from '../../../components/ui/InviteListModal'
import type { User, Group } from '../../../mocks/types'
import { mockTeamRequests } from '../../../mocks/tasks.mock'

export default function MyTeamPage() {
  const [myGroup, setMyGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  useEffect(() => {
    const fetchMyGroupData = async () => {
      setLoading(true)
      const response = await getTasksByGroupId(1)
      if (response && response.data && response.data.length > 0) {
        setMyGroup(response.data[0].group)
      } else {
        setMyGroup(null)
      }
      setLoading(false)
    }
    fetchMyGroupData()
  }, [])

  if (loading) return <LoadingSpinner message="Đang tải dữ liệu nhóm..." />

  const leader = myGroup?.leader
  const regularMembers = myGroup
    ? (myGroup.members as User[]).filter((m) => m.userId !== leader?.userId)
    : []

  const currentMemberCount = myGroup?.members?.length || 0
  const maxMembers = 5

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 xl:col-span-7">
        {!myGroup ? (
          <div className="rounded-card border-2 border-dashed border-border bg-surface p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-soft">
            <div className="size-16 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <svg className="size-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.584-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text">Bạn chưa tham gia nhóm nào</h3>
              <p className="text-sm text-text-soft max-w-sm mx-auto leading-relaxed">
                Hãy tạo nhóm mới hoặc kiểm tra lời mời từ các nhóm khác.
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="bg-brand-gradient text-surface font-semibold px-6 py-2.5 rounded-button shadow-soft hover:opacity-90 transition-opacity flex items-center gap-2 text-sm">
                Create new team
              </button>
              <button onClick={() => setIsInviteModalOpen(true)} className="bg-surface text-primary border border-primary font-semibold px-6 py-2.5 rounded-button hover:bg-primary-soft transition-all text-sm">
                View Invitations
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-border bg-surface p-6 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold text-text">{myGroup.name}</h2>
              <div className="text-sm font-semibold text-text-soft bg-surface-soft px-3 py-1.5 rounded-full border border-border">
                {currentMemberCount} / {maxMembers} Members
              </div>
            </div>

            {leader && (
              <div className="rounded-xl border border-primary/30 bg-primary-soft/10 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={leader.userProfile?.avatarUrl} className="size-12 rounded-full object-cover border border-primary/30" />
                  <div>
                    <h3 className="text-sm font-bold text-text">{leader.name} <span className="bg-primary text-surface text-[10px] px-2 py-0.5 rounded-full uppercase">Leader</span></h3>
                    <p className="text-xs text-text-soft">{leader.uid} • {leader.email}</p>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setActivePopoverId(activePopoverId === leader.userId ? null : leader.userId)} className="text-xs font-semibold text-primary px-4 py-1.5 border border-primary/30 rounded-full hover:bg-primary-soft">
                    Xem hồ sơ
                  </button>
                  {activePopoverId === leader.userId && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-72">
                      <UserProfilePopover user={leader} onClose={() => setActivePopoverId(null)} />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-3">Thành viên ({regularMembers.length})</h3>
              <div className="border border-border rounded-xl bg-surface divide-y divide-border shadow-sm">
                {regularMembers.map((member) => (
                  <MemberRow key={member.userId} member={member} onViewProfile={(user) => setActivePopoverId(activePopoverId === user.userId ? null : user.userId)}>
                    {activePopoverId === member.userId && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-72">
                        <UserProfilePopover user={member} onClose={() => setActivePopoverId(null)} />
                      </div>
                    )}
                  </MemberRow>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {myGroup && (
        <div className="lg:col-span-5 xl:col-span-5">
          <div className="rounded-card border border-border bg-surface p-6 shadow-soft space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <h2 className="text-xl font-bold text-text">Team Requests</h2>
            </div>
            <div className="space-y-4">
              {mockTeamRequests.map((request) => (
                <div key={request.userId} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <img src={request.userProfile?.avatarUrl} className="size-12 rounded-full object-cover border border-border shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-text truncate">{request.name}</h4>
                      <p className="text-xs text-text-soft mt-0.5 break-words leading-relaxed">{request.userProfile?.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-border/50">
                    <div className="relative mr-auto">
                      <button onClick={() => setActivePopoverId(activePopoverId === request.userId ? null : request.userId)} className="text-xs font-semibold text-primary px-3 py-1.5 rounded hover:bg-primary-soft">
                        Xem hồ sơ
                      </button>
                      {activePopoverId === request.userId && (
                        <div className="absolute left-0 top-full mt-2 z-50 w-72">
                          <UserProfilePopover user={request} onClose={() => setActivePopoverId(null)} />
                        </div>
                      )}
                    </div>
                    <button className="text-xs font-semibold text-text-soft px-3 py-1.5 rounded hover:bg-surface-soft">Decline</button>
                    <button className="text-xs font-semibold bg-primary text-surface px-4 py-1.5 rounded">Accept</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <InviteListModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  )
}