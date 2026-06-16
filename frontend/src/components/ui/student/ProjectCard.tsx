import { Link } from 'react-router-dom'
import type { Project } from '../../../types/api/project'

interface ProjectCardProps {
  project: Project
  courseId: string | number
  groupName?: string
  isTeacherView?: boolean
}

export default function ProjectCard({
  project,
  courseId,
  groupName,
  isTeacherView
}: ProjectCardProps) {
  const isRegistered = !!groupName

  return (
    <div className="flex flex-col rounded-card border-t-4 border-primary bg-surface p-5 shadow-soft hover:shadow-card transition-shadow h-full">
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h3 className="text-[18px] font-bold text-text line-clamp-2 min-h-[3rem] pr-4">
            <Link 
              to={isTeacherView ? `/teacher/my-course/${courseId}/project-list/${project.projectId}` : `/my-course/${courseId}/project-list/${project.projectId}`} 
              className="hover:text-primary transition-colors"
            >
              {project.title}
            </Link>
          </h3>
        </div>

        <p className="mt-2 text-sm text-text-soft line-clamp-2 min-h-[2.5rem]">
          {project.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-text-soft">
          <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span>{project.lecturerName || 'Chưa phân công'}</span>
        </div>
      </div>

      <div className="mt-4 pt-2">
        {isTeacherView ? (
          <button type="button" disabled className="w-full bg-surface-soft text-text-soft cursor-not-allowed text-xs font-semibold py-2 px-4 rounded border border-border">
            {groupName ? `${groupName} đã đăng ký` : 'Chưa có nhóm đăng ký'}
          </button>
        ) : isRegistered ? (
          <button type="button" disabled className="w-full bg-surface-soft text-text-soft cursor-not-allowed text-xs font-semibold py-2 px-4 rounded border border-border">
            {groupName} thực hiện
          </button>
        ) : (
          <button type="button" disabled className="w-full bg-surface-soft text-text-soft cursor-not-allowed text-xs font-semibold py-2 px-4 rounded border border-border">
            Chưa có nhóm nhận
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm text-text-soft">
        <span className="font-bold text-text">Deadline: <span className="font-semibold">{project.endDate}</span></span>
      </div>
    </div>
  )
}