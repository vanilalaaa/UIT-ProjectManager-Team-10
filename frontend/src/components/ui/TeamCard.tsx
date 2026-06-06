import { Link } from 'react-router-dom'
import type { User } from '../../mocks/types'

interface TeamCardProps {
  courseId: number
  groupId: number
  groupName: string
  members: User[]
  projectTitle: string | null
}

export default function TeamCard({ courseId, groupId, groupName, members, projectTitle }: TeamCardProps) {
  const maxDisplay = 4
  const displayAvatars = members.slice(0, maxDisplay)
  const extraCount = members.length - maxDisplay

  return (
    <Link 
      to={`/teacher/my-course/${courseId}/teams/${groupId}`}
      className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-card hover:border-primary/40 transition-all group flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          
          <div className="flex -space-x-3">
            {displayAvatars.map((member, idx) => (
              <img
                key={member.userId}
                src={member.userProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                alt={member.name}
                title={member.name}
                className="size-11 rounded-full border-2 border-surface object-cover shadow-sm group-hover:scale-105 transition-transform"
                style={{ zIndex: 10 - idx }} 
              />
            ))}
            {extraCount > 0 && (
              <div className="size-11 rounded-full border-2 border-surface bg-surface-soft flex items-center justify-center text-xs font-bold text-text-soft z-0">
                +{extraCount}
              </div>
            )}
            {members.length === 0 && (
              <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-[18px] font-bold text-text group-hover:text-primary transition-colors">
              {groupName}
            </h3>
            <span className="text-sm text-text-soft">{members.length} thành viên</span>
          </div>
        </div>
        
        <div className="text-text-soft opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all pt-1">
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        {projectTitle ? (
          <div>
            <span className="block text-[11px] font-bold text-text-soft uppercase tracking-wider mb-1">Đề tài đang làm</span>
            <span className="text-sm font-medium text-text line-clamp-2">{projectTitle}</span>
          </div>
        ) : (
          <div>
            <span className="block text-[11px] font-bold text-text-soft uppercase tracking-wider mb-1">Trạng thái</span>
            <span className="text-sm font-medium text-warning">Chưa đăng ký đề tài</span>
          </div>
        )}
      </div>
    </Link>
  )
}