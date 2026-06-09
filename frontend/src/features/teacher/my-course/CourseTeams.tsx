import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import MemberRow from '../../../components/ui/student/MemberRow'
import UserProfilePopover from '../../../components/ui/student/UserProfilePopover'
import { mockCourseGroupsMap } from '../../../mocks/tasks.mock'
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

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setTimeout(() => {
      if (isMounted) {
        const targetId = Number(courseId)
        setTeams(mockCourseGroupsMap[targetId] || [])
        setLoading(false)
      }
    }, 500)
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
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