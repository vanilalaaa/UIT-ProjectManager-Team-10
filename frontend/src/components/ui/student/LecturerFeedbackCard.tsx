import Avatar from '../Avatar'

interface LecturerFeedbackCardProps {
  lecturer: {
    name: string
    avatar: string
    department: string
  } | null
  children: React.ReactNode 
}

export default function LecturerFeedbackCard({ lecturer, children }: LecturerFeedbackCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl shadow-soft overflow-hidden mt-6">
      <div className="bg-surface-soft p-4 px-6 flex items-center gap-4 border-b border-border">
        <Avatar
          name={lecturer?.name || 'Giảng viên'}
          avatarUrl={lecturer?.avatar || null}
          sizeClass="size-12"
          textClass="text-base"
          className="border border-surface shadow-sm"
        />
        <div>
          <h3 className="font-bold text-text text-base">Lecturer Feedback</h3>
          <p className="text-xs text-text-soft font-medium mt-0.5">
            {lecturer ? `${lecturer.name} • ${lecturer.department}` : 'Đang chờ cập nhật...'}
          </p>
        </div>
      </div>

      <div className="p-6 text-sm text-text-soft leading-relaxed space-y-6">
        {children}
      </div>
    </div>
  )
}
