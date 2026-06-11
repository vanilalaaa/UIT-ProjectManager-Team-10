import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import MemberRow from '../../../components/ui/student/MemberRow'
import UserProfilePopover from '../../../components/ui/student/UserProfilePopover'
import NotificationModal from '../../../components/ui/student/NotificationModal'
import { getCourseGroups } from '../../../services/team.service'
import type { Group } from '../../../mocks/types'

function SmartPopoverWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')
  const [opacity, setOpacity] = useState(0)

  useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight

      if (rect.bottom > viewportHeight - 20) {
        setPosition('top')
      }
      
      setOpacity(1)
    }
  }, [])

  return (
    <div 
      ref={ref} 
      style={{ opacity }}
      className={`absolute right-4 z-[9999] w-72 transition-opacity duration-200 animate-fade-in ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      }`}
    >
      {children}
    </div>
  )
}

export default function CourseTeams() {
  const { courseId } = useParams<{ courseId: string }>()
  const [teams, setTeams] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  
  const [expandedTeams, setExpandedTeams] = useState<number[]>([])
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null)
  
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: ''
  })

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    getCourseGroups(courseId ?? '').then((data) => {
      if (isMounted) {
        setTeams(data)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [courseId])

  if (loading) return <LoadingSpinner />

  const toggleTeam = (groupId: number) => {
    setExpandedTeams(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    )
    setActivePopoverId(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setTeams(prev => prev.filter(t => t.groupId !== deleteTarget.groupId))
    const groupName = deleteTarget.name
    setDeleteTarget(null)
    setNotification({
      isOpen: true,
      title: 'Thành công',
      message: `Đã xóa nhóm ${groupName} thành công!`
    })
  }

  const handleRemoveMemberFromTeam = (groupId: number, userId: number) => {
    const targetTeam = teams.find(t => t.groupId === groupId);
    if (!targetTeam) return;

    if (targetTeam.leader.userId === userId) {
      setNotification({
        isOpen: true,
        title: 'Không thể thực hiện',
        message: 'Không thể xóa Leader ra khỏi nhóm!'
      });
      return; 
    }

    setTeams(prevTeams => 
      prevTeams.map(team => {
        if (team.groupId === groupId) {
          return {
            ...team,
            members: team.members.filter(m => m.userId !== userId)
          };
        }
        return team;
      })
    );

    setNotification({
      isOpen: true,
      title: 'Thành công',
      message: 'Đã xóa thành viên khỏi nhóm!'
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      
      <NotificationModal 
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl p-6 shadow-2xl w-full max-w-sm border border-border animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-text mb-2">Xác nhận xóa nhóm</h3>
            <p className="text-sm text-text-soft mb-6">
              Bạn có chắc chắn muốn xóa nhóm <strong>{deleteTarget.name}</strong>? Hành động này sẽ xóa vĩnh viễn dữ liệu nhóm và không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-all text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-sm"
              >
                Xóa nhóm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <Link to="/teacher/my-course" className="text-sm font-medium text-text-soft hover:text-primary transition-colors">Quản lý lớp học</Link>
        <span className="text-text-soft">/</span>
        <span className="text-sm font-medium text-text">Danh sách Nhóm</span>
      </div>

      <h2 className="text-[24px] font-bold text-text mb-6">Danh sách Nhóm ({teams.length})</h2>
      
      <div className="space-y-4">
        {teams.map((team) => {
          const isExpanded = expandedTeams.includes(team.groupId)

          return (
            <div 
              key={team.groupId} 
              className={`bg-surface border rounded-xl transition-all duration-300 ${
                isExpanded ? 'border-primary/50 shadow-card' : 'border-border shadow-sm hover:border-primary/30 hover:shadow-soft'
              }`}
            >
              <button
                onClick={() => toggleTeam(team.groupId)}
                className={`w-full flex items-center justify-between p-5 transition-colors text-left group rounded-xl ${
                  isExpanded ? 'bg-primary/5' : 'hover:bg-surface-soft/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`size-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isExpanded ? 'bg-primary text-surface shadow-sm' : 'bg-primary/10 text-primary group-hover:scale-105'
                  }`}>
                    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                  </div>
                  <span className={`font-bold text-[17px] transition-colors ${
                    isExpanded ? 'text-primary' : 'text-text group-hover:text-primary'
                  }`}>
                    {team.name}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide transition-colors ${
                    isExpanded 
                      ? 'bg-primary text-surface shadow-sm' 
                      : 'bg-surface-soft border border-border text-text-soft group-hover:border-primary/30 group-hover:text-text'
                  }`}>
                    {team.members.length} / 5 Members
                  </span>
                  
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(team)
                    }}
                    className="p-1.5 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Xóa nhóm"
                  >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>

                  <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'text-text-soft group-hover:bg-primary/10 group-hover:text-primary'}`}>
                    <svg 
                      className={`size-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border bg-surface/50 p-2 animate-fade-in">
                  <div className="divide-y divide-border/50">
                    {team.members.map((member) => (
                      <div key={member.userId} className="relative">
                        <MemberRow 
                          member={member}
                          roleLabel={member.userId === team.leader.userId ? 'LEADER' : undefined}
                          onViewProfile={(user) => setActivePopoverId(activePopoverId === user.userId ? null : user.userId)}
                        >
                          {activePopoverId === member.userId && (
                            <SmartPopoverWrapper>
                              <UserProfilePopover 
                                user={member}
                                onClose={() => setActivePopoverId(null)}
                                showInviteButton={false}
                                isTeacherView={true}
                                onDelete={() => handleRemoveMemberFromTeam(team.groupId, member.userId)}
                              />
                            </SmartPopoverWrapper>
                          )}
                        </MemberRow>
                      </div>
                    ))}
                    
                    {team.members.length === 0 && (
                      <div className="p-8 text-center text-sm font-medium text-text-soft italic">
                        Chưa có thành viên nào trong nhóm này.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {teams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-soft bg-surface border border-dashed border-border rounded-2xl shadow-sm">
            <svg className="size-12 mb-3 text-border" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <p className="font-semibold text-[15px]">Lớp học này chưa có nhóm nào.</p>
          </div>
        )}
      </div>
    </div>
  )
}