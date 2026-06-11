import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import Avatar from '../Avatar'

export interface CourseMemberAvatar {
  name: string
  avatarUrl?: string | null
}

export interface CourseCardData {
  id: number
  code: string
  name: string
  lecturer: string
  semester: string
  projectsCount: number
  membersCount: number
  memberAvatars: CourseMemberAvatar[] 
  extraMembers: number
}

interface CourseCardProps {
  course: CourseCardData
  basePath?: string
  onEdit?: (courseId: number) => void
  onDelete?: (courseId: number) => void
}

export default function CourseCard({ 
  course, 
  basePath = '/my-course', 
  onEdit, 
  onDelete 
}: CourseCardProps) {
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

  const hasActions = !!(onEdit || onDelete)

  const handleCopyCode = async () => {
    setIsMenuOpen(false)
    try {
      await navigator.clipboard.writeText(course.code)
      toast.success(`Đã sao chép mã lớp: ${course.code}`)
    } catch {
      toast.error('Không sao chép được mã lớp.')
    }
  }

  return (
    <div className="flex flex-col rounded-card border-t-4 border-primary bg-surface p-5 shadow-soft hover:shadow-card transition-shadow">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="bg-primary-soft rounded px-2 py-0.5 text-xs font-semibold text-primary">
            {course.code}
          </span>
          
          {hasActions && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1.5 text-text-soft hover:text-text hover:bg-surface-soft rounded-full transition-colors"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-8 z-10 w-44 bg-surface border border-border rounded-xl shadow-card py-1 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleCopyCode()
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-text hover:bg-surface-soft flex items-center gap-2"
                  >
                    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2m-6-12h6a2 2 0 0 1 2 2v6m-8-8V3" />
                    </svg>
                    Sao chép mã lớp
                  </button>
                  {onEdit && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        onEdit(course.id);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-text hover:bg-surface-soft flex items-center gap-2"
                    >
                      Sửa lớp
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        onDelete(course.id);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      Xóa lớp
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <h3 className="mt-3 text-[18px] font-bold text-text line-clamp-2 min-h-[3rem]">
          <Link to={`${basePath}/${course.id}`} className="hover:text-primary transition-colors">
            {course.name}
          </Link>
        </h3>

        <div className="mt-4 flex items-center gap-2 text-sm text-text-soft">
          <span>{course.lecturer}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-base font-bold text-text leading-none">{course.projectsCount}</span>
            <span className="text-xs text-text-soft mt-1">Projects</span>
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-text leading-none">{course.membersCount}</span>
            <span className="text-xs text-text-soft mt-1">Members</span>
          </div>
        </div>

        <div className="flex items-center -space-x-2">
          {course.memberAvatars.map((member, index) => (
            <Avatar 
              key={index} 
              name={member.name}
              avatarUrl={member.avatarUrl} 
              sizeClass="size-8 border-2 border-surface" 
              textClass="text-[10px]" 
            />
          ))}
          {course.extraMembers > 0 && (
            <div className="flex size-8 items-center justify-center rounded-full border-2 border-surface bg-surface-soft text-[10px] font-bold text-text-soft ring-1 ring-border-soft">
              +{course.extraMembers}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}