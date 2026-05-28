import { Link } from 'react-router-dom'

export interface CourseCardData {
  id: number
  code: string
  name: string
  lecturer: string
  semester: string
  projectsCount: number
  membersCount: number
  avatars: string[]
  extraMembers: number
}

interface CourseCardProps {
  course: CourseCardData
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="flex flex-col rounded-card border-t-4 border-primary bg-surface p-5 shadow-soft hover:shadow-card transition-shadow">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="bg-primary-soft rounded px-2 py-0.5 text-xs font-semibold text-primary">
            {course.code}
          </span>
        </div>

        <h3 className="mt-3 text-[18px] font-bold text-text line-clamp-2 min-h-[3rem]">
          <Link to={`/my-course/${course.id}`} className="hover:text-primary transition-colors">
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
          {course.avatars.map((url, index) => (
            <img
              key={index}
              className="size-8 rounded-full border-2 border-surface object-cover"
              src={url}
              alt="Avatar"
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