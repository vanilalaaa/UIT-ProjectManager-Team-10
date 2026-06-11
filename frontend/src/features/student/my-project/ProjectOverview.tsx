import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Project, Group, User } from '../../../mocks/types'
import {
  getProjectById,
  getProjectActivities,
  getProjectResources,
  type ProjectActivity,
} from '../../../services/project.service'
import { getGroupById } from '../../../services/team.service'

import ProjectDetailCard from '../../../components/ui/student/ProjectDetailCard'
import MemberRow from '../../../components/ui/student/MemberRow'
import UserProfilePopover from '../../../components/ui/student/UserProfilePopover'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Avatar from '../../../components/ui/Avatar'
import ProjectResourcesCard, { type ProjectResource } from '../../../components/ui/student/ProjectResourcesCard'
import { useAuth } from '../../auth/useAuth'

export default function ProjectOverview() {
  const { projectId } = useParams<{ projectId: string }>()

  const { currentUser } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null)
  const [resources, setResources] = useState<ProjectResource[]>([])
  const [activities, setActivities] = useState<ProjectActivity[]>([])

  const handleAddResource = (resource: Omit<ProjectResource, 'id'>) => {
    setResources(prev => [{ ...resource, id: `r${Date.now()}` }, ...prev])
  }

  const handleRemoveResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id))
  }

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    const pid = projectId ?? ''

    Promise.all([getProjectById(pid), getProjectActivities(pid), getProjectResources(pid)]).then(
      async ([foundProject, acts, res]) => {
        if (!isMounted) return
        setProject(foundProject)
        setActivities(acts)
        setResources(res)

        const groupId = foundProject?.registrations?.[0]?.groupId
        if (groupId) {
          const group = await getGroupById(groupId)
          if (isMounted) setCurrentGroup(group)
        }
        setLoading(false)
      },
    )

    return () => { isMounted = false }
  }, [projectId])

  if (loading) return <LoadingSpinner message="Đang tải dữ liệu..." />
  if (!project) return <div className="p-8 text-center text-text-soft">Không tìm thấy đồ án.</div>

  const registration = project.registrations?.[0]
  const isRegistered = !!registration
  const currentMembersCount = currentGroup?.members?.length || 0
  const maxMembersCount = 5

  const isGroupLeader = !!(
    currentGroup?.leader &&
    currentUser &&
    (currentUser.uid === currentGroup.leader.uid || currentUser.email === currentGroup.leader.email)
  )
  const isMemberOfGroup =
    currentGroup?.members?.some(m => m.uid === currentUser?.uid || m.email === currentUser?.email) ?? false
  // Mock: user đăng nhập (BE seed) chưa chắc khớp nhóm mock → cho quản lý ở chế độ xem thử.
  // Khi nối nhóm thật, đổi thành: const canManageResources = isGroupLeader
  const canManageResources = isGroupLeader || !isMemberOfGroup

  const displayedActivities = activities.slice(0, 4)

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ProjectDetailCard 
            project={project} 
            showEditButton={false} 
          />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface p-6 rounded-[28px] border border-border shadow-xl transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-text">Recent Activity</h3>
            </div>
            
            <div className="space-y-5">
              {displayedActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <Avatar 
                    name={activity.user.name}
                    avatarUrl={activity.user.avatarUrl}
                    sizeClass="size-9"
                    className="border border-border shrink-0 mt-0.5"
                  />
                  <div className="flex-1 text-sm leading-relaxed">
                    <p className="text-text">
                      <span className="font-bold">{activity.user.name}</span>{' '}
                      <span className="text-text-soft">{activity.action}</span>{' '}
                      <span className="font-semibold text-text">{activity.target}</span>
                    </p>
                    <p className="text-[11px] font-medium text-text-soft mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isRegistered && currentGroup && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <div className="lg:col-span-1 rounded-[28px] border border-border bg-surface p-6 shadow-xl flex flex-col gap-6">
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
                <h3 className="text-xl font-bold text-text">{currentGroup.name}</h3>
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

        <ProjectResourcesCard
          resources={resources}
          canManage={canManageResources}
          onAdd={handleAddResource}
          onRemove={handleRemoveResource}
        />
        </>
      )}
    </div>
  )
}