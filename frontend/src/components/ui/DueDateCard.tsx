import React from 'react'

interface DueDateCardProps {
  dueDate: string
  timeRemaining: string
}

export default function DueDateCard({ dueDate, timeRemaining }: DueDateCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-bold text-text-soft uppercase tracking-wider mb-0.5">Due Date</p>
          <p className="font-bold text-text text-base">{dueDate}</p>
        </div>
      </div>

      <div className="sm:text-right">
        <p className="text-[11px] font-bold text-text-soft uppercase tracking-wider mb-0.5">Time Remaining</p>
        <p className="font-bold text-red-600 text-xl">{timeRemaining}</p>
      </div>
    </div>
  )
}