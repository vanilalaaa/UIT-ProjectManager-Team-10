import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import MemberRow from '../../../components/ui/student/MemberRow'
import UserProfilePopover from '../../../components/ui/student/UserProfilePopover'
import type { User } from '../../../mocks/types'

import { mockCourseMembersMap } from '../../../mocks/tasks.mock'

const fetchCourseMembers = async (courseId: string | undefined): Promise<User[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const id = Number(courseId)
      resolve(mockCourseMembersMap[id] || [])
    }, 500)
  })
}

export default function CourseMembers() {
  const { courseId } = useParams<{ courseId: string }>()
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    fetchCourseMembers(courseId).then(data => {
      if (isMounted) {
        setMembers(data)
        setLoading(false)
      }
    })
    
    return () => { isMounted = false }
  }, [courseId])

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.uid.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <LoadingSpinner message="Đang tải danh sách lớp học..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text">Thành viên lớp học</h2>
          <span className="bg-primary-soft text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
            {members.length} sinh viên
          </span>
        </div>

        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="size-4 text-text-soft" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc MSSV..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm text-text placeholder:text-text-soft"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="divide-y divide-border">
          {filteredMembers.map((member) => (
            <MemberRow 
              key={member.userId}
              member={member}
              onViewProfile={(user) => setActivePopoverId(activePopoverId === user.userId ? null : user.userId)}
            >
              {activePopoverId === member.userId && (
                <div className="absolute right-0 top-full mt-2 z-50 w-72">
                  <UserProfilePopover 
                    user={member}
                    onClose={() => setActivePopoverId(null)}
                    showInviteButton={true}
                  />
                </div>
              )}
            </MemberRow>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-text-soft bg-surface-soft/20">
            <svg className="size-10 mb-2 text-border" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-2.533-3.076l-1.408-.47a7.22 7.22 0 0 0-5.617 0l-1.408.47a4.125 4.125 0 0 0-2.533 3.076 9.317 9.317 0 0 0 4.12 1.242 9.347 9.347 0 0 0 1.256-.042Z" />
            </svg>
            <p className="font-semibold text-sm">Không tìm thấy sinh viên nào!</p>
          </div>
        )}
      </div>
    </div>
  )
}