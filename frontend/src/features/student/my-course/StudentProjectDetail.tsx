import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import ProjectDetailCard from '../../../components/ui/student//ProjectDetailCard' 
import MemberRow from '../../../components/ui/student/MemberRow'
import UserProfilePopover from '../../../components/ui/student/UserProfilePopover'
import type { Project, Group, User } from '../../../mocks/types'

import { mockProjects } from '../../../mocks/projects.mock'
import { groupPhoenix, groupAster, groupNimbus, groupOrion } from '../../../mocks/tasks.mock'

export default function StudentProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()

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
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      <ProjectDetailCard
        project={project} 
        showEditButton={false} 
      />

      {isRegistered && currentGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 rounded-[28px] border border-border bg-surface p-6 shadow-xl lg:sticky top-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <svg className="size-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
                Thông tin nhóm
              </h2>
              <div className="text-sm font-bold text-text-soft">
                <span className="text-text">{currentMembersCount}</span>
                <span className="mx-1 text-border">/</span>
                {maxMembersCount} <span className="font-medium">Members</span>
              </div>
            </div>

            <div className="h-px w-full bg-border/60"></div>
            
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-20 rounded-full bg-primary-soft shadow-md flex items-center justify-center relative">
                <span className="text-2xl font-black text-primary tracking-wider">
                  {currentGroup.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-1.5 px-2">
                <h3 className="text-2x0 font-bold text-text">{currentGroup.name}</h3>
                <p className="text-sm text-text-soft leading-relaxed line-clamp-3">
                  {currentGroup.description}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-[28px] border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-bold text-text">Thành viên nhóm ({currentMembersCount})</h2>
            </div>

            <div className="flex flex-col">
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
                      <div className="absolute right-0 top-full mt-3 z-50 w-72">
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