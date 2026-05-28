import type { Task } from '../../mocks/types'

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const deadlineDate = new Date(task.deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const category = 'Research' 
  const commentsCount = 2
  const attachmentsCount = 1
  const priority = 'High' 

  return (
    <div className="bg-surface p-5 rounded-[18px] border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      
      <div className="inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg mb-3">
        {category}
      </div>

      <h4 className="font-semibold text-text text-[15px] leading-snug mb-4">
        {task.title}
      </h4>

      <div className="flex items-center gap-4 text-[13px] text-text-soft font-medium">
        
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{deadlineDate}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{commentsCount}</span>
        </div>
        
        {/* Đính kèm */}
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
          <span>{attachmentsCount}</span>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      <div className="flex items-center justify-between">
        
        {task.assignedTo?.userProfile?.avatarUrl ? (
          <img 
            src={task.assignedTo.userProfile.avatarUrl} 
            alt={task.assignedTo.name}
            className="w-8 h-8 rounded-full object-cover shadow-sm border border-surface"
            title={task.assignedTo.name}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-surface flex items-center justify-center text-xs font-bold text-text">
            {task.assignedTo?.name?.charAt(0) || '?'}
          </div>
        )}

        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
          {priority}
        </span>
        
      </div>
    </div>
  )
}