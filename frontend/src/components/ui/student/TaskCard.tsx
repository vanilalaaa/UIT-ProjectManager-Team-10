import type { Task } from '../../../types/api/task'
import Avatar from '../Avatar'

// category/commentsCount/attachmentsCount là field UI demo, BE chưa trả.
type TaskCardData = Task & {
  category?: string
  commentsCount?: number
  attachmentsCount?: number
}

interface TaskCardProps {
  task: TaskCardData
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void
}

export default function TaskCard({ task, onDragStart }: TaskCardProps) {
  const deadlineDate = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'No date'

  const taskCategory = task.category || 'Task'
  const taskPriority = task.priority || 'Medium'
  
  const priorityStyles: Record<string, string> = {
    High: 'bg-primary-soft text-primary',
    Medium: 'bg-secondary-soft text-secondary',
    Low: 'bg-surface-soft text-text-soft',
  }

  return (
    <div 
      draggable={!!onDragStart} 
      onDragStart={onDragStart} 
      className="bg-surface p-5 rounded-[18px] border border-border shadow-soft hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="inline-block px-3 py-1 bg-surface-soft text-text-soft text-xs font-bold rounded-lg mb-3">
        {taskCategory}
      </div>

      <h4 className="font-semibold text-text text-[15px] leading-snug mb-4">
        {task.title}
      </h4>

      <div className="flex items-center gap-4 text-[13px] text-text-soft font-medium">
        <div className="flex items-center gap-1.5">
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{deadlineDate}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{task.commentsCount || 0}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
          <span>{task.attachmentsCount || 0}</span>
        </div>
      </div>

      <hr className="my-4 border-border" />

      <div className="flex items-center justify-between">
        <Avatar
          name={task.assignee?.name || 'User'}
          avatarUrl={task.assignee?.avatar}
          sizeClass="size-8"
          textClass="text-xs"
          className="shadow-soft border border-surface"
        />

        <span className={`px-3 py-1 text-xs font-bold rounded-full ${priorityStyles[taskPriority] || priorityStyles.Medium}`}>
          {taskPriority}
        </span>
      </div>
    </div>
  )
}
