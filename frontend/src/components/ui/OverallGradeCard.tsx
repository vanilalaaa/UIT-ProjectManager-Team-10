import React from 'react'

interface OverallGradeCardProps {
  grade: number
  maxGrade: number
  status: string
}

export default function OverallGradeCard({ grade, maxGrade, status }: OverallGradeCardProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border border-t-4 border-t-[#22C55E] p-8 flex flex-col items-center justify-center text-center h-full">
      <h2 className="text-lg font-bold text-text mb-6">Overall Grade</h2>
      
      <div className="w-32 h-32 rounded-full border-[10px] border-[#22C55E] flex flex-col items-center justify-center mb-6">
        <span className="text-3xl font-bold text-[#22C55E]">{grade}</span>
        <span className="text-sm font-semibold text-text-soft">/ {maxGrade}</span>
      </div>

      <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {status}
      </div>
    </div>
  )
}