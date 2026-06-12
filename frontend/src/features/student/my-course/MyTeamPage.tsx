import { useEffect, useState, useCallback } from 'react'
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
import type { Team, TeamMember } from '../../../types/api/team'
import {
  getMyGroup,
  getJoinRequests,
  getCourseMembers,
  createTeam,
  reviewJoinRequest,
  removeMember,
  deleteTeam,
  transferLeader,
  leaveGroup,
  inviteMember,
} from '../../../services/team.service'
import { proposeProject } from '../../../services/registration.service'
import { addActivity } from '../../../services/activity.service'
import { useAuth } from '../../auth/useAuth'

type ModalKind =
  | 'invite'
  | 'create_team'
  | 'leave_confirm'
  | 'delete_confirm'
  | 'kick_confirm'
  | 'transfer_leader'
  | 'create_project'
  | null

export default function MyTeamPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState<boolean>(true)

  const [myGroup, setMyGroup] = useState<Team | null>(null)
  const [teamRequests, setTeamRequests] = useState<TeamMember[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<TeamMember[]>([])
  const [hasProject, setHasProject] = useState(false)

  const [suggestedPopoverId, setSuggestedPopoverId] = useState<number | null>(null)
  const [activeModal, setActiveModal] = useState<ModalKind>(null)
  const [memberToKickId, setMemberToKickId] = useState<number | null>(null)
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null)

  const isCurrentUserLeader = !!(myGroup && currentUser && myGroup.leaderId === currentUser.id)

  const reload = useCallback((): Promise<void> => {
    if (!courseId) return Promise.resolve()
    return getMyGroup(courseId)
      .then((group) => {
        setMyGroup(group)
        const isLeader = !!(group && currentUser && group.leaderId === currentUser.id)
        const reqP =
          group && isLeader
            ? getJoinRequests(courseId, group.groupId).catch(() => [] as TeamMember[])
            : Promise.resolve<TeamMember[]>([])
        const memP = group
          ? getCourseMembers(courseId).catch(() => [] as TeamMember[])
          : Promise.resolve<TeamMember[]>([])
        return Promise.all([reqP, memP]).then(([reqs, members]) => {
          setTeamRequests(reqs)
          const ids = new Set((group?.members ?? []).map((m) => m.userId))
          setSuggestedUsers(members.filter((m) => !ids.has(m.userId)))
        })
      })
      .catch(() => {
        setMyGroup(null)
        setTeamRequests([])
        setSuggestedUsers([])
      })
  }, [courseId, currentUser])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    reload().finally(() => {
      if (mounted) setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [reload])

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
    if (!courseId || !myGroup || memberToKickId === null) return
    removeMember(courseId, myGroup.groupId, memberToKickId)
      .then(() => {
        setNotification({ title: 'Thành công', message: 'Đã xóa thành viên khỏi nhóm.' })
        return reload()
      })
      .catch((err: { message?: string }) => setNotification({ title: 'Lỗi', message: err?.message || 'Không xóa được thành viên.' }))
    setActiveModal(null)
    setMemberToKickId(null)
  }

  const handleLeaveTeam = () => {
    if (!courseId || !myGroup) return
    // Leader còn thành viên khác → phải chuyển quyền trước.
    if (isCurrentUserLeader && myGroup.members.length > 1) {
      setActiveModal('transfer_leader')
      return
    }
    const disband = isCurrentUserLeader
    leaveGroup(courseId, myGroup.groupId)
      .then(() => {
        setNotification({ title: 'Thành công', message: disband ? 'Bạn đã rời và giải tán nhóm.' : 'Bạn đã rời nhóm.' })
        setMyGroup(null)
        setTeamRequests([])
        setSuggestedUsers([])
      })
      .catch((err: { message?: string }) => setNotification({ title: 'Lỗi', message: err?.message || 'Không rời được nhóm.' }))
    setActiveModal(null)
  }

  const handleTransferLeadership = (newLeaderId: number) => {
    if (!courseId || !myGroup) return
    transferLeader(courseId, myGroup.groupId, newLeaderId)
      .then(() => {
        setNotification({ title: 'Thành công', message: 'Đã chuyển quyền Trưởng nhóm.' })
        return reload()
      })
      .catch((err: { message?: string }) => setNotification({ title: 'Lỗi', message: err?.message || 'Không chuyển được quyền.' }))
    setActiveModal(null)
  }

  const handleDeleteTeamClick = () => {
    executeIfLeader(() => setActiveModal('delete_confirm'))
  }

  const confirmDeleteTeam = () => {
    if (!courseId || !myGroup) return
    deleteTeam(courseId, myGroup.groupId)
      .then(() => {
        setNotification({ title: 'Đã giải tán', message: 'Nhóm đã bị giải tán vĩnh viễn!' })
        setMyGroup(null)
      })
      .catch((err: { message?: string }) => setNotification({ title: 'Lỗi', message: err?.message || 'Không xóa được nhóm.' }))
    setActiveModal(null)
  }

  // Trưởng nhóm đề xuất đề tài → GV duyệt sẽ tạo đồ án.
  const handleCreateProjectSubmit = (title: string, description: string) => {
    if (!courseId || !myGroup) return
    proposeProject(courseId, myGroup.groupId, { title, description })
      .then(() => {
        setNotification({ title: 'Thành công', message: `Đã gửi đề xuất đề tài "${title}", chờ giảng viên duyệt.` })
        setHasProject(true)
        setActiveModal(null)
      })
      .catch((err: { message?: string }) =>
        setNotification({ title: 'Lỗi', message: err?.message || 'Không gửi được đề xuất đề tài.' }),
      )
  }

  const handleCreateTeamSubmit = (name: string, description: string) => {
    if (!courseId) return
    createTeam(courseId, { name, description })
      .then((team) => {
        setActiveModal(null)
        addActivity({ kind: 'INFO', title: `Nhóm "${name}" vừa được tạo`, actorName: currentUser?.name ?? 'Sinh viên', scope: 'ALL' })
        setNotification({ title: 'Thành công', message: `Đã tạo nhóm "${team.name}".` })
        return reload()
      })
      .catch((err: { message?: string }) => setNotification({ title: 'Lỗi', message: err?.message || 'Không tạo được nhóm.' }))
  }

  // EmptyTeamState đã gọi acceptInvitation; ở đây chỉ cần tải lại để hiện nhóm vừa vào.
  const handleAcceptTeamInvitation = () => {
    setLoading(true)
    reload().finally(() => setLoading(false))
  }

  const handleAcceptRequest = (member: TeamMember) => {
    if (!courseId || !myGroup) return
    reviewJoinRequest(courseId, myGroup.groupId, member.userId, true)
      .then(() => {
        setNotification({ title: 'Thành công', message: `Đã thêm ${member.name} vào nhóm!` })
        return reload()
      })
      .catch((err: { message?: string }) => setNotification({ title: 'Lỗi', message: err?.message || 'Không duyệt được yêu cầu.' }))
  }

  const handleDeclineRequest = (userId: number) => {
    if (!courseId || !myGroup) return
    reviewJoinRequest(courseId, myGroup.groupId, userId, false)
      .then(() => {
        setNotification({ title: 'Đã từ chối', message: 'Đã từ chối yêu cầu tham gia nhóm.' })
        return reload()
      })
      .catch((err: { message?: string }) => setNotification({ title: 'Lỗi', message: err?.message || 'Không từ chối được yêu cầu.' }))
  }

  const handleInviteUser = (user: TeamMember) => {
    if (!courseId || !myGroup) return
    inviteMember(courseId, myGroup.groupId, user.userId)
      .then(() => {
        setNotification({ title: 'Thành công', message: `Đã gửi lời mời đến ${user.name}.` })
        setSuggestedUsers((prev) => prev.filter((u) => u.userId !== user.userId))
      })
      .catch((err: { message?: string }) =>
        setNotification({ title: 'Lỗi', message: err?.message || 'Không gửi được lời mời.' }),
      )
    setSuggestedPopoverId(null)
  }

  if (loading || !currentUser) return <LoadingSpinner message="Đang tải dữ liệu nhóm..." />

  const regularMembers = myGroup ? myGroup.members.filter((m) => !m.isLeader) : []

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
              currentUserId={currentUser.id}
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
                         user={user}
                         onClose={() => setSuggestedPopoverId(null)}
                         showInviteButton={true}
                         onInvite={() => handleInviteUser(user)}
                       />
                     )}
                  </MemberRow>
                ))}
                {suggestedUsers.length === 0 && (
                  <div className="text-center py-6 text-text-soft text-sm">Không có gợi ý thành viên.</div>
                )}
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
                          avatarUrl={request.avatar}
                          sizeClass="size-10"
                          className="border border-border shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-text truncate">{request.name}</h4>
                          <p className="text-xs text-text-soft mt-0.5">{request.summary}</p>
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
