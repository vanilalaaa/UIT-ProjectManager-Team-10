import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MemberRow from '../../../components/ui/MemberRow'
import UserProfilePopover from '../../../components/ui/UserProfilePopover'
import type { User, Group } from '../../../mocks/types'

import { mockProjects } from '../../../mocks/projects.mock'
import { groupPhoenix, groupAster, groupNimbus, groupOrion } from '../../../mocks/tasks.mock'

const fetchGroupData = async (projectId: string | undefined): Promise<Group | null> => {
  // --- BẮT ĐẦU VÙNG MOCK (Xóa khi có API) ---
  const project = mockProjects.find((p) => p.projectId.toString() === projectId)
  const allGroups = [groupPhoenix, groupAster, groupNimbus, groupOrion]
  const registration = project?.registrations?.[0]
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(registration ? allGroups.find(g => g.groupId === registration.groupId) || null : null)
    }, 500)
  })

  /* KHI CÓ API THẬT:
  const response = await axios.get(`/api/projects/${projectId}/group`)
  return response.data
  */
}

export default function ProjectMembers() {
  const { projectId } = useParams()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    fetchGroupData(projectId).then((data) => {
      if (isMounted) {
        setGroup(data)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-text-soft border-2 border-dashed border-border rounded-2xl bg-surface-soft/30 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <svg className="size-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-medium text-sm">Đang tải dữ liệu nhóm...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="p-8 text-center text-text-soft border-2 border-dashed border-border rounded-2xl bg-surface-soft/30">
        Không tìm thấy thông tin nhóm của đồ án này.
      </div>
    )
  }

  const leader = group.leader
  const regularMembers = group.members.filter((m: User) => m.userId !== leader.userId)

  return (
    <div className="max-w-4xl">
      <div className="bg-surface p-8 rounded-[20px] border border-border shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-text">{group.name}</h2>
          <span className="px-4 py-1.5 bg-surface-soft text-text-soft font-bold text-sm rounded-full border border-border">
            {group.members.length} / 5 Members
          </span>
        </div>

        <hr className="border-border mb-6" />

        <div className="mb-8 border border-primary/30 rounded-xl bg-primary-soft/10">
          <MemberRow
            member={leader}
            roleLabel="Leader"
            onViewProfile={(u) => setActivePopoverId(activePopoverId === u.userId ? null : u.userId)}
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
              {regularMembers.map((member: User) => (
                <MemberRow
                  key={member.userId}
                  member={member}
                  onViewProfile={(u) => setActivePopoverId(activePopoverId === u.userId ? null : u.userId)}
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