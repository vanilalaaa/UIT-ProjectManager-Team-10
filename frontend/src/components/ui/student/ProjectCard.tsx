import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../../mocks/types'

interface ProjectCardProps {
  project: Project
  courseId: string | number
  groupName?: string
  onDelete?: () => void 
  isTeacherView?: boolean 
}

export default function ProjectCard({ 
  project, 
  courseId, 
  groupName, 
  onDelete, 
  isTeacherView 
}: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isRegistered = !!groupName
  const isExpired = new Date(project.endDate) < new Date()

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsMenuOpen(false)
    if (isExpired) {
      alert('Đề tài này đã quá thời hạn, không được phép xóa!')
    } else if (onDelete) {
      onDelete()
    }
  }

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
          
          {isTeacherView && (
            <div className="relative shrink-0" ref={menuRef}>
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className="p-1 rounded-full transition-colors hover:bg-surface-soft text-text"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-8 z-10 w-36 bg-surface border border-border rounded-xl shadow-card py-1 overflow-hidden">
                  <button 
                    onClick={handleDeleteClick}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Xóa đồ án
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-2 text-sm text-text-soft line-clamp-2 min-h-[2.5rem]">
          {project.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-text-soft">
          <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span>{project.course?.lecturer?.name || 'Chưa phân công'}</span>
        </div>
      </div>

      <div className="mt-4 pt-2">
        {isTeacherView ? (
          <button type="button" disabled className="w-full bg-surface-soft text-text-soft cursor-not-allowed text-xs font-semibold py-2 px-4 rounded border border-border">
            {groupName ? `${groupName} đã đăng ký` : 'Chưa có nhóm đăng ký'}
          </button>
        ) : isRegistered ? (
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