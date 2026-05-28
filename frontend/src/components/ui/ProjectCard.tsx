import { Link } from 'react-router-dom'
import FileAttachment from '../../components/ui/FileAttachment'
import type { Project } from '../../mocks/types'

interface ProjectCardProps {
  project: Project
  courseId: string
  groupName?: string
}

export default function ProjectCard({ project, courseId, groupName }: ProjectCardProps) {
  const isRegistered = !!groupName

  return (
    <div className="flex flex-col rounded-card border-t-4 border-primary bg-surface p-5 shadow-soft hover:shadow-card transition-shadow">
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h3 className="text-[18px] font-bold text-text line-clamp-2 min-h-[3rem] pr-4">
            <Link to={`/my-course/${courseId}/project-list/${project.projectId}`} className="hover:text-primary transition-colors">
              {project.title}
            </Link>
          </h3>
          <button type="button" className="text-text-soft hover:text-text transition-colors p-1 rounded-full shrink-0">
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
            </svg>
          </button>
        </div>

        <p className="mt-2 text-sm text-text-soft line-clamp-2 min-h-[2.5rem]">
          {project.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-text-soft">
          <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span>{project.course.lecturer?.name || 'Chưa phân công'}</span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <FileAttachment fileName="Project_Spec.pdf" />
          <FileAttachment fileName="Analysis_V2.csv" />
        </div>
      </div>

      <div className="mt-4 pt-2">
        {isRegistered ? (
          <button type="button" disabled className="w-full bg-surface-soft text-text-soft cursor-not-allowed text-xs font-semibold py-2 px-4 rounded border border-border">
            {groupName} đã đăng ký
          </button>
        ) : (
          <button type="button" className="w-full bg-primary hover:bg-primary/95 text-surface text-xs font-semibold py-2 px-4 rounded shadow-sm transition-colors">
            Đăng ký đề tài
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm text-text-soft">
        <span className="font-bold text-text">Deadline: <span className="font-semibold">{project.endDate}</span></span>
      </div>
    </div>
  )
}