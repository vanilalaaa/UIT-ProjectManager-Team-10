import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import ProjectDetailCard from '../../../components/ui/ProjectDetailCard' 
import MemberRow from '../../../components/ui/MemberRow'
import UserProfilePopover from '../../../components/ui/UserProfilePopover'
import type { Project, Group, User } from '../../../mocks/types'

import { mockProjects } from '../../../mocks/projects.mock'
import { groupPhoenix, groupAster, groupNimbus, groupOrion } from '../../../mocks/tasks.mock'

export default function StudentProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    setTimeout(() => {
      if (isMounted) {
        const foundProject = mockProjects.find(p => p.projectId.toString() === projectId)
        setProject(foundProject || null)

        const registration = foundProject?.registrations?.[0]
        if (registration) {
          const allGroups = [groupPhoenix, groupAster, groupNimbus, groupOrion]
          const group = allGroups.find(g => g.groupId === registration.groupId)
          setCurrentGroup(group || null)
        }
        setLoading(false)
      }
    }, 500)

    return () => { isMounted = false }
  }, [projectId])

  if (loading) return <LoadingSpinner message="Đang tải chi tiết đồ án..." />
  if (!project) return <div className="p-6 text-center text-text-soft">Project not found</div>

  const registration = project.registrations?.[0]
  const isRegistered = !!registration
  const currentMembersCount = currentGroup?.members?.length || 0
  const maxMembersCount = 5

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-text-soft">
        <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors">
          Project List
        </button>
        <span>&gt;</span>
        <span className="text-text font-medium truncate">{project.title}</span>
      </div>

      <ProjectDetailCard 
        project={project} 
        showEditButton={false} 
      />

      {isRegistered && currentGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-card border border-border bg-surface p-6 shadow-soft space-y-4 h-fit">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">Thông tin nhóm</h2>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-text bg-surface-soft px-3 py-1 rounded-full border border-border">
                <svg className="size-4 text-text-soft" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-2.533-3.076l-1.408-.47a7.22 7.22 0 0 0-5.617 0l-1.408.47a4.125 4.125 0 0 0-2.533 3.076 9.317 9.317 0 0 0 4.12 1.242 9.347 9.347 0 0 0 1.256-.042ZM15 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-6 3a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm4.51 5.47a3.375 3.375 0 0 0-3.02-3.02 7.21 7.21 0 0 0-5.48 0 3.375 3.375 0 0 0-3.02 3.02 9.27 9.27 0 0 0 11.52 0ZM3 16.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <span>{currentMembersCount}/{maxMembersCount}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold border border-border shrink-0">
                {currentGroup.name.substring(0, 2)}
              </div>
              <div>
                <h3 className="text-base font-bold text-text">{currentGroup.name}</h3>
                <p className="text-sm text-text-soft line-clamp-2">{currentGroup.description}</p>
              </div>
            </div>
            
            <div className="bg-surface-soft/50 rounded-lg p-3 text-sm text-text-soft flex items-center justify-between border border-border">
              <span>Trưởng nhóm: <strong className="text-text">{currentGroup.leader?.name || 'Chưa rõ'}</strong></span>
              <span className="bg-secondary-soft text-secondary font-semibold px-2.5 py-0.5 rounded-full text-xs uppercase">
                {registration?.status}
              </span>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-card border border-border bg-surface p-6 shadow-soft space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-bold text-text">Thành viên nhóm ({currentMembersCount})</h2>
            </div>

            <div className="divide-y divide-border border border-border rounded-xl bg-surface">
              {((currentGroup.members as User[]) || []).map((member: User) => {
                const isLeader = member.userId === currentGroup.leader?.userId
                return (
                  <MemberRow 
                    key={member.userId}
                    member={member}
                    roleLabel={isLeader ? 'Leader' : 'Member'}
                    onViewProfile={(user) => setActivePopoverId(activePopoverId === user.userId ? null : user.userId)}
                  >
                    {activePopoverId === member.userId && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-72">
                        <UserProfilePopover 
                          user={member}
                          onClose={() => setActivePopoverId(null)}
                        />
                      </div>
                    )}
                  </MemberRow>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}