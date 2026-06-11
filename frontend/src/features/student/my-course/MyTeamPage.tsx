import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import MemberRow from '../../../components/ui/student/MemberRow'
import UserProfilePopover from '../../../components/ui/student/UserProfilePopover'
import InviteListModal from '../../../components/ui/student/InviteListModal'
import CreateTeamModal from '../../../components/ui/student/CreateTeamModal' 
import LeaveTeamModal from '../../../components/ui/student/LeaveTeamModal'
import DeleteTeamModal from '../../../components/ui/student/DeleteTeamModal'
import KickMemberModal from '../../../components/ui/student/KickMemberModal'
import TransferLeaderModal from '../../../components/ui/student/TransferLeaderModal'
import CreateProjectModal from '../../../components/ui/student/CreateProjectModal'
import TeamInfoCard from '../../../components/ui/student/TeamInfoCard'
import NotificationModal from '../../../components/ui/student/NotificationModal'
import Avatar from '../../../components/ui/Avatar' 
import EmptyTeamState from '../../../components/ui/student/EmptyTeamState' 
import type { User, Group } from '../../../mocks/types'
import { getTeamData } from '../../../services/team.service'
import { addActivity } from '../../../services/activity.service'

export default function MyTeamPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [loading, setLoading] = useState<boolean>(true)
  
  const [myGroup, setMyGroup] = useState<Group | null>(null)
  const [teamRequests, setTeamRequests] = useState<User[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [hasProject, setHasProject] = useState(false)

  const [suggestedPopoverId, setSuggestedPopoverId] = useState<number | null>(null)
  const [activeModal, setActiveModal] = useState<'invite' | 'create_team' | 'leave_confirm' | 'delete_confirm' | 'kick_confirm' | 'transfer_leader' | 'create_project' | null>(null)
  const [memberToKickId, setMemberToKickId] = useState<number | null>(null)
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const isCurrentUserLeader = myGroup?.leader?.userId === currentUser?.userId

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getTeamData(courseId ?? '').then((data) => {
      if (isMounted) {
        setMyGroup(data.group)
        setTeamRequests(data.requests)
        setSuggestedUsers(data.suggests)
        setCurrentUser(data.currentUser)
        setLoading(false)
      }
    })

    return () => { isMounted = false }
  }, [courseId])

  const executeIfLeader = (action: () => void) => {
    if (!isCurrentUserLeader) {
      setNotification({ title: 'Thông báo', message: 'Bạn không có quyền thực hiện hành động này. Chỉ Leader mới được phép!' })
      return
    }
    action()
  }

  const handleKickMemberClick = (memberId: number) => {
    executeIfLeader(() => {
      setMemberToKickId(memberId)
      setActiveModal('kick_confirm')
    })
  }

  const confirmKickMember = () => {
    if (myGroup && memberToKickId !== null) {
      setMyGroup({
        ...myGroup,
        members: myGroup.members?.filter(m => (m as User).userId !== memberToKickId)
      })
    }
    setActiveModal(null)
    setMemberToKickId(null)
  }

  const handleLeaveTeam = () => {
    if (isCurrentUserLeader && (myGroup?.members?.length || 0) > 1) {
      setActiveModal('transfer_leader')
    } else {
      setNotification({ title: 'Thành công', message: 'Bạn đã rời khỏi nhóm thành công!' })
      setMyGroup(null)
      setActiveModal(null)
    }
  }

  const handleTransferLeadership = () => {
    setNotification({ title: 'Thành công', message: 'Đã chuyển quyền Leader thành công. Bạn đã rời nhóm!' });
    setMyGroup(null)
    setActiveModal(null)
  }

  const handleDeleteTeamClick = () => {
    executeIfLeader(() => {
      setActiveModal('delete_confirm')
    })
  }

  const confirmDeleteTeam = () => {
    setNotification({ title: 'Đã giải tán', message: 'Nhóm đã bị giải tán vĩnh viễn!' });
    setMyGroup(null)
    setActiveModal(null)
  }

  const handleCreateProjectSubmit = (title: string) => {
    setNotification({ title: 'Thành công', message: `Đã gửi đề tài "${title}" lên giảng viên duyệt!` });
    setHasProject(true)
    setActiveModal(null)
  }

  const handleCreateTeamSubmit = (name: string, description: string) => {
    if (!currentUser) return
    const newGroup: Group = {
      groupId: Math.floor(Math.random() * 1000) + 10,
      name, description, course: null as unknown as Group['course'],
      leader: currentUser, members: [currentUser], tasks: []
    }
    setMyGroup(newGroup)
    setActiveModal(null)
    addActivity({
      kind: 'INFO',
      title: `Nhóm "${name}" vừa được tạo`,
      actorName: currentUser.name,
      scope: 'ALL',
    })
  }

const handleAcceptTeamInvitation = (invite: any) => {
  if (!currentUser) return
  const joinedGroup: Group = {
    groupId: Math.floor(Math.random() * 1000) + 10,
    name: `Nhóm của ${invite.name}`,
    description: invite.info || 'Nhóm thực hiện đồ án môn học.',
    course: null as any,
    leader: {
      userId: invite.id,
      name: invite.name,
      uid: 'STUDENT_UID',
      email: 'leader@gmail.com',
      userProfile: { 
        summary: invite.info, 
        avatarUrl: invite.avatarUrl 
      } as any
    } as any,
    members: [
      {
        userId: invite.id,
        name: invite.name,
        uid: 'STUDENT_UID',
        email: 'leader@gmail.com',
        userProfile: { 
          summary: invite.info, 
          avatarUrl: invite.avatarUrl 
        } as any // 
      } as any, // 
      currentUser
    ],
    tasks: []
  };

  setMyGroup(joinedGroup);
  setNotification({ title: 'Thành công', message: `Bạn đã gia nhập nhóm của ${invite.name}!` });
};

  const handleAcceptRequest = (user: User) => {
    if (myGroup) {
      setMyGroup({
        ...myGroup,
        members: [...(myGroup.members || []), user]
      })
    }
    setTeamRequests(teamRequests.filter(req => req.userId !== user.userId))
    setNotification({ title: 'Thành công', message: `Đã thêm ${user.name} vào nhóm!` })
  }

  const handleDeclineRequest = (userId: number) => {
    setTeamRequests(teamRequests.filter(req => req.userId !== userId))
    setNotification({ title: 'Đã từ chối', message: 'Đã từ chối lời mời tham gia nhóm.' })
  }

  const handleInviteUser = (user: User) => {
    setNotification({ title: 'Thành công', message: `Đã gửi lời mời vào nhóm đến ${user.name}!` })
    setSuggestedPopoverId(null)
  }

  if (loading || !currentUser) return <LoadingSpinner message="Đang tải dữ liệu nhóm..." />

  const leader = myGroup?.leader
  const regularMembers = myGroup ? (myGroup.members as User[]).filter((m) => m.userId !== leader?.userId) : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {!myGroup ? (
        <div className="lg:col-span-12 xl:col-span-12 w-full">
           <EmptyTeamState
             onCreateTeamClick={() => setActiveModal('create_team')}
             onAcceptInvitation={handleAcceptTeamInvitation}
             courseId={courseId}
           />
        </div>
      ) : (
        <>
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <TeamInfoCard 
              myGroup={myGroup}
              currentUser={currentUser}
              isCurrentUserLeader={isCurrentUserLeader}
              onLeaveClick={() => setActiveModal('leave_confirm')}
              onDeleteClick={handleDeleteTeamClick}
              onKickMember={handleKickMemberClick}
            />

            <div className="rounded-card border border-border bg-surface p-6 shadow-soft space-y-4">
              <h3 className="text-lg font-bold text-text border-b border-border pb-4">Invite Members</h3>
              <div className="divide-y divide-border">
                {suggestedUsers.map(user => (
                  <MemberRow key={user.userId} member={user} onViewProfile={(u) => setSuggestedPopoverId(suggestedPopoverId === u.userId ? null : u.userId)}>
                     {suggestedPopoverId === user.userId && (
                       <UserProfilePopover 
                         user={user as any} 
                         onClose={() => setSuggestedPopoverId(null)} 
                         showInviteButton={true} 
                         onInvite={() => handleInviteUser(user)} 
                       />
                     )}
                  </MemberRow>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-5 space-y-6">
            {!hasProject && (
              <div className="bg-brand-gradient rounded-card p-6 shadow-md text-surface flex flex-col justify-center min-h-[160px]">
                <h3 className="text-lg font-bold mb-2">Đăng ký Đề tài Project</h3>
                <p className="text-sm text-surface/80 mb-5 leading-relaxed">Nhóm của bạn hiện chưa đăng ký đồ án. Hãy tạo một đề tài mới.</p>
                <button 
                  onClick={() => executeIfLeader(() => setActiveModal('create_project'))}
                  className="bg-surface text-primary font-bold py-2.5 px-4 rounded-button shadow-sm hover:opacity-90 transition-all text-sm w-full"
                >
                  + Tạo Project Mới
                </button>
              </div>
            )}

            <div className="rounded-card border border-border bg-surface p-6 shadow-soft space-y-5">
              <h2 className="text-lg font-bold text-text border-b border-border pb-4">Team Requests</h2>
              {teamRequests.length > 0 ? (
                <div className="space-y-4">
                  {teamRequests.map((request) => (
                    <div key={request.userId} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Avatar 
                          name={request.name}
                          avatarUrl={request.userProfile?.avatarUrl}
                          sizeClass="size-10"
                          className="border border-border shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-text truncate">{request.name}</h4>
                          <p className="text-xs text-text-soft mt-0.5">{request.userProfile?.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-border/50">
                        <button onClick={() => handleDeclineRequest(request.userId)} className="text-xs font-semibold text-text-soft px-3 py-1.5 rounded hover:bg-surface-soft">Decline</button>
                        <button onClick={() => handleAcceptRequest(request)} className="text-xs font-semibold bg-primary text-surface px-4 py-1.5 rounded">Accept</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-soft text-sm">Không có lời yêu cầu tham gia nào.</div>
              )}
            </div>
          </div>
        </>
      )}

      <InviteListModal isOpen={activeModal === 'invite'} onClose={() => setActiveModal(null)} />
      <CreateTeamModal isOpen={activeModal === 'create_team'} onClose={() => setActiveModal(null)} onSubmit={handleCreateTeamSubmit} />
      
      <LeaveTeamModal isOpen={activeModal === 'leave_confirm'} onClose={() => setActiveModal(null)} onConfirm={handleLeaveTeam} />
      <DeleteTeamModal isOpen={activeModal === 'delete_confirm'} onClose={() => setActiveModal(null)} onConfirm={confirmDeleteTeam} />
      <KickMemberModal isOpen={activeModal === 'kick_confirm'} onClose={() => { setActiveModal(null); setMemberToKickId(null); }} onConfirm={confirmKickMember} />
      
      <TransferLeaderModal isOpen={activeModal === 'transfer_leader'} onClose={() => setActiveModal(null)} members={regularMembers} onTransfer={handleTransferLeadership} />
      <CreateProjectModal isOpen={activeModal === 'create_project'} onClose={() => setActiveModal(null)} onSubmit={handleCreateProjectSubmit} />

      <NotificationModal 
        isOpen={!!notification} 
        title={notification?.title || ''} 
        message={notification?.message || ''} 
        onClose={() => setNotification(null)} 
      />
    </div>
  )
}