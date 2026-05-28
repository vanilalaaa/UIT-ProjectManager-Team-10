import React from 'react'

interface LecturerFeedbackCardProps {
  lecturer: {
    name: string
    avatar: string
    department: string
  }
  children: React.ReactNode 
}

export default function LecturerFeedbackCard({ lecturer, children }: LecturerFeedbackCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden mt-6">
      
      {/* Header Giảng viên */}
      <div className="bg-[#F8F9FE] p-4 px-6 flex items-center gap-4 border-b border-border">
        <img 
          src={lecturer.avatar} 
          alt={lecturer.name}
          className="w-12 h-12 rounded-full object-cover border border-border" 
        />
        <div>
          <h3 className="font-bold text-text text-base">Lecturer Feedback</h3>
          <p className="text-xs text-text-soft font-medium mt-0.5">
            {lecturer.name} • {lecturer.department}
          </p>
        </div>
      </div>

      {/* Nội dung nhận xét */}
      <div className="p-6 text-sm text-text-soft leading-relaxed space-y-6">
        {children}
      </div>
      
    </div>
  )
}