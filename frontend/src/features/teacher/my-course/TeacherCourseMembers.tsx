import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import MemberRow from '../../../components/ui/student/MemberRow'
import UserProfilePopover from '../../../components/ui/student/UserProfilePopover'
import NotificationModal from '../../../components/ui/student/NotificationModal'
import { getCourseGroups, removeMember } from '../../../services/team.service'
import type { Team, TeamMember } from '../../../types/api/team'

type RosterMember = TeamMember & { groupId: number; groupName: string }

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

export default function TeacherCourseMember() {
  const { courseId } = useParams<{ courseId: string }>()
  const [groups, setGroups] = useState<Team[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null)
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '' })

  const reload = useCallback((): Promise<void> => {
    if (!courseId) return Promise.resolve()
    return getCourseGroups(courseId).then(setGroups).catch(() => setGroups([]))
  }, [courseId])

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

  const roster: RosterMember[] = groups.flatMap((g) =>
    g.members.map((m) => ({ ...m, groupId: g.groupId, groupName: g.name })),
  )

  const handleRemoveMember = (member: RosterMember) => {
    if (member.isLeader) {
      setNotification({ isOpen: true, title: 'Không thể thực hiện', message: 'Không thể xóa Trưởng nhóm khỏi nhóm!' })
      return
    }
    removeMember(courseId ?? '', member.groupId, member.userId)
      .then(() => {
        setNotification({ isOpen: true, title: 'Thành công', message: 'Đã xóa sinh viên khỏi nhóm.' })
        return reload()
      })
      .catch((err: { message?: string }) =>
        setNotification({ isOpen: true, title: 'Lỗi', message: err?.message || 'Không xóa được thành viên.' }),
      )
  }

  const filteredMembers = roster.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.uid ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <LoadingSpinner message="Đang tải danh sách lớp học..." />

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-20">
      <NotificationModal
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex items-center gap-2 mb-2">
        <Link to="/teacher/my-course" className="text-sm font-medium text-text-soft hover:text-primary transition-colors">
          Quản lý lớp học
        </Link>
        <span className="text-text-soft">/</span>
        <span className="text-sm font-medium text-text">Thành viên lớp học</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[24px] font-bold text-text">Thành viên trong nhóm ({roster.length})</h2>

        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="size-4 text-text-soft" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên, MSSV hoặc Email..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm text-text placeholder:text-text-soft shadow-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setActivePopoverId(null)
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm transition-all duration-300">
        <div className="divide-y divide-border">
          {filteredMembers.map((member) => (
            <div key={`${member.groupId}-${member.userId}`} className="relative">
              <MemberRow
                member={member}
                roleLabel={member.isLeader ? `${member.groupName} · Leader` : member.groupName}
                onViewProfile={(user) => setActivePopoverId(activePopoverId === user.userId ? null : user.userId)}
              >
                <div className="flex items-center">
                  {activePopoverId === member.userId && (
                    <SmartPopoverWrapper>
                      <UserProfilePopover
                        user={member}
                        onClose={() => setActivePopoverId(null)}
                        showInviteButton={false}
                        isTeacherView={true}
                        onDelete={() => handleRemoveMember(member)}
                      />
                    </SmartPopoverWrapper>
                  )}
                </div>
              </MemberRow>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-soft bg-surface-soft/20 rounded-xl">
            <svg className="size-12 mb-3 text-border" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-2.533-3.076l-1.408-.47a7.22 7.22 0 0 0-5.617 0l-1.408.47a4.125 4.125 0 0 0-2.533 3.076 9.317 9.317 0 0 0 4.12 1.242 9.347 9.347 0 0 0 1.256-.042Z" />
            </svg>
            <p className="font-semibold text-[15px]">Chưa có sinh viên nào trong nhóm!</p>
            {searchQuery && <p className="text-sm mt-1">Thử lại với từ khóa khác nhé.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
